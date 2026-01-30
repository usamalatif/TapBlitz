import React, { useState, useEffect } from 'react';
import { Trophy, Users, Play, RotateCcw } from 'lucide-react';

export default function TappingRace() {
  const [gameState, setGameState] = useState('setup'); // setup, playing, finished
  const [numPlayers, setNumPlayers] = useState(4);
  const [players, setPlayers] = useState([]);
  const [finishers, setFinishers] = useState([]);
  const [countdown, setCountdown] = useState(null);
  const FINISH_LINE = 100;

  useEffect(() => {
    // Initialize players
    const initialPlayers = Array.from({ length: numPlayers }, (_, i) => ({
      id: i + 1,
      name: `Player ${i + 1}`,
      progress: 0,
      taps: 0,
      finished: false,
      finishPosition: null,
      color: getPlayerColor(i)
    }));
    setPlayers(initialPlayers);
  }, [numPlayers]);

  function getPlayerColor(index) {
    const colors = [
      '#3B82F6', // blue
      '#EF4444', // red
      '#10B981', // green
      '#F59E0B', // yellow
      '#8B5CF6', // purple
      '#EC4899', // pink
      '#6366F1', // indigo
      '#F97316', // orange
      '#14B8A6', // teal
      '#06B6D4'  // cyan
    ];
    return colors[index % colors.length];
  }

  function startGame() {
    setCountdown(3);
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev === 1) {
          clearInterval(countdownInterval);
          setGameState('playing');
          // Reset all players
          setPlayers(prev => prev.map(p => ({ 
            ...p, 
            progress: 0, 
            taps: 0, 
            finished: false,
            finishPosition: null 
          })));
          setFinishers([]);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  }

  function handleTap(playerId) {
    if (gameState !== 'playing') return;

    setPlayers(prev => {
      const updated = prev.map(p => {
        if (p.id === playerId && !p.finished) {
          const newTaps = p.taps + 1;
          const newProgress = Math.min((newTaps / FINISH_LINE) * 100, 100);
          
          // Check if player just finished
          if (newProgress >= 100 && !p.finished) {
            const position = finishers.length + 1;
            setFinishers(f => [...f, { ...p, finishPosition: position }]);
            
            // End game after 3 finishers
            if (position === 3) {
              setTimeout(() => setGameState('finished'), 500);
            }
            
            return { ...p, taps: newTaps, progress: newProgress, finished: true, finishPosition: position };
          }
          
          return { ...p, taps: newTaps, progress: newProgress };
        }
        return p;
      });

      return updated;
    });
  }

  function resetGame() {
    setGameState('setup');
    setFinishers([]);
    setCountdown(null);
    setPlayers(prev => prev.map(p => ({ 
      ...p, 
      progress: 0, 
      taps: 0, 
      finished: false,
      finishPosition: null 
    })));
  }

  // Checkered pattern component for mobile
  const CheckeredFinish = () => (
    <div className="grid grid-cols-8 gap-0 h-12">
      {Array.from({ length: 24 }).map((_, i) => (
        <div
          key={i}
          className={`${(Math.floor(i / 8) + (i % 8)) % 2 === 0 ? 'bg-black' : 'bg-white'}`}
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center p-4">
      {/* Mobile Phone Frame */}
      <div className="relative bg-black rounded-[3rem] p-3 shadow-2xl" style={{ width: '390px', height: '844px' }}>
        {/* Phone Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-black w-40 h-7 rounded-b-3xl z-50" />
        
        {/* Phone Screen */}
        <div className="bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 rounded-[2.5rem] h-full overflow-hidden flex flex-col">
          {/* Header */}
          <div className="text-center pt-10 pb-4 px-4">
            <h1 className="text-3xl font-bold text-white mb-1 flex items-center justify-center gap-2">
              <Trophy className="text-yellow-400" size={32} />
              Tapping Race
            </h1>
            <p className="text-blue-300 text-sm">Tap fast to win!</p>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {/* Setup Screen */}
            {gameState === 'setup' && (
              <div className="h-full flex flex-col justify-center">
                <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-white mb-6">Setup Game</h2>
                    <div className="flex items-center justify-center gap-3 mb-6">
                      <Users className="text-blue-300" size={24} />
                      <span className="text-white text-base">Players:</span>
                      <select
                        value={numPlayers}
                        onChange={(e) => setNumPlayers(Number(e.target.value))}
                        className="bg-white/20 text-white px-4 py-2 rounded-xl text-base font-bold border-2 border-white/30 focus:outline-none focus:border-blue-400"
                      >
                        {[2, 3, 4, 5, 6].map(n => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={startGame}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 active:from-green-600 active:to-emerald-700 text-white py-5 rounded-2xl text-xl font-bold flex items-center justify-center gap-2 transition-all transform active:scale-95"
                  >
                    <Play size={24} />
                    Start Race
                  </button>
                </div>
              </div>
            )}

            {/* Countdown */}
            {countdown !== null && (
              <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50">
                <div className="text-8xl font-bold text-white animate-pulse">
                  {countdown}
                </div>
              </div>
            )}

            {/* Race Track */}
            {(gameState === 'playing' || gameState === 'finished') && (
              <div className="h-full flex flex-col">
                {/* Race Track Area */}
                <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl p-3 border-2 border-white/20 mb-3" style={{ height: '520px' }}>
                  {/* Finish Line */}
                  <CheckeredFinish />
                  
                  {/* Racing Lanes */}
                  <div className="flex justify-around gap-2 mt-2" style={{ height: '450px' }}>
                    {players.map((player) => (
                      <div key={player.id} className="flex flex-col items-center" style={{ flex: 1, maxWidth: '80px' }}>
                        {/* Player Name */}
                        <div className="text-white font-bold text-xs mb-1 text-center truncate w-full">
                          P{player.id}
                        </div>
                        
                        {/* Vertical Lane */}
                        <div className="relative bg-gray-700 rounded-lg w-full border-2 border-gray-500" style={{ height: '400px' }}>
                          {/* Progress Fill (from bottom) */}
                          <div
                            className="absolute bottom-0 w-full transition-all duration-75 ease-out rounded-b-lg"
                            style={{
                              height: `${player.progress}%`,
                              backgroundColor: player.color,
                              boxShadow: `0 0 15px ${player.color}`,
                              border: `1px solid ${player.color}`
                            }}
                          />
                          
                          {/* Finish Position Badge */}
                          {player.finished && player.finishPosition && (
                            <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10">
                              <div className={`
                                px-2 py-1 rounded-full font-bold text-white text-base
                                ${player.finishPosition === 1 ? 'bg-yellow-500' : ''}
                                ${player.finishPosition === 2 ? 'bg-gray-400' : ''}
                                ${player.finishPosition === 3 ? 'bg-amber-700' : ''}
                                animate-pulse
                              `}>
                                {player.finishPosition === 1 ? '🥇' : player.finishPosition === 2 ? '🥈' : '🥉'}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Tap Count */}
                        <div className="text-white/80 text-xs mt-1 font-bold">
                          {player.taps}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tap Buttons */}
                <div className="grid gap-2" style={{ 
                  gridTemplateColumns: `repeat(${numPlayers}, minmax(0, 1fr))` 
                }}>
                  {players.map((player) => (
                    <button
                      key={player.id}
                      onClick={() => handleTap(player.id)}
                      disabled={player.finished || gameState === 'finished'}
                      className={`
                        py-6 rounded-2xl font-bold text-lg transition-all transform active:scale-95 shadow-lg
                        ${player.finished ? 'opacity-40 cursor-not-allowed' : 'active:opacity-80'}
                      `}
                      style={{
                        backgroundColor: player.color,
                        color: 'white'
                      }}
                    >
                      {player.finished ? '✓' : 'TAP'}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Winner Screen Overlay */}
          {gameState === 'finished' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/90 backdrop-blur-sm z-40 p-6">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-6 border-4 border-yellow-400 w-full max-h-full overflow-y-auto">
                <div className="text-center mb-6">
                  <Trophy className="text-yellow-400 mx-auto mb-3 animate-bounce" size={60} />
                  <h2 className="text-3xl font-bold text-white mb-4">
                    🏁 Race Complete! 🏁
                  </h2>
                </div>

                {/* Top 3 Podium */}
                <div className="bg-white/5 rounded-2xl p-4 mb-6">
                  <h3 className="text-xl font-bold text-white mb-4 text-center">🏆 Winners 🏆</h3>
                  <div className="space-y-2">
                    {finishers.map((player, index) => (
                      <div
                        key={player.id}
                        className={`
                          flex items-center justify-between rounded-xl p-3
                          ${index === 0 ? 'bg-gradient-to-r from-yellow-500/30 to-yellow-600/30 border-2 border-yellow-400' : ''}
                          ${index === 1 ? 'bg-gradient-to-r from-gray-400/30 to-gray-500/30 border-2 border-gray-400' : ''}
                          ${index === 2 ? 'bg-gradient-to-r from-amber-700/30 to-amber-800/30 border-2 border-amber-600' : ''}
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                          </span>
                          <div>
                            <div className="text-lg font-bold text-white">{player.name}</div>
                            <div className="text-white/60 text-sm">{player.taps} taps</div>
                          </div>
                        </div>
                        <div
                          className="w-3 h-12 rounded"
                          style={{ backgroundColor: player.color }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={resetGame}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 active:from-blue-600 active:to-purple-700 text-white py-4 rounded-2xl text-lg font-bold flex items-center justify-center gap-2 transition-all transform active:scale-95"
                >
                  <RotateCcw size={24} />
                  Play Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
