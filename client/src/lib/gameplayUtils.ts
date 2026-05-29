export function hashSeed(input: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function seededRandom(seed: number) {
  let a = seed >>> 0;
  return function next() {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffleWithSeed<T>(items: readonly T[], seedInput: string): T[] {
  const next = seededRandom(hashSeed(seedInput));
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function randomScenarioCode() {
  const terrain = ['MOOSE', 'GRANITE', 'COYOTE', 'GLACIER', 'COPPER', 'TIMBER', 'BISON', 'ASPEN'];
  const action = ['LIFT', 'MARCH', 'PACK', 'FORGE', 'HAUL', 'SYNC', 'READY', 'SPUR'];
  const n = Math.floor(100 + Math.random() * 900);
  return `${terrain[Math.floor(Math.random() * terrain.length)]}-${action[Math.floor(Math.random() * action.length)]}-${n}`;
}

export function missionCreditReward(score: number, difficultyMult = 1) {
  const base = Math.max(0, Math.round(score / 5));
  const difficultyBonus = Math.max(0, Math.round(base * Math.max(0, difficultyMult - 1) * 0.35));
  return base + difficultyBonus;
}

export function minigameCreditReward(score: number) {
  return Math.max(0, Math.ceil(score / 3));
}

// ─── Streak multiplier ────────────────────────────────────────────────────────
// Consecutive correct answers build a visible, at-risk bonus. +10% per correct
// answer past the first, capped at +100% (streak of 11). A wrong answer resets it.

export interface StreakInfo {
  level: number;
  active: boolean;
  bonusPct: number;
  mult: number;
}

export function streakInfo(streak: number): StreakInfo {
  const level = Math.max(0, streak);
  const bonusPct = Math.min(100, Math.max(0, level - 1) * 10);
  return { level, active: level >= 2, bonusPct, mult: 1 + bonusPct / 100 };
}

// ─── Supply drop loot ─────────────────────────────────────────────────────────
// Variable reward on mission complete. Better performance tilts the odds toward
// rare/gold, but every run has a shot at gold — that uncertainty is the hook.

export type LootTier = 'common' | 'rare' | 'gold';

export interface SupplyDrop {
  tier: LootTier;
  credits: number;
  bonusCard?: 'ray_card' | 'mercy';
}

export function rollSupplyDrop(pct: number, baseCredits: number, rand: () => number = Math.random): SupplyDrop {
  const goldChance = Math.min(0.6, 0.05 + Math.max(0, pct) * 0.45);
  const rareChance = 0.35;
  const r = rand();
  let tier: LootTier;
  if (r < goldChance) tier = 'gold';
  else if (r < goldChance + rareChance) tier = 'rare';
  else tier = 'common';
  const mult = tier === 'gold' ? 2.5 : tier === 'rare' ? 1.5 : 1;
  const credits = Math.max(1, Math.round(Math.max(0, baseCredits) * mult));
  const bonusCard = tier === 'gold' ? (rand() < 0.5 ? 'ray_card' : 'mercy') : undefined;
  return { tier, credits, bonusCard };
}
