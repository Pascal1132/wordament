"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
const socket_io_client_1 = require("socket.io-client");
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const sockets_1 = __importDefault(require("../../src/sockets"));
const GameService = __importStar(require("../../src/services/GameService"));
jest.setTimeout(10000); // 10 sec max pour le test (timer de 3 sec)
// Variables globales pour le serveur de test
let ioServer, httpServer, httpServerAddr;
// Avant tous les tests, on démarre un serveur de test
beforeAll((done) => {
    const app = (0, express_1.default)();
    httpServer = http_1.default.createServer(app);
    ioServer = new socket_io_1.Server(httpServer, {
        cors: { origin: "*" },
    });
    // On initialise nos events Socket.io (services + events)
    (0, sockets_1.default)(ioServer);
    // Patch le service de game pour que la durée soit de 3 secondes pendant le test
    const originalCreateGame = GameService.createGame;
    jest.spyOn(GameService, 'createGame').mockImplementation((adminId, adminName) => originalCreateGame(adminId, adminName, 3));
    httpServer.listen(() => {
        httpServerAddr = httpServer.address();
        done();
    });
});
// Fermeture du serveur après les tests
afterAll((done) => {
    ioServer.close();
    httpServer.close();
    done();
});
// Fonction utilitaire pour créer un client Socket.io
function createClient() {
    return (0, socket_io_client_1.io)(`http://localhost:${httpServerAddr.port}`);
}
describe("Game Service Integration Tests", () => {
    let clientAdmin, clientPlayer;
    beforeEach((done) => {
        GameService.clearGames();
        clientAdmin = createClient();
        clientPlayer = createClient();
        // Petit délai pour s'assurer que les connexions sont établies
        setTimeout(done, 500);
    });
    afterEach(() => {
        if (clientAdmin.connected)
            clientAdmin.disconnect();
        if (clientPlayer.connected)
            clientPlayer.disconnect();
    });
    test("Création d'utilisateur avec nom invalide", (done) => {
        clientAdmin.emit("createUser", { name: "" });
        clientAdmin.once("error", (error) => {
            expect(error.message).toBe("Nom invalide");
            done();
        });
    });
    test("Création d'utilisateur réussie", (done) => {
        clientAdmin.emit("createUser", { name: "AdminUser" });
        clientAdmin.once("userCreated", (response) => {
            expect(response.name).toBe("AdminUser");
            expect(response.id).toBe(clientAdmin.id);
            done();
        });
    });
    test("Création de partie sans utilisateur", (done) => {
        clientAdmin.emit("createGame");
        clientAdmin.once("error", (error) => {
            expect(error.message).toBe("Crée d'abord ton user");
            done();
        });
    });
    test("Rejoindre une partie inexistante", (done) => {
        clientPlayer.emit("createUser", { name: "PlayerUser" });
        clientPlayer.once("userCreated", () => {
            clientPlayer.emit("joinGame", { gameId: "invalid-id" });
            clientPlayer.once("error", (error) => {
                expect(error.message).toBe("Partie non trouvée ou déjà démarrée");
                done();
            });
        });
    });
    test("Cycle de vie complet d'une partie", (done) => {
        let gameId;
        let timerEventCount = 0;
        // 1. Admin crée son user
        clientAdmin.emit("createUser", { name: "AdminUser" });
        clientAdmin.once("userCreated", (user) => {
            expect(user.name).toBe("AdminUser");
            // 2. Admin crée la partie
            clientAdmin.emit("createGame");
        });
        // 3. On reçoit la création de la game
        clientAdmin.once("gameCreated", (response) => {
            gameId = response.game.id;
            expect(response.game.admin).toBe(clientAdmin.id);
            // S'assurer que la partie ne contient pas de grille (null ou undefined)
            expect(response.game.grid).toBeUndefined();
            // 4. Le player crée son user
            clientPlayer.emit("createUser", { name: "PlayerUser" });
        });
        // 5. Player rejoint la game
        clientPlayer.once("userCreated", (user) => {
            expect(user.name).toBe("PlayerUser");
            clientPlayer.emit("joinGame", { gameId });
        });
        clientPlayer.once("playerJoined", (response) => {
            expect(response.game.id).toBe(gameId);
            expect(response.game.grid).toBeUndefined();
            expect(response.player.name).toBe("PlayerUser");
            // 6. L'admin démarre la partie
            clientAdmin.emit("startGame", { gameId });
            // on attend que la grille soit créée
            clientAdmin.once("gameStatusChanged", (response) => {
                expect(response.gameId).toBe(gameId);
                expect(response.status).toBe("running");
                expect(response.grid).not.toBeUndefined();
            });
        });
        // On écoute les événements "timer"
        clientAdmin.on("timer", (data) => {
            if (data.gameId === gameId) {
                timerEventCount++;
                expect(data.remainingTime).toBeLessThanOrEqual(3);
            }
        });
        // On s'attend à recevoir l'événement "gameEnded"
        clientAdmin.once("gameEnded", (response) => {
            expect(response.gameId).toBe(gameId);
            expect(timerEventCount).toBeGreaterThan(0);
            done();
        });
    });
    test("Démarrage de partie sans être admin", (done) => {
        let gameId;
        // Admin crée la partie
        clientAdmin.emit("createUser", { name: "AdminUser" });
        clientAdmin.once("userCreated", () => clientAdmin.emit("createGame"));
        clientAdmin.once("gameCreated", (response) => {
            gameId = response.game.id;
            // Player essaie de démarrer la partie
            clientPlayer.emit("createUser", { name: "PlayerUser" });
            clientPlayer.once("userCreated", () => {
                clientPlayer.emit("joinGame", { gameId });
                clientPlayer.once("playerJoined", () => {
                    clientPlayer.emit("startGame", { gameId });
                    clientPlayer.once("error", (error) => {
                        expect(error.message).toBe("Seul l'admin peut démarrer la partie");
                        done();
                    });
                });
            });
        });
    });
});
