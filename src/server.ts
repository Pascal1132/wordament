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

// Définir le chemin du dossier de build Vue.js
const vueDistPath = path.join(__dirname, "../client/dist");

// Servir les fichiers statiques avec des headers corrects
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

// Servir Vue.js pour toutes les routes sauf celles commençant par /api
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(vueDistPath, "index.html"));
});

// Initialisation des sockets
socketHandler(io);

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => console.log(`🚀 Serveur sur http://localhost:${PORT}`));
