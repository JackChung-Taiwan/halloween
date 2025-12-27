
export interface GameDataItem {
  word: string;
  emoji: string;
}

export enum GameStatus {
  START = 'START',
  PLAYING = 'PLAYING',
  VICTORY = 'VICTORY',
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

export interface SaberPoint {
  x: number;
  y: number;
  life: number;
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number; // 1.0 to 0.0
  velocity: number;
}

export interface Card {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  rotationSpeed: number;
  data: GameDataItem;
  isTarget: boolean;
  size: number;
  isSlashed: boolean;
}
