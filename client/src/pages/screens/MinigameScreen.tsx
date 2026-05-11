import { useState, useEffect, useRef, useCallback } from 'react';
import { useGame } from '../../contexts/GameContext';
import { ScreenWrap, SectionTitle, MilCard, MilButton, MilTag } from '../../components/GameUI';
import { toast } from 'sonner';

// ─── Figarelli Tic-Tac-Toe ──────────────────────────────────────────────────
// LTC Figarelli uses unnecessarily large words. Win for 35 CR.

const FIGARELLI_QUOTES = [
  "I must say, your tactical disposition demonstrates a fundamental misapprehension of the stratification of risk.",
  "Fascinating. Your maneuver exhibits a rather precipitous disregard for the operational calculus.",
  "The synergistic confluence of your decisions is... suboptimal.",
  "I've seen more sophisticated decision-making in a BOLC After Action Review.",
  "Your positional paradigm lacks the requisite doctrinal underpinning.",
  "Interesting. A most egregious miscalculation of the operational environment.",
  "The stratification of risk you've undertaken here is, frankly, bewildering.",
  "I would characterize your approach as a manifestation of cognitive dissonance.",
  "Your strategic acumen appears inversely proportional to your confidence.",
  "This is precisely the kind of substandard staff work that necessitates remediation.",
];

const FIGARELLI_WIN_QUOTES = [
  "Checkmate, soldier. The stratification of risk was never in your favor.",
  "A predictable outcome, given your propensity for suboptimal decision-making.",
  "I anticipated this denouement with considerable prescience.",
  "Your defeat is a manifestation of inadequate operational planning.",
];

const FIGARELLI_LOSE_QUOTES = [
  "I... find myself in an unanticipated predicament. Well played.",
  "Extraordinary. You've demonstrated an unprecedented stratification of competence.",
  "I must recalibrate my assessment of your cognitive capabilities.",
  "This outcome was... not within my operational parameters.",
];

