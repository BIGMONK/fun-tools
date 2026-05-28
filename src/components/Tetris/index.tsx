import { useEffect, useCallback, useRef, useState } from 'react';
import {
  BOARD_WIDTH, BOARD_HEIGHT, Board, Piece,
  createBoard, randomPiece, rotatePiece,
  isValidPosition, placePiece, clearLines, calcScore,
} from './gameLogic';
import { ChevronDown, ChevronLeft, ChevronRight, RotateCcw as RotateIcon, Play, Pause } from 'lucide-react';

type GameState = 'idle' | 'playing' | 'paused' | 'over';

const CELL_SIZE = 28;

export default function Tetris() {
  const [board, setBoard] = useState<Board>(createBoard());
  const [current, setCurrent] = useState<Piece | null>(null);
  const [next, setNext] = useState<Piece | null>(null);
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(0);
  const [gameState, setGameState] = useState<GameState>('idle');

  const boardRef = useRef(board);
  const currentRef = useRef(current);
  const nextRef = useRef(next);
  const gameStateRef = useRef(gameState);
  boardRef.current = board;
  currentRef.current = current;
  nextRef.current = next;
  gameStateRef.current = gameState;

  const dropInterval = Math.max(100, 800 - level * 70);

  const lockPiece = useCallback((b: Board, p: Piece) => {
    const placed = placePiece(b, p);
    const { board: cleared, linesCleared } = clearLines(placed);
    setBoard(cleared);
    const newLines = lines + linesCleared;
    setLines(newLines);
    setLevel(Math.floor(newLines / 10));
    setScore((prev) => prev + calcScore(linesCleared, level));
    const pieceToSpawn = nextRef.current || randomPiece();
    if (!isValidPosition(cleared, pieceToSpawn)) {
      setGameState('over');
      setCurrent(null);
    } else {
      setCurrent(pieceToSpawn);
      setNext(randomPiece());
    }
  }, [level, lines]);

  const moveDown = useCallback(() => {
    const p = currentRef.current;
    const b = boardRef.current;
    if (!p || gameStateRef.current !== 'playing') return;
    if (isValidPosition(b, p, 0, 1)) {
      setCurrent({ ...p, y: p.y + 1 });
    } else {
      lockPiece(b, p);
    }
  }, [lockPiece]);

  const moveLeft = useCallback(() => {
    const p = currentRef.current;
    if (!p || gameStateRef.current !== 'playing') return;
    if (isValidPosition(boardRef.current, p, -1, 0)) setCurrent({ ...p, x: p.x - 1 });
  }, []);

  const moveRight = useCallback(() => {
    const p = currentRef.current;
    if (!p || gameStateRef.current !== 'playing') return;
    if (isValidPosition(boardRef.current, p, 1, 0)) setCurrent({ ...p, x: p.x + 1 });
  }, []);

  const rotate = useCallback(() => {
    const p = currentRef.current;
    if (!p || gameStateRef.current !== 'playing') return;
    const rotated = rotatePiece(p);
    if (isValidPosition(boardRef.current, rotated)) setCurrent(rotated);
    else if (isValidPosition(boardRef.current, rotated, 1, 0)) setCurrent({ ...rotated, x: rotated.x + 1 });
    else if (isValidPosition(boardRef.current, rotated, -1, 0)) setCurrent({ ...rotated, x: rotated.x - 1 });
  }, []);

  const hardDrop = useCallback(() => {
    const p = currentRef.current;
    const b = boardRef.current;
    if (!p || gameStateRef.current !== 'playing') return;
    let dropped = p;
    while (isValidPosition(b, dropped, 0, 1)) {
      dropped = { ...dropped, y: dropped.y + 1 };
    }
    lockPiece(b, dropped);
  }, [lockPiece]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (gameStateRef.current !== 'playing') return;
      switch (e.key) {
        case 'ArrowLeft': e.preventDefault(); moveLeft(); break;
        case 'ArrowRight': e.preventDefault(); moveRight(); break;
        case 'ArrowDown': e.preventDefault(); moveDown(); break;
        case 'ArrowUp': e.preventDefault(); rotate(); break;
        case ' ': e.preventDefault(); hardDrop(); break;
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [moveDown, moveLeft, moveRight, rotate, hardDrop]);

  useEffect(() => {
    if (gameState !== 'playing') return;
    const timer = setInterval(moveDown, dropInterval);
    return () => clearInterval(timer);
  }, [gameState, moveDown, dropInterval]);

  const startGame = () => {
    if(gameState === 'paused'){
      setGameState('playing');
      return;
    }
    setBoard(createBoard());
    const p1 = randomPiece();
    const p2 = randomPiece();
    setCurrent(p1);
    setNext(p2);
    setScore(0);
    setLines(0);
    setLevel(0);
    setGameState('playing');
  };

  const togglePause = () => {
    setGameState((s) => (s === 'playing' ? 'paused' : s === 'paused' ? 'playing' : s));
  };

  const getGhostY = (): number => {
    if (!current) return 0;
    let ghost = { ...current };
    while (isValidPosition(board, ghost, 0, 1)) ghost = { ...ghost, y: ghost.y + 1 };
    return ghost.y;
  };

  const renderBoard = () => {
    const display = board.map((row) => [...row]);
    const ghostY = getGhostY();
    if (current) {
      for (let r = 0; r < current.shape.length; r++) {
        for (let c = 0; c < current.shape[r].length; c++) {
          if (!current.shape[r][c]) continue;
          const gx = current.x + c;
          const gy = ghostY + r;
          if (gy >= 0 && gy < BOARD_HEIGHT && gx >= 0 && gx < BOARD_WIDTH && !display[gy][gx]) {
            display[gy][gx] = 'ghost';
          }
        }
      }
      for (let r = 0; r < current.shape.length; r++) {
        for (let c = 0; c < current.shape[r].length; c++) {
          if (!current.shape[r][c]) continue;
          const nx = current.x + c;
          const ny = current.y + r;
          if (ny >= 0 && ny < BOARD_HEIGHT && nx >= 0 && nx < BOARD_WIDTH) {
            display[ny][nx] = current.color;
          }
        }
      }
    }
    return display;
  };

  const renderNextPiece = () => {
    if (!next) return null;
    const grid = Array.from({ length: 4 }, () => Array(4).fill(null));
    const offsetR = Math.floor((4 - next.shape.length) / 2);
    const offsetC = Math.floor((4 - next.shape[0].length) / 2);
    next.shape.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell) grid[r + offsetR][c + offsetC] = next.color;
      });
    });
    return grid;
  };

  const displayBoard = renderBoard();
  const nextGrid = renderNextPiece();
  const cellSm = 22;

  return (
    <div className="flex flex-col items-center gap-4 p-4 max-w-2xl mx-auto">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">俄罗斯方块</h2>
        <p className="text-gray-400 text-sm">方向键移动，上键旋转，空格键直落</p>
      </div>

      <div className="flex gap-4 items-start">
        <div
          className="border-2 border-cyan-700 bg-gray-950 relative"
          style={{ width: BOARD_WIDTH * CELL_SIZE, height: BOARD_HEIGHT * CELL_SIZE }}
        >
          {displayBoard.map((row, r) =>
            row.map((cell, c) => (
              <div
                key={`${r}-${c}`}
                className="absolute"
                style={{
                  left: c * CELL_SIZE,
                  top: r * CELL_SIZE,
                  width: CELL_SIZE - 1,
                  height: CELL_SIZE - 1,
                  background: cell === 'ghost' ? 'rgba(255,255,255,0.07)' : cell || 'transparent',
                  border: cell && cell !== 'ghost' ? `1px solid ${cell}88` : cell === 'ghost' ? '1px dashed rgba(255,255,255,0.15)' : '1px solid rgba(255,255,255,0.03)',
                  borderRadius: 2,
                  boxShadow: cell && cell !== 'ghost' ? `inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.3)` : 'none',
                }}
              />
            ))
          )}

          {(gameState === 'idle' || gameState === 'over' || gameState === 'paused') && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-3">
              {gameState === 'over' && (
                <div className="text-center">
                  <p className="text-red-400 font-bold text-xl mb-1">Game Over</p>
                  <p className="text-gray-300 text-sm">得分: {score}</p>
                </div>
              )}
              {gameState === 'paused' && <p className="text-yellow-400 font-bold text-lg">已暂停</p>}
              <button
                onClick={startGame}
                className="flex items-center gap-2 px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-colors"
              >
                <Play size={16} />
                {gameState === 'over' ? '再来一局' : '开始游戏'}
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 min-w-[100px]">
          <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
            <p className="text-gray-400 text-xs mb-1">得分</p>
            <p className="text-cyan-400 font-bold text-lg">{score}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
            <p className="text-gray-400 text-xs mb-1">等级</p>
            <p className="text-yellow-400 font-bold text-lg">{level}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
            <p className="text-gray-400 text-xs mb-1">行数</p>
            <p className="text-green-400 font-bold text-lg">{lines}</p>
          </div>

          <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
            <p className="text-gray-400 text-xs mb-2">下一个</p>
            <div style={{ width: 4 * cellSm, height: 4 * cellSm, position: 'relative' }}>
              {nextGrid?.map((row, r) =>
                row.map((cell, c) => (
                  <div
                    key={`${r}-${c}`}
                    className="absolute"
                    style={{
                      left: c * cellSm,
                      top: r * cellSm,
                      width: cellSm - 1,
                      height: cellSm - 1,
                      background: cell || 'transparent',
                      border: cell ? `1px solid ${cell}88` : '1px solid transparent',
                      borderRadius: 2,
                    }}
                  />
                ))
              )}
            </div>
          </div>

          {(gameState === 'playing' || gameState === 'paused') && (
            <button
              onClick={togglePause}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
            >
              {gameState === 'playing' ? <Pause size={14} /> : <Play size={14} />}
              {gameState === 'playing' ? '暂停' : '继续'}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-2">
        <div />
        <button onPointerDown={rotate} className="bg-gray-700 hover:bg-gray-600 text-white rounded-lg p-3 flex items-center justify-center active:bg-gray-500">
          <RotateIcon size={20} />
        </button>
        <div />
        <button onPointerDown={moveLeft} className="bg-gray-700 hover:bg-gray-600 text-white rounded-lg p-3 flex items-center justify-center active:bg-gray-500">
          <ChevronLeft size={20} />
        </button>
        <button onPointerDown={hardDrop} className="bg-cyan-700 hover:bg-cyan-600 text-white rounded-lg p-3 flex items-center justify-center active:bg-cyan-500 text-xs font-bold">
          落下
        </button>
        <button onPointerDown={moveRight} className="bg-gray-700 hover:bg-gray-600 text-white rounded-lg p-3 flex items-center justify-center active:bg-gray-500">
          <ChevronRight size={20} />
        </button>
        <div />
        <button onPointerDown={moveDown} className="bg-gray-700 hover:bg-gray-600 text-white rounded-lg p-3 flex items-center justify-center active:bg-gray-500">
          <ChevronDown size={20} />
        </button>
        <div />
      </div>
    </div>
  );
}
