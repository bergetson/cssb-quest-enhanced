// CSSB Quest Enhanced — Game Data & State Management
// Design: Modern Military Command Dashboard
// Fonts: Rajdhani (headers) + IBM Plex Mono (numbers) + Inter (body)

export const LS_KEY = 'cssb_quest_enhanced_v1';

// ─── Types ───────────────────────────────────────────────────────────────────

export type Difficulty = 'crawl' | 'walk' | 'run' | 'nightmare' | 'qual';
export type Screen =
  | 'title' | 'register' | 'hub' | 'mission' | 'result' | 'store'
  | 'notebook' | 'certificate' | 'secret' | 'roles' | 'ref'
  | 'calc' | 'daily' | 'minigame' | 'leaderboard' | 'settings'
  | 'ppt_boss' | 'achievements' | 'inventory' | 'dorval_call'
  | 'avatar'
  | 'warrior' | 'opfor' | 'dsca' | 'convoy' | 'new_soldier';

export interface Player {
  rank: string;
  name: string;
  unit: string;
}

export interface Stats {
  cmd: number;
  clarity: number;
  tempo: number;
  coord: number;
  readiness: number;
  chaos: number;
  focus: number;
  morale: number;
}

export interface MissionRecord {
  score: number;
  max: number;
  grade: 'GOLD' | 'SILVER' | 'BRONZE' | 'FAILED';
  attempts: number;
}

export interface Badge {
  id: string;
  name: string;
  desc: string;
  emoji: string;
  earnedAt: number;
}

export interface ShameEntry {
  id: string;
  name: string;
  desc: string;
}

export interface NotebookEntry {
  title: string;
  text: string;
  ts: number;
}

export interface InventoryItem {
  id: string;
  qty: number;
}

export interface Achievement {
  id: string;
  name: string;
  desc: string;
  emoji: string;
  earnedAt: number;
}

export interface AvatarConfig {
  body: 'light' | 'tan' | 'brown' | 'dark';
  hair: 'black' | 'brown' | 'blond' | 'red' | 'gray';
  hairStyle: 'short' | 'fade' | 'bun' | 'bald';
  face: 'calm' | 'focused' | 'smirk' | 'serious';
  uniform: 'ocp' | 'pt' | 'dress' | 'field';
  patch: 'cssb' | 's1' | 's2' | 's3' | 's4' | 's6' | 'spo';
  backdrop: 'toc' | 'motorpool' | 'field' | 'mountains';
}

export interface ChaosEvent {
  id: string;
  name: string;
  desc: string;
  emoji: string;
  effect: 'chaos+10' | 'chaos+15' | 'chaos+20' | 'xp-10' | 'creds-15' | 'time-5' | 'skip' | 'bonus';
  chaosThreshold: number; // minimum chaos level to trigger
}

export interface GameState {
  screen: Screen;
  player: Player | null;
  difficulty: Difficulty;
  challenge: string;
  scenario: Scenario | null;
  missionIndex: number;
  stepIndex: number;
  timeBank: number;
  stats: Stats;
  creds: number;
  xp: number;
  level: number;
  streak: number;
  inventory: Record<string, number>;
  missions: Record<string, MissionRecord>;
  scores: Record<string, number>;
  achievements: Record<string, Achievement>;
  chaosMeter: number; // 0-100
  avatar: AvatarConfig;
  activeCosmeticId: string | null;
  pptBossUnlocked: boolean;
  pptBossDefeated: boolean;
  candyCount: number;
  storeItemsBought: string[];
  completed: Record<string, boolean>;
  notebook: NotebookEntry[];
  badges: Record<string, Badge>;
  hall: Record<string, ShameEntry>;
  clues: Record<string, string>;
  log: string[];
  lastResult: ResultData | null;
  rayCards: number;
  mercyCards: number;
  e4: boolean;
  secret: boolean;
  certViewed: boolean;
  redbull: number;
  dailyDone: boolean;
  dailyDate: string;
  ttt: string[];
  tttTurn: 'X' | 'O';
  tttDone: boolean;
  chessStep: number;
  loadmasterDone: boolean;
  roleWins: Record<string, boolean>;
  minigameScores: Record<string, number>;
  totalPlayTime: number;
  sessionStart: number;
  questionPool: Record<string, number[]>; // tracks which questions have been used
  bashDefeated: boolean;
  snedigarHits: number; // how many times Snedigar has run over the player
  e4FavorUsed: boolean;
}

export interface ResultData {
  title: string;
  isAAR?: boolean;
  choice: string;
  result: string;
  learn: string;
  score: number;
  effects: Partial<Stats>;
  protectedBy?: string;
  chaos?: string;
  missionId?: string;
  missionIndex?: number;
  grade?: string;
  max?: number;
  missionScore?: number;
}

// ─── Scenario Generator ───────────────────────────────────────────────────────

export interface Scenario {
  code: string;
  personnel: number;
  initial: number;
  durationDays: number;
  hHour: number;
  receipt: number;
  driverAvail: number;
  fmcCargo: number;
  oneWay: number;
  weatherDelay: number;
  trips: number;
  routeStatus: string;
  nmc: string;
  finalPersonnel: number;
  ammoBoost: number;
  waterRate: number;
  mealRate: number;
  mealsPerCase: number;
  casesPerPallet: number;
  waterReserve: number;
  fuelReserve: number;
  ammoReserve: number;
  plss: number;
  lmtv: number;
  hmmwv: number;
  fueler: number;
  // Vehicle fleet totals
  hemtt: number;
  lmtvTotal: number;
  plsTotal: number;
  hmmwvTotal: number;
  fuelersTotal: number;
  nmcCount: number;
}

