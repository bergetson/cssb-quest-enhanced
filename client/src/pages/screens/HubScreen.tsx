import { useGame } from '../../contexts/GameContext';
import {
  ScreenWrap, MilCard, MilButton, MilTag, SectionTitle, GradeBadge,
  StatBar, XPBar, StreakBadge, Divider,
} from '../../components/GameUI';
import { DIFFS } from '../../lib/gameData';
import { calculateCampaignScore } from '../../lib/leaderboard';
import { ChaosMeter } from '../../components/ChaosOverlay';
import PixelSoldierAvatar from '../../components/PixelSoldierAvatar';
import {
  BookOpen,
  Calculator,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Gamepad2,
  LockKeyhole,
  NotebookTabs,
  Radar,
  ShieldPlus,
  Siren,
  Store,
  Trophy,
  Truck,
  UserCog,
  UserRoundPlus,
  Users,
  type LucideIcon,
} from 'lucide-react';

const MISSIONS = [
  { id: 'm1',  title: 'MISSION 1',  name: 'WARNO DROP',            sub: 'Receipt of mission, time analysis, initial WARNO',         color: 'cyan',   icon: Radar,        xp: 80,  diff: 'CRAWL' },
  { id: 'm2',  title: 'MISSION 2',  name: 'MISSION ANALYSIS LAB',  sub: 'Facts, assumptions, constraints, running estimate',         color: 'purple', icon: BookOpen,     xp: 100, diff: 'CRAWL' },
  { id: 'm3',  title: 'MISSION 3',  name: 'CLASS I AND WATER',     sub: 'Meals, MRE cases, water gallons, reserve, pallet math',     color: 'green',  icon: Store,        xp: 120, diff: 'WALK'  },
  { id: 'm4',  title: 'MISSION 4',  name: 'FUEL AND CONVOY',       sub: 'Class III, vehicle miles, mixed fleet, convoy cycle time',  color: 'orange', icon: Truck,        xp: 120, diff: 'WALK'  },
  { id: 'm5',  title: 'MISSION 5',  name: 'CLASS V AND DODAC',     sub: 'Ammo by weapon system, rounds, reserve, packaging',        color: 'red',    icon: ShieldPlus,   xp: 140, diff: 'WALK'  },
  { id: 'm6',  title: 'MISSION 6',  name: 'LOGPAC LOADMASTER',     sub: 'Pallets, lift capacity, priority of support, risk',        color: 'cyan',   icon: Truck,        xp: 140, diff: 'RUN'   },
  { id: 'm7',  title: 'MISSION 7',  name: 'PACE AND LOGSTAT',      sub: 'Communication plans, LOGSTAT interpretation, CCIR',        color: 'purple', icon: Radar,        xp: 160, diff: 'RUN'   },
  { id: 'm8',  title: 'MISSION 8',  name: 'COA WARGAME',           sub: 'COA analysis, weighted scoring, friction, recommendations', color: 'gold',   icon: Gamepad2,     xp: 180, diff: 'RUN'   },
  { id: 'm9',  title: 'MISSION 9',  name: 'FRAGORD AND OPORD',     sub: 'Orders production, sustainment annex, update discipline',  color: 'lime',   icon: NotebookTabs, xp: 180, diff: 'HARD'  },
  { id: 'm10', title: 'MISSION 10', name: 'MDMP NIGHTMARE FINAL',  sub: 'Full staff qualification final - no mercy, no hints',      color: 'red',    icon: Siren,        xp: 250, diff: 'HARD'  },
];

