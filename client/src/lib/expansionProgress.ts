export type ExpansionGrade = 'Expert' | 'Proficient' | 'Needs Practice' | 'Retrain';

export interface ExpansionRun {
  id: string;
  module: string;
  title: string;
  score: number;
  grade: ExpansionGrade;
  xp: number;
  at: number;
}

export interface ExpansionProgress {
  xp: number;
  bestScores: Record<string, number>;
  completions: Record<string, boolean>;
  streaks: Record<string, number>;
  badges: Record<string, boolean>;
  difficultyUnlocked: Record<string, string>;
  miniGameHistory: ExpansionRun[];
  aarHistory: ExpansionRun[];
}

export const EXPANSION_LS_KEY = 'cssb_quest_expansion_v1';

export function baseExpansionProgress(): ExpansionProgress {
  return {
    xp: 0,
    bestScores: {},
    completions: {},
    streaks: {},
    badges: {},
    difficultyUnlocked: {
      warrior: 'Easy',
      opfor: 'Easy',
      dsca: 'Easy',
      convoy: 'Easy',
      newSoldier: 'Easy',
    },
    miniGameHistory: [],
    aarHistory: [],
  };
}

export function loadExpansionProgress(): ExpansionProgress {
  try {
    const raw = localStorage.getItem(EXPANSION_LS_KEY);
    if (!raw) return baseExpansionProgress();
    return { ...baseExpansionProgress(), ...JSON.parse(raw) };
  } catch {
    return baseExpansionProgress();
  }
}

export function saveExpansionProgress(progress: ExpansionProgress) {
  try {
    localStorage.setItem(EXPANSION_LS_KEY, JSON.stringify(progress));
  } catch {}
}

export function gradePercent(score: number): ExpansionGrade {
  if (score >= 90) return 'Expert';
  if (score >= 80) return 'Proficient';
  if (score >= 70) return 'Needs Practice';
  return 'Retrain';
}

export function difficultyMultiplier(difficulty: string) {
  if (difficulty === 'Expert') return 1.8;
  if (difficulty === 'Hard') return 1.45;
  if (difficulty === 'Medium') return 1.2;
  return 1;
}

export function xpFromScore(score: number, difficulty: string) {
  return Math.max(15, Math.round(score * difficultyMultiplier(difficulty)));
}

export function recordExpansionRun(
  current: ExpansionProgress,
  run: Omit<ExpansionRun, 'at'>,
  extraBadges: string[] = [],
): ExpansionProgress {
  const fullRun = { ...run, at: Date.now() };
  const bestScores = {
    ...current.bestScores,
    [run.id]: Math.max(current.bestScores[run.id] || 0, run.score),
  };
  const completions = run.score >= 70
    ? { ...current.completions, [run.id]: true }
    : current.completions;
  const streakKey = run.module;
  const streaks = {
    ...current.streaks,
    [streakKey]: run.score >= 70 ? (current.streaks[streakKey] || 0) + 1 : 0,
  };
  const badges = { ...current.badges };
  for (const badge of extraBadges) badges[badge] = true;

  return {
    ...current,
    xp: current.xp + run.xp,
    bestScores,
    completions,
    streaks,
    badges,
    miniGameHistory: [fullRun, ...current.miniGameHistory].slice(0, 80),
    aarHistory: [fullRun, ...current.aarHistory].slice(0, 80),
  };
}

export function completionPercent(progress: ExpansionProgress, ids: string[]) {
  if (!ids.length) return 0;
  const done = ids.filter(id => progress.completions[id]).length;
  return Math.round((done / ids.length) * 100);
}
