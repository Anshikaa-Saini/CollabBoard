/**
 * Formats a date as a short relative time string (e.g. "3m ago", "2h ago").
 * Falls back to a locale date string for anything more than a day old.
 */
const formatRelativeTime = (dateInput) => {
  if (!dateInput) return null;

  const date = new Date(dateInput);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.round(diffMs / 60000);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;

  return date.toLocaleDateString();
};

export default formatRelativeTime;
