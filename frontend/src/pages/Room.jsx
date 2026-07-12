import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getRoomByIdApi } from "../api/roomApi";
import Whiteboard from "../components/whiteboard/Whiteboard";
import Logo from "../components/Logo";

const Room = () => {
  const { roomId } = useParams();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

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
      <header className="flex items-center justify-between border-b border-gray-100 px-4 py-3 sm:px-6">
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
      </header>

      <div className="min-h-0 flex-1">
        <Whiteboard />
      </div>
    </div>
  );
};

export default Room;
