// src/services/gameService.ts

import GridCreator from '../utils/GridCreator';
import { Game, Player, GameStatus } from '../types/game.types';

// Stockage en mémoire des parties (attention, c'est juste pour du demo)
const games: Map<string, Game> = new Map();

export function generateGameId(): string {
  return Math.random().toString(36).substr(2, 6);
}

export function createGame(adminId: string, adminName: string, duration = 60, gridSize = 4): Game {
  const gameId = generateGameId();
  const game: Game = {
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

export function getGame(gameId: string): Game | undefined {
  return games.get(gameId);
}

export function joinGame(gameId: string, playerId: string, playerName: string): Game | null {
  const game = games.get(gameId);
  if (!game || game.status !== "waiting") return null;
  
  const existingPlayer = game.players.find(p => p.id === playerId);
  if (existingPlayer) return game;

  const newPlayer: Player = { id: playerId, name: playerName };
  game.players.push(newPlayer);
  
  // Ajouter le score du joueur
  game.playerScores.push({
    playerId,
    playerName,
    score: 0,
  });
  
  return game;
}

export function startGame(gameId: string): Game | null {
  const game = games.get(gameId);
  if (!game || game.status !== "waiting") return null;

  game.grid = GridCreator.createGrid(game.gridSize);
  
  game.status = "running";
  return game;
}

export function endGame(gameId: string): Game | null {
  const game = games.get(gameId);
  if (!game) return null;
  
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

export function removePlayer(gameId: string, playerId: string): Game | null {
  const game = games.get(gameId);
  if (!game) return null;
  
  game.players = game.players.filter(p => p.id !== playerId);
  
  // Réattribuer l'admin si nécessaire
  if (game.admin === playerId && game.players.length > 0) {
    game.admin = game.players[0].id;
  }
  
  return game;
}

// cleanup games that are older than 60 min
export function cleanupGames(): void {
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
export function isGameAdmin(game: Game, playerId: string): boolean {
  return game.admin === playerId;
}

export function canJoinGame(game: Game): boolean {
  return game.status === "waiting";
}

export function canStartGame(game: Game): boolean {
  return game.status === "waiting" && game.players.length >= 2;
}

// Pour les tests
export function clearGames(): void {
  games.clear();
}
