// src/sockets/index.ts
import { Server, Socket } from "socket.io";
import registerUserEvents from "./userEvents";
import registerGameEvents from "./gameEvents";

export default function socketHandler(io: Server) {
  io.on("connection", (socket: Socket) => {
    console.log(`🟢 Nouvelle connexion: ${socket.id}`);
    registerUserEvents(socket);
    registerGameEvents(socket, io);
  });

  io.on("disconnect", (socket: Socket) => {
    console.log(`🔴 Déconnexion: ${socket.id}`);
  });

  io.on("error", (error: Error) => {
    console.error("Erreur de connexion:", error);
  });
}
