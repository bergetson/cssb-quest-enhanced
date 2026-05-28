import { DIFFS, LS_KEY, type Difficulty, type GameState, type MissionRecord } from './gameData';
import { supabase } from './supabase';

type MissionRecordWithMeta = MissionRecord & { difficulty?: Difficulty; points?: number };

export interface LeaderboardEntry {
  id: string;
  callsign: string;
  rank: string;
  unit: string;
  score: number;
  campaignPct: number;
  missionsCompleted: number;
  goldMissions: number;
  perfectMissions: number;
  difficulty: Difficulty;
  level: number;
  xp: number;
  achievements: number;
  minigamePoints: number;
  challenge: string;
  submittedAt: string;
  source?: 'local' | 'shared' | 'seed';
}

export interface LeaderboardResult {
  entries: LeaderboardEntry[];
  sharedOnline: boolean;
  message: string;
}

const LOCAL_KEY = `${LS_KEY}_leaderboard_v2`;

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'staff-officer';
}

function difficultyMult(record: MissionRecord, fallback: Difficulty) {
  const withMeta = record as MissionRecordWithMeta;
  return DIFFS[withMeta.difficulty || fallback]?.mult || 1;
}

function missionPoints(record: MissionRecord, fallback: Difficulty) {
  const withMeta = record as MissionRecordWithMeta;
  return withMeta.points ?? Math.round(record.score * difficultyMult(record, fallback));
}

export function calculateCampaignScore(state: GameState) {
  const records = Object.values(state.missions);
  const missionBase = records.reduce((sum, record) => sum + missionPoints(record, state.difficulty), 0);
  const maxRaw = records.reduce((sum, record) => sum + record.max, 0);
  const rawScore = records.reduce((sum, record) => sum + record.score, 0);
  const campaignPct = maxRaw > 0 ? Math.round((rawScore / maxRaw) * 100) : 0;
  const missionsCompleted = Object.keys(state.completed).length;
  const goldMissions = records.filter(record => record.grade === 'GOLD').length;
  const perfectMissions = records.filter(record => record.max > 0 && record.score >= record.max).length;
  const minigamePoints = Object.values(state.minigameScores).reduce((sum, score) => sum + score, 0);
  const rolePoints = Object.keys(state.roleWins).length * 45;
  const achievementPoints = Object.keys(state.achievements).length * 60;
  const completionBonus = missionsCompleted * 35;
  const goldBonus = goldMissions * 90;
  const perfectBonus = perfectMissions * 125;
  const levelBonus = Math.max(0, state.level - 1) * 80;
  const chaosDiscipline = Math.max(0, 100 - state.chaosMeter) * 2;
  const difficultyBonus = state.difficulty === 'qual' ? 300 : state.difficulty === 'nightmare' ? 220 : state.difficulty === 'run' ? 140 : state.difficulty === 'walk' ? 60 : 0;

  return {
    total: Math.round(
      missionBase +
      completionBonus +
      goldBonus +
      perfectBonus +
      Math.min(1800, minigamePoints) +
      rolePoints +
      achievementPoints +
      levelBonus +
      chaosDiscipline +
      difficultyBonus
    ),
    campaignPct,
    missionsCompleted,
    goldMissions,
    perfectMissions,
    minigamePoints,
  };
}

export function makeLeaderboardEntry(state: GameState): LeaderboardEntry {
  const score = calculateCampaignScore(state);
  const player = state.player || { rank: 'CIV', name: 'GUEST', unit: '495 CSSB' };
  const unit = player.unit || '495 CSSB';
  const callsign = `${player.rank} ${player.name}`.trim().toUpperCase();

  return {
    id: `${slug(callsign)}-${slug(unit)}-${slug(state.challenge)}`,
    callsign,
    rank: player.rank,
    unit,
    score: score.total,
    campaignPct: score.campaignPct,
    missionsCompleted: score.missionsCompleted,
    goldMissions: score.goldMissions,
    perfectMissions: score.perfectMissions,
    difficulty: state.difficulty,
    level: state.level,
    xp: state.xp,
    achievements: Object.keys(state.achievements).length,
    minigamePoints: score.minigamePoints,
    challenge: state.challenge,
    submittedAt: new Date().toISOString(),
    source: 'local',
  };
}

function cleanEntry(entry: LeaderboardEntry, source: LeaderboardEntry['source']): LeaderboardEntry {
  return {
    ...entry,
    callsign: String(entry.callsign || 'UNKNOWN').slice(0, 40).toUpperCase(),
    unit: String(entry.unit || '495 CSSB').slice(0, 40),
    rank: String(entry.rank || '').slice(0, 10),
    challenge: String(entry.challenge || 'MOOSE-495').slice(0, 24),
    score: Math.max(0, Math.round(Number(entry.score) || 0)),
    campaignPct: Math.max(0, Math.min(100, Math.round(Number(entry.campaignPct) || 0))),
    missionsCompleted: Math.max(0, Math.min(10, Math.round(Number(entry.missionsCompleted) || 0))),
    goldMissions: Math.max(0, Math.min(10, Math.round(Number(entry.goldMissions) || 0))),
    perfectMissions: Math.max(0, Math.min(10, Math.round(Number(entry.perfectMissions) || 0))),
    difficulty: DIFFS[entry.difficulty] ? entry.difficulty : 'walk',
    level: Math.max(1, Math.round(Number(entry.level) || 1)),
    xp: Math.max(0, Math.round(Number(entry.xp) || 0)),
    achievements: Math.max(0, Math.round(Number(entry.achievements) || 0)),
    minigamePoints: Math.max(0, Math.round(Number(entry.minigamePoints) || 0)),
    submittedAt: entry.submittedAt || new Date().toISOString(),
    source,
  };
}

