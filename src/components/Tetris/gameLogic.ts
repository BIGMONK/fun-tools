export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

export type Cell = string | null;
export type Board = Cell[][];

export interface Piece {
  shape: number[][];
  color: string;
  x: number;
  y: number;
}

export const PIECES: { shape: number[][]; color: string }[] = [
  { shape: [[1, 1, 1, 1]], color: '#06b6d4' },
  { shape: [[1, 1], [1, 1]], color: '#eab308' },
  { shape: [[0, 1, 0], [1, 1, 1]], color: '#a855f7' },
  { shape: [[1, 0, 0], [1, 1, 1]], color: '#f97316' },
  { shape: [[0, 0, 1], [1, 1, 1]], color: '#3b82f6' },
  { shape: [[0, 1, 1], [1, 1, 0]], color: '#22c55e' },
  { shape: [[1, 1, 0], [0, 1, 1]], color: '#ef4444' },
];

export function createBoard(): Board {
  return Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(null));
}

export function randomPiece(): Piece {
  const template = PIECES[Math.floor(Math.random() * PIECES.length)];
  return {
    shape: template.shape,
    color: template.color,
    x: Math.floor(BOARD_WIDTH / 2) - Math.floor(template.shape[0].length / 2),
    y: 0,
  };
}

export function rotatePiece(piece: Piece): Piece {
  const rows = piece.shape.length;
  const cols = piece.shape[0].length;
  const rotated = Array.from({ length: cols }, () => Array(rows).fill(0));
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      rotated[c][rows - 1 - r] = piece.shape[r][c];
    }
  }
  return { ...piece, shape: rotated };
}

export function isValidPosition(board: Board, piece: Piece, dx = 0, dy = 0): boolean {
  for (let r = 0; r < piece.shape.length; r++) {
    for (let c = 0; c < piece.shape[r].length; c++) {
      if (!piece.shape[r][c]) continue;
      const nx = piece.x + c + dx;
      const ny = piece.y + r + dy;
      if (nx < 0 || nx >= BOARD_WIDTH || ny >= BOARD_HEIGHT) return false;
      if (ny >= 0 && board[ny][nx]) return false;
    }
  }
  return true;
}

export function placePiece(board: Board, piece: Piece): Board {
  const newBoard = board.map((row) => [...row]);
  for (let r = 0; r < piece.shape.length; r++) {
    for (let c = 0; c < piece.shape[r].length; c++) {
      if (!piece.shape[r][c]) continue;
      const nx = piece.x + c;
      const ny = piece.y + r;
      if (ny >= 0) newBoard[ny][nx] = piece.color;
    }
  }
  return newBoard;
}

export function clearLines(board: Board): { board: Board; linesCleared: number } {
  const newBoard = board.filter((row) => row.some((cell) => !cell));
  const linesCleared = BOARD_HEIGHT - newBoard.length;
  const emptyRows = Array.from({ length: linesCleared }, () => Array(BOARD_WIDTH).fill(null));
  return { board: [...emptyRows, ...newBoard], linesCleared };
}

export function calcScore(lines: number, level: number): number {
  const base = [0, 100, 300, 500, 800];
  return (base[lines] || 0) * (level + 1);
}
