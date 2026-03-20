import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { env } from "../config/env";

let io: Server | null = null;

export function initSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: env.corsOrigin,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket: Socket) => {
    console.log("[Socket] Client connected:", socket.id);

    socket.on("join-assignment", (assignmentId: string) => {
      socket.join(`assignment:${assignmentId}`);
      console.log(`[Socket] ${socket.id} joined room assignment:${assignmentId}`);
      socket.emit("joined", { assignmentId });
    });

    socket.on("disconnect", () => {
      console.log("[Socket] Client disconnected:", socket.id);
    });
  });

  return io;
}

export function getIo(): Server {
  if (!io) throw new Error("Socket.IO not initialized");
  return io;
}

export function emitToAssignment(assignmentId: string, event: string, data: object): void {
  getIo().to(`assignment:${assignmentId}`).emit(event, data);
}