export function rankEntries(entries: LeaderboardEntry[]) {
  return entries
    .slice()
    .sort((a, b) =>
      b.score - a.score ||
      b.campaignPct - a.campaignPct ||
      b.goldMissions - a.goldMissions ||
      new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()
    );
}

function mergeEntries(...groups: LeaderboardEntry[][]) {
  const byId = new Map<string, LeaderboardEntry>();
  for (const group of groups) {
    for (const raw of group) {
      const entry = cleanEntry(raw, raw.source || 'shared');
      const prev = byId.get(entry.id);
      if (!prev || entry.score > prev.score || (entry.score === prev.score && new Date(entry.submittedAt) > new Date(prev.submittedAt))) {
        byId.set(entry.id, entry);
      }
    }
  }
  return rankEntries(Array.from(byId.values())).slice(0, 100);
}

export function getLocalLeaderboard() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return [];
    const entries = JSON.parse(raw);
    return Array.isArray(entries) ? mergeEntries(entries.map(entry => ({ ...entry, source: 'local' as const }))) : [];
  } catch {
    return [];
  }
}

function saveLocalLeaderboard(entries: LeaderboardEntry[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(rankEntries(entries).slice(0, 100)));
}

export function saveLocalEntry(entry: LeaderboardEntry) {
  const localEntry = cleanEntry({ ...entry, source: 'local' }, 'local');
  const merged = mergeEntries(getLocalLeaderboard(), [localEntry]);
  saveLocalLeaderboard(merged);
  return merged;
}

// --- Supabase helpers ---

function toDbRow(entry: LeaderboardEntry) {
  return {
    id: entry.id,
    callsign: entry.callsign,
    rank: entry.rank,
    unit: entry.unit,
    score: entry.score,
    campaign_pct: entry.campaignPct,
    missions_completed: entry.missionsCompleted,
    gold_missions: entry.goldMissions,
    perfect_missions: entry.perfectMissions,
    difficulty: entry.difficulty,
    level: entry.level,
    xp: entry.xp,
    achievements: entry.achievements,
    minigame_points: entry.minigamePoints,
    challenge: entry.challenge,
    submitted_at: entry.submittedAt,
  };
}

function fromDbRow(row: Record<string, unknown>): LeaderboardEntry {
  return cleanEntry({
    id: String(row.id),
    callsign: String(row.callsign),
    rank: String(row.rank),
    unit: String(row.unit),
    score: Number(row.score),
    campaignPct: Number(row.campaign_pct),
    missionsCompleted: Number(row.missions_completed),
    goldMissions: Number(row.gold_missions),
    perfectMissions: Number(row.perfect_missions),
    difficulty: row.difficulty as Difficulty,
    level: Number(row.level),
    xp: Number(row.xp),
    achievements: Number(row.achievements),
    minigamePoints: Number(row.minigame_points),
    challenge: String(row.challenge),
    submittedAt: String(row.submitted_at),
    source: 'shared',
  }, 'shared');
}

async function fetchSupabaseEntries(): Promise<LeaderboardEntry[]> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('leaderboard_entries')
    .select('*')
    .order('score', { ascending: false })
    .limit(100);
  if (error) throw error;
  return (data as Record<string, unknown>[]).map(fromDbRow);
}

async function pushToSupabase(entry: LeaderboardEntry): Promise<LeaderboardEntry[]> {
  if (!supabase) throw new Error('Supabase not configured');

  // Only upsert if this score is an improvement (checked server-side via DB policy)
  const row = toDbRow(cleanEntry(entry, 'shared'));
  const { error } = await supabase
    .from('leaderboard_entries')
    .upsert(row, { onConflict: 'id', ignoreDuplicates: false });
  if (error) throw error;

  return fetchSupabaseEntries();
}

// --- Seed fallback ---

async function fetchSeedEntries() {
  const base = import.meta.env.BASE_URL || '/';
  const url = `${base.endsWith('/') ? base : `${base}/`}leaderboard-seed.json`;
  try {
    const response = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!response.ok) return [];
    const payload = await response.json();
    const entries = Array.isArray(payload) ? payload : payload.entries;
    return Array.isArray(entries) ? entries.map((e: LeaderboardEntry) => cleanEntry(e, 'seed')) : [];
  } catch {
    return [];
  }
}

// --- Public API ---

export async function fetchLeaderboard(): Promise<LeaderboardResult> {
  const local = getLocalLeaderboard();
  const seed = await fetchSeedEntries();

  if (!supabase) {
    return {
      entries: mergeEntries(local, seed),
      sharedOnline: false,
      message: 'Supabase not configured — showing local scores only.',
    };
  }

  try {
    const shared = await fetchSupabaseEntries();
    return {
      entries: mergeEntries(shared, local, seed),
      sharedOnline: true,
      message: 'Live leaderboard from Supabase',
    };
  } catch {
    return {
      entries: mergeEntries(local, seed),
      sharedOnline: false,
      message: 'Supabase unreachable — showing local scores.',
    };
  }
}

export async function submitLeaderboardEntry(entry: LeaderboardEntry): Promise<LeaderboardResult> {
  const local = saveLocalEntry(entry);

  if (!supabase) {
    const seed = await fetchSeedEntries();
    return {
      entries: mergeEntries(local, seed),
      sharedOnline: false,
      message: 'Score saved locally. Supabase not configured.',
    };
  }

  try {
    const shared = await pushToSupabase(entry);
    return {
      entries: mergeEntries(shared, local),
      sharedOnline: true,
      message: 'Score submitted to the global leaderboard!',
    };
  } catch {
    const seed = await fetchSeedEntries();
    return {
      entries: mergeEntries(local, seed),
      sharedOnline: false,
      message: 'Score saved locally. Could not reach Supabase.',
    };
  }
}
