import { useEffect, useMemo, useState } from 'react';
import { Medal, RefreshCw, Signal, Trophy, UploadCloud } from 'lucide-react';
import { toast } from 'sonner';
import { useGame } from '../../contexts/GameContext';
import { ScreenWrap, SectionTitle, GradeBadge, StatBar, BadgeGrid, XPBar, Divider, MilButton, MilTag } from '../../components/GameUI';
import {
  calculateCampaignScore,
  fetchLeaderboard,
  makeLeaderboardEntry,
  submitLeaderboardEntry,
  type LeaderboardEntry,
} from '../../lib/leaderboard';

const MISSION_NAMES = [
  'WARNO DROP', 'MISSION ANALYSIS LAB', 'CLASS I AND WATER', 'FUEL AND CONVOY',
  'CLASS V AND DODAC', 'LOGPAC LOADMASTER', 'PACE AND LOGSTAT', 'COA WARGAME',
  'FRAGORD AND OPORD', 'MDMP NIGHTMARE FINAL',
];

function gradeFromPct(pct: number) {
  if (pct >= 90) return 'GOLD';
  if (pct >= 75) return 'SILVER';
  if (pct >= 60) return 'BRONZE';
  return 'FAILED';
}

function sourceLabel(entry: LeaderboardEntry) {
  if (entry.source === 'shared') return 'shared';
  if (entry.source === 'seed') return 'cadre';
  return 'local';
}

