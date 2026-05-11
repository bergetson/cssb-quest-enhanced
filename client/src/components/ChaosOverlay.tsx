// Design: Modern Military Command Dashboard
// ChaosOverlay — dramatic full-screen chaos event interruptions

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/contexts/GameContext';
import { CHAOS_EVENTS, ACHIEVEMENTS_DEF, type ChaosEvent } from '@/lib/gameData';

interface ChaosOverlayProps {
  onDismiss: () => void;
  event: ChaosEvent;
}

const MORENI_QUOTES = [
  "Every setback is a setup for a comeback. Keep pushing.",
  "The difference between ordinary and extraordinary is that little extra.",
  "Discipline is the bridge between goals and accomplishment.",
  "Leaders don't create followers, they create more leaders.",
  "Excellence is not a destination; it is a continuous journey.",
  "The strength of the team is each individual member. The strength of each member is the team.",
];

const GIBSON_QUOTES = [
  "Be brilliant at the basics, people.",
  "Basics win battles. Master them.",
  "The fundamentals never go out of style.",
  "If you can't do the simple things right, the complex things will destroy you.",
  "Brilliant at the basics. Every. Single. Day.",
];

export function ChaosOverlay({ onDismiss, event }: ChaosOverlayProps) {
  const { dispatch } = useGame();
  const [quote, setQuote] = useState('');

  useEffect(() => {
    if (event.id === 'moreni_visit') {
      setQuote(MORENI_QUOTES[Math.floor(Math.random() * MORENI_QUOTES.length)]);
    } else if (event.id === 'gibson_visit') {
      setQuote(GIBSON_QUOTES[Math.floor(Math.random() * GIBSON_QUOTES.length)]);
      // Award achievement
      dispatch({ type: 'ADD_ACHIEVEMENT', achievement: {
        id: 'gibson_blessed', name: 'Brilliant at the Basics',
        desc: 'BG Gibson visited during a chaos event.',
        emoji: '⭐', earnedAt: Date.now(),
      }});
    } else if (event.id === 'bailey_candy') {
      dispatch({ type: 'ADD_CANDY', amount: 1 });
    } else if (event.id === 'snedigar_run') {
      dispatch({ type: 'SNEDIGAR_HIT' });
    }
  }, [event.id, dispatch]);

  const isBonus = event.effect === 'bonus';
  const isGibson = event.id === 'gibson_visit';
  const isMoreni = event.id === 'moreni_visit';
  const isBailey = event.id === 'bailey_candy';
  const isSnedigar = event.id === 'snedigar_run';

  const borderColor = isBonus
    ? (isGibson ? '#FFD700' : isMoreni ? '#4ade80' : '#60a5fa')
    : '#ef4444';

  const bgGradient = isBonus
    ? (isGibson ? 'from-yellow-950/95 to-slate-950/98' : isMoreni ? 'from-green-950/95 to-slate-950/98' : 'from-blue-950/95 to-slate-950/98')
    : 'from-red-950/95 to-slate-950/98';

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />

        {/* Screen shake for negative events */}
        {!isBonus && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{ x: [0, -8, 8, -4, 4, 0], y: [0, -4, 4, -2, 2, 0] }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          />
        )}

        {/* Event Card */}
        <motion.div
          className={`relative z-10 max-w-lg w-full rounded-2xl border-2 bg-gradient-to-br ${bgGradient} p-8 shadow-2xl`}
          style={{ borderColor }}
          initial={{ scale: 0.5, y: -100, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          {/* Header */}
          <div className="text-center mb-6">
            <motion.div
              className="text-6xl mb-3"
              animate={isBonus ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] } : { rotate: [0, -5, 5, -3, 3, 0] }}
              transition={{ duration: 0.6 }}
            >
              {event.emoji}
            </motion.div>

            {/* Event type badge */}
            <div
              className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-widest mb-3"
              style={{
                backgroundColor: isBonus ? `${borderColor}20` : '#ef444420',
                color: borderColor,
                border: `1px solid ${borderColor}40`,
              }}
            >
              {isBonus ? '✦ BONUS EVENT' : '⚠ CHAOS EVENT'}
            </div>

            <h2 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              {event.name}
            </h2>
          </div>

          {/* Description */}
          <div className="bg-black/30 rounded-xl p-4 mb-6 border border-white/10">
            <p className="text-slate-200 text-sm leading-relaxed">
              {event.desc}
            </p>
          </div>

          {/* Special content for generals */}
          {(isGibson || isMoreni) && quote && (
            <div
              className="rounded-xl p-4 mb-6 border"
              style={{ backgroundColor: `${borderColor}10`, borderColor: `${borderColor}40` }}
            >
              <p className="text-sm italic font-medium text-center" style={{ color: borderColor }}>
                "{quote}"
              </p>
              <p className="text-xs text-center mt-2 text-slate-400">
                — {isGibson ? 'BG Gibson' : 'GEN Moreni'}
              </p>
            </div>
          )}

          {/* Bailey candy */}
          {isBailey && (
            <div className="bg-pink-950/40 rounded-xl p-4 mb-6 border border-pink-500/30 text-center">
              <p className="text-pink-300 text-sm">🍬 +1 Candy added to your inventory</p>
            </div>
          )}

          {/* Effect display */}
          {!isBonus && (
            <div className="flex items-center gap-2 mb-6 bg-red-950/40 rounded-lg p-3 border border-red-500/30">
              <span className="text-red-400 text-xs font-bold tracking-wider">EFFECT:</span>
              <span className="text-red-300 text-xs">
                {event.effect === 'xp-10' && '−10 XP'}
                {event.effect === 'creds-15' && '−15 Credits'}
                {event.effect === 'time-5' && '−5 min planning time'}
                {event.effect === 'chaos+10' && '+10 Chaos'}
                {event.effect === 'chaos+15' && '+15 Chaos'}
                {event.effect === 'chaos+20' && '+20 Chaos'}
              </span>
            </div>
          )}

          {isSnedigar && (
            <div className="text-center text-xs text-slate-500 mb-4 italic">
              (He did this in real life during Ultimate Frisbee. He is not sorry.)
            </div>
          )}

          {/* Dismiss button */}
          <button
            onClick={onDismiss}
            className="w-full py-3 rounded-xl font-bold text-sm tracking-widest transition-all duration-200 hover:scale-105 active:scale-95"
            style={{
              backgroundColor: borderColor,
              color: isBonus ? '#000' : '#fff',
              fontFamily: 'Rajdhani, sans-serif',
            }}
          >
            {isBonus ? 'ACKNOWLEDGED ✓' : 'DRIVE ON'}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Chaos Meter Bar ──────────────────────────────────────────────────────────

