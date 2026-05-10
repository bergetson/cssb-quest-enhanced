import { useGame } from '../../contexts/GameContext';
import { ScreenWrap, SectionTitle, MilCard, GradeBadge, StatBar, BadgeGrid, XPBar, Divider } from '../../components/GameUI';

const MISSION_NAMES = [
  'WARNO DROP', 'MISSION ANALYSIS LAB', 'CLASS I AND WATER', 'FUEL AND CONVOY',
  'CLASS V AND DODAC', 'LOGPAC LOADMASTER', 'PACE AND LOGSTAT', 'COA WARGAME',
  'FRAGORD AND OPORD', 'MDMP NIGHTMARE FINAL',
];

export default function LeaderboardScreen() {
  const { state, dispatch } = useGame();
  const totalScore = Object.values(state.missions).reduce((s, m) => s + m.score, 0);
  const maxScore = Object.values(state.missions).reduce((s, m) => s + m.max, 0);
  const completed = Object.keys(state.completed).length;
  const overallGrade = maxScore > 0 ? (totalScore / maxScore >= 0.9 ? 'GOLD' : totalScore / maxScore >= 0.75 ? 'SILVER' : totalScore / maxScore >= 0.6 ? 'BRONZE' : 'FAILED') : 'BRONZE';

  return (
    <ScreenWrap>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <button onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'hub' })} className="text-xs text-slate-500 mono mb-4 hover:text-slate-300 transition-colors">
          ← HUB
        </button>

        <SectionTitle color="gold">CAMPAIGN STATS</SectionTitle>

        {/* Overview */}
        <div className="mil-card mil-card-gold p-5 mb-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="text-xs text-slate-500 mono mb-1">SOLDIER</div>
              <div className="text-xl font-black text-yellow-400" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                {state.player?.rank} {state.player?.name}
              </div>
              <div className="text-xs text-slate-500">{state.player?.unit}</div>
            </div>
            <div className="text-right">
              <GradeBadge grade={overallGrade} />
              <div className="text-xs text-slate-500 mono mt-1">{totalScore}/{maxScore} pts</div>
            </div>
          </div>
          <div className="mt-4">
            <XPBar />
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4 text-center">
            <div>
              <div className="text-2xl font-black text-yellow-400" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{state.creds}</div>
              <div className="text-[10px] text-slate-500 mono">CREDITS</div>
            </div>
            <div>
              <div className="text-2xl font-black text-cyan-400" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{completed}/10</div>
              <div className="text-[10px] text-slate-500 mono">MISSIONS</div>
            </div>
            <div>
              <div className="text-2xl font-black text-orange-400" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{state.streak}</div>
              <div className="text-[10px] text-slate-500 mono">STREAK 🔥</div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mil-card p-4 mb-6">
          <div className="text-xs text-slate-500 mono mb-3">STAFF COMPETENCIES</div>
          <div className="grid gap-2">
            <StatBar label="Command" value={state.stats.cmd} color="gold" />
            <StatBar label="Clarity" value={state.stats.clarity} color="cyan" />
            <StatBar label="Readiness" value={state.stats.readiness} color="green" />
            <StatBar label="Tempo" value={state.stats.tempo} color="orange" />
            <StatBar label="Coord" value={state.stats.coord} color="purple" />
            <StatBar label="Morale" value={state.stats.morale} color="lime" />
            <StatBar label="Chaos" value={100 - state.stats.chaos} color="red" />
          </div>
        </div>

        {/* Mission Scores */}
        <div className="mil-card p-4 mb-6">
          <div className="text-xs text-slate-500 mono mb-3">MISSION SCORES</div>
          <div className="grid gap-2">
            {MISSION_NAMES.map((name, i) => {
              const id = `m${i + 1}`;
              const rec = state.missions[id];
              const isCompleted = !!state.completed[id];
              return (
                <div key={id} className="flex items-center gap-3 py-1 border-b border-white/5">
                  <div className="text-xs text-slate-600 mono w-6">{i + 1}</div>
                  <div className="flex-1 text-xs text-slate-400 truncate">{name}</div>
                  {rec ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 mono">{rec.score}/{rec.max}</span>
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

        {/* Badges */}
        <div className="mb-6">
          <div className="text-xs text-slate-500 mono mb-3">BADGES EARNED ({Object.keys(state.badges).length})</div>
          <BadgeGrid />
        </div>

        {/* Hall of Shame */}
        {Object.keys(state.hall).length > 0 && (
          <div className="mil-card p-4 mb-6">
            <div className="text-xs text-red-400/80 mono mb-3">HALL OF SHAME</div>
            <div className="grid gap-2">
              {Object.values(state.hall).map(h => (
                <div key={h.id} className="flex items-start gap-2 py-1 border-b border-white/5">
                  <span className="text-red-400 text-sm">💀</span>
                  <div>
                    <div className="text-xs font-bold text-red-400" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{h.name}</div>
                    <div className="text-[10px] text-slate-500">{h.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <Divider />
        <div className="text-center text-xs text-slate-700 mono">THE 495 CSSB IS THE PREMIER CSSB</div>
      </div>
    </ScreenWrap>
  );
}
