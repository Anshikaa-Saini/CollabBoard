import { Link } from "react-router-dom";

const RoomCard = ({ room, currentUserId }) => {
  const isOwner = room.owner?._id === currentUserId;

  const formattedDate = new Date(room.updatedAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Link
      to={`/room/${room._id}`}
      className="card flex flex-col gap-3 transition-shadow hover:shadow-md"
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
        {isOwner && (
          <span className="rounded-full bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-700">
            Owner
          </span>
        )}
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
