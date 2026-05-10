import { useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import { MilButton, MilCard, ScreenWrap, SectionTitle } from '../../components/GameUI';
import { DIFFS, type Difficulty } from '../../lib/gameData';

const RANKS = ['PVT', 'PFC', 'SPC', 'CPL', 'SGT', 'SSG', 'SFC', 'MSG', '1SG', 'SGM', 'CSM', '2LT', '1LT', 'CPT', 'MAJ', 'LTC', 'COL'];

export default function RegisterScreen() {
  const { state, dispatch } = useGame();
  const [rank, setRank] = useState(state.player?.rank || 'CPT');
  const [name, setName] = useState(state.player?.name || '');
  const [unit, setUnit] = useState(state.player?.unit || '495 CSSB');
  const [diff, setDiff] = useState<Difficulty>(state.difficulty);
  const [challenge, setChallenge] = useState(state.challenge);

  function handleStart() {
    if (!name.trim()) return;
    dispatch({ type: 'SET_PLAYER', player: { rank, name: name.trim(), unit: unit.trim() || '495 CSSB' } });
    dispatch({ type: 'SET_DIFFICULTY', difficulty: diff });
    dispatch({ type: 'SET_CHALLENGE', challenge: challenge.trim() || 'MOOSE-495' });
    dispatch({ type: 'SET_SCREEN', screen: 'hub' });
  }

  return (
    <ScreenWrap showTopBar={false}>
      <div className="max-w-xl mx-auto px-4 py-8">
        {/* Back */}
        <button onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'title' })} className="text-xs text-slate-500 mono mb-6 hover:text-slate-300 transition-colors">
          ← BACK
        </button>

        <SectionTitle color="gold">SOLDIER REGISTRATION</SectionTitle>

        <MilCard className="p-5 mb-5">
          <div className="text-xs text-yellow-400/80 mono tracking-widest mb-4">// IDENTIFICATION</div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs text-slate-500 mb-2 mono">RANK</label>
              <select
                value={rank}
                onChange={e => setRank(e.target.value)}
                className="mil-input"
              >
                {RANKS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-2 mono">LAST NAME</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="SMITH"
                className="mil-input"
                style={{ textTransform: 'uppercase' }}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-2 mono">UNIT</label>
            <input
              type="text"
              value={unit}
              onChange={e => setUnit(e.target.value)}
              placeholder="495 CSSB"
              className="mil-input"
            />
          </div>
        </MilCard>

        <MilCard className="p-5 mb-5">
          <div className="text-xs text-cyan-400/80 mono tracking-widest mb-4">// SCENARIO CODE</div>
          <div>
            <label className="block text-xs text-slate-500 mb-2 mono">CHALLENGE CODE (changes scenario variables)</label>
            <input
              type="text"
              value={challenge}
              onChange={e => setChallenge(e.target.value.toUpperCase())}
              placeholder="MOOSE-495"
              className="mil-input"
            />
          </div>
          <p className="text-[10px] text-slate-600 mt-2">Different codes generate different personnel counts, distances, and scenarios. Share codes with your unit for standardized training.</p>
        </MilCard>

        <MilCard className="p-5 mb-6">
          <div className="text-xs text-orange-400/80 mono tracking-widest mb-4">// DIFFICULTY</div>
          <div className="flex flex-col gap-2">
            {(Object.entries(DIFFS) as [Difficulty, typeof DIFFS[Difficulty]][]).map(([key, d]) => (
              <button
                key={key}
                onClick={() => setDiff(key)}
                className={`text-left p-3 rounded-xl border transition-all ${
                  diff === key
                    ? `border-${d.color}-400/60 bg-${d.color}-400/10`
                    : 'border-white/8 bg-white/2 hover:border-white/15'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-bold ${diff === key ? `text-${d.color}-400` : 'text-slate-400'}`} style={{ fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.06em' }}>
                    {d.name}
                  </span>
                  <span className="text-[10px] text-slate-600 mono">{d.time}min • ×{d.mult}</span>
                </div>
                <p className="text-xs text-slate-500">{d.desc}</p>
                <div className="flex gap-2 mt-1.5">
                  {d.hints && <span className="mil-tag mil-tag-green">HINTS</span>}
                  {d.noSaves && <span className="mil-tag mil-tag-red">NO SAVES</span>}
                  {d.hard && <span className="mil-tag mil-tag-orange">HARD MODE</span>}
                </div>
              </button>
            ))}
          </div>
        </MilCard>

        <MilButton
          color="gold"
          size="lg"
          className="w-full"
          onClick={handleStart}
          disabled={!name.trim()}
        >
          ▶ REPORT FOR DUTY
        </MilButton>
      </div>
    </ScreenWrap>
  );
}