interface ChaosMeterProps {
  value: number; // 0-100
  className?: string;
}

export function ChaosMeter({ value, className = '' }: ChaosMeterProps) {
  const color = value < 30 ? '#4ade80' : value < 60 ? '#facc15' : value < 85 ? '#f97316' : '#ef4444';
  const label = value < 30 ? 'STABLE' : value < 60 ? 'ELEVATED' : value < 85 ? 'HIGH' : 'CRITICAL';

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-xs font-bold tracking-widest text-slate-400" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
        CHAOS
      </span>
      <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      <span className="text-xs font-bold" style={{ color, fontFamily: 'IBM Plex Mono, monospace', minWidth: '60px' }}>
        {value}% {label}
      </span>
    </div>
  );
}

// ─── Hook: trigger random chaos events ───────────────────────────────────────

export function useChaosTrigger(chaosMeter: number, pptShield: boolean) {
  const shouldTrigger = (threshold: number) => {
    // Higher chaos = higher chance of triggering events
    const baseChance = chaosMeter / 200; // 0-0.5
    return Math.random() < baseChance && chaosMeter >= threshold;
  };

  const getRandomEvent = (): ChaosEvent | null => {
    const eligible = CHAOS_EVENTS.filter(e => chaosMeter >= e.chaosThreshold);
    if (eligible.length === 0) return null;
    // Filter out PPT events if shield is active
    const filtered = pptShield
      ? eligible.filter(e => e.id !== 'ppt_interrupt')
      : eligible;
    if (filtered.length === 0) return null;
    return filtered[Math.floor(Math.random() * filtered.length)];
  };

  return { shouldTrigger, getRandomEvent };
}

// ─── Achievement Toast ────────────────────────────────────────────────────────

interface AchievementToastProps {
  achievement: { name: string; emoji: string; desc: string };
  onDismiss: () => void;
}

export function AchievementToast({ achievement, onDismiss }: AchievementToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <motion.div
      className="fixed top-4 right-4 z-50 max-w-sm"
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <div className="bg-gradient-to-r from-yellow-950 to-slate-900 border border-yellow-500/50 rounded-xl p-4 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="text-3xl">{achievement.emoji}</div>
          <div>
            <div className="text-yellow-400 text-xs font-bold tracking-widest mb-1">
              🏆 ACHIEVEMENT UNLOCKED
            </div>
            <div className="text-white font-bold text-sm" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              {achievement.name}
            </div>
            <div className="text-slate-400 text-xs mt-1">{achievement.desc}</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
