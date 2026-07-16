import { useState } from "react";

const TABS = [
  { id: "sticky", label: "Sticky Notes" },
  { id: "summary", label: "Meeting Summary" },
];

// Mirrors the backend's generateStickyNotesSchema (min 3, max 300 chars) so
// the person gets instant feedback instead of waiting on a round trip.
const PROMPT_MIN_LENGTH = 3;
const PROMPT_MAX_LENGTH = 300;

const SummarySection = ({ title, items }) => (
  <section>
    <h3 className="mb-1 text-xs font-bold uppercase tracking-wide text-gray-400">{title}</h3>
    {items?.length ? (
      <ul className="list-inside list-disc space-y-1 text-gray-700">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    ) : (
      <p className="text-gray-400">None</p>
    )}
  </section>
);

/**
 * Slide-in side panel for both AI features. Sticky note generation only
 * needs a prompt input here - the notes themselves render as draggable
 * widgets directly on the whiteboard (see StickyNoteItem). The meeting
 * summary is generated and displayed entirely within this panel.
 */
const AiPanel = ({
  open,
  onClose,
  stickyGenerating,
  stickyError,
  onGenerateStickyNotes,
  summary,
  summaryGenerating,
  summaryError,
  onGenerateSummary,
}) => {
  const [activeTab, setActiveTab] = useState("sticky");
  const [prompt, setPrompt] = useState("");
  const [promptError, setPromptError] = useState("");

  if (!open) return null;

  const handleStickySubmit = async (e) => {
    e.preventDefault();
    setPromptError("");

    const trimmed = prompt.trim();
    if (trimmed.length < PROMPT_MIN_LENGTH) {
      setPromptError(`Prompt must be at least ${PROMPT_MIN_LENGTH} characters`);
      return;
    }

    const ok = await onGenerateStickyNotes(trimmed);
    if (ok) setPrompt("");
  };

  return (
    <div className="fixed inset-0 z-30 flex h-full w-full flex-col bg-white sm:static sm:z-auto sm:w-96 sm:max-w-sm sm:border-l sm:border-gray-100">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <h2 className="text-sm font-bold text-gray-900">AI Tools</h2>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
          aria-label="Close AI panel"
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
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex border-b border-gray-100">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "border-b-2 border-primary-600 text-primary-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === "sticky" ? (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-gray-500">
              Describe what you need and AI will drop draggable sticky notes onto the board.
            </p>
            <form onSubmit={handleStickySubmit} className="flex flex-col gap-3">
              {(stickyError || promptError) && (
                <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs font-medium text-red-500">
                  {promptError || stickyError}
                </p>
              )}
              <textarea
                value={prompt}
                onChange={(e) => {
                  setPrompt(e.target.value);
                  setPromptError("");
                }}
                placeholder='e.g. "Generate sprint tasks for login module"'
                rows={3}
                maxLength={PROMPT_MAX_LENGTH}
                className="input-field resize-none"
              />
              <p className="-mt-1 text-right text-xs text-gray-400">
                {prompt.length}/{PROMPT_MAX_LENGTH}
              </p>
              <button type="submit" className="btn-primary w-full" disabled={stickyGenerating}>
                {stickyGenerating ? "Generating..." : "Generate Sticky Notes"}
              </button>
            </form>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {summaryError && (
              <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs font-medium text-red-500">
                {summaryError}
              </p>
            )}
            <button
              type="button"
              onClick={onGenerateSummary}
              className="btn-primary w-full"
              disabled={summaryGenerating}
            >
              {summaryGenerating ? "Generating..." : "Generate Summary"}
            </button>

            {summary ? (
              <div className="flex flex-col gap-4 text-sm">
                <section>
                  <h3 className="mb-1 text-xs font-bold uppercase tracking-wide text-gray-400">
                    Summary
                  </h3>
                  <p className="text-gray-700">{summary.summary || "—"}</p>
                </section>
                <SummarySection title="Action Items" items={summary.actionItems} />
                <SummarySection title="Decisions Taken" items={summary.decisionsTaken} />
                <SummarySection title="Open Questions" items={summary.openQuestions} />
              </div>
            ) : (
              <p className="text-sm text-gray-400">No summary generated yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AiPanel;
