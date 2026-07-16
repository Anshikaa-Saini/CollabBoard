import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { TOKEN_KEY } from "../constants/storageKeys";
import socket, { connectSocket, disconnectSocket } from "../socket/socket";

/**
 * Ensures the shared socket connects whenever the user is authenticated,
 * and disconnects on logout. Call this once near the top of the app
 * (App.jsx). Individual pages (e.g. Room) join/leave specific Socket.io
 * rooms on top of this base connection via useRoomSocket.
 */
const useSocket = () => {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      disconnectSocket();
      return undefined;
    }

    const token = localStorage.getItem(TOKEN_KEY);
    connectSocket(token);

    return undefined;
    // Intentionally no disconnect-on-unmount here - the socket is shared
    // app-wide and should stay connected across route changes. It only
    // disconnects when isAuthenticated flips to false (logout), handled above.
  }, [isAuthenticated]);

  return socket;
};

export default useSocket;
