const ParticipantBadge = ({ count, connected }) => {
  return (
    <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600">
      <span
        className={`h-2 w-2 rounded-full ${connected ? "bg-green-500" : "bg-red-400 animate-pulse"}`}
        aria-hidden="true"
      />
      {connected ? `${count} online` : "Reconnecting..."}
    </div>
  );
};

export default ParticipantBadge;
