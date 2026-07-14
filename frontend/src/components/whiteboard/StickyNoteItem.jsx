import { useEffect, useRef, useState } from "react";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "../../constants/canvas";

/**
 * A single draggable AI-generated sticky note, overlaid on the whiteboard.
 * Position is tracked in canvas-space pixels (the same fixed 1600x900 space
 * used by the canvas itself and remote cursors) so it lines up on every screen.
 */
const StickyNoteItem = ({ note, onDragEnd, onDelete }) => {
  const itemRef = useRef(null);
  const [pos, setPos] = useState({ x: note.x, y: note.y });

  // Keep local position in sync if it changes externally (e.g. after reload)
  useEffect(() => {
    setPos({ x: note.x, y: note.y });
  }, [note.x, note.y]);

  const handlePointerDown = (e) => {
    e.stopPropagation(); // don't let this reach the canvas and start a stroke

    const container = itemRef.current.parentElement;
    const rect = container.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;

    const startX = e.clientX;
    const startY = e.clientY;
    const originX = pos.x;
    const originY = pos.y;

    const handleMove = (moveEvent) => {
      const dx = (moveEvent.clientX - startX) * scaleX;
      const dy = (moveEvent.clientY - startY) * scaleY;
      setPos({ x: originX + dx, y: originY + dy });
    };

    const handleUp = (upEvent) => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      const dx = (upEvent.clientX - startX) * scaleX;
      const dy = (upEvent.clientY - startY) * scaleY;
      onDragEnd?.(note._id, originX + dx, originY + dy);
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
  };

  const left = `${(pos.x / CANVAS_WIDTH) * 100}%`;
  const top = `${(pos.y / CANVAS_HEIGHT) * 100}%`;

  return (
    <div
      ref={itemRef}
      onPointerDown={handlePointerDown}
      className="pointer-events-auto absolute w-36 cursor-grab select-none rounded-md p-2.5 text-xs font-medium leading-snug text-gray-800 shadow-md active:cursor-grabbing"
      style={{ left, top, backgroundColor: note.color }}
    >
      <button
        type="button"
        onClick={() => onDelete?.(note._id)}
        onPointerDown={(e) => e.stopPropagation()}
        className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-white text-gray-400 shadow hover:text-red-500"
        aria-label="Delete sticky note"
      >
        ×
      </button>
      {note.text}
    </div>
  );
};

export default StickyNoteItem;
