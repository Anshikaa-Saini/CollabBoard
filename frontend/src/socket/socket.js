import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

// A single shared socket instance for the whole app. Connection is started
// explicitly (autoConnect: false) once we have a JWT to authenticate with -
// see useSocket.js, which drives connect/disconnect off auth state.
const socket = io(SOCKET_URL, {
  autoConnect: false,
  auth: {},
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
});

export const connectSocket = (token) => {
  socket.auth = { token };
  if (!socket.connected) {
    socket.connect();
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

export default socket;
