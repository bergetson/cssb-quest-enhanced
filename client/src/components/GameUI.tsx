import { useGame } from '../contexts/GameContext';
import { CHARS, DIFFS } from '../lib/gameData';
import PixelSoldierAvatar from './PixelSoldierAvatar';

// ─── TopBar ───────────────────────────────────────────────────────────────────

export function TopBar() {
  const { state, dispatch } = useGame();
  const diff = DIFFS[state.difficulty];

  return (
    <div className="topbar flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        {state.player ? (
          <button
            onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'avatar' })}
            className="avatar-topbar-button"
            aria-label="Edit avatar"
          >
            <PixelSoldierAvatar avatar={state.avatar} cosmeticId={state.activeCosmeticId} chaos={state.chaosMeter} size="sm" />
          </button>
        ) : (
          <div className="w-9 h-9 rounded-xl border-2 border-yellow-400/60 bg-yellow-400/10 flex items-center justify-center text-yellow-400 font-bold text-sm" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
            495
          </div>
        )}
        <div>
          <div className="text-xs font-bold tracking-widest text-yellow-400/90" style={{ fontFamily: 'Rajdhani, sans-serif' }}>CSSB QUEST</div>
          <div className="text-[10px] text-slate-500 mono">{state.player ? `${state.player.rank} ${state.player.name}` : 'UNASSIGNED'}</div>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap justify-end">
        <span className="stat-pill"><span className="text-yellow-400 font-bold">{state.creds}</span> CR</span>
        <span className="stat-pill"><span className="text-cyan-400 font-bold">LV{state.level}</span></span>
        <span className={`stat-pill ${diff.color === 'red' ? 'border-red-500/40 text-red-400' : diff.color === 'orange' ? 'border-orange-500/40 text-orange-400' : 'border-cyan-500/40 text-cyan-400'}`}>
          {diff.name}
        </span>
        {state.screen !== 'title' && state.screen !== 'register' && (
          <button
            onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'hub' })}
            className="stat-pill border-slate-600/40 hover:border-slate-400/40 transition-colors cursor-pointer"
          >
            HUB
          </button>
        )}
      </div>
    </div>
  );
}

// ─── StatBar ──────────────────────────────────────────────────────────────────

export function StatBar({ label, value, color = 'cyan', max = 100 }: { label: string; value: number; color?: string; max?: number }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const colorMap: Record<string, string> = {
    cyan: 'from-cyan-500 to-cyan-400',
    gold: 'from-yellow-500 to-yellow-400',
    green: 'from-emerald-500 to-emerald-400',
    red: 'from-red-500 to-red-400',
    orange: 'from-orange-500 to-orange-400',
    purple: 'from-purple-500 to-purple-400',
  };
  const glowMap: Record<string, string> = {
    cyan: 'shadow-cyan-500/40',
    gold: 'shadow-yellow-500/40',
    green: 'shadow-emerald-500/40',
    red: 'shadow-red-500/40',
    orange: 'shadow-orange-500/40',
    purple: 'shadow-purple-500/40',
  };
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-slate-500 mono w-16 shrink-0 text-right">{label}</span>
      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden border border-white/5">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${colorMap[color] || colorMap.cyan} shadow-sm ${glowMap[color] || ''} transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="mono text-slate-400 w-7 text-right">{value}</span>
    </div>
  );
}

// ─── NPC Dialog ───────────────────────────────────────────────────────────────

