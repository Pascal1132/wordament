export type GameStatus = "waiting" | "running" | "finished";

export interface Player {
  id: string;
  name: string;
}

export interface Grid {
  letters: string[][];
}

export interface PlayerWord {
  playerId: string;
  word: string;
  points: number;
}

export interface PlayerScore {
  playerId: string;
  playerName: string;
  score: number;
}

export interface Game {
  id: string;
  admin: string;
  players: Player[];
  status: GameStatus;
  grid?: Grid;
  createdAt: Date;
  gridSize: number;
  timer?: NodeJS.Timeout;
  remainingTime: number;
  playerScores: PlayerScore[];
  words: PlayerWord[];
}

// Events Requests
export interface CreateGameRequest {}

export interface RevengeRequest {
  gameId: string;
}

export interface JoinGameRequest {
  gameId: string;
}

export interface StartGameRequest {
  gameId: string;
}

// Events Responses
export interface GameCreatedResponse {
  game: Game;
}

export interface PlayerJoinedResponse {
  player: Player;
  game: Game;
}

export interface GameStatusChangedResponse {
  gameId: string;
  status: GameStatus;
  grid?: Grid;
  playerScores: PlayerScore[];
  words: PlayerWord[];
}

export interface WordSelectedResponse {
  gameId: string;
  status: GameStatus;
  grid?: Grid;
  playerScores: PlayerScore[];
  currentPlayerWords: PlayerWord[];
}


export interface WordSelectedRequest {
  gameId: string;
  word: string;
}



export interface TimerUpdateResponse {
  gameId: string;
  remainingTime: number;
}

export interface PlayerLeftResponse {
  playerId: string;
  game: Game;
}

export interface AdminChangedResponse {
  gameId: string;
  newAdmin: string;
}

export interface GameEndedResponse {
  gameId: string;
} 