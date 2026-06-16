import { GRID_SIZE, GRID_COLS, GRID_ROWS } from '../types';

export function snapToGrid(px: number): number {
  return Math.round(px / GRID_SIZE) * GRID_SIZE;
}

export class GridOccupancy {
  private cells: boolean[][];

  constructor() {
    this.cells = Array.from({ length: GRID_ROWS }, () =>
      new Array(GRID_COLS).fill(false),
    );
  }

  clear() {
    for (let r = 0; r < GRID_ROWS; r++)
      for (let c = 0; c < GRID_COLS; c++) this.cells[r][c] = false;
  }

  markRect(x: number, y: number, w: number, h: number) {
    const c0 = Math.floor(x / GRID_SIZE);
    const r0 = Math.floor(y / GRID_SIZE);
    const c1 = Math.ceil((x + w) / GRID_SIZE);
    const r1 = Math.ceil((y + h) / GRID_SIZE);
    for (let r = r0; r < r1 && r < GRID_ROWS; r++)
      for (let c = c0; c < c1 && c < GRID_COLS; c++)
        if (r >= 0 && c >= 0) this.cells[r][c] = true;
  }

  isBlockFree(col: number, row: number, spanCols: number, spanRows: number): boolean {
    if (col < 0 || row < 0) return false;
    if (col + spanCols > GRID_COLS || row + spanRows > GRID_ROWS) return false;
    for (let r = row; r < row + spanRows; r++)
      for (let c = col; c < col + spanCols; c++)
        if (this.cells[r][c]) return false;
    return true;
  }

  isCellFree(col: number, row: number): boolean {
    if (col < 0 || row < 0 || col >= GRID_COLS || row >= GRID_ROWS) return false;
    return !this.cells[row][col];
  }

  markBlock(col: number, row: number, spanCols: number, spanRows: number) {
    for (let r = row; r < row + spanRows && r < GRID_ROWS; r++)
      for (let c = col; c < col + spanCols && c < GRID_COLS; c++)
        if (r >= 0 && c >= 0) this.cells[r][c] = true;
  }

  findFreeBlocks(spanCols: number, spanRows: number, align = 1): Array<[number, number]> {
    const result: Array<[number, number]> = [];
    const stepC = Math.max(1, align);
    const stepR = Math.max(1, align);
    for (let r = 0; r <= GRID_ROWS - spanRows; r += stepR)
      for (let c = 0; c <= GRID_COLS - spanCols; c += stepC)
        if (this.isBlockFree(c, r, spanCols, spanRows)) result.push([c, r]);
    return result;
  }

  findFreeCells(): Array<[number, number]> {
    const result: Array<[number, number]> = [];
    for (let r = 0; r < GRID_ROWS; r++)
      for (let c = 0; c < GRID_COLS; c++)
        if (!this.cells[r][c]) result.push([c, r]);
    return result;
  }
}

export function shuffle<T>(arr: T[], rand: () => number = Math.random): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