export function NPCDialog({ charId, text, location }: { charId: string; text: string; location?: string }) {
  const char = CHARS[charId] || CHARS.system;
  const colorMap: Record<string, string> = {
    gold: 'border-yellow-400/40 shadow-yellow-400/10',
    cyan: 'border-cyan-400/40 shadow-cyan-400/10',
    green: 'border-emerald-400/40 shadow-emerald-400/10',
    red: 'border-red-400/40 shadow-red-400/10',
    orange: 'border-orange-400/40 shadow-orange-400/10',
    purple: 'border-purple-400/40 shadow-purple-400/10',
    lime: 'border-lime-400/40 shadow-lime-400/10',
    blue: 'border-blue-400/40 shadow-blue-400/10',
  };
  const portraitColor: Record<string, string> = {
    gold: 'border-yellow-400/60 shadow-yellow-400/20',
    cyan: 'border-cyan-400/60 shadow-cyan-400/20',
    green: 'border-emerald-400/60 shadow-emerald-400/20',
    red: 'border-red-400/60 shadow-red-400/20',
    orange: 'border-orange-400/60 shadow-orange-400/20',
    purple: 'border-purple-400/60 shadow-purple-400/20',
    lime: 'border-lime-400/60 shadow-lime-400/20',
    blue: 'border-blue-400/60 shadow-blue-400/20',
  };
  const nameColor: Record<string, string> = {
    gold: 'text-yellow-400',
    cyan: 'text-cyan-400',
    green: 'text-emerald-400',
    red: 'text-red-400',
    orange: 'text-orange-400',
    purple: 'text-purple-400',
    lime: 'text-lime-400',
    blue: 'text-blue-400',
  };

  return (
    <div className="flex gap-3 my-4 animate-fade-in-up">
      <div className={`npc-portrait border-2 ${portraitColor[char.color] || portraitColor.cyan} shadow-md`}>
        {char.emoji}
      </div>
      <div className={`flex-1 border rounded-2xl p-4 bg-white/[0.03] shadow-lg ${colorMap[char.color] || colorMap.cyan}`}>
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-xs font-bold tracking-wide ${nameColor[char.color] || nameColor.cyan}`} style={{ fontFamily: 'Rajdhani, sans-serif' }}>
            {char.name}
          </span>
          <span className="text-[10px] text-slate-600 mono">{char.title}</span>
          {location && <span className="text-[10px] text-slate-600 ml-auto mono">{location}</span>}
        </div>
        <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{text}</p>
      </div>
    </div>
  );
}

// ─── MilCard ──────────────────────────────────────────────────────────────────

export function MilCard({
  children, color = '', className = '', onClick,
}: { children: React.ReactNode; color?: string; className?: string; onClick?: () => void }) {
  const colorClass = color ? `mil-card-${color}` : '';
  return (
    <div
      className={`mil-card ${colorClass} ${className} ${onClick ? 'cursor-pointer hover:-translate-y-0.5 transition-transform' : ''}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

// ─── MilButton ────────────────────────────────────────────────────────────────

export function MilButton({
  children, color = '', onClick, disabled = false, className = '', size = 'md',
}: {
  children: React.ReactNode;
  color?: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const colorClass = color ? `btn-mil-${color}` : '';
  const sizeClass = size === 'sm' ? 'text-xs py-2 px-3' : size === 'lg' ? 'text-base py-4 px-6' : '';
  return (
    <button
      className={`btn-mil ${colorClass} ${sizeClass} ${className} ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

// ─── MilTag ───────────────────────────────────────────────────────────────────

export function MilTag({ children, color = '' }: { children: React.ReactNode; color?: string }) {
  return <span className={`mil-tag ${color ? `mil-tag-${color}` : ''}`}>{children}</span>;
}

// ─── ProgressBar ──────────────────────────────────────────────────────────────

export function ProgressBar({ value, max, label }: { value: number; max: number; label?: string }) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  return (
    <div>
      {label && <div className="text-xs text-slate-500 mono mb-1">{label}</div>}
      <div className="progress-mil">
        <div className="progress-mil-bar" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ─── XP Bar ───────────────────────────────────────────────────────────────────

export function XPBar() {
  const { state } = useGame();
  const { xp, level } = state;
  let levelXp = 0;
  for (let i = 1; i < level; i++) levelXp += i * 200;
  const thisLevelXp = xp - levelXp;
  const nextLevelXp = level * 200;

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-cyan-400 font-bold mono">LV{level}</span>
      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden border border-white/5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-yellow-400 transition-all duration-700"
          style={{ width: `${(thisLevelXp / nextLevelXp) * 100}%` }}
        />
      </div>
      <span className="text-slate-500 mono">{thisLevelXp}/{nextLevelXp}</span>
    </div>
  );
}

// ─── Badge Display ────────────────────────────────────────────────────────────

export function BadgeGrid() {
  const { state } = useGame();
  const badges = Object.values(state.badges);
  if (!badges.length) return (
    <div className="text-center py-8 text-slate-600 text-sm">No badges earned yet. Complete missions to earn badges.</div>
  );
  return (
    <div className="grid grid-cols-2 gap-3">
      {badges.map(b => (
        <div key={b.id} className="mil-card p-3 flex items-start gap-3">
          <div className="hex-badge shrink-0">{b.emoji}</div>
          <div>
            <div className="text-xs font-bold text-yellow-400" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{b.name}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">{b.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Streak Display ───────────────────────────────────────────────────────────

export function StreakBadge() {
  const { state } = useGame();
  if (!state.streak) return null;
  return (
    <div className="flex items-center gap-1.5 text-xs">
      <span className="text-orange-400">🔥</span>
      <span className="text-orange-400 font-bold mono">{state.streak}</span>
      <span className="text-slate-500">streak</span>
    </div>
  );
}

// ─── Grade Badge ──────────────────────────────────────────────────────────────

export function GradeBadge({ grade }: { grade: string }) {
  const map: Record<string, { color: string; bg: string; border: string }> = {
    GOLD:   { color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/40' },
    SILVER: { color: 'text-cyan-400',   bg: 'bg-cyan-400/10',   border: 'border-cyan-400/40' },
    BRONZE: { color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/40' },
    FAILED: { color: 'text-red-400',    bg: 'bg-red-400/10',    border: 'border-red-400/40' },
  };
  const s = map[grade] || map.FAILED;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${s.color} ${s.bg} ${s.border}`} style={{ fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.08em' }}>
      {grade}
    </span>
  );
}

// ─── Screen Wrapper ───────────────────────────────────────────────────────────

export function ScreenWrap({ children, showTopBar = true }: { children: React.ReactNode; showTopBar?: boolean }) {
  return (
    <div className="min-h-screen flex flex-col">
      {showTopBar && <TopBar />}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}

// ─── Section Title ────────────────────────────────────────────────────────────

export function SectionTitle({ children, sub, color = 'gold' }: { children: React.ReactNode; sub?: string; color?: string }) {
  const colorMap: Record<string, string> = {
    gold: 'text-yellow-400 glow-gold',
    cyan: 'text-cyan-400 glow-cyan',
    green: 'text-emerald-400 glow-green',
    red: 'text-red-400 glow-red',
    orange: 'text-orange-400',
    purple: 'text-purple-400',
  };
  return (
    <div className="mb-6">
      <h2 className={`text-2xl font-bold tracking-wide ${colorMap[color] || colorMap.gold}`} style={{ fontFamily: 'Rajdhani, sans-serif' }}>
        {children}
      </h2>
      {sub && <p className="text-sm text-slate-500 mt-1">{sub}</p>}
    </div>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────

export function Divider({ label }: { label?: string }) {
  if (!label) return <div className="border-t border-white/5 my-4" />;
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 border-t border-white/5" />
      <span className="text-[10px] text-slate-600 mono tracking-widest">{label}</span>
      <div className="flex-1 border-t border-white/5" />
    </div>
  );
}