const TOOLS = [
  { id: 'warrior',     label: 'WARRIOR TASK ARCADE', color: 'green',  desc: 'MEDEVAC, SALUTE, MARCH, convoy drills & halt security' },
  { id: 'opfor',       label: 'OPFOR RECOGNITION',   color: 'red',    desc: 'Asset flashcards, silhouettes, reports & recognition library' },
  { id: 'dsca',        label: 'DSCA MISSIONS',       color: 'cyan',   desc: 'Wildfire, flood, SAR, shelter, water & road support missions' },
  { id: 'convoy',      label: 'CONVOY PLANNER',      color: 'orange', desc: 'Build convoy plans, brief risk, execute through friction' },
  { id: 'new_soldier', label: 'NEW SOLDIER PATH',    color: 'purple', desc: 'Interactive onboarding for unit basics, staff, reports & field habits' },
  { id: 'avatar',      label: 'AVATAR BUILDER',      color: 'cyan',   desc: 'Customize your 8-bit staff officer and equipped shop cosmetics' },
  { id: 'daily',       label: 'DAILY CHALLENGE',     color: 'gold',   desc: 'New question every day. Bonus XP.' },
  { id: 'store',       label: 'SUPPLY DEPOT',        color: 'orange', desc: 'Spend credits on power-ups & items' },
  { id: 'ref',         label: 'REFERENCE',           color: 'cyan',   desc: 'MDMP, doctrine, classes of supply' },
  { id: 'calc',        label: 'SPO CALCULATOR',      color: 'green',  desc: 'Class I/III/V commodity calculators' },
  { id: 'roles',       label: 'STAFF ROLES',         color: 'purple', desc: 'Staff section quiz & reference' },
  { id: 'minigame',    label: 'MINI GAMES',          color: 'lime',   desc: 'Convoy, trivia, math sprint & more' },
  { id: 'notebook',    label: 'NOTEBOOK',            color: 'cyan',   desc: 'Your AAR notes & teaching points' },
  { id: 'leaderboard', label: 'LEADERBOARD',         color: 'gold',   desc: 'Campaign stats, badges & history' },
];

const TOOL_ICONS: Record<string, LucideIcon> = {
  warrior: ShieldPlus,
  opfor: Radar,
  dsca: Siren,
  convoy: Truck,
  new_soldier: UserRoundPlus,
  avatar: UserCog,
  daily: CalendarDays,
  store: Store,
  ref: BookOpen,
  calc: Calculator,
  roles: Users,
  minigame: Gamepad2,
  notebook: NotebookTabs,
  leaderboard: Trophy,
};

const DIFF_COLORS: Record<string, string> = {
  CRAWL: 'text-emerald-400',
  WALK:  'text-cyan-400',
  RUN:   'text-orange-400',
  HARD:  'text-red-400',
};

