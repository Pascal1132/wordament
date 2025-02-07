"use strict";
// src/services/gameService.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateGameId = generateGameId;
exports.createGame = createGame;
exports.getGame = getGame;
exports.joinGame = joinGame;
exports.startGame = startGame;
exports.endGame = endGame;
exports.removePlayer = removePlayer;
exports.cleanupGames = cleanupGames;
exports.isGameAdmin = isGameAdmin;
exports.canJoinGame = canJoinGame;
exports.canStartGame = canStartGame;
exports.clearGames = clearGames;
const GridCreator_1 = __importDefault(require("../utils/GridCreator"));
// Stockage en mémoire des parties (attention, c'est juste pour du demo)
const games = new Map();
function generateGameId() {
    return Math.random().toString(36).substr(2, 6);
}
function createGame(adminId, adminName, duration = 45, gridSize = 4) {
    const gameId = generateGameId();
    const game = {
        createdAt: new Date(),
        id: gameId,
        admin: adminId,
        players: [{ id: adminId, name: adminName }],
        status: "waiting",
        remainingTime: duration,
        gridSize: gridSize,
        playerScores: [{
                playerId: adminId,
                playerName: adminName,
                score: 0,
            }],
        words: []
    };
    games.set(gameId, game);
    return game;
}
function getGame(gameId) {
    return games.get(gameId);
}
function joinGame(gameId, playerId, playerName) {
    const game = games.get(gameId);
    if (!game || game.status !== "waiting")
        return null;
    const existingPlayer = game.players.find(p => p.id === playerId);
    if (existingPlayer)
        return game;
    const newPlayer = { id: playerId, name: playerName };
    game.players.push(newPlayer);
    // Ajouter le score du joueur
    game.playerScores.push({
        playerId,
        playerName,
        score: 0,
    });
    return game;
}
function startGame(gameId) {
    const game = games.get(gameId);
    if (!game || game.status !== "waiting")
        return null;
    game.grid = GridCreator_1.default.createGrid(game.gridSize);
    game.status = "running";
    return game;
}
function endGame(gameId) {
    const game = games.get(gameId);
    if (!game)
        return null;
    game.status = "finished";
    if (game.timer) {
        clearInterval(game.timer);
        delete game.timer;
        // après 20 min, on détruit la partie
        setTimeout(() => {
            games.delete(gameId);
        }, 20 * 60 * 1000);
    }
    return game;
}
function removePlayer(gameId, playerId) {
    const game = games.get(gameId);
    if (!game)
        return null;
    game.players = game.players.filter(p => p.id !== playerId);
    // Réattribuer l'admin si nécessaire
    if (game.admin === playerId && game.players.length > 0) {
        game.admin = game.players[0].id;
    }
    return game;
}
// cleanup games that are older than 60 min
function cleanupGames() {
    const now = new Date();
    const before = games.size;
    games.forEach((game, gameId) => {
        if (now.getTime() - game.createdAt.getTime() > 60 * 60 * 1000) {
            games.delete(gameId);
        }
    });
    console.log('Cleanup games : ', before - games.size, 'games deleted');
}
// Nouvelles méthodes utilitaires
function isGameAdmin(game, playerId) {
    return game.admin === playerId;
}
function canJoinGame(game) {
    return game.status === "waiting";
}
function canStartGame(game) {
    return game.status === "waiting" && game.players.length >= 2;
}
// Pour les tests
function clearGames() {
    games.clear();
}
