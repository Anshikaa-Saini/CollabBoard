// In-memory per-room whiteboard state. Kept intentionally simple (a plain
// Map, no Redis) since this app runs as a single Node process. Each room's
// entry holds the latest full canvas snapshot (for Last-Write-Wins
// reconciliation + late joiners) and the set of currently connected sockets.
const rooms = new Map();

const getRoomState = (roomId) => {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      snapshot: null, // latest canvas as a data URL, or null if blank
      timestamp: 0, // ms epoch of the last applied snapshot/clear (LWW marker)
      participants: new Map(), // socketId -> { userId, name, color }
    });
  }
  return rooms.get(roomId);
};

const addParticipant = (roomId, socketId, participant) => {
  getRoomState(roomId).participants.set(socketId, participant);
};

const removeParticipant = (roomId, socketId) => {
  const state = rooms.get(roomId);
  if (!state) return;
  state.participants.delete(socketId);
  // Note: we intentionally do NOT delete the room entry when it empties out.
  // Doing so would wipe the canonical snapshot the moment the last
  // participant briefly disconnects, breaking reconnect handling. The
  // tradeoff is that state for every room ever visited stays in memory for
  // the process lifetime - acceptable for this project's scale; a
  // production version would persist snapshots to Mongo (or Redis) with a
  // TTL/eviction policy instead.
};

const getParticipantList = (roomId) => {
  const state = rooms.get(roomId);
  return state ? Array.from(state.participants.values()) : [];
};

/**
 * Last-Write-Wins conflict resolution: only applies the incoming
 * snapshot/clear if its timestamp is strictly newer than what the room
 * already has, discarding stale or out-of-order updates.
 * Returns true if it was applied, false if it was discarded as stale.
 */
const updateSnapshotIfNewer = (roomId, snapshot, timestamp) => {
  const state = getRoomState(roomId);
  if (timestamp <= state.timestamp) return false;

  state.snapshot = snapshot;
  state.timestamp = timestamp;
  return true;
};

module.exports = {
  getRoomState,
  addParticipant,
  removeParticipant,
  getParticipantList,
  updateSnapshotIfNewer,
};
