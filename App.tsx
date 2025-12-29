
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Player, GameMode, Difficulty, GameStatus, Score } from './types';
import { checkWinner, getBestMove } from './services/aiService';
import { getGameCommentary } from './services/geminiService';

// --- Sub-Components ---

const Square: React.FC<{
  value: Player;
  onClick: () => void;
  isWinningSquare: boolean;
  disabled: boolean;
}> = ({ value, onClick, isWinningSquare, disabled }) => {
  const getColors = () => {
    if (value === 'X') return 'text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]';
    if (value === 'O') return 'text-pink-400 drop-shadow-[0_0_8px_rgba(244,114,182,0.8)]';
    return '';
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || !!value}
      className={`
        relative w-full aspect-square rounded-2xl text-5xl sm:text-7xl font-bold flex items-center justify-center
        transition-all duration-300 transform
        ${!value && !disabled ? 'hover:bg-white/10 active:scale-95 cursor-pointer' : 'cursor-default'}
        ${isWinningSquare ? 'bg-white/20 border-2 border-white/50 scale-105 z-10' : 'bg-white/5 border border-white/10'}
        ${getColors()}
      `}
    >
      <span className={`transition-all duration-500 scale-110 ${value ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
        {value}
      </span>
      {isWinningSquare && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent animate-pulse" />
      )}
    </button>
  );
};

const StatusBadge: React.FC<{ text: string; color: string }> = ({ text, color }) => (
  <div className={`px-6 py-2 rounded-full font-semibold border-2 transition-all duration-500 ${color} shadow-lg`}>
    {text}
  </div>
);

// --- Main App ---

export default function App() {
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [turn, setTurn] = useState<Player>('X');
  const [status, setStatus] = useState<GameStatus>('PLAYING');
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [mode, setMode] = useState<GameMode>(GameMode.PVE);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.HARD);
  const [score, setScore] = useState<Score>({ X: 0, O: 0, draws: 0 });
  const [commentary, setCommentary] = useState<string>("Welcome to the Arena. X starts.");
  const [isAiThinking, setIsAiThinking] = useState(false);

  const boardRef = useRef<Player[]>(board);
  boardRef.current = board;

  const handleGameEnd = useCallback((resultStatus: GameStatus) => {
    setStatus(resultStatus);
    if (resultStatus === 'X_WON') setScore(s => ({ ...s, X: s.X + 1 }));
    if (resultStatus === 'O_WON') setScore(s => ({ ...s, O: s.O + 1 }));
    if (resultStatus === 'DRAW') setScore(s => ({ ...s, draws: s.draws + 1 }));
    
    // Fetch commentary for end game
    getGameCommentary(resultStatus, turn, mode, difficulty).then(setCommentary);
  }, [turn, mode, difficulty]);

  const makeMove = (index: number) => {
    if (board[index] || status !== 'PLAYING' || isAiThinking) return;

    const newBoard = [...board];
    newBoard[index] = turn;
    setBoard(newBoard);

    const { winner, line } = checkWinner(newBoard);
    if (winner) {
      setWinningLine(line);
      handleGameEnd(winner === 'X' ? 'X_WON' : 'O_WON');
      return;
    }

    if (newBoard.every(s => s !== null)) {
      handleGameEnd('DRAW');
      return;
    }

    const nextTurn = turn === 'X' ? 'O' : 'X';
    setTurn(nextTurn);
    
    // Minor commentary update during game
    if (Math.random() > 0.7) {
      getGameCommentary('PLAYING', nextTurn, mode, difficulty).then(setCommentary);
    }
  };

  // AI Effect
  useEffect(() => {
    if (mode === GameMode.PVE && turn === 'O' && status === 'PLAYING') {
      setIsAiThinking(true);
      const timer = setTimeout(() => {
        const move = getBestMove(boardRef.current, difficulty, 'O');
        makeMove(move);
        setIsAiThinking(false);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [turn, mode, status, difficulty]);

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setTurn('X');
    setStatus('PLAYING');
    setWinningLine(null);
    setIsAiThinking(false);
    setCommentary("Fresh start! X's turn.");
  };

  const resetAll = () => {
    resetGame();
    setScore({ X: 0, O: 0, draws: 0 });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full -z-10" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-600/10 blur-[120px] rounded-full -z-10" />

      {/* Header & Controls */}
      <header className="text-center mb-8 max-w-md w-full">
        <h1 className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-pink-500 mb-2 tracking-tighter">
          NEON TIC-TAC-TOE
        </h1>
        <div className="flex flex-col gap-4 bg-white/5 border border-white/10 p-4 rounded-3xl backdrop-blur-md">
          <div className="flex justify-between items-center gap-2">
            <div className="flex bg-white/10 p-1 rounded-xl">
              <button 
                onClick={() => { setMode(GameMode.PVE); resetGame(); }}
                className={`px-4 py-1.5 rounded-lg text-sm transition-all ${mode === GameMode.PVE ? 'bg-white/20 shadow-sm font-bold' : 'opacity-60 hover:opacity-100'}`}
              >
                vs AI
              </button>
              <button 
                onClick={() => { setMode(GameMode.PVP); resetGame(); }}
                className={`px-4 py-1.5 rounded-lg text-sm transition-all ${mode === GameMode.PVP ? 'bg-white/20 shadow-sm font-bold' : 'opacity-60 hover:opacity-100'}`}
              >
                vs Friend
              </button>
            </div>
            {mode === GameMode.PVE && (
              <select 
                value={difficulty} 
                onChange={(e) => { setDifficulty(e.target.value as Difficulty); resetGame(); }}
                className="bg-white/10 px-3 py-1.5 rounded-xl text-xs outline-none border border-white/10 font-medium"
              >
                <option value={Difficulty.EASY}>EASY</option>
                <option value={Difficulty.MEDIUM}>MEDIUM</option>
                <option value={Difficulty.HARD}>GOD MODE</option>
              </select>
            )}
          </div>
          
          <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-white/50 px-2">
            <div className="flex flex-col items-center">
              <span>X (PLAYER)</span>
              <span className="text-xl text-blue-400">{score.X}</span>
            </div>
            <div className="flex flex-col items-center">
              <span>DRAWS</span>
              <span className="text-xl text-gray-400">{score.draws}</span>
            </div>
            <div className="flex flex-col items-center">
              <span>O ({mode === GameMode.PVE ? 'AI' : 'PLAYER'})</span>
              <span className="text-xl text-pink-400">{score.O}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Commentary Box */}
      <div className="mb-6 h-12 flex items-center justify-center text-center max-w-sm">
        <p className="italic text-white/80 animate-in fade-in slide-in-from-bottom-2 duration-700">
          &ldquo;{commentary}&rdquo;
        </p>
      </div>

      {/* Turn Indicator */}
      <div className="mb-6">
        {status === 'PLAYING' ? (
          <StatusBadge 
            text={`${turn}'s Turn`} 
            color={turn === 'X' ? 'border-blue-500/50 text-blue-400' : 'border-pink-500/50 text-pink-400'} 
          />
        ) : (
          <div className="flex flex-col items-center gap-2">
            <StatusBadge 
              text={status === 'DRAW' ? "It's a Draw!" : `${status === 'X_WON' ? 'X' : 'O'} is the Master!`} 
              color={status === 'DRAW' ? 'border-gray-500/50 text-gray-300' : (status === 'X_WON' ? 'border-blue-500 text-blue-400 bg-blue-500/10' : 'border-pink-500 text-pink-400 bg-pink-500/10')} 
            />
          </div>
        )}
      </div>

      {/* Game Board */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-[350px] sm:max-w-[420px] bg-white/5 p-4 rounded-[2rem] border border-white/10 shadow-2xl">
        {board.map((val, idx) => (
          <Square
            key={idx}
            value={val}
            onClick={() => makeMove(idx)}
            isWinningSquare={winningLine?.includes(idx) ?? false}
            disabled={status !== 'PLAYING'}
          />
        ))}
      </div>

      {/* Action Buttons */}
      <div className="mt-10 flex gap-4 w-full max-w-xs">
        <button
          onClick={resetGame}
          className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-2xl font-bold transition-all border border-white/10 active:scale-95"
        >
          {status === 'PLAYING' ? 'Restart' : 'Play Again'}
        </button>
        <button
          onClick={resetAll}
          className="flex-1 py-3 bg-pink-600/20 hover:bg-pink-600/30 text-pink-400 border border-pink-500/20 rounded-2xl font-bold transition-all active:scale-95"
        >
          Reset All
        </button>
      </div>

      {/* Footer Info */}
      <footer className="mt-12 text-white/30 text-[10px] uppercase tracking-widest font-bold">
        Powered by Gemini Intelligence
      </footer>
    </div>
  );
}
