import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
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

// Servir le client Vue.js
const vueDistPath = path.join(__dirname, "../client/dist");
app.use(express.static(vueDistPath));

// Préfixer toutes les routes API avec "/api"
const apiRouter = express.Router();
app.use("/api", apiRouter);

// Exemple de route API
apiRouter.get("/", (req, res) => {
  res.json({ message: "Bienvenue sur l'API !" });
});

// Rediriger toutes les autres routes vers Vue.js (SPA)
app.get("*", (req, res) => {
  res.sendFile(path.join(vueDistPath, "index.html"));
});

// Initialisation des sockets
socketHandler(io);

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => console.log(`🚀 Serveur sur http://localhost:${PORT}`));
