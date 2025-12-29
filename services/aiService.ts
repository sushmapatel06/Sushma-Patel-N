
import { Player, Difficulty } from '../types';

const WIN_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
  [0, 4, 8], [2, 4, 6]             // Diagonals
];

export const checkWinner = (board: Player[]): { winner: Player; line: number[] | null } => {
  for (const combo of WIN_COMBINATIONS) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: combo };
    }
  }
  return { winner: null, line: null };
};

export const getBestMove = (board: Player[], difficulty: Difficulty, aiPlayer: Player): number => {
  const opponent = aiPlayer === 'X' ? 'O' : 'X';
  const availableMoves = board.map((val, idx) => (val === null ? idx : null)).filter((val) => val !== null) as number[];

  if (difficulty === Difficulty.EASY) {
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
  }

  if (difficulty === Difficulty.MEDIUM) {
    // 1. Can AI win now?
    for (const move of availableMoves) {
      const tempBoard = [...board];
      tempBoard[move] = aiPlayer;
      if (checkWinner(tempBoard).winner === aiPlayer) return move;
    }
    // 2. Can opponent win now? Block them.
    for (const move of availableMoves) {
      const tempBoard = [...board];
      tempBoard[move] = opponent;
      if (checkWinner(tempBoard).winner === opponent) return move;
    }
    // 3. Otherwise random
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
  }

  // HARD: Minimax
  const minimax = (tempBoard: Player[], isMaximizing: boolean): number => {
    const result = checkWinner(tempBoard).winner;
    if (result === aiPlayer) return 10;
    if (result === opponent) return -10;
    if (tempBoard.every(s => s !== null)) return 0;

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (tempBoard[i] === null) {
          tempBoard[i] = aiPlayer;
          const score = minimax(tempBoard, false);
          tempBoard[i] = null;
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (tempBoard[i] === null) {
          tempBoard[i] = opponent;
          const score = minimax(tempBoard, true);
          tempBoard[i] = null;
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  };

  let bestMove = -1;
  let bestScore = -Infinity;
  for (const move of availableMoves) {
    const tempBoard = [...board];
    tempBoard[move] = aiPlayer;
    const score = minimax(tempBoard, false);
    tempBoard[move] = null;
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }
  return bestMove;
};
