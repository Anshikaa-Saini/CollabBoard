require("dotenv").config();
const http = require("http");
const app = require("./app");
const connectDB = require("./config/db");
const initSocket = require("./socket");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  // Socket.io needs to attach to the raw HTTP server (not the Express app
  // directly) so it can hijack the upgrade request for the WebSocket handshake.
  const httpServer = http.createServer(app);
  initSocket(httpServer);

  const server = httpServer.listen(PORT, () => {
    console.log(`CollabBoard API running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
  });

  // Graceful shutdown
  process.on("unhandledRejection", (err) => {
    console.error(`Unhandled Rejection: ${err.message}`);
    server.close(() => process.exit(1));
  });
};

startServer();
