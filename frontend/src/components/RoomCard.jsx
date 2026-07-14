import { useState } from "react";
import { Link } from "react-router-dom";

const RoomCard = ({ room, currentUserId, onRename, onDelete }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const isOwner = room.owner?._id === currentUserId;

  const formattedDate = new Date(room.updatedAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // RoomCard is itself a <Link> (the whole card opens the room). The owner
  // menu lives inside it, so its clicks must stop propagation/preventDefault
  // or they'd also trigger navigation into the room.
  const stopAndRun = (fn) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    fn();
  };

  return (
    <Link
      to={`/room/${room._id}`}
      className="card relative flex flex-col gap-3 transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5 text-primary-600"
          >
            <rect x="3" y="3" width="18" height="14" rx="2" />
            <path d="M8 21h8" />
            <path d="M12 17v4" />
          </svg>
        </div>

        <div className="flex items-center gap-2">
          {isOwner && (
            <span className="rounded-full bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-700">
              Owner
            </span>
          )}
          {isOwner && (
            <div className="relative">
              <button
                type="button"
                onClick={stopAndRun(() => setMenuOpen((prev) => !prev))}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                aria-label="Room options"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-4 w-4"
                >
                  <circle cx="12" cy="5" r="1.5" />
                  <circle cx="12" cy="12" r="1.5" />
                  <circle cx="12" cy="19" r="1.5" />
                </svg>
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={stopAndRun(() => setMenuOpen(false))} />
                  <div className="absolute right-0 z-20 mt-1 w-32 rounded-lg border border-gray-100 bg-white py-1 shadow-lg">
                    <button
                      type="button"
                      onClick={stopAndRun(() => {
                        setMenuOpen(false);
                        onRename(room);
                      })}
                      className="block w-full px-3 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Rename
                    </button>
                    <button
                      type="button"
                      onClick={stopAndRun(() => {
                        setMenuOpen(false);
                        onDelete(room);
                      })}
                      className="block w-full px-3 py-1.5 text-left text-sm text-red-500 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div>
        <h3 className="truncate text-sm font-semibold text-gray-900">{room.name}</h3>
        <p className="mt-0.5 text-xs font-medium tracking-wider text-gray-400">
          CODE: {room.code}
        </p>
      </div>

      <p className="text-xs text-gray-400">Updated {formattedDate}</p>
    </Link>
  );
};

export default RoomCard;
