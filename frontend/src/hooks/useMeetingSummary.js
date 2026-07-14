import { useCallback, useEffect, useState } from "react";
import { getLatestSummaryApi, generateSummaryApi } from "../api/aiApi";

/**
 * Loads the most recently generated meeting summary for a room, and
 * exposes a generate() function for the "Generate Summary" button.
 */
const useMeetingSummary = (roomId) => {
  const [summary, setSummary] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!roomId) return;

    const fetchLatest = async () => {
      try {
        const res = await getLatestSummaryApi(roomId);
        setSummary(res.data.data.summary);
      } catch {
        // No summary generated yet - fine, panel just starts empty
      }
    };

    fetchLatest();
  }, [roomId]);

  const generate = useCallback(async () => {
    setError("");
    setGenerating(true);
    try {
      const res = await generateSummaryApi(roomId);
      setSummary(res.data.data.summary);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate summary");
      return false;
    } finally {
      setGenerating(false);
    }
  }, [roomId]);

  return { summary, generating, error, generate };
};

export default useMeetingSummary;
