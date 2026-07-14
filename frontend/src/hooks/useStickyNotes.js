import { useCallback, useEffect, useState } from "react";
import {
  getStickyNotesApi,
  generateStickyNotesApi,
  updateStickyNoteApi,
  deleteStickyNoteApi,
} from "../api/stickyNoteApi";

/**
 * Manages the sticky notes for a room: loading existing notes, generating
 * new ones from an AI prompt, and persisting drag/delete actions. Position
 * updates are applied to local state immediately (so dragging feels
 * instant) and persisted to the backend in the background.
 */
const useStickyNotes = (roomId) => {
  const [notes, setNotes] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  const fetchNotes = useCallback(async () => {
    if (!roomId) return;
    try {
      const res = await getStickyNotesApi(roomId);
      setNotes(res.data.data.notes);
    } catch {
      // Non-fatal - the board still works without sticky notes loaded
    }
  }, [roomId]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const generate = useCallback(
    async (prompt) => {
      setError("");
      setGenerating(true);
      try {
        const res = await generateStickyNotesApi(roomId, prompt);
        setNotes((prev) => [...prev, ...res.data.data.notes]);
        return true;
      } catch (err) {
        setError(err.response?.data?.message || "Failed to generate sticky notes");
        return false;
      } finally {
        setGenerating(false);
      }
    },
    [roomId]
  );

  const updatePosition = useCallback(
    (noteId, x, y) => {
      setNotes((prev) => prev.map((n) => (n._id === noteId ? { ...n, x, y } : n)));
      updateStickyNoteApi(roomId, noteId, { x, y }).catch(() => {
        // Position update failures are non-critical; the UI already moved
        // and the next successful drag will re-sync the server value.
      });
    },
    [roomId]
  );

  const remove = useCallback(
    (noteId) => {
      setNotes((prev) => prev.filter((n) => n._id !== noteId));
      deleteStickyNoteApi(roomId, noteId).catch(() => {
        // If this fails server-side, reopening the room will bring the note
        // back - an acceptable tradeoff for keeping the delete feel instant.
      });
    },
    [roomId]
  );

  return { notes, generating, error, generate, updatePosition, remove };
};

export default useStickyNotes;
