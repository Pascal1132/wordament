"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = socketHandler;
const userEvents_1 = __importDefault(require("./userEvents"));
const gameEvents_1 = __importDefault(require("./gameEvents"));
function socketHandler(io) {
    io.on("connection", (socket) => {
        console.log(`🟢 Nouvelle connexion: ${socket.id}`);
        (0, userEvents_1.default)(socket);
        (0, gameEvents_1.default)(socket, io);
    });
    io.on("disconnect", (socket) => {
        console.log(`🔴 Déconnexion: ${socket.id}`);
    });
    io.on("error", (error) => {
        console.error("Erreur de connexion:", error);
    });
}
