import { useState } from "react";
import formatRelativeTime from "../../utils/formatRelativeTime";

const HistoryMenu = ({ history, onRestore }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="btn-secondary px-3 py-1.5 text-sm"
      >
        History
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-2 w-64 rounded-xl border border-gray-100 bg-white p-2 shadow-lg">
            {history.length === 0 ? (
              <p className="px-2 py-3 text-center text-xs text-gray-400">No saved history yet.</p>
            ) : (
              history.map((entry, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    onRestore(entry.snapshot);
                    setOpen(false);
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                >
                  <span>{entry.savedBy?.name || "Someone"}</span>
                  <span className="text-xs text-gray-400">{formatRelativeTime(entry.savedAt)}</span>
                </button>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default HistoryMenu;
