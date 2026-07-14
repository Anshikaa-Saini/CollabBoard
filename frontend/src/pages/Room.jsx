import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getRoomByIdApi } from "../api/roomApi";
import Whiteboard from "../components/whiteboard/Whiteboard";
import ParticipantBadge from "../components/whiteboard/ParticipantBadge";
import HistoryMenu from "../components/whiteboard/HistoryMenu";
import AiPanel from "../components/whiteboard/AiPanel";
import Logo from "../components/Logo";
import useRoomSocket from "../hooks/useRoomSocket";
import useBoardPersistence from "../hooks/useBoardPersistence";
import useStickyNotes from "../hooks/useStickyNotes";
import useMeetingSummary from "../hooks/useMeetingSummary";
import throttle from "../utils/throttle";
import formatRelativeTime from "../utils/formatRelativeTime";

const Room = () => {
  const { roomId } = useParams();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);

  const whiteboardRef = useRef(null);

  // Only start joining the Socket.io room / loading the persisted board
  // once Whiteboard has actually mounted (metadata finished loading, no
  // error) - this guarantees whiteboardRef.current is set before any
  // board-state/board-load/draw events can arrive for it to apply.
  const activeRoomId = loading || error ? null : roomId;

  const { connected, participantCount, remoteCursors, emitDraw, emitClear, emitSnapshot, emitCursor } =
    useRoomSocket(activeRoomId, whiteboardRef);

  const { saving, lastSavedAt, history, markDirty, save } = useBoardPersistence(
    activeRoomId,
    whiteboardRef
  );

  const stickyNotes = useStickyNotes(activeRoomId);
  const meetingSummary = useMeetingSummary(activeRoomId);

  const throttledCursorMove = useMemo(() => throttle(emitCursor, 50), [emitCursor]);

  // A completed local stroke/clear both broadcasts live to collaborators
  // (emitSnapshot) and marks the board dirty for the next auto-save.
  const handleLocalSnapshot = (dataUrl) => {
    emitSnapshot(dataUrl);
    markDirty(dataUrl);
  };

  useEffect(() => {
    const fetchRoom = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await getRoomByIdApi(roomId);
        setRoom(res.data.data.room);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load room");
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [roomId]);

  const handleCopyCode = async () => {
    if (!room) return;
    try {
      await navigator.clipboard.writeText(room.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API unavailable (e.g. insecure context) - fail silently
    }
  };

  const handleRestoreHistory = (snapshot) => {
    whiteboardRef.current?.loadSnapshot(snapshot);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-100 border-t-primary-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-4 text-center">
        <p className="text-sm font-medium text-red-500">{error}</p>
        <Link to="/dashboard" className="btn-primary">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-white">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard"
            className="text-gray-400 transition-colors hover:text-gray-600"
            aria-label="Back to dashboard"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </Link>
          <Logo />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <ParticipantBadge count={participantCount} connected={connected} />

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={save}
              className="btn-secondary px-3 py-1.5 text-sm"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save"}
            </button>
            {lastSavedAt && (
              <span className="hidden text-xs text-gray-400 sm:inline">
                Saved {formatRelativeTime(lastSavedAt)}
              </span>
            )}
          </div>

          <HistoryMenu history={history} onRestore={handleRestoreHistory} />

          <button
            type="button"
            onClick={() => setAiPanelOpen((prev) => !prev)}
            className={`btn-secondary px-3 py-1.5 text-sm ${
              aiPanelOpen ? "bg-primary-50 text-primary-600" : ""
            }`}
          >
            AI Tools
          </button>

          <div className="text-right">
            <p className="text-sm font-semibold text-gray-900">{room?.name}</p>
            <button
              type="button"
              onClick={handleCopyCode}
              className="text-xs font-medium tracking-wider text-gray-400 transition-colors hover:text-primary-600"
            >
              CODE: {room?.code} · {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <div className="min-w-0 flex-1">
          <Whiteboard
            ref={whiteboardRef}
            onDrawSegment={emitDraw}
            onClearBoard={emitClear}
            onSnapshot={handleLocalSnapshot}
            onCursorMove={throttledCursorMove}
            remoteCursors={remoteCursors}
            stickyNotes={stickyNotes.notes}
            onStickyNoteDragEnd={stickyNotes.updatePosition}
            onStickyNoteDelete={stickyNotes.remove}
          />
        </div>

        <AiPanel
          open={aiPanelOpen}
          onClose={() => setAiPanelOpen(false)}
          stickyGenerating={stickyNotes.generating}
          stickyError={stickyNotes.error}
          onGenerateStickyNotes={stickyNotes.generate}
          summary={meetingSummary.summary}
          summaryGenerating={meetingSummary.generating}
          summaryError={meetingSummary.error}
          onGenerateSummary={meetingSummary.generate}
        />
      </div>
    </div>
  );
};

export default Room;
