export const CANVAS_W = 1920;
export const CANVAS_H = 1080;
export const GRID_SIZE = 20;
export const GRID_COLS = CANVAS_W / GRID_SIZE; // 96
export const GRID_ROWS = CANVAS_H / GRID_SIZE; // 54
export const EXPORT_SCALE = 4;
export const FPS = 24;
export const BG_COLOR = '#323232';

export const FIXED_COLORS = ['#000000', '#FFFFFF'] as const;

export const DEFAULT_CUSTOM_COLORS: string[] = [];

export interface ColorPair {
  bg: string;
  fg: string;
}

export type PatternAnimType =
  | 'dots'
  | 'capsule'
  | 'circle'
  | 'arrow'
  | 'square'
  | 'stripes'
  | 'cross';

export interface SvgShapeInfo {
  tag: 'rect' | 'circle' | 'path';
  x: number;
  y: number;
  w: number;
  h: number;
  rx: number;
  cx: number;
  cy: number;
  rotation: number;
  rotOriginX: number;
  rotOriginY: number;
  isStroked: boolean;
  strokeWidth: number;
  stagger: number;
}

export interface PatternDef {
  id: string;
  name: string;
  svgText: string;
  animType: PatternAnimType;
  shapes: SvgShapeInfo[];
}

export interface TitleElement {
  id: string;
  img: HTMLImageElement;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface PatternElement {
  id: string;
  patternId: string;
  x: number;
  y: number;
  colors: ColorPair;
  animDelay: number;
  clipSide: 'top' | 'bottom' | 'left' | 'right';
}

export interface SquareElement {
  id: string;
  x: number;
  y: number;
  size: number;
  color: string;
  clipSide: 'top' | 'bottom' | 'left' | 'right';
  animDelay: number;
}

export interface DotElement {
  id: string;
  x: number;
  y: number;
  color: string;
  blinkPhase: number;
  blinkSpeed: number;
}

export type ExportLayer = 'titles' | 'patterns' | 'dots';

export interface AnimationState {
  t: number;
  titleClips: Map<string, { x: number; y: number; w: number; h: number }>;
  patternProgress: Map<string, number>;
  squareClips: Map<string, { x: number; y: number; w: number; h: number }>;
  dotOpacities: Map<string, number>;
}
