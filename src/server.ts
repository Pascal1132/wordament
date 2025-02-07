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

// Vérifier que les fichiers statiques sont bien servis
app.use(express.static(vueDistPath, {
  setHeaders: (res, filePath) => {
    console.log(`Serving: ${filePath}`);
    if (filePath.endsWith(".js")) {
      res.setHeader("Content-Type", "application/javascript");
    }
  }
}));

// Vérifier si le fichier JS est bien trouvé avant redirection
app.get("/assets/*", (req, res, next) => {
  const filePath = path.join(vueDistPath, req.path);
  console.log(`Checking static file: ${filePath}`);
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error(`File not found: ${filePath}`);
      res.status(404).end();
    }
  });
});

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