function hashStr(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rng(seed: number) {
  let a = seed >>> 0;
  return function () {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(r: () => number, arr: T[]): T {
  return arr[Math.floor(r() * arr.length)];
}

export function makeScenario(code: string): Scenario {
  const r = rng(hashStr(code || 'MOOSE-495'));
  const personnel = pick(r, [587, 620, 642, 668, 710, 735, 752]);
  const initial = personnel - pick(r, [37, 43, 55, 68, 82]);
  const durationDays = pick(r, [3, 4, 5, 6]);
  const hHour = pick(r, [1600, 1700, 1800, 1900, 2000]);
  const receipt = 600;
  const driverAvail = pick(r, [9, 10, 11, 12, 13, 14]);
  const fmcCargo = pick(r, [5, 6, 7, 8]);
  const oneWay = pick(r, [37, 42, 47, 52, 58, 61, 68]);
  const weatherDelay = pick(r, [15, 20, 25, 30, 35]);
  const trips = pick(r, [1, 2, 2, 3]);
  const routeStatus = pick(r, [
    'degraded after 1400',
    'civilian traffic 0600-0800',
    'partially closed',
    'clear until rain line arrives',
    'IED threat reported at grid 4-7',
    'bridge weight limit 40 tons',
  ]);
  const nmc = pick(r, ['PLS 2', 'LMTV 1', 'Fueler', 'Wrecker', 'HMMWV 1']);
  const finalPersonnel = personnel + pick(r, [0, 34, 48, 72, 86, 104]);
  const ammoBoost = pick(r, [10, 15, 20, 25, 30]);
  return {
    code, personnel, initial, durationDays, hHour, receipt, driverAvail,
    fmcCargo, oneWay, weatherDelay, trips, routeStatus, nmc, finalPersonnel,
    ammoBoost, waterRate: 3.5, mealRate: 3, mealsPerCase: 12, casesPerPallet: 48,
    waterReserve: 0.15, fuelReserve: 0.20, ammoReserve: 0.10,
    plss: 3, lmtv: 2, hmmwv: 1, fueler: 1,
  // Vehicle fleet for scenario
  hemtt: pick(r, [2, 3, 4]),
  lmtvTotal: pick(r, [4, 5, 6]),
  plsTotal: pick(r, [3, 4, 5]),
  hmmwvTotal: pick(r, [6, 8, 10]),
  fuelersTotal: pick(r, [2, 3]),
  nmcCount: pick(r, [1, 2, 3]),
  };
}

// ─── Calculation Helpers ──────────────────────────────────────────────────────

export function ceilN(n: number) { return Math.ceil(n); }
export function fmtN(n: number) { return Number.isInteger(n) ? String(n) : String(Math.round(n * 100) / 100); }
export function parseNum(v: string) { return parseFloat(String(v).replace(/,/g, '').trim()); }

export function class1Vals(s: Scenario) {
  const days = s.durationDays;
  const meals = s.personnel * s.mealRate * days;
  const cases = ceilN(meals / s.mealsPerCase);
  const casesRes = ceilN(cases * (1 + s.waterReserve));
  const pallets = ceilN(casesRes / s.casesPerPallet);
  const waterBase = s.personnel * 3 * days;
  const waterRes = ceilN(waterBase * (1 + s.waterReserve));
  return { days, meals, cases, casesRes, pallets, waterBase, waterRes };
}

export function fuelVals(s: Scenario) {
  const rt = s.oneWay * 2;
  const trips = s.trips;
  const plsMiles = s.plss * rt * trips;
  const lmtvMiles = s.lmtv * rt * trips;
  const hMiles = s.hmmwv * rt * trips;
  const fMiles = s.fueler * rt * trips;
  const pls = plsMiles / 6;
  const lmtv = lmtvMiles / 8;
  const h = hMiles / 12;
  const f = fMiles / 7;
  const base = pls + lmtv + h + f;
  const reserve = ceilN(base * (1 + s.fuelReserve));
  return { rt, trips, plsMiles, lmtvMiles, hMiles, fMiles, pls, lmtv, h, f, base, reserve };
}

export function ammoVals(s: Scenario) {
  const loose = 420 * 40;
  const linked556 = 80 * 120;
  const linked762 = 50 * 150;
  const forty = 30 * 6;
  return {
    loose, linked556, linked762, forty,
    looseR: ceilN(loose * 1.10),
    linked556R: ceilN(linked556 * 1.10),
    linked762R: ceilN(linked762 * 1.10),
    fortyR: ceilN(forty * 1.10),
  };
}

export function finalVals(s: Scenario) {
  const days = 5;
  const meals = s.finalPersonnel * 3 * days;
  const cases = ceilN(meals / 12);
  const pallets = ceilN(cases / 48);
  const waterBase = s.finalPersonnel * s.waterRate * days;
  const waterRes = ceilN(waterBase * 1.15);
  const fv = fuelVals({ ...s, trips: 3 });
  const av = ammoVals(s);
  const totalPallets = pallets + ceilN(waterRes / 500) + 10;
  const cap = 2 * 8 + 2 * 2;
  const tripsReq = ceilN(totalPallets / cap);
  const driversReq = (2 + 2 + 1 + 1) * 2;
  return {
    days, meals, cases, pallets, waterBase, waterRes,
    fuel: fv.reserve,
    loose: ceilN(av.loose * (1 + s.ammoBoost / 100)),
    linked556: ceilN(av.linked556 * (1 + s.ammoBoost / 100)),
    linked762: ceilN(av.linked762 * (1 + s.ammoBoost / 100)),
    totalPallets, cap, tripsReq, driversReq,
    driverDelta: s.driverAvail - driversReq,
  };
}

// ─── Characters ───────────────────────────────────────────────────────────────

export const CHARS: Record<string, { name: string; emoji: string; color: string; title: string }> = {
  system:   { name: 'SYSTEM',                    emoji: '💾', color: 'gold',   title: 'AI BATTLE STAFF' },
  xo:       { name: 'MAJ Pancheau',              emoji: '📋', color: 'gold',   title: 'EXECUTIVE OFFICER' },
  bc:       { name: 'LTC Figarelle',             emoji: '🦅', color: 'gold',   title: 'BATTALION COMMANDER' },
  csm:      { name: 'CSM Good',                  emoji: '🫡', color: 'lime',   title: 'COMMAND SERGEANT MAJOR' },
  s1:       { name: 'CPT Schaack / SFC Bailey',  emoji: '👥', color: 'purple', title: 'S1 — PERSONNEL' },
  s2:       { name: 'LT Gary',                   emoji: '🌧️', color: 'cyan',   title: 'S2 — INTELLIGENCE' },
  s3:       { name: 'CPT Whitehead / MSG Benz',  emoji: '🗺️', color: 'green',  title: 'S3 — OPERATIONS' },
  s4:       { name: 'CPT Berget',                emoji: '🛠️', color: 'orange', title: 'S4 — LOGISTICS' },
  s6:       { name: 'LT Drinville',              emoji: '📡', color: 'cyan',   title: 'S6 — SIGNAL' },
  spo:      { name: 'MAJ Cantrell',              emoji: '🚚', color: 'red',    title: 'SPO — SUSTAINMENT' },
  ray:      { name: 'SFC Ray',                   emoji: '🕶️', color: 'purple', title: 'TACTICAL FIXER' },
  bash:     { name: 'SSG Bash',                  emoji: '♟️', color: 'orange', title: 'CHESS MASTER' },
  cho:      { name: 'CPT Deil Cho',              emoji: '🧠', color: 'cyan',   title: 'ANALYSIS OFFICER' },
  kyle:     { name: 'CPT Kyle Meadlee',          emoji: '🧮', color: 'green',  title: 'MATH OFFICER' },
  ashley:   { name: 'CPT Ashley Meadlee',        emoji: '📝', color: 'purple', title: 'ORDERS OFFICER' },
  ppt:      { name: 'CPT PowerPoint',            emoji: '📊', color: 'red',    title: 'SLIDE RANGER' },
  gibson:   { name: 'MG Gibson',                 emoji: '⭐', color: 'gold',   title: 'COMMANDING GENERAL' },
  moreni:   { name: 'GEN Moreni',                emoji: '🌲', color: 'lime',   title: 'THEATER COMMANDER' },
  dorval:   { name: 'BG Dorval',                 emoji: '☎️', color: 'cyan',   title: 'DEPUTY COMMANDER' },
  snedigar: { name: 'PVT Snedigar',              emoji: '🛒', color: 'red',    title: 'CHAOS AGENT' },
};

// ─── Difficulty Settings ──────────────────────────────────────────────────────

export const DIFFS: Record<Difficulty, { name: string; time: number; mult: number; hints: boolean; hard: boolean; noSaves: boolean; color: string; desc: string }> = {
  crawl:     { name: 'CRAWL',              time: 70, mult: 1.0,  hints: true,  hard: false, noSaves: false, color: 'green',  desc: 'Full hints, generous time, saves allowed. Learn the fundamentals.' },
  walk:      { name: 'WALK',               time: 58, mult: 1.05, hints: true,  hard: false, noSaves: false, color: 'cyan',   desc: 'Hints available, moderate time pressure. Build confidence.' },
  run:       { name: 'RUN',                time: 40, mult: 1.30, hints: false, hard: true,  noSaves: false, color: 'orange', desc: 'No formula hints, tighter grading, and heavier chaos penalties. The reference data is still available.' },
  nightmare: { name: 'MDMP NIGHTMARE',     time: 28, mult: 1.70, hints: false, hard: true,  noSaves: true,  color: 'red',    desc: 'Brutal time, stricter pass gate, no saves, and hard consequence management.' },
  qual:      { name: 'STAFF QUALIFICATION',time: 30, mult: 2.0,  hints: false, hard: true,  noSaves: true,  color: 'gold',   desc: 'No saves, 80% pass gate, and every answer must be earned from the brief and references.' },
};

export function passThresholdForDifficulty(difficulty: Difficulty) {
  if (difficulty === 'qual' || difficulty === 'nightmare') return 0.80;
  if (difficulty === 'run') return 0.75;
  return 0.70;
}

// ─── Shop Items ───────────────────────────────────────────────────────────────

export interface ShopItem {
  id: string;
  name: string;
  desc: string;
  flavor: string;
  cost: number;
  emoji: string;
  color: string;
  effect: string;
  speaker: string;
  speakerLine: string;
  category: 'consumable' | 'powerup' | 'cosmetic' | 'secret';
}

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'coffee', name: 'Black Coffee', desc: '+15 Focus, +10 Clarity for next mission',
    flavor: 'Army-grade. Tastes like ambition and regret.',
    cost: 55, emoji: '☕', color: 'orange', effect: 'focus+15,clarity+10',
    category: 'consumable', speaker: 'csm',
    speakerLine: 'CSM Good: "Son, this is not a Starbucks. Drink it black or don\'t drink it."',
  },
  {
    id: 'ray_card', name: 'SFC Ray Save Card', desc: 'Automatically corrects one wrong answer',
    flavor: '"The secret ingredient is crime." — SFC Ray',
    cost: 160, emoji: '🕶️', color: 'purple', effect: 'rayCard+1',
    category: 'powerup', speaker: 'ray',
    speakerLine: 'SFC Ray: "I\'m not saying I\'ll fix it. I\'m saying it\'ll be fixed."',
  },
  {
    id: 'mercy', name: 'Tactical Mercy Card', desc: 'Saves one incorrect answer from counting against you',
    flavor: 'Issued by the E4 Mafia. No questions asked.',
    cost: 140, emoji: '🃏', color: 'cyan', effect: 'mercy+1',
    category: 'powerup', speaker: 'snedigar',
    speakerLine: 'PVT Snedigar: "I found this in the motor pool. Seemed important."',
  },
  {
    id: 'redbull', name: 'Red Bull (4-pack)', desc: 'Unlocks the Red Bull Timing mini-game',
    flavor: 'Gives wings. Costs dignity.',
    cost: 90, emoji: '🔴', color: 'red', effect: 'redbull+4',
    category: 'consumable', speaker: 'bash',
    speakerLine: 'SSG Bash: "The timing is everything. Just like chess."',
  },
  {
    id: 'e4', name: 'E4 Mafia Alliance', desc: 'Random chance to auto-fix one bad number per mission',
    flavor: 'They know things. They see things. They fix things.',
    cost: 300, emoji: '🤝', color: 'lime', effect: 'e4=true',
    category: 'powerup', speaker: 'ray',
    speakerLine: 'SFC Ray: "Don\'t ask how they know. Just be grateful."',
  },
  {
    id: 'notebook_pro', name: 'Tactical Notebook Pro', desc: 'Doubles notebook capacity and adds search',
    flavor: 'Waterproof. Bullet-resistant. Smells like victory.',
    cost: 110, emoji: '📓', color: 'gold', effect: 'notebookPro=true',
    category: 'cosmetic', speaker: 'ashley',
    speakerLine: 'CPT Ashley Meadlee: "Write everything down. Everything."',
  },
  {
    id: 'ppt_shield', name: 'Anti-PowerPoint Shield', desc: 'Blocks CPT PowerPoint interference events',
    flavor: 'Repels slide decks. Attracts actual decisions.',
    cost: 180, emoji: '🛡️', color: 'cyan', effect: 'pptShield=true',
    category: 'powerup', speaker: 'cho',
    speakerLine: 'CPT Cho: "Analysis first. Slides never."',
  },
  {
    id: 'snedigar_insurance', name: 'Snedigar Insurance Policy', desc: 'Converts one chaos event into a bonus',
    flavor: 'Underwritten by the E4 Mafia. Premiums paid in MRE cheese.',
    cost: 165, emoji: '📄', color: 'orange', effect: 'snedigarIns=true',
    category: 'powerup', speaker: 'snedigar',
    speakerLine: 'PVT Snedigar: "I didn\'t mean to. But it worked out."',
  },
  {
    id: 'kyle_calc', name: 'Kyle\'s Calculator', desc: 'Shows formula hints on math steps',
    flavor: 'Borrowed from CPT Kyle Meadlee. Return it.',
    cost: 190, emoji: '🧮', color: 'green', effect: 'kyleCalc=true',
    category: 'powerup', speaker: 'kyle',
    speakerLine: 'CPT Kyle Meadlee: "The formula is on the back. Don\'t lose it."',
  },
  {
    id: 'secret_phrase', name: '??? Classified Item', desc: 'Unlocks something. Maybe.',
    flavor: 'The truth Montana doesn\'t want you to know...',
    cost: 495, emoji: '🔒', color: 'gold', effect: 'secret=true',
    category: 'secret', speaker: 'bc',
    speakerLine: 'LTC Figarelle: "The truth Montana doesn\'t want you to know..."',
  },
  {
    id: 'moreni_blessing', name: 'GEN Moreni\'s Blessing', desc: '+20 to all stats for one mission',
    flavor: 'He walked through the TOC once. The coffee got better.',
    cost: 200, emoji: '🌲', color: 'lime', effect: 'moreniBless=true',
    category: 'powerup', speaker: 'moreni',
    speakerLine: 'GEN Moreni: "Be brilliant at the basics."',
  },
  {
    id: 'battle_captain_hotline', name: 'Battle Captain Hotline', desc: 'One-time confidence boost: +10 command and +10 clarity',
    flavor: 'Not BG Dorval. This one is just the TOC politely telling you to breathe.',
    cost: 220, emoji: '☎️', color: 'cyan', effect: 'cmd+10,clarity+10',
    category: 'powerup', speaker: 'xo',
    speakerLine: 'MAJ Pancheau: "BLUF first. Status second. Recommendation third."',
  },
  {
    id: 'gary_weather', name: 'LT Gary\'s Weather Report', desc: 'Reveals the correct answer on one hard question',
    flavor: 'Forecasted: 100% chance of getting it right.',
    cost: 130, emoji: '🌧️', color: 'cyan', effect: 'garyWeather+1',
    category: 'powerup', speaker: 's2',
    speakerLine: 'LT Gary: "The forecast is... actually favorable for once."',
  },
  {
    id: 'pancheau_brief', name: 'MAJ Pancheau\'s OPORD Brief', desc: '+20 Clarity for the next two missions',
    flavor: 'Crisp. Concise. Exactly 5 minutes. Somehow covers everything.',
    cost: 190, emoji: '📋', color: 'gold', effect: 'clarity+20',
    category: 'consumable', speaker: 'xo',
    speakerLine: 'MAJ Pancheau: "Here\'s the bottom line up front. You\'re welcome."',
  },
  {
    id: 'csm_good_stare', name: 'CSM Good\'s Motivational Stare', desc: 'Resets chaos to 0 for one mission',
    flavor: 'No words needed. The chaos simply... leaves.',
    cost: 170, emoji: '🫡', color: 'lime', effect: 'chaos=0',
    category: 'consumable', speaker: 'csm',
    speakerLine: 'CSM Good: "Chaos is a choice, soldier. Choose differently."',
  },
  {
    id: 'berget_wrench', name: 'CPT Berget\'s Magic Wrench', desc: 'All vehicles FMC for one mission (no NMC penalty)',
    flavor: 'Somehow the PMCS got done. Nobody saw it happen.',
    cost: 210, emoji: '🛠️', color: 'orange', effect: 'allFMC=true',
    category: 'powerup', speaker: 's4',
    speakerLine: 'CPT Berget: "All vehicles are FMC. Don\'t ask questions."',
  },
  {
    id: 'whitehead_op', name: 'CPT Whitehead\'s Op Order', desc: 'Doubles XP earned on the next mission',
    flavor: 'Issued in 3 minutes flat. Still somehow complete.',
    cost: 240, emoji: '🗺️', color: 'green', effect: 'xpDouble=true',
    category: 'powerup', speaker: 's3',
    speakerLine: 'CPT Whitehead: "The plan is simple. Execute it perfectly."',
  },
  {
    id: 'drinville_signal', name: 'LT Drinville\'s Comms Boost', desc: 'PACE plan never fails for one mission',
    flavor: 'Signal is up. All four methods. Simultaneously.',
    cost: 125, emoji: '📡', color: 'cyan', effect: 'paceBoost=true',
    category: 'consumable', speaker: 's6',
    speakerLine: 'LT Drinville: "All comms are up. I\'m as surprised as you are."',
  },
  {
    id: 'gibson_star', name: 'MG Gibson\'s Star Power', desc: 'Auto-GOLD grade on any one mission',
    flavor: 'One star. Maximum effect.',
    cost: 900, emoji: '⭐', color: 'gold', effect: 'gibsonStar=true',
    category: 'secret', speaker: 'gibson',
    speakerLine: 'MG Gibson: "Outstanding. Brief me on how you did it."',
  },
  // ── Cosmetics ──
  {
    id: 'beret', name: 'Tactical Beret', desc: 'Cosmetic. Morale improves when worn.',
    flavor: 'Slightly tilted. Regulation enough.',
    cost: 30, emoji: '🎩', color: 'green', effect: 'cosmetic',
    category: 'cosmetic', speaker: 'csm',
    speakerLine: 'CSM Good: "That beret is not properly bloused. Fix it. ...Actually, it looks fine."',
  },
  {
    id: 'coffee_mug', name: 'Personalized Coffee Mug', desc: 'Cosmetic. Boosts morale by 5.',
    flavor: 'World\'s Okayest Staff Officer.',
    cost: 25, emoji: '☕', color: 'orange', effect: 'cosmetic',
    category: 'cosmetic', speaker: 'xo',
    speakerLine: 'MAJ Pancheau: "Is that a personalized mug? In the TOC? ...I respect it."',
  },
  {
    id: 'whiteboard_marker', name: 'Tactical Whiteboard Marker', desc: 'Cosmetic. Never runs out of ink.',
    flavor: 'Guaranteed to work until it doesn\'t.',
    cost: 20, emoji: '✏️', color: 'cyan', effect: 'cosmetic',
    category: 'cosmetic', speaker: 's3',
    speakerLine: 'CPT Whitehead: "A marker that works? In this TOC? Revolutionary."',
  },
  {
    id: 'funny_hat', name: 'Unauthorized Funny Hat', desc: 'Cosmetic. LTC Figarelle will comment.',
    flavor: 'Technically not in AR 670-1. Technically.',
    cost: 35, emoji: '🎭', color: 'purple', effect: 'cosmetic',
    category: 'cosmetic', speaker: 'bc',
    speakerLine: 'LTC Figarelle: "That hat represents a stratification of risk to your career progression."',
  },
  {
    id: 'iron_man_mustache', name: 'Iron Man Mustache', desc: 'Cosmetic. CPT Berget will notice.',
    flavor: 'Genius. Billionaire. Staff Officer.',
    cost: 45, emoji: '🥸', color: 'red', effect: 'cosmetic',
    category: 'cosmetic', speaker: 's4',
    speakerLine: 'CPT Berget: "Nice mustache. Very handsome. Almost as handsome as me."',
  },
  {
    id: 'aviator_glasses', name: 'Aviator Glasses', desc: 'Cosmetic. +5 Clarity. You look the part.',
    flavor: 'For the logistician who thinks they\'re a pilot.',
    cost: 40, emoji: '🕶️', color: 'gold', effect: 'cosmetic',
    category: 'cosmetic', speaker: 's2',
    speakerLine: 'LT Gary: "Those glasses won\'t help you read the weather forecast any better."',
  },
  {
    id: 'tornado', name: 'Shopette Tornado', desc: 'Chaos item. Increases chaos meter but gives +30 XP.',
    flavor: 'SPC Morgan and SGT Kimball love these things.',
    cost: 45, emoji: '🌪️', color: 'red', effect: 'chaos+20,xp+30',
    category: 'consumable', speaker: 'snedigar',
    speakerLine: 'PVT Snedigar: "I got three of these from the shopette. SPC Morgan showed me."',
  },
  // ── Special ──
  {
    id: 'dorval_phone_call', name: 'BG Dorval\'s Direct Line', desc: 'Call BG Dorval and give her a piece of your mind.',
    flavor: 'She answers on the second ring. Are you sure about this?',
    cost: 2500, emoji: '☎️', color: 'cyan', effect: 'dorval_call',
    category: 'secret', speaker: 'dorval',
    speakerLine: 'BG Dorval: "...Hello?"',
  },
  {
    id: 'e4_truck_favor', name: 'E4 Mafia Truck Favor', desc: 'Make one NMC truck FMC. No questions asked.',
    flavor: 'They know a guy. The guy knows a part. The part appears.',
    cost: 300, emoji: '🔧', color: 'lime', effect: 'e4FavorTruck',
    category: 'powerup', speaker: 'ray',
    speakerLine: 'SFC Ray: "Don\'t ask where the part came from. Just sign the 2404."',
  },
  {
    id: 'ray_favor', name: 'SFC Ray\'s Favor', desc: 'Ray saves you from one wrong answer — automatically.',
    flavor: '"The secret ingredient is crime." — SFC Ray',
    cost: 90, emoji: '🕶️', color: 'purple', effect: 'rayCard+1',
    category: 'powerup', speaker: 'ray',
    speakerLine: 'SFC Ray: "I wasn\'t here. This never happened. You\'re welcome."',
  },
];

// ─── Chaos Events ────────────────────────────────────────────────────────────

export const CHAOS_EVENTS: ChaosEvent[] = [
  {
    id: 'snedigar_run', name: 'PVT Snedigar Runs You Over',
    desc: 'PVT Snedigar charges through the TOC on a frisbee run and absolutely flattens you. You lose your train of thought.',
    emoji: '🛒', effect: 'xp-10', chaosThreshold: 0,
  },
  {
    id: 'marker_dry', name: 'Whiteboard Marker Runs Out',
    desc: 'Mid-brief, your marker dies. You try three more. All dry. The plan is half-written on the board.',
    emoji: '🖊️', effect: 'time-5', chaosThreshold: 10,
  },
  {
    id: 'fragord_interrupt', name: 'FRAGORD RECEIVED',
    desc: 'A FRAGORD just dropped. Higher changed the H-Hour. Again. Your timeline is now a work of fiction.',
    emoji: '📨', effect: 'chaos+10', chaosThreshold: 15,
  },
  {
    id: 'printer_jam', name: 'Printer Jams',
    desc: 'The TOC printer jams on page 1 of a 47-page OPORD. The S3 is watching.',
    emoji: '🖨️', effect: 'time-5', chaosThreshold: 20,
  },
  {
    id: 'meeting_scheduled', name: 'Mandatory Meeting Scheduled',
    desc: 'Someone just scheduled a 2-hour sync during your planning window. Attendance is mandatory.',
    emoji: '📅', effect: 'chaos+10', chaosThreshold: 25,
  },
  {
    id: 'redbull_crash', name: 'Red Bull Crash',
    desc: 'The Red Bull wore off. You stare at the LOGSTAT like it\'s written in ancient Sumerian.',
    emoji: '💤', effect: 'chaos+15', chaosThreshold: 30,
  },
  {
    id: 'ppt_interrupt', name: 'CPT PowerPoint Appears',
    desc: 'CPT PowerPoint bursts in with a 47-slide deck. "Just one quick brief," he says. It is never quick.',
    emoji: '📊', effect: 'chaos+15', chaosThreshold: 35,
  },
  {
    id: 'gibson_visit', name: 'BG Gibson Walks In',
    desc: 'BG Gibson enters the TOC unannounced. "Be brilliant at the basics, people." Everyone stands a little straighter.',
    emoji: '⭐', effect: 'bonus', chaosThreshold: 0,
  },
  {
    id: 'moreni_visit', name: 'GEN Moreni Stops By',
    desc: 'GEN Moreni pauses at your workstation. "Every setback is a setup for a comeback. Keep pushing."',
    emoji: '🌲', effect: 'bonus', chaosThreshold: 0,
  },
  {
    id: 'comms_down', name: 'Comms Are Down',
    desc: 'Primary comms just went black. LT Drinville is "working on it." The PACE plan is being tested.',
    emoji: '📡', effect: 'chaos+10', chaosThreshold: 20,
  },
  {
    id: 'nmc_spike', name: 'Vehicle Goes NMC',
    desc: 'Another truck just went NMC. The motor pool says parts are on order. ETA: unknown.',
    emoji: '🔧', effect: 'chaos+10', chaosThreshold: 15,
  },
  {
    id: 'weather_change', name: 'Weather Changes',
    desc: 'LT Gary\'s weather forecast was wrong. Again. The rain line arrived 4 hours early.',
    emoji: '🌧️', effect: 'time-5', chaosThreshold: 10,
  },
  {
    id: 'csm_stare', name: 'CSM Good Gives You The Look',
    desc: 'CSM Good walks by, stops, stares at your work for 10 full seconds, says nothing, and walks away.',
    emoji: '🫡', effect: 'chaos+15', chaosThreshold: 40,
  },
  {
    id: 'e4_saves', name: 'E4 Mafia Intervenes',
    desc: 'Out of nowhere, a specialist appears, fixes your truck, and vanishes. No explanation given.',
    emoji: '🤝', effect: 'bonus', chaosThreshold: 0,
  },
  {
    id: 'bailey_candy', name: 'SFC Bailey Walks By',
    desc: 'SFC Bailey passes through the S1 section. You find a piece of candy on your desk. No one saw anything.',
    emoji: '🍬', effect: 'bonus', chaosThreshold: 0,
  },
];

// ─── Achievements Definitions ─────────────────────────────────────────────────

export const ACHIEVEMENTS_DEF: { id: string; name: string; desc: string; emoji: string; condition: string }[] = [
  { id: 'first_mission', name: 'First Step', desc: 'Complete your first mission.', emoji: '🎖️', condition: 'Complete Mission 1' },
  { id: 'all_missions', name: 'Staff Qualified', desc: 'Complete all 10 missions.', emoji: '🏆', condition: 'Complete all 10 missions' },
  { id: 'all_gold', name: 'Gold Standard', desc: 'Earn GOLD on all 10 missions.', emoji: '🥇', condition: 'Score 90%+ on all missions' },
  { id: 'hard_complete', name: 'No Mercy', desc: 'Complete all missions on HARD difficulty.', emoji: '💀', condition: 'Finish all missions on HARD' },
  { id: 'dorval_call', name: 'Gave the A-Tag a Piece of My Mind', desc: 'Chickened out of calling BG Dorval.', emoji: '☎️', condition: 'Buy the Dorval phone and chicken out' },
  { id: 'snedigar_3x', name: 'Roadkill', desc: 'Get run over by PVT Snedigar 3 times.', emoji: '🛒', condition: 'Trigger the Snedigar chaos event 3 times' },
  { id: 'buy_all', name: 'Supply Depot Regular', desc: 'Buy every item in the store.', emoji: '🏪', condition: 'Purchase all shop items' },
  { id: 'beat_bash', name: 'Beating Bash at Chess', desc: 'Defeated SSG Bash at the resource battle.', emoji: '♟️', condition: 'Win the Bash resource battle' },
  { id: 'beat_ppt', name: 'Death to Slides', desc: 'Defeated CPT PowerPoint in battle.', emoji: '📊', condition: 'Win the CPT PowerPoint boss battle' },
  { id: 'secret_phrase', name: 'Premier CSSB', desc: 'Discovered the secret phrase.', emoji: '🔒', condition: 'Buy the classified item' },
  { id: 'shopette_tornado', name: 'Questionable Nutrition', desc: 'Bought a Shopette Tornado on purpose.', emoji: '🌪️', condition: 'Purchase the Shopette Tornado' },
  { id: 'aviator_energy', name: 'Logistics Aviator', desc: 'Equipped aviators for a job that does not involve flying.', emoji: '🕶️', condition: 'Purchase the Aviator Glasses' },
  { id: 'battle_captain_hotline', name: 'BLUF Machine', desc: 'Bought the Battle Captain Hotline.', emoji: '☎️', condition: 'Purchase the hotline' },
  { id: 'candy_collector', name: 'Sweet Tooth', desc: 'Collected 5 pieces of candy.', emoji: '🍬', condition: 'Accumulate 5 candies' },
  { id: 'ray_save', name: "Ray's Got You", desc: 'SFC Ray saved you from a wrong answer.', emoji: '🕶️', condition: 'Use a Ray Save Card' },
  { id: 'chaos_max', name: 'Absolute Chaos', desc: 'Hit 100% chaos meter.', emoji: '🌪️', condition: 'Fill the chaos meter completely' },
  { id: 'daily_streak', name: 'Battle Rhythm', desc: 'Complete 5 daily challenges.', emoji: '📅', condition: 'Complete 5 daily challenges' },
  { id: 'perfect_mission', name: 'No Errors', desc: 'Complete a mission with a perfect score.', emoji: '⭐', condition: 'Score 100% on any mission' },
  { id: 'e4_mafia', name: 'Connected', desc: 'Used the E4 Mafia favor.', emoji: '🤝', condition: 'Use the E4 Mafia truck fix' },
  { id: 'gibson_blessed', name: 'Brilliant at the Basics', desc: 'BG Gibson visited during a chaos event.', emoji: '⭐', condition: 'Trigger the Gibson chaos event' },
];

// ─── Question Banks (rotating) ────────────────────────────────────────────────

export interface QuizQuestion {
  id: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  question: string;
  choices: { text: string; correct: boolean; explanation: string }[];
  teachingPoint: string;
}

export const QUIZ_BANK: QuizQuestion[] = [
  // MDMP
  {
    id: 'mdmp_1', category: 'MDMP', difficulty: 'easy',
    question: 'What is the FIRST step of the Military Decision Making Process?',
    choices: [
      { text: 'Mission Analysis', correct: false, explanation: 'Mission Analysis is Step 2.' },
      { text: 'Receipt of Mission', correct: true, explanation: 'Receipt of Mission initiates the MDMP and triggers the 1/3 - 2/3 rule.' },
      { text: 'COA Development', correct: false, explanation: 'COA Development is Step 3.' },
      { text: 'Orders Production', correct: false, explanation: 'Orders Production is Step 7.' },
    ],
    teachingPoint: 'Receipt of Mission starts the clock. The first action is to issue a WARNO to buy subordinate planning time.',
  },
  {
    id: 'mdmp_2', category: 'MDMP', difficulty: 'medium',
    question: 'The 1/3 - 2/3 rule means the higher headquarters keeps ___ of available planning time.',
    choices: [
      { text: '2/3 of the time', correct: false, explanation: 'Higher HQ keeps 1/3 to plan; subordinates get 2/3.' },
      { text: '1/3 of the time', correct: true, explanation: 'Higher HQ keeps 1/3 so subordinates receive 2/3 for their own planning.' },
      { text: '1/2 of the time', correct: false, explanation: 'The rule is 1/3 - 2/3, not 50/50.' },
      { text: 'All of the time until the OPORD is complete', correct: false, explanation: 'This would leave subordinates no planning time.' },
    ],
    teachingPoint: 'Protecting subordinate planning time is a fundamental staff discipline. Issue WARNOs early and often.',
  },
  {
    id: 'mdmp_3', category: 'MDMP', difficulty: 'hard',
    question: 'During Mission Analysis, which product is the PRIMARY output that drives all subsequent planning?',
    choices: [
      { text: 'The Commander\'s Initial Guidance', correct: false, explanation: 'This is an input to COA Development, not the primary MA output.' },
      { text: 'The Restated Mission', correct: true, explanation: 'The restated mission is the approved output of Mission Analysis that defines the who, what, when, where, and why.' },
      { text: 'The WARNO', correct: false, explanation: 'The WARNO is issued at the start, not the primary MA output.' },
      { text: 'The COA Sketch', correct: false, explanation: 'COA sketches come in Step 3, after Mission Analysis.' },
    ],
    teachingPoint: 'The restated mission is the foundation. Every COA must accomplish the restated mission.',
  },
  {
    id: 'mdmp_4', category: 'MDMP', difficulty: 'hard',
    question: 'What is the purpose of the COA Wargame (Step 4)?',
    choices: [
      { text: 'To select the best COA before briefing the commander', correct: false, explanation: 'Selection happens in Step 5. Wargaming tests, it does not select.' },
      { text: 'To identify strengths, weaknesses, and decision points for each COA', correct: true, explanation: 'Wargaming stress-tests each COA against enemy actions to identify risks and refine the plan.' },
      { text: 'To brief subordinate commanders on the plan', correct: false, explanation: 'That is the OPORD brief in Step 7.' },
      { text: 'To produce the synchronization matrix', correct: false, explanation: 'The synch matrix is a tool used during wargaming, not the purpose of it.' },
    ],
    teachingPoint: 'Wargaming is not a formality. It is how the staff finds the holes in the plan before the enemy does.',
  },
  {
    id: 'mdmp_5', category: 'MDMP', difficulty: 'expert',
    question: 'A FRAGORD is issued when:',
    choices: [
      { text: 'The mission is complete', correct: false, explanation: 'FRAGORDs modify existing orders, not conclude missions.' },
      { text: 'Conditions change and only portions of the existing order need to be updated', correct: true, explanation: 'A FRAGORD (Fragmentary Order) modifies an existing OPORD when only specific elements change.' },
      { text: 'A new OPORD is required from scratch', correct: false, explanation: 'If the entire plan changes, a new OPORD is issued, not a FRAGORD.' },
      { text: 'The commander wants a briefing', correct: false, explanation: 'A briefing is not an order.' },
    ],
    teachingPoint: 'FRAGORDs are surgical. They change what changed and leave the rest of the OPORD intact. Update the math, not just the tracker.',
  },
  // Staff Roles
  {
    id: 'roles_1', category: 'STAFF ROLES', difficulty: 'easy',
    question: 'Which staff section is responsible for personnel strength reporting (PERSTAT)?',
    choices: [
      { text: 'S3 Operations', correct: false, explanation: 'S3 handles operations and training.' },
      { text: 'S1 Personnel', correct: true, explanation: 'S1 owns all human resources functions including PERSTAT, casualty reporting, and awards.' },
      { text: 'S4 Logistics', correct: false, explanation: 'S4 handles logistics and maintenance.' },
      { text: 'SPO', correct: false, explanation: 'SPO handles sustainment planning and commodity calculations.' },
    ],
    teachingPoint: 'S1 is the foundation of sustainment planning. Every Class I and water calculation starts with an accurate personnel count from S1.',
  },
  {
    id: 'roles_2', category: 'STAFF ROLES', difficulty: 'medium',
    question: 'The S2 section\'s PRIMARY contribution to sustainment planning is:',
    choices: [
      { text: 'Calculating fuel requirements', correct: false, explanation: 'Fuel is an S4/SPO function.' },
      { text: 'Providing weather, terrain, and threat analysis that affects route and timing decisions', correct: true, explanation: 'S2 intelligence directly impacts route selection, timing, and risk assessment for all convoys.' },
      { text: 'Writing the sustainment annex', correct: false, explanation: 'The sustainment annex is an S4/SPO product.' },
      { text: 'Managing the LOGSTAT', correct: false, explanation: 'LOGSTAT is managed by S4 and SPO.' },
    ],
    teachingPoint: 'S2 is often underutilized in sustainment planning. Weather, terrain, and threat data should drive every route and timing decision.',
  },
  {
    id: 'roles_3', category: 'STAFF ROLES', difficulty: 'medium',
    question: 'What does the SPO (Support Operations Officer) primarily do?',
    choices: [
      { text: 'Manages personnel records', correct: false, explanation: 'Personnel records are an S1 function.' },
      { text: 'Plans and coordinates all sustainment operations including Classes of Supply', correct: true, explanation: 'The SPO is the primary staff officer for sustainment planning, commodity calculations, and distribution coordination.' },
      { text: 'Manages communications equipment', correct: false, explanation: 'Communications is an S6 function.' },
      { text: 'Conducts intelligence preparation of the battlefield', correct: false, explanation: 'IPB is an S2 function.' },
    ],
    teachingPoint: 'The SPO bridges the gap between what the commander needs and what logistics can provide. Every commodity calculation runs through the SPO.',
  },
  {
    id: 'roles_4', category: 'STAFF ROLES', difficulty: 'hard',
    question: 'The S6 section\'s PACE plan must ensure:',
    choices: [
      { text: 'All four methods use the same radio frequency', correct: false, explanation: 'Using the same frequency defeats the purpose of having alternates.' },
      { text: 'Each method is a genuinely different and independent means of communication', correct: true, explanation: 'PACE only works if each method (Primary, Alternate, Contingency, Emergency) is truly independent and available.' },
      { text: 'The primary method is always FM radio', correct: false, explanation: 'The primary method depends on the situation; FM may not always be best.' },
      { text: 'The emergency method is always a runner', correct: false, explanation: 'While runners are common emergency methods, the key is independence, not a specific method.' },
    ],
    teachingPoint: 'A PACE plan where all methods share infrastructure is not a PACE plan. Each method must work when the others fail.',
  },
  {
    id: 'roles_5', category: 'STAFF ROLES', difficulty: 'hard',
    question: 'Which staff section owns the running estimate for maintenance and equipment readiness?',
    choices: [
      { text: 'S1', correct: false, explanation: 'S1 owns the personnel running estimate.' },
      { text: 'S3', correct: false, explanation: 'S3 owns the operations running estimate.' },
      { text: 'S4', correct: true, explanation: 'S4 owns the logistics running estimate, which includes maintenance, equipment readiness, and supply status.' },
      { text: 'S6', correct: false, explanation: 'S6 owns the communications running estimate.' },
    ],
    teachingPoint: 'Every staff section maintains a running estimate in their functional area. The S4 running estimate is critical for sustainment planning.',
  },
  // Sustainment / SPO Calculations
  {
    id: 'spo_1', category: 'SPO CALCULATIONS', difficulty: 'easy',
    question: 'The standard water planning rate for soldiers in the field is:',
    choices: [
      { text: '1 gallon per soldier per day', correct: false, explanation: 'This is insufficient for field conditions.' },
      { text: '3 gallons per soldier per day', correct: true, explanation: 'The standard planning rate is 3 gallons per soldier per day for field operations.' },
      { text: '5 gallons per soldier per day', correct: false, explanation: 'This is higher than the standard planning rate.' },
      { text: '2 liters per soldier per day', correct: false, explanation: 'The standard is in gallons, not liters, and is higher than this.' },
    ],
    teachingPoint: 'Water is often the pacing commodity. Always calculate water requirements early and verify distribution capacity.',
  },
  {
    id: 'spo_2', category: 'SPO CALCULATIONS', difficulty: 'medium',
    question: 'When calculating MRE requirements, you should ALWAYS:',
    choices: [
      { text: 'Round down to save transportation space', correct: false, explanation: 'Rounding down creates artificial shortages. Never round down what soldiers need.' },
      { text: 'Round up at each packaging step (meals → cases → pallets)', correct: true, explanation: 'Rounding up at each step ensures you never plan a shortage into the system.' },
      { text: 'Use the exact decimal value throughout', correct: false, explanation: 'You cannot order a fraction of a case or pallet; you must round up.' },
      { text: 'Round to the nearest whole number', correct: false, explanation: 'Rounding to nearest could round down. Always round UP for sustainment.' },
    ],
    teachingPoint: 'Rounding down is a planning failure. Soldiers eat whole meals, cases hold whole MREs, pallets carry whole cases. Round up every time.',
  },
  {
    id: 'spo_3', category: 'SPO CALCULATIONS', difficulty: 'hard',
    question: 'A standard MRE case contains ___ meals, and a standard pallet holds ___ cases.',
    choices: [
      { text: '12 meals per case, 48 cases per pallet', correct: true, explanation: 'Standard Army planning: 12 meals/case, 48 cases/pallet.' },
      { text: '24 meals per case, 24 cases per pallet', correct: false, explanation: 'Incorrect packaging standards.' },
      { text: '12 meals per case, 36 cases per pallet', correct: false, explanation: 'The pallet standard is 48 cases, not 36.' },
      { text: '8 meals per case, 48 cases per pallet', correct: false, explanation: 'The case standard is 12 meals, not 8.' },
    ],
    teachingPoint: 'Know your packaging standards cold. Meals → Cases (÷12) → Pallets (÷48). Round up at each step.',
  },
  {
    id: 'spo_4', category: 'SPO CALCULATIONS', difficulty: 'hard',
    question: 'The standard fuel reserve percentage for Army convoy planning is:',
    choices: [
      { text: '10%', correct: false, explanation: 'Ten percent is the standard ammo reserve, not fuel.' },
      { text: '15%', correct: false, explanation: 'Fifteen percent is the standard water reserve, not fuel.' },
      { text: '20%', correct: true, explanation: 'The standard fuel reserve is 20% above calculated requirements.' },
      { text: '25%', correct: false, explanation: 'Twenty-five percent exceeds the standard fuel reserve.' },
    ],
    teachingPoint: 'Know your reserve percentages: Fuel = 20%, Water = 15%, Ammo = 10%. These are not optional — they are planning minimums.',
  },
  {
    id: 'spo_5', category: 'SPO CALCULATIONS', difficulty: 'expert',
    question: 'When a LOGSTAT shows water at "GREEN" but Company A reports 40% and Company B reports 70%, what is the FIRST action?',
    choices: [
      { text: 'Trust the LOGSTAT and continue', correct: false, explanation: 'The LOGSTAT may not reflect changed conditions. Never trust a tracker over ground truth.' },
      { text: 'Verify personnel count — the planning base may have changed', correct: true, explanation: 'Changed personnel numbers are the most common reason a LOGSTAT diverges from unit reports. Verify the base number first.' },
      { text: 'Order an emergency resupply immediately', correct: false, explanation: 'Without verifying the cause, you may order unnecessary resupply or miss the real problem.' },
      { text: 'Brief the commander that water is green', correct: false, explanation: 'Briefing a potentially wrong status is worse than saying "I\'m verifying."' },
    ],
    teachingPoint: 'LOGSTAT is not self-interpreting. A green tracker can hide changed assumptions. Verify the base number before acting on the status.',
  },
  // Doctrine
  {
    id: 'doc_1', category: 'DOCTRINE', difficulty: 'medium',
    question: 'What does CCIR stand for, and who approves it?',
    choices: [
      { text: 'Critical Combat Intelligence Requirements — approved by S2', correct: false, explanation: 'CCIR is not just intelligence, and it is not approved by S2.' },
      { text: 'Commander\'s Critical Information Requirements — approved by the Commander', correct: true, explanation: 'CCIR is approved by the commander and includes FFIR and PIR. Only the commander can approve CCIR.' },
      { text: 'Combined Command Intelligence Report — approved by the XO', correct: false, explanation: 'CCIR is not a report and is not approved by the XO.' },
      { text: 'Critical Combat Information Report — approved by the S3', correct: false, explanation: 'CCIR is not a report and is not approved by the S3.' },
    ],
    teachingPoint: 'CCIR belongs to the commander. The staff recommends; the commander approves. CCIR drives information collection and reporting priorities.',
  },
  {
    id: 'doc_2', category: 'DOCTRINE', difficulty: 'hard',
    question: 'In the OPORD format, where does the LOGPAC SP time appear?',
    choices: [
      { text: 'Paragraph 4 — Sustainment', correct: false, explanation: 'Sustainment contains logistics arrangements, not specific execution timing.' },
      { text: 'Paragraph 3 — Execution', correct: true, explanation: 'SP times and movement timelines are execution details that belong in Paragraph 3.' },
      { text: 'Paragraph 5 — Command and Signal', correct: false, explanation: 'Command and Signal covers command relationships and communications, not movement timing.' },
      { text: 'Paragraph 1 — Situation', correct: false, explanation: 'Situation covers enemy and friendly forces, not execution details.' },
    ],
    teachingPoint: 'Know your OPORD paragraphs: 1-Situation, 2-Mission, 3-Execution, 4-Sustainment, 5-Command & Signal. Put information where subordinates will look for it.',
  },
  {
    id: 'doc_3', category: 'DOCTRINE', difficulty: 'hard',
    question: 'The LOGSTAT reporting interval during active operations is typically:',
    choices: [
      { text: 'Every 24 hours', correct: false, explanation: 'Daily reporting is insufficient during active operations.' },
      { text: 'Every 6 hours', correct: true, explanation: 'Standard LOGSTAT reporting during operations is every 6 hours (or as directed by higher HQ).' },
      { text: 'Every 12 hours', correct: false, explanation: 'Twelve-hour intervals may miss critical changes during active operations.' },
      { text: 'Only when status changes', correct: false, explanation: 'Status-change-only reporting creates gaps. Regular intervals ensure continuous situational awareness.' },
    ],
    teachingPoint: 'Regular LOGSTAT reporting is not administrative overhead — it is how the commander maintains sustainment situational awareness.',
  },
  {
    id: 'doc_4', category: 'DOCTRINE', difficulty: 'expert',
    question: 'What is the PRIMARY difference between a WARNO and a FRAGORD?',
    choices: [
      { text: 'WARNOs are longer and more detailed than FRAGORDs', correct: false, explanation: 'Length is not the distinguishing factor.' },
      { text: 'A WARNO provides early warning before a complete order; a FRAGORD modifies an existing order', correct: true, explanation: 'WARNOs buy planning time before the full OPORD. FRAGORDs change specific elements of an existing OPORD.' },
      { text: 'FRAGORDs are only issued by higher headquarters', correct: false, explanation: 'Any echelon can issue a FRAGORD to modify their own orders.' },
      { text: 'WARNOs are classified; FRAGORDs are not', correct: false, explanation: 'Classification is based on content, not the type of order.' },
    ],
    teachingPoint: 'Issue WARNOs early to buy time. Issue FRAGORDs precisely to change only what changed. Both are tools for maintaining tempo.',
  },
  // Advanced MDMP
  {
    id: 'mdmp_6', category: 'MDMP', difficulty: 'hard',
    question: 'Which of the following is NOT a characteristic of a valid COA?',
    choices: [
      { text: 'Suitable — accomplishes the mission', correct: false, explanation: 'Suitable is a required COA characteristic.' },
      { text: 'Feasible — within available resources', correct: false, explanation: 'Feasible is a required COA characteristic.' },
      { text: 'Optimal — the single best possible option', correct: true, explanation: 'COAs must be suitable, feasible, acceptable, distinguishable, and complete. "Optimal" is not a required characteristic — that is determined during wargaming.' },
      { text: 'Distinguishable — clearly different from other COAs', correct: false, explanation: 'Distinguishable is a required COA characteristic.' },
    ],
    teachingPoint: 'The five COA criteria are: Suitable, Feasible, Acceptable, Distinguishable, Complete. Optimal is a judgment made during comparison, not a screening criterion.',
  },
  {
    id: 'mdmp_7', category: 'MDMP', difficulty: 'expert',
    question: 'During COA Comparison (Step 5), the staff uses a weighted decision matrix. What is the MOST important rule?',
    choices: [
      { text: 'The COA with the most green boxes always wins', correct: false, explanation: 'Weighted scores matter more than raw counts. A critical criterion with high weight can override multiple minor criteria.' },
      { text: 'Criteria weights must reflect commander priorities, not staff preferences', correct: true, explanation: 'The matrix is only as good as its criteria weights. Weights must come from the commander\'s guidance and mission priorities.' },
      { text: 'All criteria should receive equal weight for fairness', correct: false, explanation: 'Equal weighting ignores the commander\'s priorities. Some criteria matter more than others.' },
      { text: 'The XO should assign weights without input from the staff', correct: false, explanation: 'Criteria and weights should reflect the commander\'s guidance and staff analysis.' },
    ],
    teachingPoint: 'A decision matrix is only as useful as its criteria weights. If the weights do not reflect commander priorities, the matrix produces a meaningless result.',
  },
  {
    id: 'mdmp_8', category: 'MDMP', difficulty: 'hard',
    question: 'The WARNO should be issued:',
    choices: [
      { text: 'After Mission Analysis is complete', correct: false, explanation: 'Waiting for MA completion wastes subordinate planning time.' },
      { text: 'Immediately upon receipt of mission — even if incomplete', correct: true, explanation: 'Issue the WARNO immediately to buy subordinate planning time. An incomplete WARNO is better than no WARNO.' },
      { text: 'Only when the commander approves the restated mission', correct: false, explanation: 'That is too late. Subordinates need time to plan.' },
      { text: 'After the OPORD is drafted', correct: false, explanation: 'This defeats the entire purpose of a WARNO.' },
    ],
    teachingPoint: 'Issue WARNOs early and often. An imperfect WARNO issued immediately is worth more than a perfect WARNO issued late.',
  },
  {
    id: 'mdmp_9', category: 'MDMP', difficulty: 'expert',
    question: 'METT-TC stands for:',
    choices: [
      { text: 'Mission, Enemy, Terrain & Weather, Troops & Support, Time, Civil Considerations', correct: true, explanation: 'METT-TC is the framework for mission analysis. All six factors must be analyzed.' },
      { text: 'Mission, Equipment, Terrain, Troops, Timeline, Coordination', correct: false, explanation: 'Incorrect expansion. Enemy, Weather, and Civil Considerations are all missing.' },
      { text: 'Mission, Enemy, Tactics, Terrain, Time, Command', correct: false, explanation: 'Incorrect expansion. Weather, Troops & Support, and Civil Considerations are missing.' },
      { text: 'Mission, Environment, Terrain, Troops, Time, Communications', correct: false, explanation: 'Incorrect expansion. Enemy and Civil Considerations are missing.' },
    ],
    teachingPoint: 'METT-TC is the foundation of mission analysis. Every factor must be considered — skipping Civil Considerations is a common mistake in sustainment planning.',
  },
  // Advanced Staff Roles
  {
    id: 'roles_6', category: 'STAFF ROLES', difficulty: 'hard',
    question: 'The S3 section\'s PRIMARY contribution to a sustainment plan is:',
    choices: [
      { text: 'Calculating fuel requirements for the convoy', correct: false, explanation: 'Fuel calculations are an SPO/S4 function.' },
      { text: 'Providing the operational timeline and task organization that drives sustainment timing', correct: true, explanation: 'S3 owns the operational timeline. Sustainment must be synchronized to the operational plan — SP times, phase lines, and task organization all come from S3.' },
      { text: 'Writing the sustainment annex', correct: false, explanation: 'The sustainment annex is an S4/SPO product.' },
      { text: 'Managing personnel accountability', correct: false, explanation: 'Personnel accountability is an S1 function.' },
    ],
    teachingPoint: 'S3 drives the operational timeline that sustainment must support. The SPO must synchronize with S3 to ensure logistics arrive when and where the operation needs them.',
  },
  {
    id: 'roles_7', category: 'STAFF ROLES', difficulty: 'medium',
    question: 'Which staff section is responsible for the LOGSTAT?',
    choices: [
      { text: 'S1', correct: false, explanation: 'S1 owns personnel reporting (PERSTAT), not logistics status.' },
      { text: 'S2', correct: false, explanation: 'S2 owns intelligence reporting.' },
      { text: 'S4 and SPO', correct: true, explanation: 'The LOGSTAT is a logistics status report managed by S4 and SPO, showing supply levels by class of supply.' },
      { text: 'S6', correct: false, explanation: 'S6 owns communications status.' },
    ],
    teachingPoint: 'The LOGSTAT is the primary tool for sustainment situational awareness. S4 and SPO own it, but every staff section contributes data to it.',
  },
  {
    id: 'roles_8', category: 'STAFF ROLES', difficulty: 'expert',
    question: 'A "running estimate" is best described as:',
    choices: [
      { text: 'A spreadsheet tracking current supply levels', correct: false, explanation: 'A supply tracker is a tool, not a running estimate.' },
      { text: 'A staff section\'s continuous assessment of the situation in their functional area', correct: true, explanation: 'A running estimate is the staff section\'s current understanding of the situation, relevant facts, assumptions, and recommendations in their area of responsibility.' },
      { text: 'A daily status report submitted to higher headquarters', correct: false, explanation: 'A running estimate is internal to the staff, not a report to higher.' },
      { text: 'A list of all current tasks and their completion status', correct: false, explanation: 'That describes a task tracker, not a running estimate.' },
    ],
    teachingPoint: 'Every staff section maintains a running estimate. It is not a tracker — it is the section\'s current understanding of what matters and what the commander needs to know.',
  },
  // Advanced SPO Calculations
  {
    id: 'spo_6', category: 'SPO CALCULATIONS', difficulty: 'hard',
    question: 'A convoy has 4 PLS (8 pallets each) and 2 LMTV (2 pallets each). Total cargo is 38 pallets. How many trips are required?',
    choices: [
      { text: '1 trip', correct: false, explanation: 'Total capacity is 36 pallets (4×8 + 2×2). 38 > 36, so one trip is insufficient.' },
      { text: '2 trips', correct: true, explanation: 'Total capacity per lift = 4×8 + 2×2 = 36 pallets. 38 pallets ÷ 36 = 1.06 → round up = 2 trips.' },
      { text: '3 trips', correct: false, explanation: '2 trips is sufficient. 36 + 36 = 72 pallet capacity for 38 pallets.' },
      { text: 'Cannot be determined', correct: false, explanation: 'The math is straightforward: total pallets ÷ capacity per lift, rounded up.' },
    ],
    teachingPoint: 'Lift feasibility = total cargo pallets ÷ vehicle capacity per lift, rounded up. Always check if one lift is sufficient before planning multiple trips.',
  },
  {
    id: 'spo_7', category: 'SPO CALCULATIONS', difficulty: 'expert',
    question: 'The standard ammo reserve percentage for Army planning is:',
    choices: [
      { text: '20%', correct: false, explanation: '20% is the fuel reserve standard.' },
      { text: '15%', correct: false, explanation: '15% is the water reserve standard.' },
      { text: '10%', correct: true, explanation: 'Standard ammo reserve is 10%. Remember: Fuel=20%, Water=15%, Ammo=10%.' },
      { text: '25%', correct: false, explanation: '25% exceeds the standard ammo reserve.' },
    ],
    teachingPoint: 'Reserve percentages by class: Fuel (Class III) = 20%, Water = 15%, Ammo (Class V) = 10%. Know these cold — they appear on every sustainment calculation.',
  },
  {
    id: 'spo_8', category: 'SPO CALCULATIONS', difficulty: 'hard',
    question: 'When a FRAGORD increases the operation by 2 days, what is the FIRST calculation to update?',
    choices: [
      { text: 'Fuel requirements', correct: false, explanation: 'Fuel is driven by distance and trips, not duration. Check if additional convoys are needed.' },
      { text: 'Class I (meals) and water — both are duration-dependent', correct: true, explanation: 'Class I and water are calculated as personnel × rate × days. An extension immediately changes both requirements.' },
      { text: 'Ammo requirements', correct: false, explanation: 'Ammo is based on weapons and rates, not duration directly.' },
      { text: 'Driver availability', correct: false, explanation: 'Driver availability is a capacity constraint, not a duration-dependent calculation.' },
    ],
    teachingPoint: 'Duration changes drive Class I and water recalculations immediately. Personnel × rate × days — when days change, the math changes.',
  },
  {
    id: 'spo_9', category: 'SPO CALCULATIONS', difficulty: 'expert',
    question: 'A PLS truck gets 6 MPG. For a 47-mile one-way route with 2 trips, what is the fuel for ONE PLS?',
    choices: [
      { text: '15.7 gallons', correct: false, explanation: 'Check your calculation: RT = 94 miles, × 2 trips = 188 vehicle-miles.' },
      { text: '31.3 gallons', correct: true, explanation: 'RT = 47×2 = 94 miles. Vehicle-miles = 94×2 trips = 188. Fuel = 188÷6 = 31.3 gallons.' },
      { text: '47 gallons', correct: false, explanation: 'This uses one-way distance without accounting for round-trip and MPG.' },
      { text: '62.7 gallons', correct: false, explanation: 'Check your MPG divisor.' },
    ],
    teachingPoint: 'Fuel formula: (One-way × 2) × trips ÷ MPG. Always calculate round-trip distance first, then multiply by trips, then divide by MPG.',
  },
  // Convoy Operations
  {
    id: 'convoy_1', category: 'CONVOY OPS', difficulty: 'medium',
    question: 'Before a convoy departs, the convoy commander must complete:',
    choices: [
      { text: 'A PowerPoint briefing to higher headquarters', correct: false, explanation: 'Slides do not replace pre-combat checks.' },
      { text: 'Pre-Combat Checks and Pre-Combat Inspections (PCC/PCI)', correct: true, explanation: 'PCC/PCI ensures all personnel, equipment, and communications are ready before SP.' },
      { text: 'A full MDMP cycle', correct: false, explanation: 'MDMP is for deliberate planning, not pre-departure checks.' },
      { text: 'A LOGSTAT submission', correct: false, explanation: 'LOGSTAT is submitted during operations, not before departure.' },
    ],
    teachingPoint: 'PCC/PCI before SP prevents avoidable failure. The road is a terrible place to discover missing equipment.',
  },
  {
    id: 'convoy_2', category: 'CONVOY OPS', difficulty: 'hard',
    question: 'When one vehicle goes NMC and reduces convoy capacity, the CORRECT action is:',
    choices: [
      { text: 'Overload remaining vehicles to maintain the original load plan', correct: false, explanation: 'Overloading violates safety and capacity limits. Capacity limits are not suggestions.' },
      { text: 'Cancel the convoy and request a new mission', correct: false, explanation: 'Canceling creates mission risk. Manage the constraint, do not eliminate the mission.' },
      { text: 'Prioritize by priority of support, brief the shortfall, and adjust the load plan', correct: true, explanation: 'Priority of support drives load decisions under constraint. Brief the commander on what changed.' },
      { text: 'Wait until the vehicle is repaired before departing', correct: false, explanation: 'Waiting may miss the delivery window. Manage the constraint.' },
    ],
    teachingPoint: 'Risk management is not risk avoidance. When capacity drops, prioritize, adjust, and brief the shortfall. Do not cancel the mission.',
  },
  {
    id: 'convoy_3', category: 'CONVOY OPS', difficulty: 'hard',
    question: 'The convoy commander receives a route closure warning 30 minutes before SP. What is the CORRECT sequence of actions?',
    choices: [
      { text: 'Delay SP, notify supported unit, activate alternate route from PACE plan, brief commander', correct: true, explanation: 'This sequence manages the constraint, maintains communication, and uses the existing PACE plan.' },
      { text: 'Proceed on original route and hope the closure is resolved', correct: false, explanation: 'Hoping is not a planning method. Activate the alternate route.' },
      { text: 'Cancel the mission and report the route closure to higher', correct: false, explanation: 'Canceling is a last resort. The PACE plan exists precisely for this situation.' },
      { text: 'Request a new route from higher headquarters before doing anything else', correct: false, explanation: 'You already have an alternate route in your PACE plan. Use it.' },
    ],
    teachingPoint: 'The PACE plan is not a planning exercise — it is a decision tool. When the primary fails, activate the alternate immediately.',
  },
  {
    id: 'convoy_4', category: 'CONVOY OPS', difficulty: 'expert',
    question: 'Priority of support in a LOGPAC determines:',
    choices: [
      { text: 'Which vehicles depart first', correct: false, explanation: 'Departure sequence is a movement control issue, not priority of support.' },
      { text: 'Which units receive supplies first when capacity is constrained', correct: true, explanation: 'Priority of support establishes which units receive sustainment first when the total requirement exceeds capacity.' },
      { text: 'How much fuel each vehicle carries', correct: false, explanation: 'Fuel load is a vehicle capacity and safety issue, not priority of support.' },
      { text: 'The order in which vehicles are loaded at the LSA', correct: false, explanation: 'Loading order is a logistics planning detail, not priority of support.' },
    ],
    teachingPoint: 'Priority of support is the commander\'s decision on who gets sustainment first when you cannot support everyone simultaneously. It must be established before the LOGPAC departs.',
  },
  // OPORD and Doctrine
  {
    id: 'opord_1', category: 'DOCTRINE', difficulty: 'medium',
    question: 'In a standard OPORD, the sustainment annex belongs in which paragraph?',
    choices: [
      { text: 'Paragraph 3 — Execution', correct: false, explanation: 'Execution covers tasks and timelines. Sustainment details go in Paragraph 4.' },
      { text: 'Paragraph 4 — Sustainment', correct: true, explanation: 'Paragraph 4 contains all sustainment information: logistics, medical, personnel services, and financial management.' },
      { text: 'Paragraph 5 — Command and Signal', correct: false, explanation: 'Command and Signal covers command relationships and communications.' },
      { text: 'Paragraph 1 — Situation', correct: false, explanation: 'Situation covers enemy and friendly forces, not sustainment details.' },
    ],
    teachingPoint: 'Know your OPORD paragraphs: 1-Situation, 2-Mission, 3-Execution, 4-Sustainment, 5-Command & Signal. Sustainment always goes in Paragraph 4.',
  },
  {
    id: 'opord_2', category: 'DOCTRINE', difficulty: 'hard',
    question: 'FFIR (Friendly Force Information Requirements) are a component of:',
    choices: [
      { text: 'PIR (Priority Intelligence Requirements)', correct: false, explanation: 'PIR focuses on enemy and threat information, not friendly forces.' },
      { text: 'CCIR (Commander\'s Critical Information Requirements)', correct: true, explanation: 'CCIR includes both PIR (enemy-focused) and FFIR (friendly-focused). Both are approved by the commander.' },
      { text: 'LOGSTAT (Logistics Status Report)', correct: false, explanation: 'LOGSTAT is a sustainment reporting tool, not an information requirements framework.' },
      { text: 'PERSTAT (Personnel Status Report)', correct: false, explanation: 'PERSTAT is a personnel reporting tool, not an information requirements framework.' },
    ],
    teachingPoint: 'CCIR = PIR + FFIR. PIR focuses on enemy information; FFIR focuses on friendly force information. Both are commander-approved and drive staff reporting priorities.',
  },
  {
    id: 'opord_3', category: 'DOCTRINE', difficulty: 'expert',
    question: 'A "decision point" in the wargame is:',
    choices: [
      { text: 'When the commander decides to approve the OPORD', correct: false, explanation: 'OPORD approval is a planning milestone, not a decision point in the wargame sense.' },
      { text: 'A point in time and/or space where the commander must make a decision to achieve a desired outcome', correct: true, explanation: 'Decision points are identified during wargaming and trigger branch plans or sequel plans.' },
      { text: 'When the staff votes on which COA to recommend', correct: false, explanation: 'The staff does not vote. The commander decides based on staff analysis and recommendation.' },
      { text: 'The moment a subordinate unit reports mission complete', correct: false, explanation: 'Mission completion is a reporting event, not a decision point in the planning sense.' },
    ],
    teachingPoint: 'Decision points are identified during wargaming. They tell the commander: "At this time and place, you must decide X." Good wargaming produces actionable decision points.',
  },
  // Sustainment Operations
  {
    id: 'sust_1', category: 'SUSTAINMENT', difficulty: 'medium',
    question: 'The three principles of sustainment operations are:',
    choices: [
      { text: 'Speed, Accuracy, and Economy', correct: false, explanation: 'These are desirable qualities but not the doctrinal principles.' },
      { text: 'Integration, Anticipation, and Responsiveness', correct: false, explanation: 'These are sustainment characteristics, not the three core principles.' },
      { text: 'Continuity, Improvisation, and Economy', correct: false, explanation: 'Improvisation is not a doctrinal sustainment principle.' },
      { text: 'Integration, Anticipation, Responsiveness, Simplicity, Economy, Survivability, Flexibility, Attainability, Sustainability', correct: true, explanation: 'These are the nine principles of sustainment from ADP 4-0. Know them.' },
    ],
    teachingPoint: 'The nine principles of sustainment (ADP 4-0): Integration, Anticipation, Responsiveness, Simplicity, Economy, Survivability, Flexibility, Attainability, Sustainability.',
  },
  {
    id: 'sust_2', category: 'SUSTAINMENT', difficulty: 'hard',
    question: 'The CSSB (Combat Sustainment Support Battalion) primarily supports:',
    choices: [
      { text: 'Brigade Combat Teams directly', correct: false, explanation: 'The BSB (Brigade Support Battalion) directly supports BCTs. The CSSB operates at a higher echelon.' },
      { text: 'Division and Corps-level sustainment operations', correct: true, explanation: 'The CSSB provides general support to multiple supported units, typically operating under an ESC or Sustainment Brigade.' },
      { text: 'Only Class V (ammunition) distribution', correct: false, explanation: 'The CSSB provides multi-class sustainment, not just ammunition.' },
      { text: 'Only maintenance operations', correct: false, explanation: 'The CSSB provides distribution, maintenance, and other sustainment functions.' },
    ],
    teachingPoint: 'The CSSB is a multi-functional sustainment unit. The 495 CSSB supports multiple customers and must prioritize support based on commander guidance.',
  },
  {
    id: 'sust_3', category: 'SUSTAINMENT', difficulty: 'expert',
    question: 'The "pacing item" in sustainment planning is:',
    choices: [
      { text: 'The most expensive commodity', correct: false, explanation: 'Cost is not the criterion for pacing item designation.' },
      { text: 'The commodity that most constrains the operation if it runs out', correct: true, explanation: 'The pacing item is the commodity whose shortage would most severely impact the operation. Often water or fuel.' },
      { text: 'The commodity that requires the most vehicles to transport', correct: false, explanation: 'Transportation requirement is a planning factor, not the pacing item criterion.' },
      { text: 'Always Class III (fuel)', correct: false, explanation: 'The pacing item depends on the operation. Water is often the pacing item for dismounted operations.' },
    ],
    teachingPoint: 'Identify the pacing item early. Plan it first. Verify it continuously. The pacing item is what breaks the operation if it fails.',
  },
];

// ─── Daily Challenge Questions ────────────────────────────────────────────────

export const DAILY_CHALLENGES: QuizQuestion[] = [
  {
    id: 'daily_1', category: 'DAILY', difficulty: 'hard',
    question: 'A battalion of 650 soldiers conducts a 4-day operation. Water rate is 3.5 gallons/soldier/day with 15% reserve. How many gallons of water are required?',
    choices: [
      { text: '10,465 gallons', correct: true, explanation: '650 × 3.5 × 4 = 9,100 base. 9,100 × 1.15 = 10,465 gallons.' },
      { text: '9,100 gallons', correct: false, explanation: 'This is the base requirement without the 15% reserve.' },
      { text: '10,920 gallons', correct: false, explanation: 'This uses a 20% reserve instead of 15%.' },
      { text: '8,190 gallons', correct: false, explanation: 'This uses a 3 gal/day rate instead of 3.5.' },
    ],
    teachingPoint: 'Always apply the reserve AFTER calculating the base requirement. 650 × 3.5 × 4 × 1.15 = 10,465.',
  },
  {
    id: 'daily_2', category: 'DAILY', difficulty: 'expert',
    question: 'A PLS gets 6 MPG. An LMTV gets 8 MPG. A HMMWV gets 12 MPG. For a 52-mile one-way route with 2 trips, what is the TOTAL base fuel for 3 PLS, 2 LMTV, and 1 HMMWV?',
    choices: [
      { text: '156 gallons', correct: false, explanation: 'Check your vehicle miles calculation.' },
      { text: '174 gallons', correct: true, explanation: 'RT=104mi. PLS: 3×104×2÷6=104gal. LMTV: 2×104×2÷8=52gal. HMMWV: 1×104×2÷12≈17.3gal. Total≈173.3→174.' },
      { text: '192 gallons', correct: false, explanation: 'Check your MPG values.' },
      { text: '208 gallons', correct: false, explanation: 'This does not account for different vehicle MPG rates.' },
    ],
    teachingPoint: 'Calculate each vehicle type separately. Vehicle miles ÷ MPG = gallons. Sum all vehicles for total base fuel.',
  },
  {
    id: 'daily_3', category: 'DAILY', difficulty: 'hard',
    question: '3 PLS at 6 MPG, 2 LMTV at 8 MPG, 1 HMMWV at 12 MPG. One-way route: 42 miles. 1 trip. Add 20% reserve. Total fuel?',
    choices: [
      { text: '84 gallons', correct: true, explanation: 'RT=84mi. PLS: 3×84÷6=42gal. LMTV: 2×84÷8=21gal. HMMWV: 84÷12=7gal. Base=70. ⌈70×1.20⌉=84 gallons.' },
      { text: '70 gallons', correct: false, explanation: 'This is the base without the 20% reserve.' },
      { text: '99 gallons', correct: false, explanation: 'Check your MPG values.' },
      { text: '112 gallons', correct: false, explanation: 'Check your vehicle count.' },
    ],
    teachingPoint: 'RT=84. PLS: 3×84÷6=42. LMTV: 2×84÷8=21. HMMWV: 84÷12=7. Base=70. With 20% reserve: ⌈70×1.20⌉=84 gallons.',
  },
  {
    id: 'daily_4', category: 'DAILY', difficulty: 'expert',
    question: 'Mission extended by 2 days. Original: 580 soldiers, 3 days, 3 meals/day, 12 meals/case, 48 cases/pallet, 15% reserve. How many pallets for the 2-day extension ONLY?',
    choices: [
      { text: '3 pallets', correct: false, explanation: 'Recalculate for 2 additional days only.' },
      { text: '7 pallets', correct: true, explanation: '580×3×2=3480 meals. ⌈3480÷12⌉=290 cases. ⌈290×1.15⌉=334 cases. ⌈334÷48⌉=7 pallets.' },
      { text: '11 pallets', correct: false, explanation: 'This is the total for the original 3-day plan.' },
      { text: '4 pallets', correct: false, explanation: 'Check your packaging math.' },
    ],
    teachingPoint: 'For a FRAGORD extension, calculate only the additional days. 580×3×2=3480 meals → 290 cases → 334 with reserve → 7 pallets.',
  },
  {
    id: 'daily_5', category: 'DAILY', difficulty: 'hard',
    question: 'Which OPORD paragraph contains the CASEVAC plan?',
    choices: [
      { text: 'Paragraph 3 — Execution', correct: false, explanation: 'Execution contains tasks and timelines, not medical plans.' },
      { text: 'Paragraph 4 — Sustainment', correct: true, explanation: 'CASEVAC is a medical sustainment function and belongs in Paragraph 4.' },
      { text: 'Paragraph 5 — Command and Signal', correct: false, explanation: 'Command and Signal covers command relationships and communications.' },
      { text: 'Paragraph 1 — Situation', correct: false, explanation: 'Situation covers enemy and friendly forces.' },
    ],
    teachingPoint: 'Medical support, including CASEVAC, belongs in Paragraph 4 — Sustainment. Know where subordinates will look for this information.',
  },
  {
    id: 'daily_6', category: 'DAILY', difficulty: 'expert',
    question: 'A LOGSTAT shows Class III at 45% for Company A and 80% for Company B, but overall status shows GREEN. Most likely cause?',
    choices: [
      { text: 'The LOGSTAT formula is broken', correct: false, explanation: 'A formula error is possible but not the most likely cause.' },
      { text: 'The overall status uses an outdated personnel base', correct: true, explanation: 'If the planning base has changed, the overall percentage can be misleading. Always verify the base number.' },
      { text: 'Company A is misreporting', correct: false, explanation: 'Assuming dishonesty before verifying data is poor staff work.' },
      { text: 'The GREEN threshold is set too low', correct: false, explanation: 'Threshold settings are a factor, but the most common cause is a changed planning base.' },
    ],
    teachingPoint: 'A LOGSTAT is only as accurate as its planning base. When unit reports diverge from the overall status, verify the personnel count first.',
  },
  {
    id: 'daily_7', category: 'DAILY', difficulty: 'hard',
    question: 'Mission received at 0800. H-hour is 2000. Applying the 1/3 - 2/3 rule, how many hours do subordinates receive?',
    choices: [
      { text: '4 hours', correct: false, explanation: '4 hours is 1/3 of 12. That is what higher keeps.' },
      { text: '6 hours', correct: false, explanation: 'Check your math. Total available = 12 hours.' },
      { text: '8 hours', correct: true, explanation: 'Total = 12 hours. Higher keeps 1/3 = 4 hours. Subordinates get 2/3 = 8 hours.' },
      { text: '12 hours', correct: false, explanation: '12 hours is the total available time, not the subordinate share.' },
    ],
    teachingPoint: '2000 - 0800 = 12 hours total. Higher keeps 1/3 (4 hours). Subordinates receive 2/3 (8 hours). Protect subordinate planning time.',
  },
  {
    id: 'daily_8', category: 'DAILY', difficulty: 'hard',
    question: 'What does PACE stand for in communications planning?',
    choices: [
      { text: 'Primary, Alternate, Contingency, Emergency', correct: true, explanation: 'PACE is the communications planning framework. Each method must be genuinely independent.' },
      { text: 'Primary, Alternate, Communications, Emergency', correct: false, explanation: 'The C in PACE is Contingency, not Communications.' },
      { text: 'Planned, Alternate, Contingency, Emergency', correct: false, explanation: 'The P in PACE is Primary, not Planned.' },
      { text: 'Primary, Auxiliary, Contingency, Emergency', correct: false, explanation: 'The A in PACE is Alternate, not Auxiliary.' },
    ],
    teachingPoint: 'PACE = Primary, Alternate, Contingency, Emergency. Each method must be independent. A PACE plan where all methods share infrastructure is not a PACE plan.',
  },
  {
    id: 'daily_9', category: 'DAILY', difficulty: 'expert',
    question: '420 M4 shooters × 40 rounds + 80 M249 × 120 rounds + 10% reserve. Total rounds required?',
    choices: [
      { text: '26,400 rounds', correct: false, explanation: 'This is the base without reserve.' },
      { text: '29,040 rounds', correct: true, explanation: 'M4: 420×40=16,800. M249: 80×120=9,600. Base=26,400. ×1.10=29,040.' },
      { text: '27,720 rounds', correct: false, explanation: 'Check your reserve calculation.' },
      { text: '30,800 rounds', correct: false, explanation: 'Check your base calculation.' },
    ],
    teachingPoint: 'M4: 420×40=16,800. M249: 80×120=9,600. Base=26,400. With 10% reserve: 26,400×1.10=29,040 rounds total.',
  },
  {
    id: 'daily_10', category: 'DAILY', difficulty: 'hard',
    question: 'A FRAGORD changes the route from Route Moose to Route Elk (different distance). Minimum update required?',
    choices: [
      { text: 'Recalculate all commodity requirements from scratch', correct: false, explanation: 'Commodity requirements do not change with a route change.' },
      { text: 'Recalculate fuel requirements using the new route distance', correct: true, explanation: 'Fuel is distance-dependent. New route = new distance = new fuel calculations.' },
      { text: 'Issue a new OPORD', correct: false, explanation: 'A FRAGORD modifies only what changed.' },
      { text: 'No update required', correct: false, explanation: 'Route changes affect fuel calculations and potentially timing.' },
    ],
    teachingPoint: 'A route change requires fuel recalculation. Distance changes → vehicle-miles change → fuel changes. Class I, water, and ammo are not distance-dependent.',
  },
  {
    id: 'daily_11', category: 'DAILY', difficulty: 'expert',
    question: 'Which staff section owns the intelligence running estimate and conducts IPB?',
    choices: [
      { text: 'S1', correct: false, explanation: 'S1 owns the personnel running estimate.' },
      { text: 'S2', correct: true, explanation: 'S2 owns the intelligence running estimate and conducts Intelligence Preparation of the Battlefield (IPB).' },
      { text: 'S3', correct: false, explanation: 'S3 owns the operations running estimate.' },
      { text: 'S4', correct: false, explanation: 'S4 owns the logistics running estimate.' },
    ],
    teachingPoint: 'S2 owns IPB and the intelligence running estimate. S2 analysis of weather, terrain, and threat directly impacts sustainment route and timing decisions.',
  },
  {
    id: 'daily_12', category: 'DAILY', difficulty: 'hard',
    question: 'A convoy has 3 PLS (8 pallets each). Total cargo is 20 pallets. How many trips and what is the spare capacity on the last trip?',
    choices: [
      { text: '1 trip, 4 pallets spare', correct: true, explanation: '3 PLS × 8 = 24 pallet capacity. 20 cargo. One trip sufficient. 24 - 20 = 4 pallets spare.' },
      { text: '2 trips, 4 pallets spare', correct: false, explanation: 'One trip is sufficient: 24 capacity > 20 cargo.' },
      { text: '1 trip, 8 pallets spare', correct: false, explanation: 'Spare capacity = 24 - 20 = 4, not 8.' },
      { text: '1 trip, 0 pallets spare', correct: false, explanation: '24 - 20 = 4 pallets spare.' },
    ],
    teachingPoint: '3 PLS × 8 = 24 capacity. 20 cargo. One trip, 4 pallets spare. Spare capacity is a risk buffer — one NMC vehicle still allows mission completion.',
  },
];

// ─── Base State ───────────────────────────────────────────────────────────────

export function defaultAvatar(): AvatarConfig {
  return {
    body: 'tan',
    hair: 'brown',
    hairStyle: 'short',
    face: 'focused',
    uniform: 'ocp',
    patch: 'cssb',
    backdrop: 'toc',
  };
}

export function generateChallengeCode() {
  const terrain = ['MOOSE', 'GRANITE', 'COYOTE', 'GLACIER', 'COPPER', 'TIMBER', 'BISON', 'ASPEN'];
  const action = ['LIFT', 'MARCH', 'PACK', 'FORGE', 'HAUL', 'SYNC', 'READY', 'SPUR'];
  const n = Math.floor(100 + Math.random() * 900);
  return `${terrain[Math.floor(Math.random() * terrain.length)]}-${action[Math.floor(Math.random() * action.length)]}-${n}`;
}

export function baseState(): GameState {
  return {
    screen: 'title',
    player: null,
    difficulty: 'walk',
    challenge: generateChallengeCode(),
    scenario: null,
    missionIndex: 0,
    stepIndex: 0,
    timeBank: 0,
    stats: { cmd: 55, clarity: 50, tempo: 50, coord: 50, readiness: 50, chaos: 24, focus: 50, morale: 55 },
    creds: 60,
    xp: 0,
    level: 1,
    streak: 0,
    inventory: { coffee: 1 },
    missions: {},
    scores: {},
    completed: {},
    notebook: [],
    badges: {},
    hall: {},
    clues: {},
    log: [],
    lastResult: null,
    rayCards: 0,
    mercyCards: 0,
    e4: false,
    secret: false,
    certViewed: false,
    redbull: 0,
    dailyDone: false,
    dailyDate: '',
    ttt: Array(9).fill(''),
    tttTurn: 'X',
    tttDone: false,
    chessStep: 0,
    loadmasterDone: false,
    roleWins: {},
    minigameScores: {},
    totalPlayTime: 0,
    sessionStart: Date.now(),
    questionPool: {},
    achievements: {},
    chaosMeter: 0,
    avatar: defaultAvatar(),
    activeCosmeticId: null,
    pptBossUnlocked: false,
    pptBossDefeated: false,
    candyCount: 0,
    storeItemsBought: [],
    bashDefeated: false,
    snedigarHits: 0,
    e4FavorUsed: false,
  };
}

export function loadState(): GameState {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return baseState();
    return { ...baseState(), ...JSON.parse(raw) };
  } catch {
    return baseState();
  }
}

