import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import Toolbar from "./Toolbar";
import RemoteCursor from "./RemoteCursor";
import StickyNoteItem from "./StickyNoteItem";
import useCanvasHistory from "../../hooks/useCanvasHistory";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "../../constants/canvas";

/**
 * Local drawing surface. Whiteboard has no knowledge of Socket.io - it only
 * knows how to render strokes. Local actions are reported upward via the
 * onDrawSegment / onClearBoard / onSnapshot / onCursorMove callback props
 * (wired to the socket by the parent, see Room.jsx + useRoomSocket), and
 * events arriving from other clients are applied via the imperative ref API
 * (drawRemoteSegment / clearRemote / loadSnapshot) so remote updates never
 * have to go through React state/re-renders.
 */
const Whiteboard = forwardRef(
  (
    {
      onDrawSegment,
      onClearBoard,
      onSnapshot,
      onCursorMove,
      remoteCursors = {},
      stickyNotes = [],
      onStickyNoteDragEnd,
      onStickyNoteDelete,
    },
    ref
  ) => {
    const canvasRef = useRef(null);
    const isDrawingRef = useRef(false);
    const lastPointRef = useRef({ x: 0, y: 0 });

    const [tool, setTool] = useState("pen");
    const [color, setColor] = useState("#111827");
    const [brushSize, setBrushSize] = useState(4);

    const { pushSnapshot, undo, redo, reset, canUndo, canRedo } = useCanvasHistory(canvasRef);

    // Initialize a blank white canvas and seed the history stack
    useEffect(() => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      reset();
      pushSnapshot();
      // Intentionally run once on mount only
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const getCanvasPoint = (e) => {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    };

    const strokeSegment = (ctx, x0, y0, x1, y1, strokeColor, size, strokeTool) => {
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = size;
      ctx.globalCompositeOperation = strokeTool === "eraser" ? "destination-out" : "source-over";
      ctx.strokeStyle = strokeColor;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
    };

    const handlePointerDown = (e) => {
      const canvas = canvasRef.current;
      canvas.setPointerCapture(e.pointerId);
      isDrawingRef.current = true;
      lastPointRef.current = getCanvasPoint(e);
    };

    const handlePointerMove = (e) => {
      const point = getCanvasPoint(e);

      // Cursor sync happens any time the pointer is over the board, whether
      // or not the user is actively drawing.
      onCursorMove?.(point.x, point.y);

      if (!isDrawingRef.current) return;

      const ctx = canvasRef.current.getContext("2d");
      const { x: x0, y: y0 } = lastPointRef.current;

      strokeSegment(ctx, x0, y0, point.x, point.y, color, brushSize, tool);
      onDrawSegment?.({ x0, y0, x1: point.x, y1: point.y, color, size: brushSize, tool });

      lastPointRef.current = point;
    };

    const handlePointerUp = (e) => {
      if (!isDrawingRef.current) return;
      isDrawingRef.current = false;
      canvasRef.current.releasePointerCapture(e.pointerId);
      pushSnapshot();
      onSnapshot?.(canvasRef.current.toDataURL());
    };

    const handleClear = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      pushSnapshot();
      onClearBoard?.();
    };

    // Imperative API used by useRoomSocket to apply events from other clients
    useImperativeHandle(ref, () => ({
      drawRemoteSegment: ({ x0, y0, x1, y1, color: remoteColor, size, tool: remoteTool }) => {
        const ctx = canvasRef.current.getContext("2d");
        strokeSegment(ctx, x0, y0, x1, y1, remoteColor, size, remoteTool);
      },
      clearRemote: () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        pushSnapshot();
      },
      loadSnapshot: (dataUrl) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        const img = new Image();
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          pushSnapshot();
        };
        img.src = dataUrl;
      },
      getSnapshot: () => canvasRef.current.toDataURL(),
    }));

    return (
      <div className="flex h-full flex-col">
        <Toolbar
          tool={tool}
          onToolChange={setTool}
          color={color}
          onColorChange={setColor}
          brushSize={brushSize}
          onBrushSizeChange={setBrushSize}
          onClear={handleClear}
          onUndo={undo}
          onRedo={redo}
          canUndo={canUndo}
          canRedo={canRedo}
        />

        <div className="flex flex-1 items-center justify-center overflow-auto bg-gray-100 p-4 sm:p-8">
          <div
            className="relative w-full max-w-5xl"
            style={{ aspectRatio: `${CANVAS_WIDTH} / ${CANVAS_HEIGHT}` }}
          >
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              className="absolute inset-0 h-full w-full touch-none rounded-xl border border-gray-200 bg-white shadow-sm"
            />
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
              {Object.entries(remoteCursors).map(([userId, cursor]) => (
                <RemoteCursor
                  key={userId}
                  name={cursor.name}
                  color={cursor.color}
                  x={cursor.x}
                  y={cursor.y}
                />
              ))}
            </div>
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
              {stickyNotes.map((note) => (
                <StickyNoteItem
                  key={note._id}
                  note={note}
                  onDragEnd={onStickyNoteDragEnd}
                  onDelete={onStickyNoteDelete}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

Whiteboard.displayName = "Whiteboard";

export default Whiteboard;
