
import { GameDataItem } from './types';

export const GAME_DATA: GameDataItem[] = [
  { word: "witch", emoji: "🧙‍♀️" },
  { word: "wizard", emoji: "🧙‍♂️" },
  { word: "vampire", emoji: "🧛" },
  { word: "monster", emoji: "👹" },
  { word: "zombie", emoji: "🧟" },
  { word: "skeleton", emoji: "💀" },
  { word: "bat", emoji: "🦇" },
  { word: "pumpkin", emoji: "🎃" },
  { word: "spider", emoji: "🕷️" },
  { word: "costume", emoji: "🦸" },
  { word: "mask", emoji: "👺" },
  { word: "candle", emoji: "🕯️" },
  { word: "hat", emoji: "🎩" },
  { word: "web", emoji: "🕸️" },
  { word: "broom", emoji: "🧹" },
  { word: "ghost", emoji: "👻" },
  { word: "candy", emoji: "🍬" },
  { word: "grave", emoji: "🪦" }
];

export const MAX_SCORE = 10;
export const GRAVITY = 0.15; // Reduced from 0.25 for slower movement
export const SABER_LIFE = 10;
export const PARTICLE_COUNT = 15;