function checkWinner(board: string[]): string | null {
  const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  for (const [a,b,c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  return null;
}

function getBestMove(board: string[], player: string): number {
  const opponent = player === 'X' ? 'O' : 'X';
  function minimax(b: string[], isMax: boolean, depth: number): number {
    const w = checkWinner(b);
    if (w === player) return 10 - depth;
    if (w === opponent) return depth - 10;
    if (b.every(Boolean)) return 0;
    const moves = b.map((v, i) => v ? -1 : i).filter(i => i >= 0);
    if (isMax) {
      let best = -Infinity;
      for (const m of moves) { const nb = [...b]; nb[m] = player; best = Math.max(best, minimax(nb, false, depth + 1)); }
      return best;
    } else {
      let best = Infinity;
      for (const m of moves) { const nb = [...b]; nb[m] = opponent; best = Math.min(best, minimax(nb, true, depth + 1)); }
      return best;
    }
  }
  const moves = board.map((v, i) => v ? -1 : i).filter(i => i >= 0);
  let best = -Infinity, bestMove = moves[0];
  for (const m of moves) { const nb = [...board]; nb[m] = 'O'; const s = minimax(nb, false, 0); if (s > best) { best = s; bestMove = m; } }
  return bestMove;
}

function TicTacToe({ onScore }: { onScore: (s: number) => void }) {
  const [board, setBoard] = useState<string[]>(Array(9).fill(''));
  const [turn, setTurn] = useState<'X' | 'O'>('X');
  const [done, setDone] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [scored, setScored] = useState(false);
  const [wins, setWins] = useState(0);
  const [figarelliQuote, setFigarelliQuote] = useState(FIGARELLI_QUOTES[0]);

  function handleClick(i: number) {
    if (board[i] || done || turn !== 'X') return;
    const nb = [...board]; nb[i] = 'X';
    const w = checkWinner(nb);
    if (w || nb.every(Boolean)) {
      setBoard(nb); setWinner(w); setDone(true);
      if (!scored) {
        const pts = w === 'X' ? 35 : 0;
        onScore(pts);
        setScored(true);
        if (w === 'X') setWins(x => x + 1);
        setFigarelliQuote(w === 'X'
          ? FIGARELLI_LOSE_QUOTES[Math.floor(Math.random() * FIGARELLI_LOSE_QUOTES.length)]
          : FIGARELLI_WIN_QUOTES[Math.floor(Math.random() * FIGARELLI_WIN_QUOTES.length)]);
      }
      return;
    }
    // LTC Figarelli (AI) move — he mutters a quote after each move
    const aiMove = getBestMove(nb, 'O');
    nb[aiMove] = 'O';
    setFigarelliQuote(FIGARELLI_QUOTES[Math.floor(Math.random() * FIGARELLI_QUOTES.length)]);
    const w2 = checkWinner(nb);
    setBoard(nb);
    if (w2 || nb.every(Boolean)) {
      setWinner(w2); setDone(true);
      if (!scored) {
        onScore(w2 === 'X' ? 35 : 0); setScored(true);
        setFigarelliQuote(w2 === 'X'
          ? FIGARELLI_LOSE_QUOTES[Math.floor(Math.random() * FIGARELLI_LOSE_QUOTES.length)]
          : FIGARELLI_WIN_QUOTES[Math.floor(Math.random() * FIGARELLI_WIN_QUOTES.length)]);
      }
    } else setTurn('X');
  }

  function reset() { setBoard(Array(9).fill('')); setTurn('X'); setDone(false); setWinner(null); setScored(false); setFigarelliQuote(FIGARELLI_QUOTES[0]); }

  return (
    <div className="animate-fade-in-up">
      {/* Figarelli quote bubble */}
      <div className="mil-card p-3 mb-4 border-yellow-400/20">
        <div className="text-[10px] text-yellow-400 mono font-bold mb-1">🎖️ LTC FIGARELLI SAYS:</div>
        <p className="text-xs text-slate-300 italic">"{figarelliQuote}"</p>
      </div>
      <div className="flex justify-between items-center mb-3">
        <div className="text-xs text-slate-500 mono">Wins vs Figarelli: <span className="text-yellow-400 font-bold">{wins}</span></div>
        <div className="text-xs text-slate-400 mono">
          {done ? (winner === 'X' ? '🏆 WIN! +35 CR' : winner === 'O' ? '❌ FIGARELLI WINS' : '🤝 DRAW') : `Your turn (X)`}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 max-w-[240px] mx-auto mb-4">
        {board.map((cell, i) => (
          <button
            key={i}
            onClick={() => handleClick(i)}
            className={`h-20 rounded-xl border text-3xl font-black transition-all ${
              cell === 'X' ? 'border-cyan-400/60 bg-cyan-400/10 text-cyan-400' :
              cell === 'O' ? 'border-red-400/60 bg-red-400/10 text-red-400' :
              'border-white/10 bg-white/3 hover:border-white/20 hover:bg-white/6'
            }`}
            style={{ fontFamily: 'Rajdhani, sans-serif' }}
          >
            {cell}
          </button>
        ))}
      </div>
      {done && <MilButton color="cyan" className="w-full" onClick={reset}>PLAY AGAIN</MilButton>}
    </div>
  );
}

// ─── Timing Challenge ─────────────────────────────────────────────────────────

function TimingChallenge({ onScore }: { onScore: (s: number) => void }) {
  const [phase, setPhase] = useState<'idle' | 'waiting' | 'go' | 'done'>('idle');
  const [startTime, setStartTime] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [target] = useState(() => 1000 + Math.floor(Math.random() * 2000));
  const [attempts, setAttempts] = useState(0);
  const [best, setBest] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function start() {
    setPhase('waiting');
    const delay = 1500 + Math.random() * 2500;
    timerRef.current = setTimeout(() => { setPhase('go'); setStartTime(Date.now()); }, delay);
  }

  function stop() {
    if (phase === 'waiting') {
      if (timerRef.current) clearTimeout(timerRef.current);
      setPhase('idle');
      toast.error('Too early! Wait for GO.');
      return;
    }
    if (phase !== 'go') return;
    const e = Date.now() - startTime;
    setElapsed(e);
    setPhase('done');
    setAttempts(a => a + 1);
    const diff = Math.abs(e - target);
    const score = Math.max(0, 30 - Math.floor(diff / 40));
    if (!best || diff < Math.abs(best - target)) setBest(e);
    onScore(score);
    toast.info(`${e}ms — target: ${target}ms — diff: ${diff}ms — +${score} pts`);
  }

  return (
    <div className="animate-fade-in-up text-center">
      <div className="text-xs text-slate-500 mono mb-2">Stop as close to <span className="text-yellow-400 font-bold">{target}ms</span> as possible</div>
      <div className="text-xs text-slate-600 mono mb-4">Attempts: {attempts} | Best: {best ? `${best}ms` : '—'}</div>
      <div
        onClick={phase === 'idle' ? start : stop}
        className={`h-32 rounded-2xl border-2 flex items-center justify-center text-xl font-black cursor-pointer transition-all select-none ${
          phase === 'idle' ? 'border-slate-600 bg-slate-800 text-slate-400 hover:border-slate-500' :
          phase === 'waiting' ? 'border-yellow-400/40 bg-yellow-400/5 text-yellow-400 animate-pulse' :
          phase === 'go' ? 'border-emerald-400/60 bg-emerald-400/10 text-emerald-400 animate-pulse' :
          'border-cyan-400/40 bg-cyan-400/5 text-cyan-400'
        }`}
        style={{ fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.1em' }}
      >
        {phase === 'idle' ? 'TAP TO START' :
         phase === 'waiting' ? 'WAIT...' :
         phase === 'go' ? 'STOP!' :
         `${elapsed}ms`}
      </div>
      {phase === 'done' && (
        <div className="mt-3">
          <MilButton color="cyan" className="w-full" onClick={() => setPhase('idle')}>TRY AGAIN</MilButton>
        </div>
      )}
    </div>
  );
}

// ─── Math Sprint ──────────────────────────────────────────────────────────────

function MathSprint({ onScore }: { onScore: (s: number) => void }) {
  const [q, setQ] = useState<{ text: string; answer: number } | null>(null);
  const [input, setInput] = useState('');
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const QUESTIONS = [
    { text: '420 soldiers × 3 meals × 3 days = ?', answer: 3780 },
    { text: '⌈3780 meals ÷ 12⌉ = ? cases', answer: 315 },
    { text: '⌈315 cases × 1.15⌉ = ? cases with 15% reserve', answer: 363 },
    { text: '⌈363 cases ÷ 48⌉ = ? pallets', answer: 8 },
    { text: '250 soldiers × 3 gal × 5 days = ? gallons', answer: 3750 },
    { text: '⌈3750 × 1.15⌉ = ? gallons with 15% reserve', answer: 4313 },
    { text: '3 PLS × 80mi × 2 × 2 trips ÷ 6 mpg = ? gal', answer: 160 },
    { text: '⌈160 × 1.20⌉ = ? gal with 20% reserve', answer: 192 },
    { text: '420 M4 shooters × 40 rounds = ?', answer: 16800 },
    { text: '⌈16800 × 1.10⌉ = ? with 10% reserve', answer: 18480 },
    { text: '80 M249 × 120 linked 5.56 = ?', answer: 9600 },
    { text: '⌈9600 × 1.10⌉ = ? with 10% reserve', answer: 10560 },
    { text: '18 hours available ÷ 3 = ? hours commander keeps', answer: 6 },
    { text: '18 hours × 2/3 = ? hours for subordinates', answer: 12 },
    { text: '500 soldiers × 3 meals × 7 days = ?', answer: 10500 },
    { text: '⌈10500 ÷ 12⌉ = ? MRE cases', answer: 875 },
    { text: '⌈875 × 1.15⌉ = ? cases with reserve', answer: 1007 },
    { text: '⌈1007 ÷ 48⌉ = ? pallets', answer: 21 },
    { text: '2 LMTV × 47mi × 2 ÷ 8 mpg = ? gal', answer: 24 },
    { text: '50 M240 × 150 rounds 7.62 linked = ?', answer: 7500 },
    { text: '30 M320 × 6 rounds 40mm = ?', answer: 180 },
    { text: '⌈7500 × 1.10⌉ = ? 7.62 with reserve', answer: 8250 },
    { text: '4 PLS × 8 pallets = ? capacity', answer: 32 },
    { text: '3 PLS × 8 + 2 LMTV × 2 = ? total capacity', answer: 28 },
    { text: '580 soldiers × 3 × 4 days = ? meals', answer: 6960 },
    { text: '⌈6960 ÷ 12⌉ = ? cases', answer: 580 },
    { text: '⌈580 × 1.15⌉ = ? cases with reserve', answer: 667 },
    { text: '⌈667 ÷ 48⌉ = ? pallets', answer: 14 },
  ];

  function getNextQ() {
    const idx = Math.floor(Math.random() * QUESTIONS.length);
    setQ(QUESTIONS[idx]);
    setInput('');
  }

  function startGame() {
    setStarted(true);
    setDone(false);
    setStreak(0);
    setTotalScore(0);
    setCorrect(0);
    setTimeLeft(60);
    getNextQ();
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current!); setDone(true); return 0; }
        return t - 1;
      });
    }, 1000);
  }

  function handleSubmit() {
    if (!q) return;
    const n = parseInt(input);
    if (n === q.answer) {
      const pts = 5 + streak * 2;
      setStreak(s => s + 1);
      setTotalScore(s => s + pts);
      setCorrect(c => c + 1);
      onScore(pts);
      toast.success(`✓ +${pts} pts (streak ${streak + 1})`);
    } else {
      setStreak(0);
      toast.error(`✗ Answer: ${q.answer.toLocaleString()}`);
    }
    getNextQ();
  }

  useEffect(() => {
    if (done && started) toast.info(`Time's up! ${correct} correct — ${totalScore} pts`);
  }, [done]);

  return (
    <div className="animate-fade-in-up">
      {!started ? (
        <div className="text-center">
          <div className="text-xs text-slate-500 mono mb-4">60 seconds. Solve sustainment math as fast as you can.<br/>Streak multiplier: each consecutive correct answer adds +2 pts.</div>
          <MilButton color="gold" className="w-full" onClick={startGame}>START SPRINT</MilButton>
        </div>
      ) : done ? (
        <div className="text-center">
          <div className="text-5xl mb-3">⏱️</div>
          <div className="text-3xl font-black text-yellow-400 mb-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{totalScore} PTS</div>
          <div className="text-xs text-slate-500 mono mb-4">{correct} questions correct</div>
          <MilButton color="gold" className="w-full" onClick={startGame}>PLAY AGAIN</MilButton>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs text-orange-400 mono font-bold">🔥 {streak}</span>
            <span className={`text-sm font-black mono ${timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-yellow-400'}`}>⏱️ {timeLeft}s</span>
            <span className="text-xs text-cyan-400 mono">{totalScore} pts</span>
          </div>
          <div className="mil-card p-4 mb-3 min-h-[64px] flex items-center">
            <p className="text-sm text-slate-200 font-mono">{q?.text}</p>
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              className="mil-input flex-1"
              placeholder="Answer..."
              autoFocus
            />
            <MilButton color="cyan" onClick={handleSubmit}>→</MilButton>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Convoy Commander ─────────────────────────────────────────────────────────
// Drag-and-drop load planning puzzle. Match cargo to vehicles optimally.

type Cargo = { id: string; name: string; pallets: number; priority: 'critical' | 'high' | 'low'; emoji: string };
type Vehicle = { id: string; name: string; capacity: number; loaded: Cargo[] };

function ConvoyCommander({ onScore }: { onScore: (s: number) => void }) {
  const SCENARIOS = [
    {
      name: 'OPERATION IRON EAGLE',
      vehicles: [
        { id: 'pls1', name: 'PLS-1', capacity: 8, loaded: [] },
        { id: 'pls2', name: 'PLS-2', capacity: 8, loaded: [] },
        { id: 'lmtv1', name: 'LMTV-1', capacity: 2, loaded: [] },
        { id: 'lmtv2', name: 'LMTV-2', capacity: 2, loaded: [] },
      ],
      cargo: [
        { id: 'water', name: 'Water (Class I)', pallets: 6, priority: 'critical' as const, emoji: '💧' },
        { id: 'ammo', name: 'Ammo (Class V)', pallets: 4, priority: 'critical' as const, emoji: '💥' },
        { id: 'mre', name: 'MREs (Class I)', pallets: 4, priority: 'high' as const, emoji: '🍱' },
        { id: 'fuel', name: 'Fuel (Class III)', pallets: 3, priority: 'high' as const, emoji: '⛽' },
        { id: 'parts', name: 'Maint Parts (Class IX)', pallets: 2, priority: 'low' as const, emoji: '🔧' },
        { id: 'batteries', name: 'Batteries (Class II)', pallets: 1, priority: 'low' as const, emoji: '🔋' },
      ],
      totalCapacity: 20,
      totalCargo: 20,
    },
    {
      name: 'OPERATION SWIFT MOOSE',
      vehicles: [
        { id: 'pls1', name: 'PLS-1', capacity: 8, loaded: [] },
        { id: 'pls2', name: 'PLS-2', capacity: 8, loaded: [] },
        { id: 'pls3', name: 'PLS-3', capacity: 8, loaded: [] },
        { id: 'lmtv1', name: 'LMTV-1', capacity: 2, loaded: [] },
      ],
      cargo: [
        { id: 'water', name: 'Water', pallets: 9, priority: 'critical' as const, emoji: '💧' },
        { id: 'ammo', name: 'Ammo', pallets: 6, priority: 'critical' as const, emoji: '💥' },
        { id: 'mre', name: 'MREs', pallets: 5, priority: 'high' as const, emoji: '🍱' },
        { id: 'fuel', name: 'Fuel Cans', pallets: 3, priority: 'high' as const, emoji: '⛽' },
        { id: 'parts', name: 'Parts', pallets: 3, priority: 'low' as const, emoji: '🔧' },
      ],
      totalCapacity: 26,
      totalCargo: 26,
    },
  ];

  const [scenarioIdx] = useState(() => Math.floor(Math.random() * SCENARIOS.length));
  const scenario = SCENARIOS[scenarioIdx];
  const [vehicles, setVehicles] = useState<Vehicle[]>(scenario.vehicles.map(v => ({ ...v, loaded: [] })));
  const [unloaded, setUnloaded] = useState<Cargo[]>(scenario.cargo);
  const [selected, setSelected] = useState<Cargo | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{ score: number; feedback: string } | null>(null);

  function selectCargo(c: Cargo) {
    if (submitted) return;
    setSelected(prev => prev?.id === c.id ? null : c);
  }

  function loadToVehicle(vId: string) {
    if (!selected || submitted) return;
    const v = vehicles.find(v => v.id === vId);
    if (!v) return;
    const usedCap = v.loaded.reduce((s, c) => s + c.pallets, 0);
    if (usedCap + selected.pallets > v.capacity) {
      toast.error(`${v.name} only has ${v.capacity - usedCap} pallets remaining.`);
      return;
    }
    setVehicles(prev => prev.map(veh => veh.id === vId ? { ...veh, loaded: [...veh.loaded, selected!] } : veh));
    setUnloaded(prev => prev.filter(c => c.id !== selected.id));
    setSelected(null);
  }

  function unloadFromVehicle(vId: string, cargoId: string) {
    if (submitted) return;
    const v = vehicles.find(v => v.id === vId);
    const c = v?.loaded.find(c => c.id === cargoId);
    if (!v || !c) return;
    setVehicles(prev => prev.map(veh => veh.id === vId ? { ...veh, loaded: veh.loaded.filter(x => x.id !== cargoId) } : veh));
    setUnloaded(prev => [...prev, c]);
  }

  function evaluate() {
    if (unloaded.length > 0) {
      toast.error('Load all cargo before submitting.');
      return;
    }

    let score = 0;
    const feedback: string[] = [];

    // Check capacity violations
    let overloaded = false;
    for (const v of vehicles) {
      const used = v.loaded.reduce((s, c) => s + c.pallets, 0);
      if (used > v.capacity) { overloaded = true; break; }
    }
    if (overloaded) {
      feedback.push('❌ Capacity violation detected. Vehicles are overloaded.');
      score -= 20;
    } else {
      score += 30;
      feedback.push('✓ No capacity violations.');
    }

    // Check critical cargo is loaded
    const criticalLoaded = scenario.cargo.filter(c => c.priority === 'critical').every(c =>
      vehicles.some(v => v.loaded.some(l => l.id === c.id))
    );
    if (criticalLoaded) { score += 30; feedback.push('✓ All critical cargo loaded.'); }
    else { feedback.push('❌ Critical cargo missing from load plan.'); }

    // Check load balance (no vehicle should be empty while others are full)
    const usages = vehicles.map(v => v.loaded.reduce((s, c) => s + c.pallets, 0) / v.capacity);
    const maxUsage = Math.max(...usages);
    const minUsage = Math.min(...usages);
    if (maxUsage - minUsage < 0.5) { score += 20; feedback.push('✓ Good load balance across vehicles.'); }
    else { feedback.push('⚠️ Load imbalance detected. Distribute cargo more evenly.'); }

    // Bonus: critical cargo on larger vehicles
    const critOnLarge = vehicles.filter(v => v.capacity >= 8).every(v =>
      v.loaded.some(c => c.priority === 'critical')
    );
    if (critOnLarge) { score += 20; feedback.push('✓ Critical cargo prioritized on high-capacity vehicles.'); }

    score = Math.max(0, Math.min(100, score));
    setResult({ score, feedback: feedback.join('\n') });
    setSubmitted(true);
    onScore(score);
    if (score >= 80) toast.success(`Excellent load plan! +${score} CR`);
    else if (score >= 50) toast.info(`Acceptable plan. +${score} CR`);
    else toast.error(`Poor load plan. +${score} CR`);
  }

  function reset() {
    setVehicles(scenario.vehicles.map(v => ({ ...v, loaded: [] })));
    setUnloaded(scenario.cargo);
    setSelected(null);
    setSubmitted(false);
    setResult(null);
  }

  const priorityColor = (p: string) => p === 'critical' ? 'text-red-400' : p === 'high' ? 'text-orange-400' : 'text-slate-400';

  return (
    <div className="animate-fade-in-up">
      <div className="text-xs text-slate-500 mono mb-1">{scenario.name}</div>
      <div className="text-xs text-slate-600 mono mb-4">
        Select cargo → tap a vehicle to load. Tap loaded cargo to unload. Prioritize critical cargo.
      </div>

      {/* Unloaded Cargo */}
      <div className="mb-4">
        <div className="text-xs text-slate-500 mono mb-2">CARGO YARD ({unloaded.length} items)</div>
        <div className="flex flex-wrap gap-2">
          {unloaded.map(c => (
            <button
              key={c.id}
              onClick={() => selectCargo(c)}
              className={`px-3 py-2 rounded-lg border text-xs transition-all ${
                selected?.id === c.id
                  ? 'border-yellow-400/70 bg-yellow-400/15 text-yellow-300'
                  : 'border-white/10 bg-white/3 hover:border-white/20'
              }`}
            >
              <span className="mr-1">{c.emoji}</span>
              <span className={priorityColor(c.priority)}>{c.name}</span>
              <span className="text-slate-500 ml-1">({c.pallets}p)</span>
            </button>
          ))}
          {unloaded.length === 0 && <div className="text-xs text-emerald-400 mono">All cargo loaded ✓</div>}
        </div>
      </div>

      {/* Vehicles */}
      <div className="grid gap-2 mb-4">
        {vehicles.map(v => {
          const used = v.loaded.reduce((s, c) => s + c.pallets, 0);
          const pct = used / v.capacity;
          return (
            <div
              key={v.id}
              onClick={() => loadToVehicle(v.id)}
              className={`p-3 rounded-xl border transition-all cursor-pointer ${
                selected ? 'border-cyan-400/40 bg-cyan-400/5 hover:border-cyan-400/70' : 'border-white/10 bg-white/2'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold mono text-slate-300">🚛 {v.name}</span>
                <span className={`text-xs mono ${pct >= 1 ? 'text-red-400' : pct >= 0.8 ? 'text-orange-400' : 'text-slate-500'}`}>
                  {used}/{v.capacity} pallets
                </span>
              </div>
              <div className="progress-mil mb-2">
                <div
                  className="progress-mil-bar"
                  style={{
                    width: `${Math.min(100, pct * 100)}%`,
                    background: pct >= 1 ? 'oklch(0.62 0.22 25)' : pct >= 0.8 ? 'oklch(0.72 0.18 55)' : undefined,
                  }}
                />
              </div>
              <div className="flex flex-wrap gap-1">
                {v.loaded.map(c => (
                  <button
                    key={c.id}
                    onClick={e => { e.stopPropagation(); unloadFromVehicle(v.id, c.id); }}
                    className="px-2 py-0.5 rounded text-[10px] border border-white/10 bg-white/5 hover:border-red-400/40 hover:bg-red-400/5 transition-all"
                  >
                    {c.emoji} {c.pallets}p ✕
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {!submitted ? (
        <MilButton color="gold" className="w-full" onClick={evaluate}>SUBMIT LOAD PLAN</MilButton>
      ) : result && (
        <div className="animate-fade-in-up">
          <div className={`p-4 rounded-xl border mb-3 ${result.score >= 80 ? 'border-emerald-400/40 bg-emerald-400/8' : result.score >= 50 ? 'border-orange-400/40 bg-orange-400/8' : 'border-red-400/40 bg-red-400/8'}`}>
            <div className="text-2xl font-black mb-2" style={{ fontFamily: 'Rajdhani, sans-serif', color: result.score >= 80 ? 'oklch(0.68 0.18 160)' : result.score >= 50 ? 'oklch(0.72 0.18 55)' : 'oklch(0.62 0.22 25)' }}>
              {result.score}/100 POINTS
            </div>
            <pre className="text-xs mono text-slate-400 whitespace-pre-wrap">{result.feedback}</pre>
          </div>
          <MilButton color="cyan" className="w-full" onClick={reset}>TRY AGAIN</MilButton>
        </div>
      )}
    </div>
  );
}

// ─── Staff Trivia Blitz ───────────────────────────────────────────────────────

const TRIVIA_QUESTIONS = [
  { q: 'What paragraph of an OPORD contains the sustainment plan?', a: '4', choices: ['2', '3', '4', '5'] },
  { q: 'PACE stands for Primary, Alternate, __, Emergency.', a: 'Contingency', choices: ['Communications', 'Contingency', 'Command', 'Control'] },
  { q: 'Standard fuel reserve percentage?', a: '20%', choices: ['10%', '15%', '20%', '25%'] },
  { q: 'Standard water reserve percentage?', a: '15%', choices: ['10%', '15%', '20%', '25%'] },
  { q: 'Standard ammo reserve percentage?', a: '10%', choices: ['5%', '10%', '15%', '20%'] },
  { q: 'How many meals per case of MREs?', a: '12', choices: ['6', '12', '18', '24'] },
  { q: 'How many MRE cases per pallet?', a: '48', choices: ['24', '36', '48', '60'] },
  { q: 'PLS standard pallet capacity?', a: '8', choices: ['4', '6', '8', '10'] },
  { q: 'LMTV standard pallet capacity?', a: '2', choices: ['1', '2', '3', '4'] },
  { q: 'METT-TC: what does the C stand for?', a: 'Civil Considerations', choices: ['Command', 'Communications', 'Civil Considerations', 'Coordination'] },
  { q: 'The 1/3 - 2/3 rule: subordinates receive what fraction?', a: '2/3', choices: ['1/3', '1/2', '2/3', '3/4'] },
  { q: 'Which staff section owns IPB?', a: 'S2', choices: ['S1', 'S2', 'S3', 'S4'] },
  { q: 'Which staff section owns the PERSTAT?', a: 'S1', choices: ['S1', 'S2', 'S3', 'S4'] },
  { q: 'COA criteria: which is NOT one of the five?', a: 'Optimal', choices: ['Suitable', 'Feasible', 'Optimal', 'Distinguishable'] },
  { q: 'Standard water rate per soldier per day?', a: '3 gallons', choices: ['1 gallon', '2 gallons', '3 gallons', '5 gallons'] },
  { q: 'Standard meals per soldier per day?', a: '3', choices: ['2', '3', '4', '5'] },
  { q: 'CCIR includes PIR and what?', a: 'FFIR', choices: ['LOGSTAT', 'FFIR', 'PERSTAT', 'SITREP'] },
  { q: 'A WARNO should be issued when?', a: 'Immediately upon receipt of mission', choices: ['After OPORD is complete', 'After mission analysis', 'Immediately upon receipt of mission', 'After commander approves COA'] },
  { q: 'PLS MPG (standard planning rate)?', a: '6', choices: ['4', '6', '8', '10'] },
  { q: 'HMMWV MPG (standard planning rate)?', a: '12', choices: ['8', '10', '12', '15'] },
];

function StaffTriviaBlitz({ onScore }: { onScore: (s: number) => void }) {
  const [qIdx, setQIdx] = useState(0);
  const [shuffled] = useState(() => [...TRIVIA_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 10));
  const [answered, setAnswered] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [started, setStarted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const q = shuffled[qIdx];
  const shuffledChoices = useRef<string[]>([]);

  useEffect(() => {
    if (started && !done) {
      shuffledChoices.current = [...q.choices].sort(() => Math.random() - 0.5);
      setTimeLeft(15);
      setAnswered(null);
    }
  }, [qIdx, started]);

  useEffect(() => {
    if (!started || done) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          if (answered === null) {
            toast.error('Time out!');
            setTimeout(() => advance(), 800);
          }
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [qIdx, started, done]);

  function start() {
    setStarted(true);
    shuffledChoices.current = [...shuffled[0].choices].sort(() => Math.random() - 0.5);
  }

  function handleAnswer(choice: string) {
    if (answered !== null) return;
    clearInterval(timerRef.current!);
    const idx = shuffledChoices.current.indexOf(choice);
    setAnswered(idx);
    const correct = choice === q.a;
    const pts = correct ? Math.max(5, timeLeft * 2) : 0;
    if (correct) { setScore(s => s + pts); onScore(pts); toast.success(`✓ +${pts} pts`); }
    else toast.error(`✗ Correct: ${q.a}`);
    setTimeout(() => advance(), 1200);
  }

  function advance() {
    if (qIdx + 1 >= shuffled.length) { setDone(true); }
    else { setQIdx(i => i + 1); }
  }

  if (!started) return (
    <div className="text-center">
      <div className="text-xs text-slate-500 mono mb-4">10 questions. 15 seconds each. Faster answers = more points.</div>
      <MilButton color="purple" className="w-full" onClick={start}>START BLITZ</MilButton>
    </div>
  );

  if (done) return (
    <div className="text-center animate-fade-in-up">
      <div className="text-5xl mb-3">🧠</div>
      <div className="text-3xl font-black text-purple-400 mb-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{score} PTS</div>
      <div className="text-xs text-slate-500 mono mb-4">Staff Trivia Blitz complete</div>
      <MilButton color="purple" className="w-full" onClick={() => { setQIdx(0); setScore(0); setDone(false); setStarted(false); setAnswered(null); }}>PLAY AGAIN</MilButton>
    </div>
  );

  return (
    <div className="animate-fade-in-up">
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs mono text-slate-500">Q {qIdx + 1}/10</span>
        <span className={`text-sm font-black mono ${timeLeft <= 5 ? 'text-red-400 animate-pulse' : 'text-yellow-400'}`}>⏱️ {timeLeft}s</span>
        <span className="text-xs mono text-purple-400">{score} pts</span>
      </div>
      <div className="progress-mil mb-4">
        <div className="progress-mil-bar" style={{ width: `${((qIdx) / shuffled.length) * 100}%`, background: 'oklch(0.68 0.18 290)' }} />
      </div>
      <div className="mil-card p-4 mb-4 min-h-[72px] flex items-center">
        <p className="text-sm text-slate-200">{q.q}</p>
      </div>
      <div className="grid gap-2">
        {shuffledChoices.current.map((choice, i) => {
          const isSelected = answered === i;
          const isCorrect = choice === q.a;
          return (
            <button
              key={i}
              onClick={() => handleAnswer(choice)}
              disabled={answered !== null}
              className={`choice-btn text-left ${
                answered !== null
                  ? isCorrect ? 'correct' : isSelected ? 'wrong' : 'opacity-40'
                  : ''
              }`}
            >
              <span className="text-xs text-slate-500 mono mr-2">{String.fromCharCode(65 + i)}.</span>
              {choice}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Bash Resource Battle ───────────────────────────────────────────────────────
// SSG Bash, the supply sergeant, quotes historic generals.
// Alternate turns allocating logistics resources. Outmaneuver Bash to win.

const BASH_QUOTES = [
  { quote: "'No plan survives first contact with the enemy.' — Moltke the Elder", action: "Bash seizes the fuel point!" },
  { quote: "'An army marches on its stomach.' — Napoleon Bonaparte", action: "Bash stockpiles Class I!" },
  { quote: "'Amateurs talk strategy. Professionals talk logistics.' — Omar Bradley", action: "Bash secures the ammo ASP!" },
  { quote: "'The line between disorder and order lies in logistics.' — Sun Tzu", action: "Bash controls the MSR!" },
  { quote: "'In war, the moral is to the physical as three is to one.' — Napoleon", action: "Bash rallies his supply chain!" },
  { quote: "'Speed is the essence of war.' — Sun Tzu", action: "Bash fast-tracks a requisition!" },
  { quote: "'The more you sweat in peace, the less you bleed in war.' — Patton", action: "Bash pre-positions reserves!" },
  { quote: "'Logistics is the ball and chain of armored warfare.' — Rommel", action: "Bash denies your Class III!" },
  { quote: "'Give me enough medals and I will win you any war.' — Napoleon", action: "Bash motivates his team!" },
  { quote: "'In preparing for battle, I have always found that plans are useless, but planning is indispensable.' — Eisenhower", action: "Bash revises his LOGSTAT!" },
];

type ResourceType = 'fuel' | 'ammo' | 'food' | 'water' | 'parts';
type ResourceNode = { id: string; type: ResourceType; name: string; emoji: string; value: number; owner: 'player' | 'bash' | null };

function BashResourceBattle({ onScore, onBashDefeated }: { onScore: (s: number) => void; onBashDefeated?: () => void }) {
  const INITIAL_NODES: ResourceNode[] = [
    { id: 'n1', type: 'fuel',  name: 'Fuel Point Alpha',   emoji: '⛽', value: 30, owner: null },
    { id: 'n2', type: 'ammo',  name: 'ASP Bravo',          emoji: '💥', value: 25, owner: null },
    { id: 'n3', type: 'food',  name: 'Class I Site Charlie', emoji: '🍱', value: 20, owner: null },
    { id: 'n4', type: 'water', name: 'Water Point Delta',  emoji: '💧', value: 20, owner: null },
    { id: 'n5', type: 'parts', name: 'Parts Depot Echo',   emoji: '🔧', value: 15, owner: null },
    { id: 'n6', type: 'fuel',  name: 'Fuel Point Foxtrot', emoji: '⛽', value: 25, owner: null },
    { id: 'n7', type: 'ammo',  name: 'ASP Golf',           emoji: '💥', value: 20, owner: null },
    { id: 'n8', type: 'food',  name: 'Class I Site Hotel', emoji: '🍱', value: 15, owner: null },
    { id: 'n9', type: 'water', name: 'Water Point India',  emoji: '💧', value: 15, owner: null },
  ];

  const [nodes, setNodes] = useState<ResourceNode[]>(INITIAL_NODES);
  const [turn, setTurn] = useState<'player' | 'bash'>('player');
  const [turnsLeft, setTurnsLeft] = useState(9);
  const [bashQuote, setBashQuote] = useState(BASH_QUOTES[0]);
  const [log, setLog] = useState<string[]>(['Game started. Claim resource nodes before SSG Bash does!']);
  const [done, setDone] = useState(false);
  const [result, setResult] = useState<{ playerScore: number; bashScore: number; won: boolean } | null>(null);
  const bashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function addLog(msg: string) {
    setLog(prev => [msg, ...prev].slice(0, 8));
  }

  function claimNode(nodeId: string) {
    if (turn !== 'player' || done) return;
    const node = nodes.find(n => n.id === nodeId);
    if (!node || node.owner !== null) return;

    setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, owner: 'player' } : n));
    addLog(`✅ You secured ${node.name} (+${node.value} pts)`);
    setTurn('bash');
    setTurnsLeft(t => t - 1);
  }

  // Bash AI turn
  useEffect(() => {
    if (turn !== 'bash' || done) return;
    const q = BASH_QUOTES[Math.floor(Math.random() * BASH_QUOTES.length)];
    setBashQuote(q);

    bashTimerRef.current = setTimeout(() => {
      setNodes(prev => {
        const unclaimed = prev.filter(n => n.owner === null);
        if (unclaimed.length === 0) return prev;
        // Bash prioritizes high-value nodes
        const sorted = [...unclaimed].sort((a, b) => b.value - a.value);
        const target = sorted[0];
        addLog(`📦 Bash: "${q.quote.split('—')[0].trim()}" — ${q.action}`);
        return prev.map(n => n.id === target.id ? { ...n, owner: 'bash' } : n);
      });
      setTurn('player');
    }, 1200);

    return () => { if (bashTimerRef.current) clearTimeout(bashTimerRef.current); };
  }, [turn, done]);

  // Check end condition
  useEffect(() => {
    const unclaimed = nodes.filter(n => n.owner === null);
    if (unclaimed.length === 0 && turnsLeft <= 0) {
      endGame();
    } else if (turnsLeft <= 0 && nodes.filter(n => n.owner === null).length === 0) {
      endGame();
    }
  }, [nodes, turnsLeft]);

  function endGame() {
    if (done) return;
    setDone(true);
    const playerScore = nodes.filter(n => n.owner === 'player').reduce((s, n) => s + n.value, 0);
    const bashScore = nodes.filter(n => n.owner === 'bash').reduce((s, n) => s + n.value, 0);
    const won = playerScore > bashScore;
    setResult({ playerScore, bashScore, won });
    const pts = won ? 60 : 15;
    onScore(pts);
    if (won && onBashDefeated) onBashDefeated();
  }

  function reset() {
    setNodes(INITIAL_NODES);
    setTurn('player');
    setTurnsLeft(9);
    setBashQuote(BASH_QUOTES[0]);
    setLog(['Game started. Claim resource nodes before SSG Bash does!']);
    setDone(false);
    setResult(null);
  }

  const playerScore = nodes.filter(n => n.owner === 'player').reduce((s, n) => s + n.value, 0);
  const bashScore = nodes.filter(n => n.owner === 'bash').reduce((s, n) => s + n.value, 0);
  const totalValue = nodes.reduce((s, n) => s + n.value, 0);

  return (
    <div className="animate-fade-in-up">
      {/* Bash quote */}
      <div className="mil-card p-3 mb-4 border-orange-400/20">
        <div className="text-[10px] text-orange-400 mono font-bold mb-1">📦 SSG BASH SAYS:</div>
        <p className="text-xs text-slate-300 italic">"{bashQuote.quote}"</p>
      </div>

      {/* Score bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs mono mb-1">
          <span className="text-cyan-400 font-bold">YOU: {playerScore}</span>
          <span className="text-slate-500">Total: {totalValue}</span>
          <span className="text-red-400 font-bold">BASH: {bashScore}</span>
        </div>
        <div className="h-2 rounded-full bg-white/5 overflow-hidden flex">
          <div className="h-full bg-cyan-500 transition-all" style={{ width: `${(playerScore / totalValue) * 100}%` }} />
          <div className="h-full bg-red-500 transition-all" style={{ width: `${(bashScore / totalValue) * 100}%` }} />
        </div>
      </div>

      {/* Turn indicator */}
      {!done && (
        <div className={`text-center text-xs font-bold mono mb-4 py-2 rounded-lg ${
          turn === 'player' ? 'bg-cyan-400/10 text-cyan-400' : 'bg-orange-400/10 text-orange-400 animate-pulse'
        }`}>
          {turn === 'player' ? '→ YOUR TURN — Claim a resource node' : '⏳ SSG Bash is planning his move...'}
        </div>
      )}

      {/* Resource nodes grid */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {nodes.map(node => (
          <button
            key={node.id}
            onClick={() => claimNode(node.id)}
            disabled={node.owner !== null || turn !== 'player' || done}
            className={`p-2 rounded-xl border text-center transition-all ${
              node.owner === 'player' ? 'border-cyan-400/60 bg-cyan-400/10 cursor-default' :
              node.owner === 'bash' ? 'border-red-400/60 bg-red-400/10 cursor-default' :
              turn === 'player' ? 'border-white/15 bg-white/3 hover:border-yellow-400/50 hover:bg-yellow-400/5 cursor-pointer' :
              'border-white/8 bg-white/2 cursor-not-allowed opacity-60'
            }`}
          >
            <div className="text-xl mb-0.5">{node.emoji}</div>
            <div className="text-[9px] mono leading-tight text-slate-400">{node.name.split(' ').slice(-1)[0]}</div>
            <div className={`text-xs font-black ${
              node.owner === 'player' ? 'text-cyan-400' :
              node.owner === 'bash' ? 'text-red-400' : 'text-yellow-400'
            }`} style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              {node.owner === 'player' ? '✔ YOURS' : node.owner === 'bash' ? '✖ BASH' : `+${node.value}`}
            </div>
          </button>
        ))}
      </div>

      {/* Log */}
      <div className="mil-card p-3 mb-4 max-h-24 overflow-y-auto">
        {log.map((entry, i) => (
          <div key={i} className="text-[10px] mono text-slate-500 leading-relaxed">{entry}</div>
        ))}
      </div>

      {done && result && (
        <div className={`p-4 rounded-xl border mb-3 ${
          result.won ? 'border-emerald-400/40 bg-emerald-400/8' : 'border-red-400/40 bg-red-400/8'
        }`}>
          <div className="text-xl font-black mb-1" style={{ fontFamily: 'Rajdhani, sans-serif', color: result.won ? 'oklch(0.68 0.18 160)' : 'oklch(0.62 0.22 25)' }}>
            {result.won ? '🏆 VICTORY! You beat Bash at chess!' : '📦 BASH WINS'}
          </div>
          <div className="text-xs mono text-slate-400">
            Your score: {result.playerScore} | Bash: {result.bashScore}
          </div>
          {result.won && (
            <div className="text-xs text-emerald-400 mt-1">
              🏆 Achievement unlocked: "Beating Bash at Chess"
            </div>
          )}
          {!result.won && (
            <div className="text-xs text-slate-500 italic mt-1">
              Bash mutters: "{BASH_QUOTES[Math.floor(Math.random() * BASH_QUOTES.length)].quote}"
            </div>
          )}
        </div>
      )}

      {done && <MilButton color="cyan" className="w-full" onClick={reset}>PLAY AGAIN</MilButton>}
    </div>
  );
}

// ─── Main Minigame Screen ─────────────────────────────────────────────────────────────

const GAMES = [
  { id: 'convoy', name: 'CONVOY COMMANDER', emoji: '🚛', desc: 'Load the LOGPAC. Prioritize critical cargo. No overloading.', color: 'orange', difficulty: 'MEDIUM' },
  { id: 'trivia', name: 'STAFF TRIVIA BLITZ', emoji: '🧠', desc: '10 questions. 15 seconds each. Speed bonus applies.', color: 'purple', difficulty: 'HARD' },
  { id: 'math', name: 'MATH SPRINT', emoji: '🧮', desc: '60-second sustainment math blitz. Streak multiplier.', color: 'green', difficulty: 'HARD' },
  { id: 'ttt', name: 'TIC-TAC-TOE vs FIGARELLI', emoji: '⭕', desc: 'Beat LTC Figarelli. He will use unnecessarily large words.', color: 'cyan', difficulty: 'EASY' },
  { id: 'timing', name: 'TIMING CHALLENGE', emoji: '⏱️', desc: 'Stop the timer at the exact target time.', color: 'gold', difficulty: 'MEDIUM' },
  { id: 'bash', name: 'BASH RESOURCE BATTLE', emoji: '♟️', desc: 'Outmaneuver SSG Bash. He quotes historic generals. Win for 60 CR.', color: 'orange', difficulty: 'MEDIUM' },
] as const;

type GameId = typeof GAMES[number]['id'];

export default function MinigameScreen() {
  const { dispatch } = useGame();
  const [active, setActive] = useState<GameId | null>(null);
  const [totalEarned, setTotalEarned] = useState(0);

  function handleScore(s: number) {
    if (s > 0) {
      dispatch({ type: 'ADD_CREDS', amount: s });
      dispatch({ type: 'ADD_XP', amount: Math.ceil(s / 2) });
      setTotalEarned(t => t + s);
    }
  }

  function handleBashDefeated() {
    dispatch({ type: 'BASH_DEFEATED' });
    dispatch({ type: 'ADD_ACHIEVEMENT', achievement: {
      id: 'beat_bash',
      name: 'Beating Bash at Chess',
      desc: 'Outmaneuvered SSG Bash in the Resource Battle. He quoted Patton. You won anyway.',
      emoji: '♟️',
      earnedAt: Date.now(),
    }});
    toast.success('🏆 Achievement unlocked: Beating Bash at Chess!');
  }

  const diffColor = (d: string) => d === 'EASY' ? 'text-emerald-400' : d === 'MEDIUM' ? 'text-orange-400' : 'text-red-400';

  return (
    <ScreenWrap>
      <div className="max-w-xl mx-auto px-4 py-6">
        <button onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'hub' })} className="text-xs text-slate-500 mono mb-4 hover:text-slate-300 transition-colors">
          ← HUB
        </button>

        <div className="flex items-center justify-between mb-6">
          <SectionTitle color="lime">MINI GAMES</SectionTitle>
          {totalEarned > 0 && <div className="text-xs text-yellow-400 mono font-bold">+{totalEarned} CR earned this session</div>}
        </div>

        {!active ? (
          <div className="grid gap-3">
            {GAMES.map(g => (
              <div
                key={g.id}
                className="mil-card p-4 cursor-pointer hover:-translate-y-0.5 transition-transform"
                onClick={() => setActive(g.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="text-3xl">{g.emoji}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <div className={`text-sm font-bold text-${g.color}-400`} style={{ fontFamily: 'Rajdhani, sans-serif' }}>{g.name}</div>
                      <span className={`text-[10px] mono font-bold ${diffColor(g.difficulty)}`}>{g.difficulty}</span>
                    </div>
                    <div className="text-xs text-slate-500">{g.desc}</div>
                  </div>
                  <MilTag color={g.color}>PLAY</MilTag>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div>
            <button onClick={() => setActive(null)} className="text-xs text-slate-500 mono mb-4 hover:text-slate-300 transition-colors">
              ← ALL GAMES
            </button>
            <MilCard className="p-5">
              <div className="text-xs text-slate-500 mono mb-4 font-bold" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                {GAMES.find(g => g.id === active)?.emoji} {GAMES.find(g => g.id === active)?.name}
              </div>
              {active === 'convoy' && <ConvoyCommander onScore={handleScore} />}
              {active === 'trivia' && <StaffTriviaBlitz onScore={handleScore} />}
              {active === 'math' && <MathSprint onScore={handleScore} />}
              {active === 'ttt' && <TicTacToe onScore={handleScore} />}
              {active === 'bash' && <BashResourceBattle onScore={handleScore} onBashDefeated={handleBashDefeated} />}
              {active === 'timing' && <TimingChallenge onScore={handleScore} />}
            </MilCard>
          </div>
        )}
      </div>
    </ScreenWrap>
  );
}
