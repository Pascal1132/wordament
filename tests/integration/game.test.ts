import { Server } from "socket.io";
import { io as Client, Socket } from "socket.io-client";
import express from "express";
import http from "http";
import socketHandler from "../../src/sockets";
import * as GameService from "../../src/services/GameService";
import {
  Game,
  GameCreatedResponse,
  PlayerJoinedResponse,
  GameStatusChangedResponse,
  TimerUpdateResponse,
  GameEndedResponse
} from '../../src/types/game.types';
import { UserCreatedResponse } from '../../src/types/user.types';

jest.setTimeout(10000); // 10 sec max pour le test (timer de 3 sec)

// Variables globales pour le serveur de test
let ioServer: Server, httpServer: http.Server, httpServerAddr: any;

// Avant tous les tests, on démarre un serveur de test
beforeAll((done) => {
  const app = express();
  httpServer = http.createServer(app);
  ioServer = new Server(httpServer, {
    cors: { origin: "*" },
  });

  // On initialise nos events Socket.io (services + events)
  socketHandler(ioServer);

  // Patch le service de game pour que la durée soit de 3 secondes pendant le test
  const originalCreateGame = GameService.createGame;
  jest.spyOn(GameService, 'createGame').mockImplementation(
    (adminId: string, adminName: string) => originalCreateGame(adminId, adminName, 3)
  );

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
function createClient(): Socket {
  return Client(`http://localhost:${httpServerAddr.port}`);
}

describe("Game Service Integration Tests", () => {
  let clientAdmin: Socket, clientPlayer: Socket;

  beforeEach((done) => {
    GameService.clearGames();
    clientAdmin = createClient();
    clientPlayer = createClient();
    // Petit délai pour s'assurer que les connexions sont établies
    setTimeout(done, 500);
  });

  afterEach(() => {
    if (clientAdmin.connected) clientAdmin.disconnect();
    if (clientPlayer.connected) clientPlayer.disconnect();
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
    
    clientAdmin.once("userCreated", (response: UserCreatedResponse) => {
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
    let gameId: string;
    let timerEventCount = 0;

    // 1. Admin crée son user
    clientAdmin.emit("createUser", { name: "AdminUser" });
    
    clientAdmin.once("userCreated", (user: UserCreatedResponse) => {
      expect(user.name).toBe("AdminUser");
      // 2. Admin crée la partie
      clientAdmin.emit("createGame");
    });

    // 3. On reçoit la création de la game
    clientAdmin.once("gameCreated", (response: GameCreatedResponse) => {
      gameId = response.game.id;
      expect(response.game.admin).toBe(clientAdmin.id);
      
      // S'assurer que la partie ne contient pas de grille (null ou undefined)
      expect(response.game.grid).toBeUndefined();

      // 4. Le player crée son user
      clientPlayer.emit("createUser", { name: "PlayerUser" });
    });

    // 5. Player rejoint la game
    clientPlayer.once("userCreated", (user: UserCreatedResponse) => {
      expect(user.name).toBe("PlayerUser");
      clientPlayer.emit("joinGame", { gameId });
    });

    clientPlayer.once("playerJoined", (response: PlayerJoinedResponse) => {
      expect(response.game.id).toBe(gameId);
      expect(response.game.grid).toBeUndefined();
      expect(response.player.name).toBe("PlayerUser");
      // 6. L'admin démarre la partie
      clientAdmin.emit("startGame", { gameId });

      // on attend que la grille soit créée
      clientAdmin.once("gameStatusChanged", (response: GameStatusChangedResponse) => {
        expect(response.gameId).toBe(gameId);
        expect(response.status).toBe("running");
        expect(response.grid).not.toBeUndefined();
      });
    });

    

    // On écoute les événements "timer"
    clientAdmin.on("timer", (data: TimerUpdateResponse) => {
      if (data.gameId === gameId) {
        timerEventCount++;
        expect(data.remainingTime).toBeLessThanOrEqual(3);
      }
    });

    // On s'attend à recevoir l'événement "gameEnded"
    clientAdmin.once("gameEnded", (response: GameEndedResponse) => {
      expect(response.gameId).toBe(gameId);
      expect(timerEventCount).toBeGreaterThan(0);
      done();
    });
  });

  test("Démarrage de partie sans être admin", (done) => {
    let gameId: string;

    // Admin crée la partie
    clientAdmin.emit("createUser", { name: "AdminUser" });
    clientAdmin.once("userCreated", () => clientAdmin.emit("createGame"));

    clientAdmin.once("gameCreated", (response: GameCreatedResponse) => {
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
