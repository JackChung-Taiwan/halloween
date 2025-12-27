
import React, { useState, useCallback, useEffect } from 'react';
import { GameStatus } from './types';
import { MAX_SCORE } from './constants';
import HalloweenGame from './components/HalloweenGame';

const App: React.FC = () => {
  const [status, setStatus] = useState<GameStatus>(GameStatus.START);
  const [score, setScore] = useState(0);

  const startGame = () => {
    setScore(0);
    setStatus(GameStatus.PLAYING);
  };

  const handleVictory = () => {
    setStatus(GameStatus.VICTORY);
  };

  const handleScoreUpdate = useCallback((newScore: number) => {
    setScore(newScore);
    if (newScore >= MAX_SCORE) {
      handleVictory();
    }
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#1a0525] text-white">
      {/* Game Canvas */}
      <HalloweenGame 
        isPlaying={status === GameStatus.PLAYING} 
        onScoreChange={handleScoreUpdate}
        onVictory={handleVictory}
      />

      {/* Progress Bar */}
      {status !== GameStatus.START && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 w-3/4 max-w-lg z-10">
          <div className="flex justify-between items-center mb-1 px-1">
            <span className="text-sm font-bold tracking-widest text-[#ff7518]">PROGRESS</span>
            <span className="text-sm font-bold tracking-widest text-[#ff7518]">{score}/{MAX_SCORE}</span>
          </div>
          <div className="h-4 bg-gray-900/50 border border-white/20 rounded-full overflow-hidden backdrop-blur-sm">
            <div 
              className="h-full bg-[#ff7518] shadow-[0_0_15px_#ff7518] transition-all duration-300 ease-out"
              style={{ width: `${(score / MAX_SCORE) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* UI Panels */}
      {status === GameStatus.START && (
        <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/60 backdrop-blur-md">
          <div className="bg-[#1a0525]/90 border-4 border-[#ff7518] rounded-[2rem] p-10 text-center shadow-[0_0_50px_rgba(255,117,24,0.4)] max-w-sm w-full mx-4">
            <h1 className="text-6xl font-creepy text-[#ff7518] mb-6 drop-shadow-[0_4px_4px_rgba(0,0,0,1)]">
              Halloween Slasher
            </h1>
            <p className="text-lg text-orange-100 mb-8 leading-relaxed">
              Listen to the word,<br /> then <span className="text-[#ff7518] font-bold">SLASH</span> the correct spooky card!
            </p>
            <button 
              onClick={startGame}
              className="w-full bg-[#ff7518] hover:bg-[#ff8c3d] text-[#1a0525] font-bold py-4 px-8 rounded-full text-2xl transform transition active:scale-95 shadow-[0_4px_20px_rgba(255,117,24,0.4)]"
            >
              START GAME
            </button>
          </div>
        </div>
      )}

      {status === GameStatus.VICTORY && (
        <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/60 backdrop-blur-md">
          <div className="bg-[#1a0525]/90 border-4 border-[#ff7518] rounded-[2rem] p-10 text-center shadow-[0_0_50px_rgba(255,117,24,0.4)] max-w-sm w-full mx-4 animate-in fade-in zoom-in duration-300">
            <h1 className="text-5xl font-creepy text-[#ff7518] mb-4 drop-shadow-[0_4px_4px_rgba(0,0,0,1)]">
              Bravo!
            </h1>
            <div className="text-5xl mb-6">🏆🧟‍♂️🎃</div>
            <p className="text-xl text-orange-100 mb-8 font-bold">
              You are a Halloween Vocabulary Master!
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-[#ff7518] hover:bg-[#ff8c3d] text-[#1a0525] font-bold py-4 px-8 rounded-full text-2xl transform transition active:scale-95 shadow-[0_4px_20px_rgba(255,117,24,0.4)]"
            >
              PLAY AGAIN
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
