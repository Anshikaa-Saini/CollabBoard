import { useCallback, useEffect, useRef, useState } from "react";
import { getBoardApi, saveBoardApi } from "../api/boardApi";

const AUTO_SAVE_INTERVAL_MS = 10000;

/**
 * Handles whiteboard persistence for a room:
 *  - loads the saved board once when the room is opened/reopened
 *  - auto-saves every 10 seconds, but only if something actually changed
 *    since the last save (tracked via markDirty)
 *  - exposes a manual save() for the Save button
 *  - exposes the short version history returned by the backend
 *
 * Note on load ordering: this hook's board load and useRoomSocket's live
 * "board-state" both race to call whiteboardRef.current.loadSnapshot() when
 * a room opens. That's intentional and safe - useRoomSocket only applies its
 * in-memory snapshot if one exists (see its `if (snapshot)` guard), so on a
 * cold room (no one drawing yet) the persisted DB board wins by default,
 * and on a "live" room the more current in-memory state wins, which is the
 * more correct outcome anyway.
 */
const useBoardPersistence = (roomId, whiteboardRef) => {
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [history, setHistory] = useState([]);

  const latestSnapshotRef = useRef(null);
  const dirtyRef = useRef(false);

  useEffect(() => {
    if (!roomId) return undefined;

    let cancelled = false;

    const loadBoard = async () => {
      try {
        const res = await getBoardApi(roomId);
        const board = res.data.data.board;

        if (!cancelled) {
          if (board?.snapshot) {
            whiteboardRef.current?.loadSnapshot(board.snapshot);
          }
          setLastSavedAt(board?.lastSavedAt || null);
          setHistory(board?.history || []);
        }
      } catch {
        // No saved board yet, or failed to load - start from a blank canvas
      } finally {
        if (!cancelled) setLoaded(true);
      }
    };

    loadBoard();

    return () => {
      cancelled = true;
    };
  }, [roomId, whiteboardRef]);

  const markDirty = useCallback((snapshot) => {
    latestSnapshotRef.current = snapshot;
    dirtyRef.current = true;
  }, []);

  const save = useCallback(async () => {
    if (!roomId) return;

    const snapshot = latestSnapshotRef.current || whiteboardRef.current?.getSnapshot();
    if (!snapshot) return;

    setSaving(true);
    try {
      const res = await saveBoardApi(roomId, snapshot);
      setLastSavedAt(res.data.data.lastSavedAt);
      dirtyRef.current = false;
    } catch {
      // Leave dirtyRef true so the next auto-save/manual save attempt retries
    } finally {
      setSaving(false);
    }
  }, [roomId, whiteboardRef]);

  // Auto-save every 10 seconds, but only if something changed since the last save
  useEffect(() => {
    if (!roomId || !loaded) return undefined;

    const interval = setInterval(() => {
      if (dirtyRef.current) save();
    }, AUTO_SAVE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [roomId, loaded, save]);

  return { loaded, saving, lastSavedAt, history, markDirty, save };
};

export default useBoardPersistence;
