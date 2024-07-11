import app from "./app.js";
import logger from "./configs/logger.config.js";
import mongoose from "mongoose";
import { Server } from "socket.io";
import SocketServer from "./SocketServer.js";
const { DATABASE_URL } = process.env;

const PORT = process.env.PORT || 8000;

//Exit on mongodb error
mongoose.connection.on("error", (err) => {
  logger.error(`Mongodb Connection Error: ${err}`);
  process.exit(1);
});

// Mongodb debug mode
if (process.env.NODE_ENV !== "production") {
  mongoose.set("debug", true);
}

mongoose
  .connect(DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    logger.info(`Connected to MongoDb !`);
  });

let server;

server = app.listen(PORT, () => {
  logger.info(`Server is listening at ${PORT}`);
});

//Socket.io
const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  logger.info("Socket io connected successfully ");
  SocketServer(socket, io);
});

const exitHandler = () => {
  if (server) {
    logger.info("Server is closed.");
    process.exit(1);
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error(error);
};

process.on("uncaughtException", unexpectedErrorHandler);
process.on("uncaughtRejection", unexpectedErrorHandler);

//SIGTERM
process.on("SIGTERM", () => {
  if (server) {
    logger.info("Server closed.");
    process.exit(1);
  }
});
