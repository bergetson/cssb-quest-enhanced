// PositiveFX — quick, non-blocking reward feedback for correct answers.
// Green screen flash + a rising "+points" pop + an optional streak flame.
// Auto-dismisses; pointer-events are disabled so it never blocks input.

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface PositiveFxData {
  points: number;
  bonus?: number;   // streak bonus points
  streak?: number;  // current streak level
  bonusPct?: number;
}

interface PositiveFXProps {
  data: PositiveFxData | null;
  onDone: () => void;
}

export default function PositiveFX({ data, onDone }: PositiveFXProps) {
  useEffect(() => {
    if (!data) return;
    const t = setTimeout(onDone, 950);
    return () => clearTimeout(t);
  }, [data, onDone]);

  return (
    <AnimatePresence>
      {data && (
        <motion.div
          className="fixed inset-0 z-40 pointer-events-none flex items-center justify-center"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Green vignette flash */}
          <motion.div
            className="absolute inset-0"
            style={{ background: 'radial-gradient(circle at center, rgba(74,222,128,0.22) 0%, rgba(74,222,128,0.10) 35%, transparent 70%)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
          />

          {/* Big number pop */}
          <motion.div
            className="relative text-center"
            initial={{ scale: 0.4, y: 30, opacity: 0 }}
            animate={{ scale: [0.4, 1.15, 1], y: [-0, -18, -48], opacity: [0, 1, 0] }}
            transition={{ duration: 0.95, ease: 'easeOut', times: [0, 0.35, 1] }}
          >
            <div
              className="font-black drop-shadow-[0_2px_12px_rgba(74,222,128,0.6)]"
              style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '4.5rem', lineHeight: 1, color: '#4ade80' }}
            >
              +{data.points}
            </div>
            {!!data.bonus && data.bonus > 0 && (
              <div
                className="font-black text-orange-300 drop-shadow-[0_2px_10px_rgba(249,115,22,0.6)]"
                style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '1.6rem', lineHeight: 1, marginTop: 4 }}
              >
                🔥 +{data.bonus} STREAK BONUS
              </div>
            )}
            {!!data.streak && data.streak >= 2 && (
              <div className="text-xs mono text-orange-400 tracking-widest mt-1">
                x{data.streak} COMBO{data.bonusPct ? ` · +${data.bonusPct}%` : ''}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
