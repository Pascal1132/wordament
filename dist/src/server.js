"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const sockets_1 = __importDefault(require("./sockets"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: { origin: "*" }
});
// Middlewares
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Définir le chemin du dossier de build Vue.js
const vueDistPath = path_1.default.join(__dirname, "../client/dist");
// Servir les fichiers statiques avec des headers corrects
app.use(express_1.default.static(vueDistPath, {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith(".js")) {
            res.setHeader("Content-Type", "application/javascript");
        }
    }
}));
// Préfixer toutes les routes API avec "/api"
const apiRouter = express_1.default.Router();
app.use("/api", apiRouter);
// Exemple de route API
apiRouter.get("/", (req, res) => {
    res.json({ message: "Bienvenue sur l'API !" });
});
// Servir Vue.js pour toutes les routes sauf celles commençant par /api
app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path_1.default.join(vueDistPath, "index.html"));
});
// Initialisation des sockets
(0, sockets_1.default)(io);
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => console.log(`🚀 Serveur sur http://localhost:${PORT}`));
