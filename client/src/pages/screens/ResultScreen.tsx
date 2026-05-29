import { useGame } from '../../contexts/GameContext';
import { ScreenWrap, MilCard, MilButton, GradeBadge, SectionTitle, Divider } from '../../components/GameUI';
import { grade, gradeColor, passThresholdForDifficulty } from '../../lib/gameData';
import { ChaosMeter } from '../../components/ChaosOverlay';
import OutcomeFX from '../../components/OutcomeFX';
import SupplyDrop from '../../components/SupplyDrop';

const MISSIONS_COUNT = 10;

export default function ResultScreen() {
  const { state, dispatch } = useGame();
  const r = state.lastResult;

  if (!r) {
    dispatch({ type: 'SET_SCREEN', screen: 'hub' });
    return null;
  }

  const isAAR = r.isAAR;
  const g = r.grade || (isAAR ? grade(r.missionScore || 0, r.max || 1) : '');
  const color = gradeColor(g);
  const missionIdx = r.missionIndex ?? 0;
  const hasNext = missionIdx < MISSIONS_COUNT - 1;
  const nextIdx = missionIdx + 1;

  const pct = r.max && r.max > 0 ? (r.missionScore || 0) / r.max : 0;
  const passThreshold = passThresholdForDifficulty(state.difficulty);
  const passed = pct >= passThreshold;
  const nextMissionLocked = !passed;

  const gradeMessages: Record<string, { title: string; msg: string }> = {
    GOLD:   { title: '🥇 GOLD — OUTSTANDING', msg: 'You tied facts to a commander decision. That is staff work. The 495 CSSB is the premier CSSB.' },
    SILVER: { title: '🥈 SILVER — PROFICIENT', msg: 'Solid staff work. A few gaps remain. Review the teaching points and replay for Gold.' },
    BRONZE: { title: '🥉 BRONZE — MARGINAL', msg: `You passed the ${Math.round(passThreshold * 100)}% threshold. But the commander noticed. Review the formulas and replay for Silver.` },
    FAILED: { title: '❌ FAILED — REMEDIATION REQUIRED', msg: `Below ${Math.round(passThreshold * 100)}%. Next mission is locked. Return to the reference materials and replay. The staff depends on you.` },
  };

  const gMsg = gradeMessages[g] || gradeMessages.FAILED;

  return (
    <ScreenWrap>
      <div className="max-w-2xl mx-auto px-4 py-8">
        {isAAR ? (
          <>
            {/* Mission AAR */}
            <div className={`mil-card mil-card-${color} p-6 mb-6 animate-fade-in-up relative overflow-hidden`}>
              <OutcomeFX outcome={passed ? 'pass' : 'fail'} label={passed ? 'MISSION GO' : 'RETRAIN'} />
              <div className="text-xs text-slate-500 mono mb-2">// MISSION AFTER ACTION REVIEW</div>
              <h2 className="text-3xl font-black tracking-wide mb-1" style={{ fontFamily: 'Rajdhani, sans-serif', color: `var(--${color}-accent, #F5C842)` }}>
                {r.choice}
              </h2>
              <div className="flex items-center gap-3 mb-4">
                <GradeBadge grade={g} />
                <span className="text-sm text-slate-400">{gMsg.title}</span>
              </div>

              {/* Score breakdown */}
              <div className="output-box mb-4">
                {r.result}
              </div>

              {/* Pass/Fail gate message */}
              {passed ? (
                <div className="success-box mb-4">
                  <div className="font-bold mb-1 text-xs" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                    ✓ MISSION PASSED ({Math.round(pct * 100)}% — threshold: {Math.round(passThreshold * 100)}%)
                  </div>
                  <p className="text-xs">{gMsg.msg}</p>
                </div>
              ) : (
                <div className="danger-box mb-4">
                  <div className="font-bold mb-1 text-xs" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                    ✗ MISSION FAILED ({Math.round(pct * 100)}% — need {Math.round(passThreshold * 100)}% to advance)
                  </div>
                  <p className="text-xs">{gMsg.msg}</p>
                  <p className="text-xs mt-2 text-red-300 font-bold">Next mission remains LOCKED until you score 70% or higher.</p>
                </div>
              )}
            </div>

            {/* Supply drop reveal */}
            {r.loot && <SupplyDrop loot={r.loot} />}

            {/* Near-miss nudge — the replay hook */}
            {r.nearMissPts && r.nearMissPts > 0 && (
              <div className="mil-card mil-card-gold p-4 mb-4 animate-fade-in-up">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🎯</span>
                  <div className="flex-1">
                    <div className="font-black text-yellow-300" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                      SO CLOSE — {r.nearMissPts} {r.nearMissPts === 1 ? 'point' : 'points'} from 🥇 GOLD
                    </div>
                    <div className="text-xs text-slate-400">One cleaner calculation and the GOLD is yours. Run it back?</div>
                  </div>
                  <MilButton color="gold" onClick={() => {
                    dispatch({ type: 'INIT_MISSION', missionIndex: r.missionIndex ?? 0 });
                    dispatch({ type: 'SET_SCREEN', screen: 'mission' });
                  }}>
                    🔄 REPLAY
                  </MilButton>
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="mil-card p-4 mb-4">
              <div className="text-xs text-slate-500 mono mb-3">// CAMPAIGN STATUS</div>
              <div className="grid grid-cols-3 gap-4 text-center mb-4">
                <div>
                  <div className="text-2xl font-black text-yellow-400" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{r.missionScore || 0}</div>
                  <div className="text-[10px] text-slate-500 mono">MISSION SCORE</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-cyan-400" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{state.creds}</div>
                  <div className="text-[10px] text-slate-500 mono">TOTAL CREDITS</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-emerald-400" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{Object.keys(state.completed).length}/{MISSIONS_COUNT}</div>
                  <div className="text-[10px] text-slate-500 mono">MISSIONS DONE</div>
                </div>
              </div>
              {/* Streak bonus earned this mission */}
              {r.streakBonus && r.streakBonus > 0 && (
                <div className="mb-3 flex items-center justify-between rounded-lg border border-orange-400/30 bg-orange-400/10 px-3 py-2">
                  <span className="text-xs text-orange-300 mono font-bold">🔥 STREAK BONUS</span>
                  <span className="text-xs text-orange-200 mono font-bold">+{r.streakBonus} XP</span>
                </div>
              )}
              {/* Chaos meter */}
              <ChaosMeter value={state.chaosMeter} />
            </div>

            <Divider />

            {/* Actions */}
            <div className="grid gap-3">
              <div className="grid grid-cols-2 gap-3">
                <MilButton color="gold" className="w-full" onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'hub' })}>
                  ← RETURN TO HUB
                </MilButton>
                {hasNext && !nextMissionLocked && (
                  <MilButton color="cyan" className="w-full" onClick={() => {
                    dispatch({ type: 'INIT_MISSION', missionIndex: nextIdx });
                    dispatch({ type: 'SET_SCREEN', screen: 'mission' });
                  }}>
                    NEXT MISSION →
                  </MilButton>
                )}
                {hasNext && nextMissionLocked && (
                  <div className="flex items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
                  <span className="text-xs text-red-400 mono text-center">🔒 LOCKED — Score {Math.round(passThreshold * 100)}%+ to unlock</span>
                  </div>
                )}
              </div>
              <MilButton className="w-full" onClick={() => {
                dispatch({ type: 'INIT_MISSION', missionIndex: r.missionIndex ?? 0 });
                dispatch({ type: 'SET_SCREEN', screen: 'mission' });
              }}>
                🔄 REPLAY MISSION
              </MilButton>
              <MilButton color="cyan" className="w-full" onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'leaderboard' })}>
                🏆 SUBMIT / VIEW LEADERBOARD
              </MilButton>
              <MilButton className="w-full" onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'achievements' })}>
                🏆 VIEW ACHIEVEMENTS
              </MilButton>
            </div>
          </>
        ) : (
          <>
            {/* Step Result */}
            <div className={`mil-card p-6 mb-6 animate-fade-in-up ${r.title?.includes('CONFIRMED') || r.title?.includes('CORRECT') ? 'mil-card-green' : r.title?.includes('MOSTLY') ? 'mil-card-orange' : 'mil-card-red'}`}>
              <div className="text-xs text-slate-500 mono mb-2">// STEP RESULT</div>
              <h2 className="text-2xl font-black tracking-wide mb-3" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                {r.title}
              </h2>
              <div className="output-box">{r.result}</div>
              {r.protectedBy && (
                <div className="info-box mt-3">
                  <div className="font-bold text-xs mb-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>SAVE USED</div>
                  {r.protectedBy}
                </div>
              )}
              {r.learn && (
                <div className="success-box mt-3">
                  <div className="font-bold text-xs mb-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>TEACHING POINT</div>
                  {r.learn}
                </div>
              )}
            </div>

            <MilButton color="gold" size="lg" className="w-full" onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'mission' })}>
              CONTINUE →
            </MilButton>
          </>
        )}
      </div>
    </ScreenWrap>
  );
}