export function saveState(s: GameState) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(s));
  } catch {}
}

// ─── Grade Logic ──────────────────────────────────────────────────────────────

export function grade(score: number, max: number): 'GOLD' | 'SILVER' | 'BRONZE' | 'FAILED' {
  const pct = max > 0 ? score / max : 0;
  if (pct >= 0.9) return 'GOLD';
  if (pct >= 0.75) return 'SILVER';
  if (pct >= 0.5) return 'BRONZE';
  return 'FAILED';
}

export function gradeColor(g: string) {
  if (g === 'GOLD') return 'gold';
  if (g === 'SILVER') return 'cyan';
  if (g === 'BRONZE') return 'orange';
  return 'red';
}

// ─── XP / Level ───────────────────────────────────────────────────────────────

export function xpForLevel(level: number) { return level * 200; }
export function levelFromXp(xp: number) {
  let l = 1;
  let total = 0;
  while (total + xpForLevel(l) <= xp) { total += xpForLevel(l); l++; }
  return l;
}

// ─── Reference Data ───────────────────────────────────────────────────────────

export const REF_SECTIONS = [
  {
    id: 'mdmp',
    title: 'MDMP — 7 Steps',
    icon: '🗺️',
    color: 'cyan',
    content: [
      { step: '1', name: 'Receipt of Mission', key: 'Issue initial WARNO. Apply 1/3-2/3 rule. Identify time constraints.', detail: 'The clock starts when you receive the mission. Your first action is to buy subordinate planning time by issuing a WARNO. Apply the 1/3-2/3 rule: higher HQ keeps 1/3 of available time, subordinates receive 2/3.' },
      { step: '2', name: 'Mission Analysis', key: 'Analyze METT-TC. Identify tasks. Develop restated mission.', detail: 'Mission Analysis produces the restated mission, initial commander\'s intent, planning guidance, and updated WARNO. Analyze METT-TC: Mission, Enemy, Terrain & Weather, Troops & Support Available, Time Available, Civil Considerations.' },
      { step: '3', name: 'COA Development', key: 'Develop 2-3 viable COAs. Each must be suitable, feasible, acceptable, distinguishable, complete.', detail: 'Each COA must be: Suitable (accomplishes mission), Feasible (within capabilities), Acceptable (risk vs. gain), Distinguishable (clearly different), Complete (who, what, when, where, why, how).' },
      { step: '4', name: 'COA Analysis (Wargame)', key: 'War-game each COA against most likely and most dangerous enemy COA.', detail: 'The wargame identifies strengths, weaknesses, and decision points for each COA. Use the action-reaction-counteraction method. Record results in a synchronization matrix.' },
      { step: '5', name: 'COA Comparison', key: 'Use decision criteria matrix. Staff recommends best COA.', detail: 'Compare COAs against evaluation criteria weighted by the commander. The staff recommends the best COA — it does not select it. The commander selects.' },
      { step: '6', name: 'COA Approval', key: 'Commander selects COA. Issues updated guidance. Staff refines plan.', detail: 'The commander approves a COA, modifies it, or directs further analysis. The staff then refines the selected COA into a complete plan.' },
      { step: '7', name: 'Orders Production', key: 'Produce OPORD. Issue to subordinates. Conduct rehearsal.', detail: 'The OPORD follows the 5-paragraph format: 1-Situation, 2-Mission, 3-Execution, 4-Sustainment, 5-Command & Signal. Issue in time for subordinates to plan and prepare.' },
    ],
  },
  {
    id: 'staff',
    title: 'Staff Sections',
    icon: '👥',
    color: 'purple',
    content: [
      { step: 'S1', name: 'Personnel', key: 'Strength reporting, casualty management, awards, HR services', detail: 'S1 owns all human resources functions. Critical outputs: PERSTAT (personnel status), casualty reports, strength numbers for planning. The base variable for all Class I and water calculations.' },
      { step: 'S2', name: 'Intelligence', key: 'IPB, threat analysis, weather, terrain, CCIR management', detail: 'S2 conducts Intelligence Preparation of the Battlefield (IPB). Provides weather, terrain, and threat analysis that directly impacts route selection, timing, and risk assessment.' },
      { step: 'S3', name: 'Operations', key: 'Operations planning, training management, battle rhythm, OPORD production', detail: 'S3 is the primary planning staff section. Owns the operations running estimate, battle rhythm, and OPORD production. The S3 synchronizes all staff sections during planning.' },
      { step: 'S4', name: 'Logistics', key: 'Supply, maintenance, transportation, Class I-IX planning', detail: 'S4 owns the logistics running estimate and coordinates all supply and maintenance. Works closely with SPO on commodity calculations and distribution planning.' },
      { step: 'S6', name: 'Signal', key: 'Communications, PACE planning, network management, JBC-P', detail: 'S6 owns all communications architecture. Critical product: PACE plan (Primary, Alternate, Contingency, Emergency). Each method must be genuinely independent.' },
      { step: 'SPO', name: 'Support Operations', key: 'Sustainment planning, commodity calculations, distribution coordination', detail: 'The SPO bridges the gap between what the commander needs and what logistics can provide. Owns all commodity calculations (Class I-IX), distribution planning, and LOGSTAT management.' },
    ],
  },
  {
    id: 'classes',
    title: 'Classes of Supply',
    icon: '📦',
    color: 'orange',
    content: [
      { step: 'I', name: 'Subsistence', key: 'Food and rations (MREs, UGRs, water)', detail: 'Planning rate: 3 meals/soldier/day. MRE case = 12 meals. Pallet = 48 cases. Water planning rate: 3 gal/soldier/day (field). Reserve: 15%. Always round up.' },
      { step: 'II', name: 'Clothing & Equipment', key: 'Clothing, tools, hand tools, OCIE', detail: 'Planned based on authorizations and shortages. Includes individual clothing, tools, and organizational equipment.' },
      { step: 'III', name: 'Petroleum', key: 'Fuel and lubricants (Class IIIB = bulk fuel)', detail: 'Fuel planning: Vehicle miles ÷ MPG = gallons. Add 20% reserve. PLS: 6 MPG. LMTV: 8 MPG. HMMWV: 12 MPG. Fueler: 7 MPG.' },
      { step: 'IV', name: 'Construction Materials', key: 'Barrier and construction materials', detail: 'Includes lumber, sandbags, concertina wire, and other construction materials. Planned based on engineer requirements.' },
      { step: 'V', name: 'Ammunition', key: 'All types of ammunition and explosives', detail: 'Separate by type: 5.56 loose ≠ 5.56 linked. Reserve: 10%. Know your DODAC. Packaging matters for transport and issue.' },
      { step: 'VI', name: 'Personal Demand Items', key: 'Hygiene, comfort items (AAFES)', detail: 'Soldier welfare items. Not a primary planning commodity but important for morale.' },
      { step: 'VII', name: 'Major End Items', key: 'Tanks, trucks, helicopters, weapons systems', detail: 'Tracked by serial number. Maintenance and replacement planned through S4 and SPO.' },
      { step: 'VIII', name: 'Medical Material', key: 'Medical supplies and equipment', detail: 'Planned by medical section. Includes pharmaceuticals, medical equipment, and blood products.' },
      { step: 'IX', name: 'Repair Parts', key: 'Maintenance parts and components', detail: 'Planned based on equipment density list and historical usage rates. Critical for maintaining FMC rates.' },
      { step: 'X', name: 'Non-Military Programs', key: 'Agricultural and economic development materials', detail: 'Used in stability operations. Includes seeds, fertilizer, and other non-military materials.' },
    ],
  },
  {
    id: 'opord',
    title: 'OPORD Format',
    icon: '📋',
    color: 'gold',
    content: [
      { step: '1', name: 'Situation', key: 'Enemy forces, friendly forces, attachments/detachments, civil considerations', detail: 'Paragraph 1 sets the context. Includes enemy COA (most likely and most dangerous), friendly forces (higher, adjacent, supporting), and attachments/detachments.' },
      { step: '2', name: 'Mission', key: 'Restated mission: Who, What, When, Where, Why (Purpose)', detail: 'The restated mission is a single sentence with no ambiguity. It answers: Who (unit), What (task), When (time), Where (location), Why (purpose).' },
      { step: '3', name: 'Execution', key: 'Commander\'s intent, concept of operations, tasks to subordinate units, coordinating instructions', detail: 'The largest paragraph. Contains commander\'s intent (purpose, method, endstate), concept of operations, tasks to each subordinate unit, and coordinating instructions including SP times and movement timelines.' },
      { step: '4', name: 'Sustainment', key: 'Logistics, personnel services, medical, Class I-IX arrangements', detail: 'Contains all sustainment arrangements: supply, maintenance, transportation, medical, and personnel services. LRP locations, LOGPAC schedules, and Class of Supply arrangements.' },
      { step: '5', name: 'Command and Signal', key: 'Command relationships, succession of command, PACE plan, frequencies', detail: 'Contains command relationships, succession of command, and all communications information including the PACE plan, frequencies, and call signs.' },
    ],
  },
  {
    id: 'pace',
    title: 'PACE Planning',
    icon: '📡',
    color: 'cyan',
    content: [
      { step: 'P', name: 'Primary', key: 'Best available method for the mission', detail: 'The primary method should be the most reliable and capable for the specific mission. Often FM radio for tactical operations.' },
      { step: 'A', name: 'Alternate', key: 'Different means, same capability', detail: 'Must be genuinely different from primary. If primary is FM, alternate might be JBC-P or SINCGARS on a different net.' },
      { step: 'C', name: 'Contingency', key: 'Available when both primary and alternate fail', detail: 'Must work independently of primary and alternate. Satellite phone, cell phone, or relay through another unit.' },
      { step: 'E', name: 'Emergency', key: 'Last resort — must always be available', detail: 'Must work when all else fails. Runner, pre-arranged check-in windows, or visual signals. Must be pre-coordinated and understood by all.' },
    ],
  },
];

