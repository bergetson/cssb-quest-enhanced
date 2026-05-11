// Design: Modern Military Command Dashboard
// Dorval Call Screen — the great chicken-out

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/contexts/GameContext';

type Phase = 'dialing' | 'ringing' | 'chickens_out' | 'achievement';

export default function DorvalCallScreen() {
  const { state, dispatch } = useGame();
  const [phase, setPhase] = useState<Phase>('dialing');
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(setTimeout(() => setPhase('ringing'), 2000));
    timers.push(setTimeout(() => setPhase('chickens_out'), 4500));
    timers.push(setTimeout(() => {
      setPhase('achievement');
      dispatch({ type: 'ADD_ACHIEVEMENT', achievement: {
        id: 'dorval_call',
        name: 'Gave the A-Tag a Piece of My Mind',
        desc: 'Chickened out of calling BG Dorval.',
        emoji: '☎️',
        earnedAt: Date.now(),
      }});
      dispatch({ type: 'ADD_LOG', text: 'Chickened out of calling BG Dorval.' });
    }, 7000));
    return () => timers.forEach(clearTimeout);
  }, [dispatch]);

  const playerName = `${state.player?.rank || ''} ${state.player?.name || ''}`.trim();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-cyan-950/20 to-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">

        {/* Dialing phase */}
        <AnimatePresence mode="wait">
          {phase === 'dialing' && (
            <motion.div
              key="dialing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="text-7xl mb-6">☎️</div>
              <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                Dialing BG Dorval{dots}
              </h2>
              <p className="text-slate-400 text-sm">
                {playerName} picks up the phone with a determined look.
              </p>
              <p className="text-cyan-400 text-sm mt-2 italic">
                "I'm gonna call Dorval and give her a piece of my mind."
              </p>
            </motion.div>
          )}

          {phase === 'ringing' && (
            <motion.div
              key="ringing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <motion.div
                className="text-7xl mb-6"
                animate={{ rotate: [-10, 10, -10, 10, 0] }}
                transition={{ duration: 0.5, repeat: 3 }}
              >
                📱
              </motion.div>
              <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                RINGING{dots}
              </h2>
              <p className="text-slate-400 text-sm">
                The line connects. It's ringing.
              </p>
              <p className="text-yellow-400 text-sm mt-2 font-bold">
                BG Dorval answers on the second ring.
              </p>
              <p className="text-cyan-300 text-sm mt-1 italic">
                "...Hello?"
              </p>
            </motion.div>
          )}

          {phase === 'chickens_out' && (
            <motion.div
              key="chickens_out"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <motion.div
                className="text-7xl mb-6"
                animate={{ scale: [1, 0.8, 1.2, 0.9, 1] }}
                transition={{ duration: 0.6 }}
              >
                😰
              </motion.div>
              <h2 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                ABORT ABORT ABORT
              </h2>
              <div className="bg-slate-900/80 border border-yellow-500/30 rounded-xl p-6 mb-4">
                <p className="text-slate-200 text-sm leading-relaxed mb-3">
                  {playerName} freezes. The words evaporate. The carefully rehearsed speech
                  — gone. All of it. Gone.
                </p>
                <p className="text-yellow-300 text-sm italic font-medium">
                  "On second thought... maybe I won't call her."
                </p>
                <p className="text-slate-400 text-xs mt-3">
                  {playerName} hangs up. BG Dorval is left wondering why someone called
                  and immediately hung up. She will never know.
                </p>
              </div>
            </motion.div>
          )}

          {phase === 'achievement' && (
            <motion.div
              key="achievement"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <motion.div
                className="text-7xl mb-4"
                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 0.8 }}
              >
                ☎️
              </motion.div>
              <h2 className="text-2xl font-bold text-yellow-400 mb-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                ACHIEVEMENT UNLOCKED
              </h2>
              <div className="bg-gradient-to-r from-yellow-950 to-slate-900 border border-yellow-500/50 rounded-xl p-6 mb-6">
                <div className="text-4xl mb-2">☎️</div>
                <h3 className="text-xl font-bold text-white mb-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                  Gave the A-Tag a Piece of My Mind
                </h3>
                <p className="text-slate-400 text-sm">
                  Chickened out of calling BG Dorval. She will never know what you almost said.
                </p>
              </div>
              <button
                onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'hub' })}
                className="px-8 py-4 bg-cyan-700 hover:bg-cyan-600 text-white font-bold rounded-xl tracking-widest transition-all hover:scale-105"
                style={{ fontFamily: 'Rajdhani, sans-serif' }}
              >
                RETURN TO HUB
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
