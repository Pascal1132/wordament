export type GameStatus = 'waiting' | 'running' | 'finished'

export interface Player {
  id: string
  name: string
}

export interface Grid {
  letters: string[][]
}

export interface PlayerWord {
  word: string
  points: number,
  playerId: string
}

export interface PlayerScore {
  playerId: string
  playerName: string
  score: number
}

export interface Game {
  id: string
  admin: string
  players: Player[]
  grid?: Grid
  gridSize: number
  status: GameStatus
  remainingTime: number
  playerScores: PlayerScore[],
  words: PlayerWord[]
}
