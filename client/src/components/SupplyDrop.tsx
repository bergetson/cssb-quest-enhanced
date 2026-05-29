// SupplyDrop — variable-reward reveal shown on the mission AAR.
// Starts closed (tap to open), reveals tier + credits with a little drama.

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { playSfx } from '../lib/sfx';

export interface LootResult {
  tier: 'common' | 'rare' | 'gold';
  credits: number;
  bonusCard?: 'ray_card' | 'mercy';
}

const TIER_META: Record<LootResult['tier'], { label: string; color: string; glow: string; emoji: string }> = {
  common: { label: 'COMMON', color: '#94a3b8', glow: 'rgba(148,163,184,0.4)', emoji: '📦' },
  rare:   { label: 'RARE',   color: '#22d3ee', glow: 'rgba(34,211,238,0.5)',  emoji: '🎁' },
  gold:   { label: 'GOLD',   color: '#F5C842', glow: 'rgba(245,200,66,0.6)',  emoji: '🏆' },
};

const CARD_LABEL: Record<NonNullable<LootResult['bonusCard']>, string> = {
  ray_card: '🕶️ SFC Ray Save Card',
  mercy: '🃏 Mercy Card',
};

export default function SupplyDrop({ loot }: { loot: LootResult }) {
  const [open, setOpen] = useState(false);
  const meta = TIER_META[loot.tier];

  const sfxKind = loot.tier === 'gold' ? 'gold' : 'loot';

  // Auto-open after a beat so passive players still get the payoff.
  useEffect(() => {
    if (open) return;
    const t = setTimeout(() => { setOpen(true); playSfx(sfxKind); }, 2500);
    return () => clearTimeout(t);
  }, [open]);

  function reveal() {
    if (open) return;
    setOpen(true);
    playSfx(sfxKind);
  }

  return (
    <div className="mil-card p-4 mb-4">
      <div className="text-xs text-slate-500 mono mb-3">// SUPPLY DROP</div>
      {!open ? (
        <button onClick={reveal} className="w-full flex flex-col items-center py-4 group">
          <motion.div
            className="text-6xl"
            animate={{ rotate: [0, -6, 6, -4, 4, 0], y: [0, -3, 0] }}
            transition={{ duration: 1.1, repeat: Infinity, repeatDelay: 0.3 }}
          >
            📦
          </motion.div>
          <div className="mt-3 text-xs mono tracking-widest text-cyan-300 group-hover:text-cyan-200">
            TAP TO OPEN
          </div>
        </button>
      ) : (
        <motion.div
          className="flex flex-col items-center py-3"
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 320, damping: 18 }}
        >
          <motion.div
            className="text-6xl"
            style={{ filter: `drop-shadow(0 0 18px ${meta.glow})` }}
            animate={{ scale: [1, 1.18, 1] }}
            transition={{ duration: 0.5 }}
          >
            {meta.emoji}
          </motion.div>
          <div
            className="mt-2 px-3 py-1 rounded-full text-xs font-black tracking-[0.2em]"
            style={{ color: meta.color, backgroundColor: `${meta.color}1a`, border: `1px solid ${meta.color}55`, fontFamily: 'Rajdhani, sans-serif' }}
          >
            {meta.label} DROP
          </div>
          <div className="mt-3 text-3xl font-black mono" style={{ color: meta.color }}>
            +{loot.credits} <span className="text-sm text-slate-400 font-normal">credits</span>
          </div>
          {loot.bonusCard && (
            <div className="mt-2 text-xs text-emerald-300 mono">
              + {CARD_LABEL[loot.bonusCard]}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