export default function HubScreen() {
  const { state, dispatch, getScenario } = useGame();
  const diff = DIFFS[state.difficulty];
  const s = getScenario();
  const completedCount = Object.keys(state.completed).length;
  const totalMissions = MISSIONS.length;
  const overallPct = Math.round((completedCount / totalMissions) * 100);
  const campaignScore = calculateCampaignScore(state);

  function startMission(index: number) {
    dispatch({ type: 'INIT_MISSION', missionIndex: index });
    dispatch({ type: 'SET_SCREEN', screen: 'mission' });
  }

  const today = new Date().toDateString();
  const dailyAvailable = !state.dailyDone || state.dailyDate !== today;

  // Find next unlocked mission
  const nextMissionIdx = MISSIONS.findIndex((m, i) => !state.completed[m.id] && (i === 0 || state.completed[MISSIONS[i - 1].id]));

  const completedMissionCount = Object.keys(state.completed).length;
  const pptBossAvailable = completedMissionCount >= 5 && !state.pptBossDefeated;
  const pptBossDefeated = state.pptBossDefeated;
  const achievementCount = Object.keys(state.achievements).length;

  return (
    <ScreenWrap>
      <div className="max-w-4xl mx-auto px-4 py-6">

        {/* Player Header */}
        <div className="mil-card mil-card-gold player-profile-card p-5 mb-5 animate-fade-in-up relative overflow-hidden">
          {/* Background accent */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: 'repeating-linear-gradient(45deg, oklch(0.78 0.15 85) 0, oklch(0.78 0.15 85) 1px, transparent 0, transparent 50%)',
            backgroundSize: '12px 12px',
          }} />
          <div className="player-profile-layout relative flex items-start justify-between gap-4 flex-wrap">
            <div className="player-profile-main flex items-start gap-4 min-w-0 flex-1">
              <button
                onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'avatar' })}
                className="avatar-hub-button"
                aria-label="Open avatar builder"
              >
                <PixelSoldierAvatar avatar={state.avatar} cosmeticId={state.activeCosmeticId} chaos={state.chaosMeter} size="md" />
              </button>
              <div className="player-profile-copy min-w-0">
              <div className="text-[10px] text-yellow-400/60 mono tracking-[0.2em] mb-1">// SOLDIER PROFILE - {diff.name} MODE</div>
              <h2 className="player-name text-3xl font-black text-yellow-400 tracking-wide glow-gold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                {state.player?.rank} {state.player?.name}
              </h2>
              <div className="text-sm text-slate-400 mb-2">{state.player?.unit}</div>
              <div className="player-meta-row flex items-center gap-3 flex-wrap">
                <StreakBadge />
                <span className="text-xs text-slate-500 mono">{completedCount}/{totalMissions} missions complete</span>
                <span className="text-xs text-yellow-400 mono font-bold">CR {state.creds}</span>
                <span className="text-xs text-cyan-400 mono">LVL {state.level}</span>
                <span className="text-xs text-emerald-400 mono">BOARD {campaignScore.total}</span>
              </div>
              <div className="mt-3">
                <MilButton color="cyan" size="sm" onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'avatar' })}>
                  EDIT AVATAR
                </MilButton>
              </div>
              </div>
            </div>
            <div className="player-profile-stats min-w-[200px]">
              <XPBar />
              <div className="mt-3 grid grid-cols-2 gap-1.5">
                <StatBar label="CMD" value={state.stats.cmd} color="gold" />
                <StatBar label="CLR" value={state.stats.clarity} color="cyan" />
                <StatBar label="RDY" value={state.stats.readiness} color="green" />
                <StatBar label="CHO" value={Math.max(0, 100 - state.stats.chaos)} color="red" />
              </div>
            </div>
          </div>

          {/* Chaos Meter */}
          <div className="mt-3">
            <ChaosMeter value={state.chaosMeter} />
          </div>

          {/* Campaign progress bar */}
          <div className="mt-4 pt-4 border-t border-yellow-400/10">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[10px] mono text-slate-500">CAMPAIGN PROGRESS</span>
              <span className="text-[10px] mono text-yellow-400 font-bold">{overallPct}%</span>
            </div>
            <div className="progress-mil">
              <div className="progress-mil-bar" style={{ width: `${overallPct}%` }} />
            </div>
          </div>
        </div>

        {/* Achievements & PPT Boss Quick Bar */}
        <div className="flex gap-2 mb-3 animate-fade-in-up">
          <button
            onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'achievements' })}
            className="flex-1 mil-card p-3 hover:-translate-y-0.5 transition-transform text-left"
          >
            <div className="flex items-center gap-2">
              <Trophy size={22} className="text-yellow-400" />
              <div>
                <div className="text-xs font-bold text-yellow-400" style={{ fontFamily: 'Rajdhani, sans-serif' }}>ACHIEVEMENTS</div>
                <div className="text-[10px] text-slate-500 mono">{achievementCount} unlocked</div>
              </div>
            </div>
          </button>
          {state.candyCount > 0 && (
            <div className="mil-card p-3 flex items-center gap-2">
              <span className="text-xs font-black text-pink-300 mono">CANDY</span>
              <div>
                <div className="text-xs font-bold text-pink-400" style={{ fontFamily: 'Rajdhani, sans-serif' }}>CANDY</div>
                <div className="text-[10px] text-slate-500 mono">x{state.candyCount}</div>
              </div>
            </div>
          )}
          {pptBossAvailable && (
            <button
              onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'ppt_boss' })}
              className="flex-1 mil-card mil-card-red p-3 hover:-translate-y-0.5 transition-transform text-left animate-pulse-glow"
            >
              <div className="flex items-center gap-2">
                <NotebookTabs size={22} className="text-red-400" />
                <div>
                  <div className="text-xs font-bold text-red-400" style={{ fontFamily: 'Rajdhani, sans-serif' }}>BOSS BATTLE</div>
                  <div className="text-[10px] text-slate-500 mono">CPT PowerPoint awaits</div>
                </div>
              </div>
            </button>
          )}
          {pptBossDefeated && (
            <div className="mil-card p-3 flex items-center gap-2">
              <NotebookTabs size={22} className="text-green-400" />
              <div>
                <div className="text-xs font-bold text-green-400" style={{ fontFamily: 'Rajdhani, sans-serif' }}>PPT DEFEATED</div>
                <div className="text-[10px] text-slate-500 mono">Slides vanquished</div>
              </div>
            </div>
          )}
        </div>

        {/* Scenario Info Bar */}
        <div className="info-box mb-5 animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
          <div className="text-[10px] text-cyan-400/80 mono tracking-[0.2em] mb-2">// ACTIVE SCENARIO: {s.code} - OPERATION {state.challenge}</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <div className="text-slate-600 mono text-[10px] mb-0.5">PERSONNEL</div>
              <div className="text-cyan-300 mono font-bold">{s.personnel}</div>
            </div>
            <div>
              <div className="text-slate-600 mono text-[10px] mb-0.5">DURATION</div>
              <div className="text-cyan-300 mono font-bold">{s.durationDays} days</div>
            </div>
            <div>
              <div className="text-slate-600 mono text-[10px] mb-0.5">H-HOUR</div>
              <div className="text-cyan-300 mono font-bold">{s.hHour}</div>
            </div>
            <div>
              <div className="text-slate-600 mono text-[10px] mb-0.5">ROUTE (OW)</div>
              <div className="text-cyan-300 mono font-bold">{s.oneWay} mi</div>
            </div>
          </div>
        </div>

        {/* Daily Challenge Banner */}
        {dailyAvailable && (
          <div
            className="mil-card mil-card-gold p-4 mb-5 cursor-pointer hover:-translate-y-0.5 transition-transform animate-pulse-glow animate-fade-in-up"
            style={{ animationDelay: '0.1s' }}
            onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'daily' })}
          >
            <div className="flex items-center gap-3">
              <CalendarDays size={30} className="text-yellow-400" />
              <div className="flex-1">
                <div className="text-sm font-bold text-yellow-400" style={{ fontFamily: 'Rajdhani, sans-serif' }}>DAILY CHALLENGE AVAILABLE</div>
                <div className="text-xs text-slate-500">Complete today's challenge for bonus XP and credits</div>
              </div>
              <MilTag color="gold">GO</MilTag>
            </div>
          </div>
        )}

        {/* Campaign Missions */}
        <SectionTitle color="gold" sub={`${diff.name} difficulty - ${completedCount}/${totalMissions} complete`}>
          CAMPAIGN MISSIONS
        </SectionTitle>

        <div className="grid gap-2.5 mb-8">
          {MISSIONS.map((m, i) => {
            const rec = state.missions[m.id];
            const isCompleted = !!state.completed[m.id];
            const isLocked = i > 0 && !state.completed[MISSIONS[i - 1].id];
            const isCurrent = !isCompleted && !isLocked;
            const isNext = i === nextMissionIdx;
            const MissionIcon = m.icon;

            return (
              <div
                key={m.id}
                className={`mil-card p-4 transition-all ${
                  isLocked ? 'opacity-35 cursor-not-allowed' :
                  `hover:-translate-y-0.5 cursor-pointer ${isCurrent ? `mil-card-${m.color}` : ''}`
                }`}
                onClick={() => !isLocked && startMission(i)}
              >
                <div className="flex items-center gap-3">
                  {/* Icon */}
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                    isCompleted ? 'bg-emerald-400/10 border border-emerald-400/30' :
                    isLocked    ? 'bg-slate-800 border border-white/5' :
                    `bg-${m.color}-400/10 border border-${m.color}-400/30`
                  }`}>
                    {isLocked ? (
                      <LockKeyhole size={21} className="text-slate-500" />
                    ) : isCompleted ? (
                      <CheckCircle2 size={22} className="text-emerald-300" />
                    ) : (
                      <MissionIcon size={22} strokeWidth={2.3} />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="text-[10px] text-slate-600 mono">{m.title}</span>
                      <span className={`text-[10px] mono font-bold ${DIFF_COLORS[m.diff] || 'text-slate-500'}`}>{m.diff}</span>
                      {rec && <GradeBadge grade={rec.grade} />}
                      {isNext && !isCompleted && (
                        <span className="mil-tag mil-tag-cyan" style={{ fontSize: '0.6rem' }}>NEXT</span>
                      )}
                    </div>
                    <div className="text-sm font-bold text-slate-200" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                      {m.name}
                    </div>
                    <div className="text-[11px] text-slate-600 mt-0.5 truncate">{m.sub}</div>
                  </div>

                  {/* Score / XP */}
                  <div className="text-right shrink-0">
                    {rec ? (
                      <div className="text-xs mono">
                        <div className={`font-bold ${rec.grade === 'GOLD' ? 'text-yellow-400' : rec.grade === 'SILVER' ? 'text-cyan-400' : rec.grade === 'BRONZE' ? 'text-orange-400' : 'text-red-400'}`}>
                          {rec.score}/{rec.max}
                        </div>
                        <div className="text-slate-600 text-[10px]">{rec.attempts}x played</div>
                      </div>
                    ) : (
                      <div className="text-xs text-yellow-400/70 mono">+{m.xp} XP</div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <Divider label="TOOLS & RESOURCES" />

        {/* Tools Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {TOOLS.map(t => {
            const isDailyDone = t.id === 'daily' && !dailyAvailable;
            const ToolIcon = TOOL_ICONS[t.id] || Gamepad2;
            return (
              <button
                key={t.id}
                onClick={() => dispatch({ type: 'SET_SCREEN', screen: t.id as any })}
                className={`mil-card tool-card p-4 text-left hover:-translate-y-0.5 transition-transform ${isDailyDone ? 'opacity-40' : ''}`}
              >
                <div className={`tool-card-icon tool-card-icon-${t.color}`} aria-hidden="true">
                  <ToolIcon size={22} strokeWidth={2.3} />
                </div>
                <div className={`text-xs font-bold tracking-wide text-${t.color}-400 mb-1`} style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                  {t.label}
                  {t.id === 'daily' && dailyAvailable && (
                    <span className="ml-1 inline-block w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                  )}
                </div>
                <div className="text-[10px] text-slate-600 leading-relaxed">{t.desc}</div>
              </button>
            );
          })}
        </div>

        {/* Inventory */}
        {(state.rayCards > 0 || state.mercyCards > 0 || state.redbull > 0 || state.e4 || state.candyCount > 0 || state.activeCosmeticId) && (
          <div className="mil-card p-4 mb-5">
            <div className="text-[10px] text-orange-400/80 mono tracking-[0.2em] mb-3">// ACTIVE INVENTORY</div>
            <div className="flex flex-wrap gap-2">
              {state.rayCards > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-purple-400/30 bg-purple-400/8">
                  <span className="text-[10px] font-black text-purple-300 mono">RAY</span>
                  <span className="text-xs text-purple-300 mono">Ray Cards x{state.rayCards}</span>
                </div>
              )}
              {state.mercyCards > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cyan-400/30 bg-cyan-400/8">
                  <span className="text-[10px] font-black text-cyan-300 mono">MRC</span>
                  <span className="text-xs text-cyan-300 mono">Mercy x{state.mercyCards}</span>
                </div>
              )}
              {state.redbull > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-400/30 bg-red-400/8">
                  <span className="text-[10px] font-black text-red-300 mono">RB</span>
                  <span className="text-xs text-red-300 mono">Red Bull x{state.redbull}</span>
                </div>
              )}
              {state.e4 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-lime-400/30 bg-lime-400/8">
                  <span className="text-[10px] font-black text-lime-300 mono">E4</span>
                  <span className="text-xs text-lime-300 mono">E4 Mafia Active</span>
                </div>
              )}
              {state.candyCount > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-pink-400/30 bg-pink-400/8">
                  <span className="text-[10px] font-black text-pink-300 mono">CNDY</span>
                  <span className="text-xs text-pink-300 mono">Candy x{state.candyCount}</span>
                </div>
              )}
              {state.activeCosmeticId && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-yellow-400/30 bg-yellow-400/8">
                  <CircleDollarSign size={14} className="text-yellow-300" />
                  <span className="text-xs text-yellow-300 mono">Cosmetic: {state.activeCosmeticId.replace(/_/g, ' ')}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Unlockables */}
        {completedCount >= 5 && (
          <div className="grid grid-cols-2 gap-3 mb-5">
            <MilButton color="gold" className="w-full" onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'certificate' })}>
              CERTIFICATE
            </MilButton>
            {state.secret && (
              <MilButton color="purple" className="w-full" onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'secret' })}>
                SECRET ENDING
              </MilButton>
            )}
          </div>
        )}

        {/* Catchphrase Easter Egg */}
        {completedCount >= 10 && (
          <div className="text-center py-4 mb-4">
            <div className="text-xs text-yellow-400/60 mono italic animate-pulse">
              "The 495 CSSB is the premier CSSB."
            </div>
          </div>
        )}

        {/* Reset */}
        <div className="mt-4 text-center">
          <button
            onClick={() => {
              if (confirm('Reset all progress? This cannot be undone.')) {
                dispatch({ type: 'RESET_GAME' });
              }
            }}
            className="text-xs text-slate-700 mono hover:text-red-500 transition-colors"
          >
            RESET PROGRESS
          </button>
        </div>
      </div>
    </ScreenWrap>
  );
}