// ─── Roles Quiz Data ──────────────────────────────────────────────────────────

export const ROLES_QUIZ = [
  { role: 'S1', emoji: '👥', color: 'purple', title: 'Personnel Officer', tasks: ['PERSTAT reporting', 'Casualty management', 'Awards processing', 'Personnel strength verification', 'HR services coordination'] },
  { role: 'S2', emoji: '🌧️', color: 'cyan', title: 'Intelligence Officer', tasks: ['IPB (Intelligence Preparation of Battlefield)', 'Weather analysis', 'Terrain analysis', 'Threat assessment', 'CCIR management'] },
  { role: 'S3', emoji: '🗺️', color: 'green', title: 'Operations Officer', tasks: ['OPORD production', 'Battle rhythm management', 'Training management', 'Operations running estimate', 'Staff synchronization'] },
  { role: 'S4', emoji: '🛠️', color: 'orange', title: 'Logistics Officer', tasks: ['Supply coordination', 'Maintenance management', 'Transportation planning', 'Logistics running estimate', 'Class I-IX coordination'] },
  { role: 'S6', emoji: '📡', color: 'cyan', title: 'Signal Officer', tasks: ['PACE plan development', 'Network management', 'JBC-P administration', 'Frequency management', 'Communications architecture'] },
  { role: 'SPO', emoji: '🚚', color: 'red', title: 'Support Operations Officer', tasks: ['Commodity calculations', 'Distribution planning', 'LOGSTAT management', 'Sustainment planning', 'Class of Supply coordination'] },
];
