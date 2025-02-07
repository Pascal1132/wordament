// src/sockets/gameEvents.ts
import { Socket, Server } from "socket.io";
import * as GameService from "../services/GameService";
import {
  CreateGameRequest,
  JoinGameRequest,
  StartGameRequest,
  GameCreatedResponse,
  PlayerJoinedResponse,
  GameStatusChangedResponse,
  TimerUpdateResponse,
  PlayerLeftResponse,
  AdminChangedResponse,
  GameEndedResponse,
  WordSelectedRequest,
  Grid,
  PlayerScore,
  RevengeRequest,
  WordSelectedResponse
} from '../types/game.types';
import { ErrorResponse, WordValidatingError } from '../types/user.types';
import * as WordValidator from '../utils/WordValidator';

// cleanup games every 10 min
setInterval(GameService.cleanupGames, 10 * 60 * 1000);

export default function registerGameEvents(socket: Socket, io: Server) {
  // Création d'une partie
  socket.on("createGame", (_data: CreateGameRequest) => {

    console.log("createGame", socket.data);
    if (!socket.data.username) {
      const error: ErrorResponse = { message: "Crée d'abord ton user" };
      socket.emit("error", error);
      return;
    }

    const game = GameService.createGame(socket.id, socket.data.username);
    socket.join(game.id);

    const createdResponse: GameCreatedResponse = { game };
    socket.emit("gameCreated", createdResponse);

    const statusResponse: GameStatusChangedResponse = {
      gameId: game.id,
      status: game.status,
      grid: game.grid,
      playerScores: game.playerScores,
      words: game.words
    };
    io.to(game.id).emit("gameStatusChanged", statusResponse);
  });

  socket.on("revenge", (data: RevengeRequest) => {
    if (!socket.data.username) {
      const error: ErrorResponse = { message: "Crée d'abord ton user" };
      socket.emit("error", error);
      return;
    }
    const game = GameService.getGame(data.gameId);
    if (!game) {
      const error: ErrorResponse = { message: "Partie non trouvée" };
      socket.emit("error", error);
      return;
    }

    const newGame = GameService.createGame(socket.id, socket.data.username);

    // Créer une copie des joueurs de l'ancienne partie (sauf le créateur qui est déjà ajouté)
    const playersToAdd = game.players.filter(player => player.id !== socket.id);
    playersToAdd.forEach(player => {
      const playerSocket = io.sockets.sockets.get(player.id);
      if (playerSocket && playerSocket.data.username) {
        // Ajouter le joueur à la nouvelle partie avec son username actuel
        GameService.joinGame(newGame.id, player.id, playerSocket.data.username);
        // Faire rejoindre le socket room au joueur
        playerSocket.join(newGame.id);
      }
    });

    // Ajouter le créateur au socket room
    socket.join(newGame.id);

    // Envoyer la nouvelle partie à tous les joueurs
    const createdResponse: GameCreatedResponse = { game: newGame };
    io.to(newGame.id).emit("gameCreated", createdResponse);
    
    const statusResponse: GameStatusChangedResponse = {
      gameId: newGame.id,
      status: newGame.status,
      grid: newGame.grid,
      playerScores: newGame.playerScores,
      words: newGame.words
    };
    io.to(newGame.id).emit("gameStatusChanged", statusResponse);
  });

  // Rejoindre une partie existante
  socket.on("joinGame", (data: JoinGameRequest) => {
    if (!socket.data.username) {
      const error: ErrorResponse = { message: "Crée d'abord ton user" };
      socket.emit("error", error);
      return;
    }

    const game = GameService.joinGame(data.gameId, socket.id, socket.data.username);
    if (!game) {
      const error: ErrorResponse = { message: "Partie non trouvée ou déjà démarrée" };
      socket.emit("error", error);
      return;
    }

    socket.join(data.gameId);

    const response: PlayerJoinedResponse = {
      player: { id: socket.id, name: socket.data.username },
      game
    };
    io.to(data.gameId).emit("playerJoined", response);
  });

  // Démarrer une partie (seul l'admin peut le faire)
  socket.on("startGame", (data: StartGameRequest) => {
    const game = GameService.getGame(data.gameId);
    if (!game) {
      const error: ErrorResponse = { message: "Partie non trouvée" };
      socket.emit("error", error);
      return;
    }

    if (!GameService.isGameAdmin(game, socket.id)) {
      const error: ErrorResponse = { message: "Seul l'admin peut démarrer la partie" };
      socket.emit("error", error);
      return;
    }

    if (!GameService.canStartGame(game)) {
      const error: ErrorResponse = { message: "La partie ne peut pas démarrer (minimum 2 joueurs requis)" };
      socket.emit("error", error);
      return;
    }

    // On s'assure d'arrêter un éventuel timer existant
    if (game.timer) {
      clearInterval(game.timer);
    }

    GameService.startGame(data.gameId);

    const statusResponse: GameStatusChangedResponse = {
      gameId: game.id,
      status: game.status,
      grid: game.grid,
      playerScores: game.playerScores,
      words: game.words
    };
    io.to(data.gameId).emit("gameStatusChanged", statusResponse);

    // Démarrage du timer
    const timer = setInterval(() => {
      const currentGame = GameService.getGame(data.gameId);
      if (!currentGame || currentGame.status !== "running") {
        clearInterval(timer);
        return;
      }

      currentGame.remainingTime--;
      
      const timerResponse: TimerUpdateResponse = {
        gameId: currentGame.id,
        remainingTime: currentGame.remainingTime
      };
      io.to(currentGame.id).emit("timer", timerResponse);

      if (currentGame.remainingTime <= 0) {
        clearInterval(timer);
        GameService.endGame(data.gameId);
        
        const endedResponse: GameEndedResponse = { gameId: currentGame.id };
        io.to(currentGame.id).emit("gameEnded", endedResponse);

        const finalStatusResponse: GameStatusChangedResponse = {
          gameId: currentGame.id,
          status: "finished",
          grid: currentGame.grid,
          playerScores: currentGame.playerScores,
          words: currentGame.words
        };
        io.to(currentGame.id).emit("gameStatusChanged", finalStatusResponse);
      }
    }, 1000);

    game.timer = timer;
  });

  socket.on("wordSelect", (data: WordSelectedRequest) => {
    const game = GameService.getGame(data.gameId);
    if (!game) {
      const error: ErrorResponse = { message: "Partie non trouvée" };
      socket.emit("error", error);
      return;
    }

    if (game.status !== "running") {
      const error: ErrorResponse = { message: "La partie n'est pas en cours" };
      socket.emit("error", error);
      return;
    }
    
    const playerScore = game.playerScores.find(ps => ps.playerId === socket.id);
    if (!playerScore) {
      const error: ErrorResponse = { message: "Vous ne pouvez pas sélectionner de mot si vous n'êtes pas un joueur" };
      socket.emit("error", error);
      return;
    }

    if (!game.grid) {
      const error: ErrorResponse = { message: "La grille n'est pas encore générée" };
      socket.emit("error", error);
      return;
    }

    const word = data.word;
    const gridSize = game.gridSize;

    if (!WordValidator.validateWord(word, gridSize, game.grid as Grid)) {
      const error: WordValidatingError = { gameId: game.id, code: "INVALID_WORD", word };
      socket.emit("wordValidatingError", error);
      return;
    }

    // Vérifier si le mot a déjà été joué par le joueur
    if (game.words.some(w => w.word === word && w.playerId === playerScore.playerId)) {
      const error: WordValidatingError = { gameId: game.id, code: "INVALID_WORD", word };
      socket.emit("wordValidatingError", error);
      return;
    }

    const wordPoints = WordValidator.calculateWordPoints(word, gridSize, game.grid as Grid);
    
    // Ajouter le mot au score du joueur
    const newWord = { word, points: wordPoints, playerId: playerScore.playerId };
    game.words.push(newWord);
    playerScore.score += wordPoints;

    // Envoyer à chaque joueur uniquement ses propres mots
    game.players.forEach(player => {
      const response: WordSelectedResponse = {
        gameId: game.id,
        status: game.status,
        grid: game.grid,
        playerScores: game.playerScores,
        currentPlayerWords: game.words.filter(w => w.playerId === player.id)
      };
      io.to(player.id).emit("wordSelected", response);
    });
  });

  // Gestion de la déconnexion
  socket.on("disconnect", () => {
    const rooms = io.sockets.adapter.rooms;
    if (!rooms) return;

    for (const [roomId, room] of rooms.entries()) {
      const game = GameService.getGame(roomId);
      if (game) {
        // Si c'est l'admin qui se déconnecte, on arrête le timer
        if (game.admin === socket.id && game.timer) {
          clearInterval(game.timer);
          delete game.timer;
        }

        GameService.removePlayer(game.id, socket.id);
        
        const leftResponse: PlayerLeftResponse = {
          playerId: socket.id,
          game
        };
        io.to(game.id).emit("playerLeft", leftResponse);

        const adminResponse: AdminChangedResponse = {
          gameId: game.id,
          newAdmin: game.admin
        };
        io.to(game.id).emit("adminChanged", adminResponse);
      }
    }
  });

  socket.on("gameEnded", (response: { gameId: string }) => {
    const currentGame = GameService.getGame(response.gameId);
    if (currentGame) {
      const statusResponse: GameStatusChangedResponse = {
        gameId: currentGame.id,
        status: "finished",
        grid: currentGame.grid,
        playerScores: currentGame.playerScores,
        words: currentGame.words
      };
      io.to(currentGame.id).emit("gameStatusChanged", statusResponse);
    }
  });
}
