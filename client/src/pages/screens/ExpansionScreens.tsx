import { useEffect, useMemo, useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import {
  ScreenWrap, MilCard, MilButton, MilTag, SectionTitle, ProgressBar, Divider,
} from '../../components/GameUI';
import OutcomeFX from '../../components/OutcomeFX';
import { accentText, accentTint } from '../../lib/colors';
import {
  convoyScenarios,
  dscaMissions,
  matchingPrompts,
  newSoldierLessons,
  opforAssets,
  silhouettePrompts,
  threatReportPrompts,
  warriorGames,
  warriorScenarios,
  type ChoiceOption,
  type ConvoyScenario,
  type DscaMission,
  type OpforAsset,
  type TrainingAAR,
  type WarriorGameCard,
  type WarriorScenario,
} from '../../data/expansionContent';
import {
  completionPercent,
  gradePercent,
  loadExpansionProgress,
  recordExpansionRun,
  saveExpansionProgress,
  xpFromScore,
  type ExpansionGrade,
  type ExpansionProgress,
} from '../../lib/expansionProgress';
import { shuffleWithSeed } from '../../lib/gameplayUtils';

type MetricMap = Record<string, number>;

const gradeColor: Record<ExpansionGrade, string> = {
  Expert: 'gold',
  Proficient: 'green',
  'Needs Practice': 'orange',
  Retrain: 'red',
};

const metricLabels: Record<string, string> = {
  mission: 'Mission Success',
  communication: 'Communication',
  safety: 'Soldier Safety',
  sustainment: 'Sustainment',
  speed: 'Speed',
  trust: 'Commander Trust',
  risk: 'Risk Control',
};

const categoryPool = [
  'Main Battle Tank',
  'Infantry Fighting Vehicle',
  'Armored Personnel Carrier',
  'Rocket Artillery',
  'Self-Propelled Artillery',
  'Air Defense',
  'Tactical Truck',
  'Fighter Aircraft',
  'Attack Helicopter',
  'Transport Helicopter',
  'Small UAS',
  'Unknown / Not enough information',
];

function useExpansionStore() {
  const [progress, setProgress] = useState<ExpansionProgress>(() => loadExpansionProgress());

  function update(next: ExpansionProgress) {
    setProgress(next);
    saveExpansionProgress(next);
  }

  return { progress, update };
}

function clampMetric(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function applyEffects(metrics: MetricMap, effects: MetricMap = {}) {
  const next = { ...metrics };
  Object.entries(effects).forEach(([key, amount]) => {
    next[key] = clampMetric((next[key] ?? 75) + amount);
  });
  return next;
}

function averageMetrics(metrics: MetricMap, keys = Object.keys(metrics)) {
  const values = keys.map(key => metrics[key] ?? 75);
  return Math.round(values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length));
}

function makeAar(score: number, fallback: TrainingAAR): TrainingAAR {
  if (score >= 90) return fallback;
  if (score >= 80) {
    return {
      ...fallback,
      improve: [...fallback.improve, 'Push speed while keeping your report or decision structured.'],
    };
  }
  if (score >= 70) {
    return {
      sustain: fallback.sustain.slice(0, 1),
      improve: [...fallback.improve, 'Rehearse the sequence again and say the reason for each choice out loud.'],
      retrain: fallback.retrain,
      teachingPoint: fallback.teachingPoint,
    };
  }
  return {
    sustain: ['You completed the rep and generated an AAR.'],
    improve: [...fallback.improve, 'Slow down, identify the mission variable, then choose the safest complete answer.'],
    retrain: fallback.retrain,
    teachingPoint: fallback.teachingPoint,
  };
}

function addGameRewards(
  dispatch: ReturnType<typeof useGame>['dispatch'],
  id: string,
  title: string,
  module: string,
  score: number,
  difficulty: string,
  progress: ExpansionProgress,
  updateProgress: (progress: ExpansionProgress) => void,
  aar: TrainingAAR,
  badges: { id: string; name: string; desc: string }[] = [],
) {
  const grade = gradePercent(score);
  const xp = xpFromScore(score, difficulty);
  const next = recordExpansionRun(progress, { id, module, title, score, grade, xp }, badges.map(b => b.id));
  updateProgress(next);
  dispatch({ type: 'ADD_XP', amount: xp });
  dispatch({ type: 'SET_MINIGAME_SCORE', game: id, score });
  dispatch(score >= 70 ? { type: 'ADD_STREAK' } : { type: 'RESET_STREAK' });
  dispatch({
    type: 'ADD_NOTEBOOK',
    title: `${title} AAR`,
    text: `Score: ${score}%\nGrade: ${grade}\nSustains: ${aar.sustain.join('; ')}\nImproves: ${aar.improve.join('; ')}\nRetrain: ${aar.retrain.join('; ')}\nTeaching Point: ${aar.teachingPoint}`,
  });
  badges.forEach(badge => {
    dispatch({
      type: 'ADD_BADGE',
      badge: { ...badge, emoji: '*', earnedAt: Date.now() },
    });
  });
  return { grade, xp };
}

function ModuleHeader({
  eyebrow,
  title,
  subtitle,
  color = 'gold',
  onBack,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  color?: string;
  onBack?: () => void;
}) {
  return (
    <div className={`mil-card mil-card-${color} p-5 mb-5 animate-fade-in-up relative overflow-hidden`}>
      <div className="absolute inset-0 expansion-grid opacity-30" />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <div className="text-[10px] mono tracking-[0.24em] text-slate-500 mb-1">// {eyebrow}</div>
          <h1 className="text-3xl font-black tracking-wide" style={{ fontFamily: 'Rajdhani, sans-serif', ...accentText(color) }}>
            {title}
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">{subtitle}</p>
        </div>
        {onBack && <MilButton color={color} size="sm" onClick={onBack}>BACK</MilButton>}
      </div>
    </div>
  );
}

function ScoreAARPanel({
  title,
  score,
  xp,
  aar,
  onRetry,
  onBack,
}: {
  title: string;
  score: number;
  xp: number;
  aar: TrainingAAR;
  onRetry: () => void;
  onBack: () => void;
}) {
  const grade = gradePercent(score);
  const color = gradeColor[grade];
  return (
    <MilCard color={color} className={`p-5 after-action-card ${score >= 80 ? 'after-action-pass' : 'after-action-fail'}`}>
      <OutcomeFX outcome={score >= 80 ? 'pass' : 'fail'} label={score >= 80 ? 'GOOD REP' : 'RETRAIN'} />
      <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <div>
          <div className="text-[10px] mono tracking-[0.2em] text-slate-500">// AFTER ACTION REVIEW</div>
          <h2 className="text-2xl font-black text-slate-100" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{title}</h2>
        </div>
        <div className="text-right">
          <div className="text-4xl font-black mono" style={accentText(color)}>{score}%</div>
          <div className="text-xs text-slate-500 mono">{grade} | +{xp} XP</div>
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-3">
        <AarList title="Sustains" items={aar.sustain} color="green" />
        <AarList title="Improves" items={aar.improve} color="orange" />
        <AarList title="Retrain" items={aar.retrain} color="red" />
      </div>
      <div className="info-box mt-4">
        <div className="text-[10px] mono tracking-[0.18em] text-cyan-300 mb-1">// TEACHING POINT</div>
        {aar.teachingPoint}
      </div>
      <div className="grid grid-cols-2 gap-3 mt-4">
        <MilButton color={color} onClick={onRetry}>RETRY</MilButton>
        <MilButton onClick={onBack}>BACK</MilButton>
      </div>
    </MilCard>
  );
}

function AarList({ title, items, color }: { title: string; items: string[]; color: string }) {
  return (
    <div className="rounded-xl border p-3" style={accentTint(color, 0.05, 0.25)}>
      <div className="text-xs font-bold mb-2" style={{ fontFamily: 'Rajdhani, sans-serif', ...accentText(color) }}>{title}</div>
      <ul className="space-y-1.5">
        {items.map(item => <li key={item} className="text-xs text-slate-400 leading-relaxed">- {item}</li>)}
      </ul>
    </div>
  );
}

function MetricBars({ metrics }: { metrics: MetricMap }) {
  return (
    <div className="grid sm:grid-cols-2 gap-2">
      {Object.entries(metrics).map(([key, value]) => (
        <ProgressBar key={key} value={value} max={100} label={`${metricLabels[key] || key}: ${value}`} />
      ))}
    </div>
  );
}

function TimerPill({ seconds }: { seconds: number }) {
  return (
    <div className={`stat-pill ${seconds <= 10 ? 'border-red-500/50 text-red-400 animate-pulse' : 'border-cyan-500/40 text-cyan-400'}`}>
      TIMER {seconds}s
    </div>
  );
}

function useCountdown(seconds: number, activeKey: string, running: boolean) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    setRemaining(seconds);
  }, [seconds, activeKey]);

  useEffect(() => {
    if (!running) return undefined;
    const timer = window.setInterval(() => {
      setRemaining(value => Math.max(0, value - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [running, activeKey]);

  return remaining;
}

function OptionButton({
  text,
  selected,
  onClick,
}: {
  text: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`choice-btn text-left w-full ${selected ? 'border-cyan-400/70 bg-cyan-400/10 text-cyan-200' : ''}`}
    >
      {text}
    </button>
  );
}

function ChoiceCard({ option, onChoose }: { option: ChoiceOption; onChoose: () => void }) {
  return (
    <button className="mil-card p-4 text-left hover:-translate-y-0.5 transition-transform" onClick={onChoose}>
      <div className="text-sm text-slate-200 font-semibold">{option.text}</div>
      <div className="text-[11px] text-slate-600 mt-2">{option.feedback}</div>
    </button>
  );
}

export function WarriorTaskArcadeScreen() {
  const { dispatch } = useGame();
  const { progress, update } = useExpansionStore();
  const [game, setGame] = useState<WarriorGameCard | null>(null);
  const [scenario, setScenario] = useState<WarriorScenario | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [sequence, setSequence] = useState<string[]>([]);
  const [result, setResult] = useState<{ score: number; xp: number; aar: TrainingAAR } | null>(null);
  const remaining = useCountdown(scenario?.timeLimitSeconds || 60, scenario?.id || 'warrior', !!scenario && !result);

  const scenarioList = useMemo(
    () => (game ? warriorScenarios.filter(item => item.gameId === game.id) : []),
    [game],
  );

  function resetPlay(nextScenario: WarriorScenario) {
    setScenario(nextScenario);
    setAnswers({});
    setSequence([]);
    setResult(null);
  }

  function submitScenario() {
    if (!scenario) return;
    let correct = 0;
    let total = 1;

    if (scenario.gameType === 'sequence') {
      total = scenario.correctSequence?.length || 1;
      correct = (scenario.correctSequence || []).filter((value, index) => sequence[index] === value).length;
    } else {
      total = scenario.rounds?.length || 1;
      correct = (scenario.rounds || []).filter(round => answers[round.id] === round.correctAnswer).length;
    }

    const base = Math.round((correct / total) * 92);
    const timeBonus = Math.round((remaining / (scenario.timeLimitSeconds || 60)) * 8);
    const score = Math.max(0, Math.min(100, base + timeBonus));
    const aar = makeAar(score, scenario.aar);
    const badges = [];
    if (scenario.gameId === 'medevac' && score >= 90) badges.push({ id: 'nine-line-killer', name: 'Nine-Line Killer', desc: 'Score 90%+ on a 9-line MEDEVAC scenario.' });
    if (scenario.gameId === 'march') badges.push({ id: 'docs-apprentice', name: "Doc's Apprentice", desc: 'Complete MARCH casualty assessment practice.' });
    if (scenario.gameId === 'convoy-drill') badges.push({ id: 'convoy-survivor', name: 'Convoy Survivor', desc: 'Complete a convoy battle drill scenario.' });
    if (scenario.gameId === 'halt-security') badges.push({ id: 'security-at-the-halt', name: 'Security at the Halt', desc: 'Complete halt security practice.' });
    const rewards = addGameRewards(dispatch, scenario.id, scenario.title, 'warrior', score, scenario.difficulty, progress, update, aar, badges);
    setResult({ score, xp: rewards.xp, aar });
  }

  if (scenario) {
    if (result) {
      return (
        <ScreenWrap>
          <div className="max-w-4xl mx-auto px-4 py-6">
            <ScoreAARPanel
              title={scenario.title}
              score={result.score}
              xp={result.xp}
              aar={result.aar}
              onRetry={() => resetPlay(scenario)}
              onBack={() => { setScenario(null); setResult(null); }}
            />
          </div>
        </ScreenWrap>
      );
    }

    return (
      <ScreenWrap>
        <div className="max-w-4xl mx-auto px-4 py-6">
          <ModuleHeader eyebrow="WARRIOR TASK ARCADE" title={scenario.title} subtitle={scenario.prompt} color="green" onBack={() => setScenario(null)} />
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <TimerPill seconds={remaining} />
            <MilTag color="green">{scenario.difficulty}</MilTag>
            <MilTag color="cyan">{scenario.category}</MilTag>
          </div>
          <MilCard className="p-4 mb-4">
            <div className="text-[10px] mono tracking-[0.18em] text-slate-500 mb-2">// SCENARIO</div>
            <p className="text-sm text-slate-300 leading-relaxed">{scenario.scenarioText}</p>
          </MilCard>

          {scenario.gameType === 'sequence' ? (
            <MilCard className="p-4">
              <div className="text-sm text-slate-300 mb-3">Tap the items in order:</div>
              <div className="flex flex-wrap gap-2 mb-4">
                {shuffleWithSeed(scenario.sequenceChoices || [], `warrior-sequence:${scenario.id}`).map(choice => (
                  <MilButton key={choice} size="sm" disabled={sequence.includes(choice)} onClick={() => setSequence([...sequence, choice])}>
                    {choice}
                  </MilButton>
                ))}
              </div>
              <div className="rounded-xl border border-white/10 p-3 min-h-20 mb-4 bg-black/20">
                <div className="text-[10px] mono text-slate-500 mb-2">YOUR SEQUENCE</div>
                {sequence.length ? sequence.map((item, index) => (
                  <span key={`${item}-${index}`} className="mil-tag mil-tag-cyan mr-2 mb-2">{index + 1}. {item}</span>
                )) : <span className="text-xs text-slate-600">No selections yet.</span>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <MilButton onClick={() => setSequence([])}>CLEAR</MilButton>
                <MilButton color="green" disabled={sequence.length !== scenario.correctSequence?.length} onClick={submitScenario}>SUBMIT</MilButton>
              </div>
            </MilCard>
          ) : (
            <div className="space-y-4">
              {scenario.rounds?.map(round => (
                <MilCard key={round.id} className="p-4">
                  <div className="text-[10px] mono text-slate-500 mb-1">{round.label}</div>
                  <div className="text-sm font-semibold text-slate-200 mb-3">{round.prompt}</div>
                  <div className="grid gap-2">
                    {shuffleWithSeed(round.options, `warrior-round:${scenario.id}:${round.id}`).map(option => (
                      <OptionButton
                        key={option}
                        text={option}
                        selected={answers[round.id] === option}
                        onClick={() => setAnswers({ ...answers, [round.id]: option })}
                      />
                    ))}
                  </div>
                </MilCard>
              ))}
              <MilButton color="green" className="w-full" disabled={Object.keys(answers).length !== (scenario.rounds?.length || 0)} onClick={submitScenario}>
                SUBMIT FOR AAR
              </MilButton>
            </div>
          )}
        </div>
      </ScreenWrap>
    );
  }

  if (game) {
    return (
      <ScreenWrap>
        <div className="max-w-5xl mx-auto px-4 py-6">
          <ModuleHeader eyebrow="WARRIOR TASK ARCADE" title={game.title} subtitle={game.description} color="green" onBack={() => setGame(null)} />
          {!game.playable && (
            <MilCard color="orange" className="p-5 mb-4">
              <div className="text-lg font-bold text-orange-300 mb-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>FRAMEWORK READY</div>
              <p className="text-sm text-slate-400">
                This mini-game card is wired into the arcade and progression system. Add scenarios to the warrior scenario data with this game id to make it playable.
              </p>
            </MilCard>
          )}
          <div className="grid md:grid-cols-3 gap-3">
            {scenarioList.map(item => (
              <MilCard key={item.id} className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <MilTag color="green">{item.difficulty}</MilTag>
                  <span className="text-[10px] mono text-slate-500">BEST {progress.bestScores[item.id] || 0}%</span>
                </div>
                <div className="text-lg font-bold text-slate-100" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{item.title}</div>
                <p className="text-xs text-slate-500 mt-2 min-h-12">{item.scenarioText}</p>
                <MilButton color="green" className="w-full mt-4" onClick={() => resetPlay(item)}>START</MilButton>
              </MilCard>
            ))}
          </div>
        </div>
      </ScreenWrap>
    );
  }

  return (
    <ScreenWrap>
      <div className="max-w-6xl mx-auto px-4 py-6">
        <ModuleHeader
          eyebrow="ARCADE TRAINING"
          title="Warrior Task Arcade"
          subtitle="Short, replayable tactical decision reps with timers, AARs, XP, streaks, badges, and framework cards for future expansion."
          color="green"
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
          {warriorGames.map(item => {
            const ids = warriorScenarios.filter(s => s.gameId === item.id).map(s => s.id);
            const best = Math.max(0, ...ids.map(id => progress.bestScores[id] || 0));
            const pct = completionPercent(progress, ids);
            return (
              <MilCard key={item.id} color={item.playable ? 'green' : ''} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <MilTag color={item.playable ? 'green' : 'orange'}>{item.playable ? 'PLAYABLE' : 'DATA SLOT'}</MilTag>
                  <span className="text-[10px] mono text-slate-500">BEST {best}%</span>
                </div>
                <h3 className="text-xl font-black text-slate-100 mt-3" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{item.title}</h3>
                <p className="text-xs text-slate-500 mt-1 min-h-12">{item.description}</p>
                <div className="mt-3">
                  <ProgressBar value={pct} max={100} label={`Completion ${pct}%`} />
                </div>
                <MilButton color={item.playable ? 'green' : 'orange'} className="w-full mt-4" onClick={() => setGame(item)}>
                  {item.playable ? 'ENTER MINI-GAME' : 'VIEW FRAMEWORK'}
                </MilButton>
              </MilCard>
            );
          })}
        </div>
      </div>
    </ScreenWrap>
  );
}

function AssetVisual({ asset, silhouette = false }: { asset: OpforAsset; silhouette?: boolean }) {
  const [failed, setFailed] = useState(false);
  if (asset.image && !failed) {
    return (
      <div className="asset-visual">
        <img
          src={asset.image}
          alt={asset.name}
          className={silhouette ? 'asset-img silhouette-img' : 'asset-img'}
          onError={() => setFailed(true)}
        />
      </div>
    );
  }
  return (
    <div className={`asset-placeholder ${silhouette ? 'asset-silhouette' : ''}`}>
      <div className="text-[10px] mono tracking-[0.2em] text-slate-600">{silhouette ? 'SILHOUETTE' : 'PLACEHOLDER IMAGE'}</div>
      <div className="text-2xl font-black text-cyan-300 mt-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{asset.name}</div>
      <div className="text-xs text-slate-500 mt-1">{asset.category}</div>
    </div>
  );
}

function AssetCard({ asset, onClick }: { asset: OpforAsset; onClick?: () => void }) {
  return (
    <MilCard className="p-3" onClick={onClick}>
      <AssetVisual asset={asset} />
      <div className="flex items-center justify-between gap-2 mt-3">
        <div>
          <div className="text-sm font-bold text-slate-100" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{asset.name}</div>
          <div className="text-[11px] text-slate-500">{asset.category}</div>
        </div>
        <MilTag color={asset.faction === 'Russian' ? 'red' : asset.faction === 'Chinese' ? 'gold' : 'cyan'}>{asset.faction}</MilTag>
      </div>
    </MilCard>
  );
}

export function OpforRecognitionScreen() {
  const { dispatch } = useGame();
  const { progress, update } = useExpansionStore();
  const [mode, setMode] = useState<'hub' | 'flash' | 'silhouette' | 'library' | 'report' | 'matching'>('hub');
  const [index, setIndex] = useState(0);
  const [libraryAsset, setLibraryAsset] = useState<OpforAsset | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ score: number; xp: number; aar: TrainingAAR } | null>(null);
  const asset = opforAssets[index % opforAssets.length];
  const promptAsset = mode === 'silhouette'
    ? opforAssets.find(item => item.id === silhouettePrompts[index % silhouettePrompts.length].assetId) || asset
    : asset;

  function resetRound(nextMode = mode) {
    setMode(nextMode);
    setAnswers({});
    setResult(null);
  }

  function finishOpfor(score: number, title: string, aar: TrainingAAR, id: string, badgeId?: string) {
    const badges = badgeId ? [{ id: badgeId, name: badgeId === 'threat-spotter' ? 'Threat Spotter' : 'No Guessing', desc: badgeId === 'threat-spotter' ? 'Complete OPFOR recognition practice.' : 'Use disciplined low-confidence/unknown reporting.' }] : [];
    const rewards = addGameRewards(dispatch, id, title, 'opfor', score, promptAsset.difficulty, progress, update, aar, badges);
    setResult({ score, xp: rewards.xp, aar });
  }

  function submitFlashcard() {
    let score = 0;
    if (answers.category === asset.category) score += 40;
    if (answers.faction === asset.faction) score += 25;
    if (answers.model === asset.name) score += 20;
    if (answers.model === 'Unknown / Not enough information' && answers.confidence === 'Low') score += 12;
    if (answers.confidence) score += 10;
    const finalScore = Math.min(100, score);
    finishOpfor(finalScore, 'OPFOR Flashcard Mode', {
      sustain: ['You practiced category, faction, model, and confidence as separate judgments.'],
      improve: ['Avoid exact-model guessing when the visible features do not support it.'],
      retrain: ['Review asset category recognition and confidence language.'],
      teachingPoint: 'Report what you know. Category and activity are often more important than perfect nomenclature.',
    }, `opfor-flash-${asset.id}`, answers.model === 'Unknown / Not enough information' ? 'no-guessing' : 'threat-spotter');
  }

  function submitSilhouette() {
    const pick = answers.category;
    const score = pick === promptAsset.category ? 92 : pick === 'Unknown / Not enough information' ? 65 : 25;
    finishOpfor(score, 'Silhouette Challenge', {
      sustain: ['You practiced category recognition from limited visual information.'],
      improve: ['Use broad category recognition before model-level claims.'],
      retrain: ['Review silhouettes and basic vehicle/aircraft categories.'],
      teachingPoint: 'A silhouette may support category confidence without supporting exact model confidence.',
    }, `opfor-sil-${promptAsset.id}`, pick === 'Unknown / Not enough information' ? 'no-guessing' : 'threat-spotter');
  }

  function submitReport() {
    const prompt = threatReportPrompts[index % threatReportPrompts.length];
    const pick = answers.report;
    const score = pick === prompt.bestReport ? 95 : pick?.includes('possible') || pick?.includes('unknown') ? 72 : 35;
    finishOpfor(score, 'Threat Report Builder', {
      sustain: ['You practiced disciplined report language.'],
      improve: ['Put category, activity, location/time, and confidence in the first sentence.'],
      retrain: ['Review SALUTE-style threat reporting.'],
      teachingPoint: 'Unsupported exact-model guessing is less useful than a clear category report with confidence.',
    }, `opfor-report-${prompt.id}`, pick?.includes('unknown') ? 'no-guessing' : 'threat-spotter');
  }

  function submitMatching() {
    const total = matchingPrompts.length;
    const correct = matchingPrompts.filter(prompt => answers[prompt.id] === prompt.answer).length;
    const score = Math.round((correct / total) * 100);
    finishOpfor(score, 'Matching Board', {
      sustain: ['You matched recognition features to broad categories.'],
      improve: ['Revisit any category that felt like a guess.'],
      retrain: ['Review the Asset Dex by category.'],
      teachingPoint: 'Fast recognition starts with a few reliable category cues.',
    }, 'opfor-matching', 'threat-spotter');
  }

  if (result) {
    return (
      <ScreenWrap>
        <div className="max-w-4xl mx-auto px-4 py-6">
          <ScoreAARPanel
            title={mode === 'flash' ? 'OPFOR Flashcard Mode' : mode === 'silhouette' ? 'Silhouette Challenge' : mode === 'report' ? 'Threat Report Builder' : 'Matching Board'}
            score={result.score}
            xp={result.xp}
            aar={result.aar}
            onRetry={() => resetRound()}
            onBack={() => { setResult(null); setMode('hub'); }}
          />
        </div>
      </ScreenWrap>
    );
  }

  if (mode === 'library') {
    return (
      <ScreenWrap>
        <div className="max-w-6xl mx-auto px-4 py-6">
          <ModuleHeader eyebrow="OPFOR RECOGNITION" title="Asset Dex / Recognition Library" subtitle="Browse public, general recognition cues. Placeholder cards are ready for replacement with properly licensed images." color="red" onBack={() => { setLibraryAsset(null); setMode('hub'); }} />
          {libraryAsset ? (
            <MilCard color="red" className="p-5">
              <div className="grid md:grid-cols-[320px_1fr] gap-5">
                <AssetVisual asset={libraryAsset} />
                <div>
                  <div className="flex gap-2 flex-wrap mb-3">
                    <MilTag color="red">{libraryAsset.faction}</MilTag>
                    <MilTag color="cyan">{libraryAsset.category}</MilTag>
                    <MilTag color="gold">{libraryAsset.difficulty}</MilTag>
                  </div>
                  <h2 className="text-3xl font-black text-slate-100" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{libraryAsset.name}</h2>
                  <p className="text-sm text-slate-400 mt-1">{libraryAsset.country} | {libraryAsset.role}</p>
                  <Divider label="RECOGNITION FEATURES" />
                  <ul className="grid sm:grid-cols-2 gap-2">
                    {libraryAsset.recognitionFeatures.map(feature => <li key={feature} className="success-box my-0">- {feature}</li>)}
                  </ul>
                  <div className="info-box mt-4">{libraryAsset.reportingTip}</div>
                  <div className="text-xs text-slate-500 mt-3">Similar assets: {libraryAsset.similarAssets.join(', ')}</div>
                  {libraryAsset.imageCredit && <div className="text-[10px] text-slate-600 mt-2">Image source: {libraryAsset.imageCredit}</div>}
                  <MilButton color="red" className="mt-4" onClick={() => { setIndex(opforAssets.findIndex(a => a.id === libraryAsset.id)); resetRound('flash'); }}>
                    PRACTICE THIS ASSET
                  </MilButton>
                </div>
              </div>
            </MilCard>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {opforAssets.map(item => <AssetCard key={item.id} asset={item} onClick={() => setLibraryAsset(item)} />)}
            </div>
          )}
        </div>
      </ScreenWrap>
    );
  }

  if (mode === 'flash') {
    const modelOptions = [asset.name, ...asset.similarAssets.slice(0, 2), 'Unknown / Not enough information'];
    return (
      <ScreenWrap>
        <div className="max-w-4xl mx-auto px-4 py-6">
          <ModuleHeader eyebrow="OPFOR RECOGNITION" title="Flashcard Mode" subtitle="Identify category, faction, likely model, and confidence." color="red" onBack={() => setMode('hub')} />
          <MilCard className="p-4 mb-4"><AssetVisual asset={asset} /></MilCard>
          <RecognitionQuestion title="Category" seed={`flash-category:${asset.id}:${index}`} options={categoryPool.filter(item => item === asset.category || ['Main Battle Tank', 'Infantry Fighting Vehicle', 'Air Defense', 'Tactical Truck', 'Unknown / Not enough information'].includes(item)).slice(0, 5)} value={answers.category} onPick={value => setAnswers({ ...answers, category: value })} />
          <RecognitionQuestion title="Faction" seed={`flash-faction:${asset.id}:${index}`} options={['Russian', 'Chinese', 'UAS', 'Unknown']} value={answers.faction} onPick={value => setAnswers({ ...answers, faction: value })} />
          <RecognitionQuestion title="Likely Model" seed={`flash-model:${asset.id}:${index}`} options={modelOptions} value={answers.model} onPick={value => setAnswers({ ...answers, model: value })} />
          <RecognitionQuestion title="Confidence" seed={`flash-confidence:${asset.id}:${index}`} options={['High', 'Medium', 'Low']} value={answers.confidence} onPick={value => setAnswers({ ...answers, confidence: value })} />
          <MilButton color="red" className="w-full mt-4" disabled={Object.keys(answers).length < 4} onClick={submitFlashcard}>SUBMIT RECOGNITION</MilButton>
        </div>
      </ScreenWrap>
    );
  }

  if (mode === 'silhouette') {
    return (
      <ScreenWrap>
        <div className="max-w-4xl mx-auto px-4 py-6">
          <ModuleHeader eyebrow="OPFOR RECOGNITION" title="Silhouette Challenge" subtitle="Limited view. Reward category discipline and appropriate unknown calls." color="red" onBack={() => setMode('hub')} />
          <MilCard className="p-4 mb-4"><AssetVisual asset={promptAsset} silhouette /></MilCard>
          <RecognitionQuestion
            title="What category is best supported?"
            seed={`silhouette:${promptAsset.id}:${index}`}
            options={[promptAsset.category, 'Main Battle Tank', 'Armored Personnel Carrier', 'Air Defense', 'Unknown / Not enough information'].filter((value, itemIndex, arr) => arr.indexOf(value) === itemIndex)}
            value={answers.category}
            onPick={value => setAnswers({ ...answers, category: value })}
          />
          <MilButton color="red" className="w-full mt-4" disabled={!answers.category} onClick={submitSilhouette}>SUBMIT SILHOUETTE CALL</MilButton>
        </div>
      </ScreenWrap>
    );
  }

  if (mode === 'report') {
    const prompt = threatReportPrompts[index % threatReportPrompts.length];
    const options = [
      prompt.bestReport,
      'Exact model confirmed, no uncertainty, hostile intent confirmed.',
      'Possible asset observed; exact model unknown; report category, location, activity, and confidence.',
    ];
    return (
      <ScreenWrap>
        <div className="max-w-4xl mx-auto px-4 py-6">
          <ModuleHeader eyebrow="OPFOR RECOGNITION" title="Threat Report Builder" subtitle="Build a disciplined SALUTE-style report without unsupported guessing." color="red" onBack={() => setMode('hub')} />
          <MilCard className="p-4 mb-4">
            <div className="text-[10px] mono text-slate-500 mb-1">// SCENARIO</div>
            <p className="text-sm text-slate-300">{prompt.scenario}</p>
          </MilCard>
          <RecognitionQuestion title="Pick the best report" seed={`report:${prompt.id}:${index}`} options={options} value={answers.report} onPick={value => setAnswers({ ...answers, report: value })} />
          <MilButton color="red" className="w-full mt-4" disabled={!answers.report} onClick={submitReport}>SUBMIT REPORT</MilButton>
        </div>
      </ScreenWrap>
    );
  }

  if (mode === 'matching') {
    return (
      <ScreenWrap>
        <div className="max-w-4xl mx-auto px-4 py-6">
          <ModuleHeader eyebrow="OPFOR RECOGNITION" title="Matching Board" subtitle="Match recognition clues to broad asset categories." color="red" onBack={() => setMode('hub')} />
          <div className="space-y-3">
            {matchingPrompts.map(prompt => (
              <RecognitionQuestion key={prompt.id} title={prompt.prompt} seed={`match:${prompt.id}`} options={[prompt.answer, 'Main Battle Tank', 'Air Defense', 'Transport Helicopter', 'Small UAS'].filter((value, itemIndex, arr) => arr.indexOf(value) === itemIndex)} value={answers[prompt.id]} onPick={value => setAnswers({ ...answers, [prompt.id]: value })} />
            ))}
          </div>
          <MilButton color="red" className="w-full mt-4" disabled={Object.keys(answers).length < matchingPrompts.length} onClick={submitMatching}>CHECK MATCHES</MilButton>
        </div>
      </ScreenWrap>
    );
  }

  const modes = [
    { id: 'flash', title: 'Flashcard Mode', desc: 'Country/faction, category, model, and confidence.', color: 'red' },
    { id: 'silhouette', title: 'Silhouette Challenge', desc: 'Identify category from limited visual cues.', color: 'orange' },
    { id: 'report', title: 'Threat Report Builder', desc: 'Practice disciplined reporting and confidence language.', color: 'cyan' },
    { id: 'matching', title: 'Matching Board', desc: 'Match feature, role, name, and category.', color: 'green' },
    { id: 'library', title: 'Asset Dex', desc: 'Browse all starter assets and recognition tips.', color: 'gold' },
  ] as const;

  return (
    <ScreenWrap>
      <div className="max-w-6xl mx-auto px-4 py-6">
        <ModuleHeader eyebrow="PUBLIC RECOGNITION TRAINING" title="OPFOR Recognition Trainer" subtitle="Safe, general recognition practice for category, faction, confidence, and disciplined reporting." color="red" />
        <div className="grid md:grid-cols-5 gap-3 mb-5">
          <MilCard className="p-4 md:col-span-2">
            <div className="text-4xl font-black text-red-400 mono">{opforAssets.length}</div>
            <div className="text-xs text-slate-500">Starter asset cards across Russian, Chinese, aircraft, helicopter, ground, and UAS categories.</div>
          </MilCard>
          <MilCard className="p-4 md:col-span-3">
            <div className="text-sm text-slate-300 leading-relaxed">
              Training rule: report what you know, use confidence levels, and do not overclaim exact models from weak evidence.
            </div>
          </MilCard>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {modes.map(item => (
            <MilCard key={item.id} color={item.color} className="p-4">
              <h3 className="text-xl font-black text-slate-100" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{item.title}</h3>
              <p className="text-xs text-slate-500 min-h-10 mt-1">{item.desc}</p>
              <MilButton color={item.color} className="w-full mt-4" onClick={() => resetRound(item.id)}>START</MilButton>
            </MilCard>
          ))}
        </div>
      </div>
    </ScreenWrap>
  );
}

function RecognitionQuestion({
  title,
  options,
  value,
  onPick,
  seed,
}: {
  title: string;
  options: string[];
  value?: string;
  onPick: (value: string) => void;
  seed?: string;
}) {
  const visibleOptions = useMemo(
    () => shuffleWithSeed(options, seed || title),
    [options, seed, title],
  );
  return (
    <MilCard className="p-4 mb-3">
      <div className="text-sm font-semibold text-slate-200 mb-3">{title}</div>
      <div className="grid gap-2">
        {visibleOptions.map(option => (
          <OptionButton key={option} text={option} selected={value === option} onClick={() => onPick(option)} />
        ))}
      </div>
    </MilCard>
  );
}

export function DscaMissionsScreen() {
  const { dispatch } = useGame();
  const { progress, update } = useExpansionStore();
  const [mission, setMission] = useState<DscaMission | null>(null);
  const [step, setStep] = useState(0);
  const [metrics, setMetrics] = useState<MetricMap>({ mission: 75, communication: 75, safety: 75, sustainment: 75, speed: 75, trust: 75, risk: 75 });
  const [result, setResult] = useState<{ score: number; xp: number; aar: TrainingAAR } | null>(null);

  const steps = mission ? [
    ...mission.decisions.map(item => ({ kind: 'decision' as const, title: 'Planning Decision', prompt: item.prompt, options: item.options })),
    ...mission.frictionEvents.map(item => ({ kind: 'friction' as const, title: item.title, prompt: item.text, options: item.options })),
    { kind: 'commander' as const, title: 'Commander Update', prompt: mission.commanderUpdate.prompt, options: mission.commanderUpdate.options },
  ] : [];
  const active = steps[step];

  function startMission(item: DscaMission) {
    setMission(item);
    setStep(0);
    setResult(null);
    setMetrics({ mission: 75, communication: 75, safety: 75, sustainment: 75, speed: 75, trust: 75, risk: 75 });
  }

  function choose(option: ChoiceOption) {
    const nextMetrics = applyEffects(metrics, option.effects || {});
    setMetrics(nextMetrics);
    if (step + 1 >= steps.length && mission) {
      const score = averageMetrics(nextMetrics);
      const aar: TrainingAAR = {
        sustain: ['You completed the mission cycle from brief to commander update.', 'You balanced support to civilians with Soldier safety and reporting.'],
        improve: ['Keep reserves and liaison updates visible in every DSCA plan.', 'Tie every support request to risk, priority, and sustainment impact.'],
        retrain: ['Review DSCA resource allocation, civil support coordination, and BLUF updates.'],
        teachingPoint: mission.aarTeachingPoint,
      };
      const badges = [{ id: 'first-responder', name: 'First Responder', desc: 'Complete one DSCA mission.' }];
      if (mission.id.includes('wildfire') && score >= 80) badges.push({ id: 'wildfire-support-qualified', name: 'Wildfire Support Qualified', desc: 'Score 80%+ on wildfire response.' });
      if (mission.id.includes('flood') && score >= 80) badges.push({ id: 'flood-response-pro', name: 'Flood Response Pro', desc: 'Score 80%+ on flood response.' });
      if (score >= 90) badges.push({ id: 'commanders-confidence', name: "Commander's Confidence", desc: 'Score 90%+ on a commander update mission.' });
      const rewards = addGameRewards(dispatch, mission.id, mission.title, 'dsca', score, mission.difficulty, progress, update, aar, badges);
      setResult({ score, xp: rewards.xp, aar });
    } else {
      setStep(step + 1);
    }
  }

  if (mission && result) {
    return (
      <ScreenWrap>
        <div className="max-w-4xl mx-auto px-4 py-6">
          <ScoreAARPanel title={mission.title} score={result.score} xp={result.xp} aar={result.aar} onRetry={() => startMission(mission)} onBack={() => { setMission(null); setResult(null); }} />
        </div>
      </ScreenWrap>
    );
  }

  if (mission && active) {
    return (
      <ScreenWrap>
        <div className="max-w-5xl mx-auto px-4 py-6">
          <ModuleHeader eyebrow="DSCA MISSION" title={mission.title} subtitle={mission.situation} color="cyan" onBack={() => setMission(null)} />
          <div className="grid lg:grid-cols-[1fr_340px] gap-4">
            <div>
              {step === 0 && (
                <MilCard className="p-4 mb-4">
                  <div className="text-[10px] mono text-slate-500 mb-2">// MISSION BRIEF</div>
                  <p className="text-sm text-slate-300 mb-3">{mission.mission}</p>
                  <p className="text-xs text-cyan-200">{mission.commanderIntent}</p>
                </MilCard>
              )}
              <MilCard color={active.kind === 'friction' ? 'orange' : active.kind === 'commander' ? 'gold' : 'cyan'} className="p-5">
                <MilTag color={active.kind === 'friction' ? 'orange' : active.kind === 'commander' ? 'gold' : 'cyan'}>{active.title}</MilTag>
                <h2 className="text-2xl font-black text-slate-100 mt-3" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{active.prompt}</h2>
                <div className="grid gap-3 mt-4">
                  {shuffleWithSeed(active.options, `dsca:${mission.id}:${step}`).map(option => <ChoiceCard key={option.text} option={option} onChoose={() => choose(option)} />)}
                </div>
              </MilCard>
            </div>
            <div className="space-y-4">
              <MilCard className="p-4">
                <div className="text-[10px] mono text-slate-500 mb-2">// AVAILABLE ASSETS</div>
                {mission.assets.map(asset => <div key={asset} className="text-xs text-slate-400 py-1 border-b border-white/5">{asset}</div>)}
              </MilCard>
              <MilCard className="p-4">
                <div className="text-[10px] mono text-slate-500 mb-2">// LIVE METRICS</div>
                <MetricBars metrics={metrics} />
              </MilCard>
            </div>
          </div>
        </div>
      </ScreenWrap>
    );
  }

  return (
    <ScreenWrap>
      <div className="max-w-6xl mx-auto px-4 py-6">
        <ModuleHeader eyebrow="NATIONAL GUARD DOMESTIC SUPPORT" title="Disaster Response / DSCA Missions" subtitle="Fictional Montana-style domestic support missions focused on logistics, communication, safety, and commander updates." color="cyan" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {dscaMissions.map(item => (
            <MilCard key={item.id} color="cyan" className="p-4">
              <div className="flex justify-between gap-2"><MilTag color="cyan">{item.difficulty}</MilTag><span className="text-[10px] mono text-slate-500">BEST {progress.bestScores[item.id] || 0}%</span></div>
              <h3 className="text-xl font-black text-slate-100 mt-3" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{item.title}</h3>
              <p className="text-xs text-slate-500 min-h-16 mt-1">{item.situation}</p>
              <div className="flex flex-wrap gap-1 mt-3">{item.trainingFocus.map(focus => <MilTag key={focus} color="cyan">{focus}</MilTag>)}</div>
              <MilButton color="cyan" className="w-full mt-4" onClick={() => startMission(item)}>START MISSION</MilButton>
            </MilCard>
          ))}
        </div>
      </div>
    </ScreenWrap>
  );
}

export function ConvoyPlannerScreen() {
  const { dispatch } = useGame();
  const { progress, update } = useExpansionStore();
  const [scenario, setScenario] = useState<ConvoyScenario | null>(null);
  const [phase, setPhase] = useState<'route' | 'plan' | 'execute' | 'aar'>('route');
  const [step, setStep] = useState(0);
  const [planScore, setPlanScore] = useState(0);
  const [execScore, setExecScore] = useState(0);
  const [result, setResult] = useState<{ score: number; xp: number; aar: TrainingAAR } | null>(null);
  const currentPlan = scenario?.planSteps[step];
  const currentFriction = scenario?.friction[step];

  function start(item: ConvoyScenario) {
    setScenario(item);
    setPhase('route');
    setStep(0);
    setPlanScore(0);
    setExecScore(0);
    setResult(null);
  }

  function chooseRoute(best?: boolean) {
    setPlanScore(best ? 15 : 7);
    setPhase('plan');
    setStep(0);
  }

  function choosePlan(option: ChoiceOption) {
    setPlanScore(planScore + (option.points || 0));
    if (!scenario) return;
    if (step + 1 >= scenario.planSteps.length) {
      setPhase('execute');
      setStep(0);
    } else {
      setStep(step + 1);
    }
  }

  function chooseFriction(option: ChoiceOption) {
    const nextExec = execScore + (option.points || 0);
    setExecScore(nextExec);
    if (!scenario) return;
    if (step + 1 >= scenario.friction.length) {
      const score = Math.min(100, Math.round(((planScore + nextExec) / 121) * 100));
      const aar: TrainingAAR = {
        sustain: ['You planned route, recovery, comms, medical, fuel, security, and execution decisions.', 'You saw how plan quality shapes friction options.'],
        improve: ['Brief contingencies in a way every vehicle commander can repeat.', 'Use fuel, recovery, and CCP planning as risk controls, not paperwork.'],
        retrain: ['Review convoy planning inputs and actions on breakdown, route blockage, lost comms, UAS, and casualties.'],
        teachingPoint: scenario.teachingPoint,
      };
      const badges = [{ id: 'convoy-planner', name: 'Convoy Planner', desc: 'Complete one convoy plan.' }];
      if (score >= 90 && scenario.id.includes('class-iii')) badges.push({ id: 'fuel-boss', name: 'Fuel Boss', desc: 'Complete fuel mission with 90%+.' });
      if (planScore >= 75) badges.push({ id: 'recovery-ready', name: 'Recovery Ready', desc: 'Build a strong recovery-ready convoy plan.' });
      const rewards = addGameRewards(dispatch, scenario.id, scenario.title, 'convoy', score, scenario.difficulty, progress, update, aar, badges);
      setResult({ score, xp: rewards.xp, aar });
      setPhase('aar');
    } else {
      setStep(step + 1);
    }
  }

  if (scenario && result) {
    return (
      <ScreenWrap>
        <div className="max-w-4xl mx-auto px-4 py-6">
          <ScoreAARPanel title={scenario.title} score={result.score} xp={result.xp} aar={result.aar} onRetry={() => start(scenario)} onBack={() => { setScenario(null); setResult(null); }} />
        </div>
      </ScreenWrap>
    );
  }

  if (scenario) {
    const risk = planScore >= 70 ? 'Low' : planScore >= 50 ? 'Moderate' : planScore >= 30 ? 'Significant' : 'High';
    return (
      <ScreenWrap>
        <div className="max-w-5xl mx-auto px-4 py-6">
          <ModuleHeader eyebrow="CONVOY PLANNING SIMULATOR" title={scenario.title} subtitle={scenario.mission} color="orange" onBack={() => setScenario(null)} />
          <div className="grid lg:grid-cols-[1fr_320px] gap-4">
            <div>
              {phase === 'route' && (
                <MilCard color="orange" className="p-5">
                  <MilTag color="orange">PLAN BUILDER</MilTag>
                  <h2 className="text-2xl font-black text-slate-100 mt-3" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Select Route</h2>
                  <div className="grid gap-3 mt-4">
                    {shuffleWithSeed(scenario.routes, `convoy-route:${scenario.id}`).map(route => (
                      <button key={route.id} className="mil-card p-4 text-left hover:-translate-y-0.5 transition-transform" onClick={() => chooseRoute(route.best)}>
                        <div className="flex justify-between gap-3"><span className="font-bold text-slate-100">{route.name}</span><MilTag color={route.best ? 'green' : route.risk === 'High' ? 'red' : 'orange'}>{route.risk}</MilTag></div>
                        <div className="text-xs text-slate-500 mt-1">{route.distanceKm} km | {route.travelTimeMinutes} min | {route.notes}</div>
                      </button>
                    ))}
                  </div>
                </MilCard>
              )}
              {phase === 'plan' && currentPlan && (
                <MilCard color="orange" className="p-5">
                  <MilTag color="orange">PLAN STEP {step + 1}/{scenario.planSteps.length}</MilTag>
                  <h2 className="text-2xl font-black text-slate-100 mt-3" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{currentPlan.prompt}</h2>
                  <div className="grid gap-3 mt-4">{shuffleWithSeed(currentPlan.options, `convoy-plan:${scenario.id}:${step}`).map(option => <ChoiceCard key={option.text} option={option} onChoose={() => choosePlan(option)} />)}</div>
                </MilCard>
              )}
              {phase === 'execute' && currentFriction && (
                <MilCard color="red" className="p-5">
                  <MilTag color="red">MISSION EXECUTION</MilTag>
                  <h2 className="text-2xl font-black text-slate-100 mt-3" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{currentFriction.title}</h2>
                  <p className="text-sm text-slate-400 mt-2">{currentFriction.text}</p>
                  <div className="grid gap-3 mt-4">{shuffleWithSeed(currentFriction.options, `convoy-friction:${scenario.id}:${step}`).map(option => <ChoiceCard key={option.text} option={option} onChoose={() => chooseFriction(option)} />)}</div>
                </MilCard>
              )}
            </div>
            <div className="space-y-4">
              <MilCard className="p-4">
                <div className="text-[10px] mono text-slate-500 mb-2">// CONVOY BRIEF</div>
                <div className="text-xs text-slate-400">SP: {scenario.startPoint}</div>
                <div className="text-xs text-slate-400">RP: {scenario.destination}</div>
                <div className="text-xs text-slate-400">RAT: {scenario.requiredArrivalTime}</div>
                <Divider label="CARGO" />
                {scenario.cargo.map(item => <div key={item} className="text-xs text-slate-400 py-1">{item}</div>)}
              </MilCard>
              <MilCard className="p-4">
                <div className="text-[10px] mono text-slate-500 mb-2">// RISK ESTIMATE</div>
                <div className={`text-3xl font-black ${risk === 'Low' ? 'text-emerald-400' : risk === 'Moderate' ? 'text-cyan-400' : risk === 'Significant' ? 'text-orange-400' : 'text-red-400'}`} style={{ fontFamily: 'Rajdhani, sans-serif' }}>{risk}</div>
                <ProgressBar value={planScore} max={95} label={`Plan quality ${planScore}/95`} />
                <ProgressBar value={execScore} max={36} label={`Execution ${execScore}/36`} />
              </MilCard>
            </div>
          </div>
        </div>
      </ScreenWrap>
    );
  }

  return (
    <ScreenWrap>
      <div className="max-w-6xl mx-auto px-4 py-6">
        <ModuleHeader eyebrow="S4 / CSSB PRACTICAL TRAINING" title="Convoy Planning Simulator" subtitle="Build a route, recovery, comms, fuel, medical, and contingency plan, then execute through friction." color="orange" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {convoyScenarios.map(item => (
            <MilCard key={item.id} color="orange" className="p-4">
              <div className="flex justify-between gap-2"><MilTag color="orange">{item.difficulty}</MilTag><span className="text-[10px] mono text-slate-500">BEST {progress.bestScores[item.id] || 0}%</span></div>
              <h3 className="text-xl font-black text-slate-100 mt-3" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{item.title}</h3>
              <p className="text-xs text-slate-500 min-h-14 mt-1">{item.mission}</p>
              <MilButton color="orange" className="w-full mt-4" onClick={() => start(item)}>BUILD PLAN</MilButton>
            </MilCard>
          ))}
        </div>
      </div>
    </ScreenWrap>
  );
}

export function NewSoldierScreen() {
  const { dispatch } = useGame();
  const { progress, update } = useExpansionStore();
  const [lessonId, setLessonId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ score: number; xp: number; aar: TrainingAAR } | null>(null);
  const lesson = newSoldierLessons.find(item => item.id === lessonId) || null;

  function completeLesson() {
    if (!lesson) return;
    const total = lesson.checks.length || 1;
    const correct = lesson.checks.filter((check, index) => answers[String(index)] === check.answer).length;
    const score = Math.round((correct / total) * 100);
    const aar: TrainingAAR = {
      sustain: ['You completed the lesson and answered the quick checks.', 'You practiced practical unit expectations in small pieces.'],
      improve: ['Review any missed item and connect it to what you would do at drill.'],
      retrain: ['Revisit the lesson card and related game module.'],
      teachingPoint: lesson.id === 'new-final'
        ? 'New Soldiers become useful quickly by communicating early, learning the staff rhythm, and helping the section solve real problems.'
        : 'Onboarding works best when short lessons connect directly to field behavior.',
    };
    const badges = [];
    if (lesson.completionBadge) badges.push({ id: lesson.completionBadge.toLowerCase().replace(/[^a-z0-9]+/g, '-'), name: lesson.completionBadge, desc: `Complete ${lesson.title}.` });
    if (lesson.id === 'new-final' && score >= 80) badges.push({ id: 'mission-ready', name: 'Mission Ready', desc: 'Complete the new Soldier onboarding path final check.' });
    const rewards = addGameRewards(dispatch, lesson.id, lesson.title, 'new-soldier', score, 'Easy', progress, update, aar, badges);
    setResult({ score, xp: rewards.xp, aar });
  }

  if (lesson && result) {
    return (
      <ScreenWrap>
        <div className="max-w-4xl mx-auto px-4 py-6">
          <ScoreAARPanel
            title={lesson.title}
            score={result.score}
            xp={result.xp}
            aar={result.aar}
            onRetry={() => { setAnswers({}); setResult(null); }}
            onBack={() => { setLessonId(null); setAnswers({}); setResult(null); }}
          />
        </div>
      </ScreenWrap>
    );
  }

  if (lesson) {
    return (
      <ScreenWrap>
        <div className="max-w-4xl mx-auto px-4 py-6">
          <ModuleHeader eyebrow="NEW SOLDIER ONBOARDING" title={lesson.title} subtitle={lesson.summary} color="purple" onBack={() => setLessonId(null)} />
          <div className="grid gap-3 mb-4">
            {lesson.contentBlocks.map(block => (
              <MilCard key={block.heading} className="p-4">
                <div className="text-lg font-bold text-purple-300" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{block.heading}</div>
                <p className="text-sm text-slate-400 mt-1 leading-relaxed">{block.body}</p>
              </MilCard>
            ))}
          </div>
          <SectionTitle color="purple" sub="Quick checks save your progress and award XP.">INTERACTIVE CHECK</SectionTitle>
          <div className="space-y-3">
            {lesson.checks.map((check, index) => (
              <RecognitionQuestion
                key={`${check.prompt}-${index}`}
                title={check.prompt}
                seed={`new-soldier:${lesson.id}:${index}`}
                options={check.options}
                value={answers[String(index)]}
                onPick={value => setAnswers({ ...answers, [String(index)]: value })}
              />
            ))}
          </div>
          <MilButton color="purple" className="w-full mt-4" disabled={Object.keys(answers).length < lesson.checks.length} onClick={completeLesson}>
            COMPLETE LESSON
          </MilButton>
          {(lesson.id === 'new-warrior' || lesson.id === 'new-convoy-basics') && (
            <div className="grid grid-cols-2 gap-3 mt-3">
              <MilButton color="green" onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'warrior' as any })}>WARRIOR ARCADE</MilButton>
              <MilButton color="orange" onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'convoy' as any })}>CONVOY SIM</MilButton>
            </div>
          )}
        </div>
      </ScreenWrap>
    );
  }

  const pct = completionPercent(progress, newSoldierLessons.map(item => item.id));
  return (
    <ScreenWrap>
      <div className="max-w-6xl mx-auto px-4 py-6">
        <ModuleHeader eyebrow="495 CSSB SOLDIER PATH" title="New Soldier Onboarding Path" subtitle="A practical, interactive path for learning the unit, reports, staff sections, convoy basics, field expectations, and how to be useful at drill." color="purple" />
        <MilCard className="p-4 mb-5">
          <ProgressBar value={pct} max={100} label={`Onboarding completion ${pct}%`} />
        </MilCard>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {newSoldierLessons.map((item, index) => (
            <MilCard key={item.id} color={progress.completions[item.id] ? 'green' : 'purple'} className="p-4">
              <div className="flex justify-between gap-2">
                <MilTag color={progress.completions[item.id] ? 'green' : 'purple'}>{progress.completions[item.id] ? 'COMPLETE' : `LESSON ${index + 1}`}</MilTag>
                <span className="text-[10px] mono text-slate-500">{item.estimatedTime}</span>
              </div>
              <h3 className="text-xl font-black text-slate-100 mt-3" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{item.title}</h3>
              <p className="text-xs text-slate-500 min-h-12 mt-1">{item.summary}</p>
              <MilButton color="purple" className="w-full mt-4" onClick={() => { setLessonId(item.id); setAnswers({}); setResult(null); }}>
                START LESSON
              </MilButton>
            </MilCard>
          ))}
        </div>
      </div>
    </ScreenWrap>
  );
}