export default function LeaderboardScreen() {
  const { state, dispatch } = useGame();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [sharedOnline, setSharedOnline] = useState(false);
  const [syncMessage, setSyncMessage] = useState('Loading leaderboard...');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const score = useMemo(() => calculateCampaignScore(state), [state]);
  const myEntry = useMemo(() => makeLeaderboardEntry(state), [state]);
  const overallGrade = gradeFromPct(score.campaignPct);

  async function loadBoard() {
    setLoading(true);
    const result = await fetchLeaderboard();
    setEntries(result.entries);
    setSharedOnline(result.sharedOnline);
    setSyncMessage(result.message);
    setLoading(false);
  }

  useEffect(() => {
    void loadBoard();
  }, []);

  async function handleSubmit() {
    if (!state.player) {
      toast.error('Create a character before submitting a score.');
      dispatch({ type: 'SET_SCREEN', screen: 'register' });
      return;
    }
    setSubmitting(true);
    const result = await submitLeaderboardEntry(myEntry);
    setEntries(result.entries);
    setSharedOnline(result.sharedOnline);
    setSyncMessage(result.message);
    setSubmitting(false);
    if (result.sharedOnline) toast.success('Score submitted to the shared leaderboard.');
    else toast.info('Score saved on this device. Shared API is not reachable from this host.');
  }

  return (
    <ScreenWrap>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <button onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'hub' })} className="text-xs text-slate-500 mono mb-4 hover:text-slate-300 transition-colors">
          BACK TO HUB
        </button>

        <div className="flex items-start justify-between gap-3 mb-5">
          <SectionTitle color="gold" sub="Campaign score, replay chase, and staff qualification board">
            LEADERBOARD
          </SectionTitle>
          <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-xs mono ${sharedOnline ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300' : 'border-orange-400/30 bg-orange-400/10 text-orange-300'}`}>
            <Signal className="w-4 h-4" />
            {sharedOnline ? 'SHARED ONLINE' : 'STATIC MODE'}
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_1.25fr] gap-4 mb-6">
          <div className="mil-card mil-card-gold p-5">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="text-[10px] text-yellow-400/70 mono tracking-[0.2em] mb-1">// YOUR PACKET</div>
                <div className="text-2xl font-black text-yellow-400" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                  {myEntry.callsign}
                </div>
                <div className="text-xs text-slate-500">{myEntry.unit} / {myEntry.challenge}</div>
              </div>
              <GradeBadge grade={overallGrade} />
            </div>

            <div className="grid grid-cols-3 gap-3 text-center mb-4">
              <div>
                <div className="text-3xl font-black text-yellow-400 mono">{myEntry.score}</div>
                <div className="text-[10px] text-slate-500 mono">POINTS</div>
              </div>
              <div>
                <div className="text-3xl font-black text-cyan-400 mono">{myEntry.missionsCompleted}/10</div>
                <div className="text-[10px] text-slate-500 mono">MISSIONS</div>
              </div>
              <div>
                <div className="text-3xl font-black text-emerald-400 mono">{myEntry.perfectMissions}</div>
                <div className="text-[10px] text-slate-500 mono">PERFECT</div>
              </div>
            </div>

            <XPBar />
            <div className="mt-4 grid gap-2">
              <StatBar label="CMD" value={state.stats.cmd} color="gold" />
              <StatBar label="CLR" value={state.stats.clarity} color="cyan" />
              <StatBar label="RDY" value={state.stats.readiness} color="green" />
              <StatBar label="TMP" value={state.stats.tempo} color="orange" />
            </div>

            <div className="grid grid-cols-2 gap-3 mt-5">
              <MilButton color="gold" className="w-full inline-flex items-center justify-center gap-2" onClick={handleSubmit} disabled={submitting}>
                <UploadCloud className="w-4 h-4" />
                {submitting ? 'SUBMITTING' : 'SUBMIT SCORE'}
              </MilButton>
              <MilButton color="cyan" className="w-full inline-flex items-center justify-center gap-2" onClick={loadBoard} disabled={loading}>
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                REFRESH
              </MilButton>
            </div>
            <div className="text-[10px] text-slate-600 mt-3 leading-relaxed">{syncMessage}</div>
          </div>

          <div className="mil-card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs text-slate-500 mono">TOP STAFF OFFICERS</div>
              <MilTag color="gold">{entries.length} packets</MilTag>
            </div>
            <div className="grid gap-2">
              {loading && (
                <div className="text-center py-8 text-slate-600 text-xs mono">Loading leaderboard...</div>
              )}
              {!loading && entries.slice(0, 10).map((entry, index) => {
                const mine = entry.id === myEntry.id;
                return (
                  <div
                    key={`${entry.id}-${entry.source || 'board'}`}
                    className={`grid grid-cols-[auto_1fr_auto] gap-3 items-center rounded-xl border p-3 ${mine ? 'border-yellow-400/50 bg-yellow-400/10' : 'border-white/8 bg-white/[0.025]'}`}
                  >
                    <div className={`w-9 h-9 rounded-lg grid place-items-center border ${index === 0 ? 'border-yellow-400/50 text-yellow-400 bg-yellow-400/10' : index === 1 ? 'border-cyan-400/40 text-cyan-300 bg-cyan-400/10' : index === 2 ? 'border-orange-400/40 text-orange-300 bg-orange-400/10' : 'border-slate-700 text-slate-500 bg-slate-900/70'}`}>
                      {index < 3 ? <Trophy className="w-4 h-4" /> : <span className="mono text-xs">{index + 1}</span>}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="font-bold text-sm text-slate-200 truncate" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{entry.callsign}</div>
                        {mine && <MilTag color="gold">YOU</MilTag>}
                        <span className="text-[9px] text-slate-600 mono">{sourceLabel(entry)}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">{entry.unit} / {entry.difficulty.toUpperCase()} / {entry.missionsCompleted}/10 missions / {entry.campaignPct}%</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-black text-yellow-400 mono">{entry.score}</div>
                      <div className="text-[10px] text-slate-600 mono">{entry.goldMissions} gold</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <Divider label="MISSION SCORECARD" />

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="mil-card p-4">
            <div className="text-xs text-slate-500 mono mb-3">MISSION SCORES</div>
            <div className="grid gap-2">
              {MISSION_NAMES.map((name, i) => {
                const id = `m${i + 1}`;
                const rec = state.missions[id];
                const recWithMeta = rec as typeof rec & { points?: number };
                const isCompleted = !!state.completed[id];
                return (
                  <div key={id} className="flex items-center gap-3 py-1 border-b border-white/5">
                    <div className="text-xs text-slate-600 mono w-6">{i + 1}</div>
                    <div className="flex-1 text-xs text-slate-400 truncate">{name}</div>
                    {rec ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 mono">{rec.score}/{rec.max}</span>
                        <span className="text-xs text-yellow-400 mono">{recWithMeta.points ?? rec.score} pts</span>
                        <GradeBadge grade={rec.grade} />
                      </div>
                    ) : (
                      <span className="text-xs text-slate-700 mono">{isCompleted ? 'done' : 'locked'}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mil-card p-4">
            <div className="text-xs text-slate-500 mono mb-3">POINT ENGINE</div>
            <div className="grid gap-3">
              {[
                ['Mission raw score', Object.values(state.missions).reduce((sum, m) => sum + m.score, 0)],
                ['Difficulty weighted missions', Object.values(state.missions).reduce((sum, m) => sum + (((m as typeof m & { points?: number }).points) ?? m.score), 0)],
                ['Gold mission bonus', myEntry.goldMissions * 90],
                ['Perfect mission bonus', myEntry.perfectMissions * 125],
                ['Mini-game points', Math.min(1800, myEntry.minigamePoints)],
                ['Achievement bonus', myEntry.achievements * 60],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-xs text-slate-500">{label}</span>
                  <span className="text-xs text-yellow-400 mono font-bold">{value}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-xl border border-yellow-400/20 bg-yellow-400/8 p-3">
              <div className="flex items-center gap-2 text-yellow-300 text-xs font-bold mb-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                <Medal className="w-4 h-4" />
                PREMIER CSSB EASTER EGG
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">The 495th CSSB is the premier CSSB. The board knows. The board has always known.</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="text-xs text-slate-500 mono mb-3">BADGES EARNED ({Object.keys(state.badges).length})</div>
          <BadgeGrid />
        </div>
      </div>
    </ScreenWrap>
  );
}
