const OpenAI = require("openai");
const ApiError = require("../utils/ApiError");

const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

let client = null;

const ensureConfigured = () => {
  if (!process.env.OPENAI_API_KEY) {
    throw new ApiError(
      503,
      "AI features are not configured. Set OPENAI_API_KEY in the backend .env file."
    );
  }
};

// Lazily construct the client on first actual use, rather than at module
// load time. The OpenAI SDK throws immediately in its constructor if no API
// key is present - constructing it eagerly at the top of this file would
// crash the entire backend on boot whenever OPENAI_API_KEY isn't set yet,
// even though auth/rooms/whiteboard have nothing to do with AI.
const getClient = () => {
  if (!client) {
    // baseURL left undefined uses OpenAI's default endpoint. Point it at
    // Groq's OpenAI-compatible endpoint (e.g. https://api.groq.com/openai/v1)
    // instead, and this same code works unmodified - that's the whole point
    // of Groq speaking the OpenAI chat completions protocol.
    client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL || undefined,
    });
  }
  return client;
};

// LLMs sometimes wrap JSON in markdown code fences despite instructions not
// to - strip those defensively before parsing.
const stripCodeFences = (text) =>
  text
    .trim()
    .replace(/^```(json)?/i, "")
    .replace(/```$/, "")
    .trim();

const parseJsonArray = (raw) => {
  try {
    const parsed = JSON.parse(stripCodeFences(raw));
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
};

const parseSummaryObject = (raw) => {
  try {
    const parsed = JSON.parse(stripCodeFences(raw));
    return {
      summary: typeof parsed.summary === "string" ? parsed.summary : "",
      actionItems: Array.isArray(parsed.actionItems) ? parsed.actionItems : [],
      decisionsTaken: Array.isArray(parsed.decisionsTaken) ? parsed.decisionsTaken : [],
      openQuestions: Array.isArray(parsed.openQuestions) ? parsed.openQuestions : [],
    };
  } catch {
    return { summary: "", actionItems: [], decisionsTaken: [], openQuestions: [] };
  }
};

/**
 * Normalizes errors thrown by the OpenAI SDK (bad key, rate limit, provider
 * outage, etc.) into our own ApiError shape, so callers/clients get a clean
 * message instead of a raw third-party error leaking through.
 */
const wrapAiError = (err) => {
  if (err instanceof ApiError) return err; // e.g. from ensureConfigured() above

  const status = err?.status || err?.response?.status;

  if (status === 401 || status === 403) {
    return new ApiError(502, "AI provider rejected the request - check the API key configuration.");
  }
  if (status === 429) {
    return new ApiError(429, "AI provider rate limit reached. Please try again shortly.");
  }
  return new ApiError(502, "AI request failed. Please try again.");
};

/**
 * Turns a short prompt (e.g. "Generate sprint tasks for login module") into
 * a list of concise, actionable task strings for sticky notes.
 */
const generateStickyNoteTasks = async (prompt) => {
  ensureConfigured();

  try {
    const completion = await getClient().chat.completions.create({
      model: MODEL,
      temperature: 0.5,
      messages: [
        {
          role: "system",
          content:
            "You turn a short product/engineering prompt into a concise list of actionable tasks. " +
            "Respond with ONLY a JSON array of strings, no prose, no markdown fences. " +
            "Generate at most 8 tasks, each under 12 words.",
        },
        { role: "user", content: prompt },
      ],
    });

    const raw = completion.choices[0]?.message?.content || "[]";
    return parseJsonArray(raw);
  } catch (err) {
    throw wrapAiError(err);
  }
};

/**
 * Turns a block of raw notes text (e.g. this room's sticky notes) into a
 * structured meeting recap: summary, action items, decisions, open questions.
 */
const generateMeetingSummary = async (notesText) => {
  ensureConfigured();

  try {
    const completion = await getClient().chat.completions.create({
      model: MODEL,
      temperature: 0.4,
      messages: [
        {
          role: "system",
          content:
            "You summarize brainstorm/whiteboard notes into a structured meeting recap. " +
            "Respond with ONLY valid JSON matching this exact shape, no prose, no markdown fences: " +
            '{"summary": string, "actionItems": string[], "decisionsTaken": string[], "openQuestions": string[]}',
        },
        { role: "user", content: notesText },
      ],
    });

    const raw = completion.choices[0]?.message?.content || "{}";
    return parseSummaryObject(raw);
  } catch (err) {
    throw wrapAiError(err);
  }
};

module.exports = { generateStickyNoteTasks, generateMeetingSummary };
