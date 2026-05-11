// Design: Modern Military Command Dashboard
// Achievements Screen

import { motion } from 'framer-motion';
import { useGame } from '@/contexts/GameContext';
import { ACHIEVEMENTS_DEF } from '@/lib/gameData';

export default function AchievementsScreen() {
  const { state, dispatch } = useGame();

  const earned = Object.values(state.achievements);
  const earnedIds = new Set(earned.map(a => a.id));
  const total = ACHIEVEMENTS_DEF.length;
  const earnedCount = earnedIds.size;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-yellow-950/10 to-slate-950">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur-sm border-b border-yellow-500/20 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-yellow-400" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              ACHIEVEMENTS
            </h1>
            <p className="text-slate-400 text-xs">
              {earnedCount} / {total} unlocked
            </p>
          </div>
          <button
            onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'hub' })}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-bold rounded-lg border border-slate-600 transition-all"
            style={{ fontFamily: 'Rajdhani, sans-serif' }}
          >
            ← HUB
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4">
        {/* Progress bar */}
        <div className="mb-6 bg-slate-900/60 rounded-xl p-4 border border-yellow-500/20">
          <div className="flex justify-between text-xs text-slate-400 mb-2">
            <span style={{ fontFamily: 'Rajdhani, sans-serif' }}>COMPLETION</span>
            <span style={{ fontFamily: 'IBM Plex Mono, monospace' }}>{earnedCount}/{total}</span>
          </div>
          <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-yellow-600 to-yellow-400"
              initial={{ width: 0 }}
              animate={{ width: `${(earnedCount / total) * 100}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
          {earnedCount === total && (
            <p className="text-yellow-400 text-xs text-center mt-2 font-bold">
              🏆 ALL ACHIEVEMENTS UNLOCKED — THE 495 CSSB IS THE PREMIER CSSB
            </p>
          )}
        </div>

        {/* Earned achievements */}
        {earnedCount > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-bold text-yellow-400 tracking-widest mb-3" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              ✦ EARNED
            </h2>
            <div className="space-y-2">
              {ACHIEVEMENTS_DEF.filter(a => earnedIds.has(a.id)).map((ach, i) => {
                const earned = state.achievements[ach.id];
                return (
                  <motion.div
                    key={ach.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-4 bg-gradient-to-r from-yellow-950/40 to-slate-900/60 border border-yellow-500/30 rounded-xl p-4"
                  >
                    <div className="text-3xl">{ach.emoji}</div>
                    <div className="flex-1">
                      <div className="text-white font-bold text-sm" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                        {ach.name}
                      </div>
                      <div className="text-slate-400 text-xs">{ach.desc}</div>
                      {earned && (
                        <div className="text-yellow-600 text-xs mt-1" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
                          Earned {new Date(earned.earnedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    <div className="text-yellow-400 text-xl">✓</div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Locked achievements */}
        <div>
          <h2 className="text-sm font-bold text-slate-500 tracking-widest mb-3" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
            🔒 LOCKED
          </h2>
          <div className="space-y-2">
            {ACHIEVEMENTS_DEF.filter(a => !earnedIds.has(a.id)).map((ach, i) => (
              <motion.div
                key={ach.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-4 bg-slate-900/40 border border-slate-700/40 rounded-xl p-4 opacity-60"
              >
                <div className="text-3xl grayscale">{ach.emoji}</div>
                <div className="flex-1">
                  <div className="text-slate-400 font-bold text-sm" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                    {ach.name}
                  </div>
                  <div className="text-slate-500 text-xs">{ach.desc}</div>
                  <div className="text-slate-600 text-xs mt-1 italic">
                    Hint: {ach.condition}
                  </div>
                </div>
                <div className="text-slate-600 text-xl">🔒</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-3 text-center">
            <div className="text-yellow-400 font-bold text-lg" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
              {state.snedigarHits}
            </div>
            <div className="text-slate-500 text-xs">Snedigar Hits</div>
          </div>
          <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-3 text-center">
            <div className="text-pink-400 font-bold text-lg" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
              {state.candyCount}
            </div>
            <div className="text-slate-500 text-xs">Candy Collected</div>
          </div>
          <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-3 text-center">
            <div className="text-cyan-400 font-bold text-lg" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
              {state.storeItemsBought.length}
            </div>
            <div className="text-slate-500 text-xs">Items Bought</div>
          </div>
        </div>
      </div>
    </div>
  );
}
