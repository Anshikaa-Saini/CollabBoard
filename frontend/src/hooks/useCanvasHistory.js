import { useCallback, useRef, useState } from "react";

const MAX_HISTORY = 50;

/**
 * Manages an undo/redo history stack of canvas snapshots (data URLs) for a
 * given canvas ref. Snapshots are captured on demand (e.g. after a completed
 * stroke or a clear) rather than continuously, for performance.
 */
const useCanvasHistory = (canvasRef) => {
  const historyRef = useRef([]);
  const indexRef = useRef(-1);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const updateFlags = useCallback(() => {
    setCanUndo(indexRef.current > 0);
    setCanRedo(indexRef.current < historyRef.current.length - 1);
  }, []);

  const pushSnapshot = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const snapshot = canvas.toDataURL();

    // Discard any "future" states if the user undid then drew something new
    historyRef.current = historyRef.current.slice(0, indexRef.current + 1);
    historyRef.current.push(snapshot);

    // Cap history length to avoid unbounded memory growth
    if (historyRef.current.length > MAX_HISTORY) {
      historyRef.current.shift();
    }

    indexRef.current = historyRef.current.length - 1;
    updateFlags();
  }, [canvasRef, updateFlags]);

  const restoreSnapshot = useCallback(
    (snapshot) => {
      const canvas = canvasRef.current;
      if (!canvas || !snapshot) return;

      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = snapshot;
    },
    [canvasRef]
  );

  const undo = useCallback(() => {
    if (indexRef.current <= 0) return;
    indexRef.current -= 1;
    restoreSnapshot(historyRef.current[indexRef.current]);
    updateFlags();
  }, [restoreSnapshot, updateFlags]);

  const redo = useCallback(() => {
    if (indexRef.current >= historyRef.current.length - 1) return;
    indexRef.current += 1;
    restoreSnapshot(historyRef.current[indexRef.current]);
    updateFlags();
  }, [restoreSnapshot, updateFlags]);

  const reset = useCallback(() => {
    historyRef.current = [];
    indexRef.current = -1;
    updateFlags();
  }, [updateFlags]);

  return { pushSnapshot, undo, redo, reset, canUndo, canRedo };
};

export default useCanvasHistory;
