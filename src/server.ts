// src/server.ts
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";
import socketHandler from "./sockets";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" }
});

// Middlewares
app.use(cors());
app.use(express.json());

socketHandler(io);

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => console.log(`🚀 Serveur sur http://localhost:${PORT}`));
