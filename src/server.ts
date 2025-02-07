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

// Servir les fichiers statiques du client Vue.js
const vueDistPath = path.join(__dirname, "../client/dist");
app.use(express.static(vueDistPath, {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith(".js")) {
      res.setHeader("Content-Type", "application/javascript");
    }
  }
}));

// Préfixer toutes les routes API avec "/api"
const apiRouter = express.Router();
app.use("/api", apiRouter);

// Exemple de route API
apiRouter.get("/", (req, res) => {
  res.json({ message: "Bienvenue sur l'API !" });
});

// Ne pas intercepter les fichiers statiques avec la wildcard
app.get("*", (req, res) => {
  if (!req.path.startsWith("/assets/")) {
    res.sendFile(path.join(vueDistPath, "index.html"));
  }
});

// Initialisation des sockets
socketHandler(io);

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => console.log(`🚀 Serveur sur http://localhost:${PORT}`));
