
export type Player = 'X' | 'O' | null;

export enum GameMode {
  PVP = 'PVP',
  PVE = 'PVE'
}

export enum Difficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD'
}

export type GameStatus = 'PLAYING' | 'X_WON' | 'O_WON' | 'DRAW';

export interface Score {
  X: number;
  O: number;
  draws: number;
}
