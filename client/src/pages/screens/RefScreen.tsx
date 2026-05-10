import { useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import { ScreenWrap, SectionTitle, MilTag, Divider } from '../../components/GameUI';

// Design: Modern Military Command Dashboard — Reference Library
// Fonts: Rajdhani (headers) + IBM Plex Mono (numbers)

const REFS = [
  {
    id: 'mdmp', title: 'MDMP STEPS', color: 'gold', emoji: '📋', category: 'PLANNING',
    content: [
      { label: 'Step 1: Receipt of Mission', text: 'Receive the mission. Issue initial WARNO immediately. Conduct time analysis using the 1/3-2/3 rule. Identify planning timeline and key events.' },
      { label: 'Step 2: Mission Analysis', text: 'Analyze higher mission. Identify facts, assumptions, constraints, risks, and CCIR. Produce restated mission. Issue WARNO 2.' },
      { label: 'Step 3: COA Development', text: 'Develop at least two COAs. Each must be suitable, feasible, acceptable, distinguishable, and complete (SFADC). Develop COA sketches and narratives.' },
      { label: 'Step 4: COA Analysis (Wargame)', text: 'Wargame each COA against enemy COAs using action-reaction-counteraction. Identify advantages, disadvantages, decision points, and risk.' },
      { label: 'Step 5: COA Comparison', text: 'Compare COAs using evaluation criteria and weighted decision matrix. Identify recommended COA. Brief commander.' },
      { label: 'Step 6: COA Approval', text: 'Commander approves COA. Staff refines plan. Issue WARNO 3 with key decisions.' },
      { label: 'Step 7: Orders Production', text: 'Produce OPORD using 5-paragraph format. Assign tasks, coordinate support, and issue to subordinates with sufficient time to plan.' },
      { label: 'Key Principle', text: 'The MDMP is iterative, not linear. Steps can be revisited as the situation changes. The goal is a quality decision, not a perfect process.' },
    ],
  },
  {
    id: 'coa', title: 'COA CRITERIA', color: 'purple', emoji: '♟️', category: 'PLANNING',
    content: [
      { label: 'Suitable', text: 'The COA must accomplish the mission and comply with higher guidance. If it does not accomplish the mission, it is not suitable.' },
      { label: 'Feasible', text: 'The COA must be capable of accomplishment within the time, space, and resources available. If you cannot resource it, it is not feasible.' },
      { label: 'Acceptable', text: 'The COA must balance cost (risk, resources, time) against advantage gained. An unacceptable COA is one where the cost outweighs the benefit.' },
      { label: 'Distinguishable', text: 'Each COA must differ significantly from the others. COAs that are essentially the same provide no real choice to the commander.' },
      { label: 'Complete', text: 'The COA must incorporate all tasks to be accomplished. A COA that leaves out critical tasks is incomplete.' },
      { label: 'Weighted Matrix', text: 'Score = Σ(Criterion Score × Weight). Criteria typically include: speed, risk, flexibility, resource use, and sustainability.' },
    ],
  },
  {
    id: 'classes', title: 'CLASSES OF SUPPLY', color: 'green', emoji: '📦', category: 'SUSTAINMENT',
    content: [
      { label: 'Class I — Subsistence', text: 'Food and rations. MREs, A-rations, B-rations. Planning rate: 3 meals/Soldier/day. MRE case = 12 meals. Pallet = 48 cases. Reserve: 15%.' },
      { label: 'Class II — Clothing/Equipment', text: 'Clothing, individual equipment, tools, hand tools. Includes OCIE (Organizational Clothing and Individual Equipment).' },
      { label: 'Class III — POL', text: 'Petroleum, oils, lubricants. Class IIIB = bulk fuel (diesel, JP-8). Class IIIP = packaged POL (oil, grease). 20% reserve standard.' },
      { label: 'Class IV — Construction', text: 'Construction materials, barrier materials, sandbags, concertina wire, lumber. Typically requested by engineer.' },
      { label: 'Class V — Ammunition', text: 'All types of ammunition. Separate by type (loose vs linked). 10% reserve standard. DODAC codes identify ammo type and lot.' },
      { label: 'Class VI — Personal Demand', text: 'Personal demand items sold through AAFES/PX. Not typically planned by SPO.' },
      { label: 'Class VII — Major End Items', text: 'Tanks, helicopters, trucks, weapons systems. Tracked separately from repair parts.' },
      { label: 'Class VIII — Medical', text: 'Medical materiel, pharmaceuticals, blood. Coordinated through medical staff.' },
      { label: 'Class IX — Repair Parts', text: 'Repair parts and components for equipment maintenance. Tracked by S4 and maintenance.' },
      { label: 'Class X — Agriculture', text: 'Agricultural and economic development supplies. Used in stability operations.' },
    ],
  },
  {
    id: 'water', title: 'WATER PLANNING', color: 'cyan', emoji: '💧', category: 'SUSTAINMENT',
    content: [
      { label: 'Standard Rate', text: '3 gallons per Soldier per day (field conditions, temperate climate).' },
      { label: 'Hot Weather Rate', text: '5-7 gallons per Soldier per day (WBGT > 90°F or desert operations).' },
      { label: 'Cold Weather Rate', text: '2 gallons per Soldier per day minimum (cold weather reduces sweat but not hydration needs).' },
      { label: 'Reserve', text: '15% reserve standard for water. Round up at every step.' },
      { label: 'Formula', text: 'Total = ⌈Personnel × Rate × Days × 1.15⌉' },
      { label: 'Pacing Commodity', text: 'Water is often the pacing commodity because distribution capacity is harder to surge than storage capacity.' },
      { label: 'Sources', text: 'RO systems, water points, bottled water, host nation sources. Verify quality before distribution. Test all field-purified water.' },
      { label: 'Distribution', text: 'Water is distributed in 400-gallon water buffaloes (M149), 5-gallon cans, or bottled. Plan distribution assets separately from storage.' },
    ],
  },
  {
    id: 'fuel', title: 'FUEL PLANNING', color: 'orange', emoji: '⛽', category: 'SUSTAINMENT',
    content: [
      { label: 'Formula', text: 'Fuel = (Distance × 2 × Trips × Vehicles) ÷ MPG' },
      { label: 'Reserve', text: '20% reserve standard for fuel. ⌈Base × 1.20⌉' },
      { label: 'PLS MPG', text: '6 MPG (standard planning rate)' },
      { label: 'LMTV MPG', text: '8 MPG (standard planning rate)' },
      { label: 'HMMWV MPG', text: '12 MPG (standard planning rate)' },
      { label: 'M1 Abrams MPG', text: '0.6 MPG (gas turbine engine, very fuel-intensive)' },
      { label: 'Fueler (HEMTT) MPG', text: '7 MPG (standard planning rate)' },
      { label: 'Round Trip Rule', text: 'Always calculate round trip (distance × 2) unless one-way is confirmed by order.' },
      { label: 'Mixed Fleet', text: 'Calculate each vehicle type separately. Sum for total. Never average MPG across vehicle types.' },
      { label: 'JP-8', text: 'Standard Army fuel. Used in diesel vehicles and aircraft. One fuel simplifies logistics.' },
    ],
  },
  {
    id: 'ammo', title: 'AMMO PLANNING', color: 'red', emoji: '💥', category: 'SUSTAINMENT',
    content: [
      { label: 'Reserve', text: '10% reserve standard for ammunition. ⌈Rounds × 1.10⌉' },
      { label: 'Separate by Type', text: '5.56 loose ≠ 5.56 linked. Always separate by type, caliber, and packaging. They are different DODAC codes.' },
      { label: 'DODAC', text: 'Department of Defense Ammunition Code. Identifies ammo type, lot, and characteristics. Required for all ammo requests.' },
      { label: 'M4 Rate', text: '210 rounds basic load. Training planning rate: 40 rounds per shooter.' },
      { label: 'M249 SAW Rate', text: '1,000 rounds basic load. Linked 5.56mm. Training: 120 rounds.' },
      { label: 'M240B Rate', text: '900 rounds basic load. Linked 7.62mm. Training: 150 rounds.' },
      { label: 'M320 Rate', text: '36 rounds basic load. 40mm grenades. Training: 6 rounds.' },
      { label: 'M2 .50 Cal Rate', text: '900 rounds basic load. Linked .50 cal. Training: 200 rounds.' },
      { label: 'Packaging', text: 'Ammo is packaged in rounds → boxes → crates. Know your packaging to calculate pallet loads.' },
    ],
  },
  {
    id: 'opord', title: 'OPORD FORMAT', color: 'purple', emoji: '📄', category: 'ORDERS',
    content: [
      { label: 'Paragraph 1 — Situation', text: 'Enemy forces (composition, disposition, capabilities, COAs). Friendly forces (higher mission, adjacent units). Attachments/detachments. Civil considerations (ASCOPE).' },
      { label: 'Paragraph 2 — Mission', text: 'Who, what, when, where, why. The mission statement. Must be clear, concise, and complete. Approved by commander.' },
      { label: 'Paragraph 3 — Execution', text: 'Commander\'s intent (purpose, key tasks, end state). Concept of operations. Tasks to subordinate units. Coordinating instructions (SP times, ROE, risk reduction).' },
      { label: 'Paragraph 4 — Sustainment', text: 'Logistics (supply, maintenance, transportation, field services). Personnel services (PERSTAT, casualty reporting). Health service support. CASEVAC/MEDEVAC. LRP locations.' },
      { label: 'Paragraph 5 — Command and Signal', text: 'Command: succession of command, CP locations, liaison. Signal: PACE plan, frequencies, COMSEC, challenge/password.' },
      { label: 'Annexes', text: 'A-Task Organization, B-Intelligence, C-Operations Overlay, D-Fire Support, E-Engineer, F-Command, G-Signal, H-CSS/Sustainment, I-OPSEC, J-PSYOP' },
      { label: 'Key Rule', text: 'Put information where subordinates will look for it. SP times go in Para 3. Sustainment details go in Para 4. Comms go in Para 5.' },
    ],
  },
  {
    id: 'pace', title: 'PACE PLAN', color: 'lime', emoji: '📻', category: 'ORDERS',
    content: [
      { label: 'P — Primary', text: 'Best available method. Usually FM radio, JBC-P (digital), or SINCGARS. Must be tested and operational.' },
      { label: 'A — Alternate', text: 'Different system from primary. Must be available and tested. Example: if P is FM, A might be SATCOM.' },
      { label: 'C — Contingency', text: 'Works when both P and A fail. SAT phone, cell phone, HF radio. Must be independent of P and A infrastructure.' },
      { label: 'E — Emergency', text: 'Last resort. Always available. Runner, visual signals (VS-17 panel, mirror), prearranged check-in time.' },
      { label: 'Key Rule', text: 'Each method must be genuinely different and independent. Do not list the same system twice. A PACE plan where all methods share infrastructure is not a PACE plan.' },
      { label: 'Location', text: 'PACE plan goes in Paragraph 5 (Command and Signal) of the OPORD.' },
      { label: 'Testing', text: 'All PACE methods must be tested before the operation. An untested PACE plan is a failed PACE plan.' },
    ],
  },
  {
    id: 'logstat', title: 'LOGSTAT GUIDE', color: 'cyan', emoji: '📊', category: 'SUSTAINMENT',
    content: [
      { label: 'Purpose', text: 'Report current logistics status to higher headquarters. Identifies shortfalls before they become crises. Enables proactive sustainment decisions.' },
      { label: 'Reporting Interval', text: 'As directed by OPORD. Typically every 6 hours during active operations. Never less than every 12 hours.' },
      { label: 'GREEN', text: 'Fully capable. No shortfall. Mission can be sustained at current rate for the planned duration.' },
      { label: 'AMBER', text: 'Reduced capability. Shortfall exists but mission can continue. Commander must be informed. Resupply should be planned.' },
      { label: 'RED', text: 'Mission capability degraded. Significant shortfall. Commander must be notified immediately. Resupply is urgent.' },
      { label: 'BLACK', text: 'Mission incapable. Critical shortage. Immediate resupply required. May require mission modification.' },
      { label: 'Key Principle', text: 'A green LOGSTAT can hide changed assumptions. Always verify the underlying numbers (personnel count, consumption rate, days remaining).' },
      { label: 'Common Errors', text: 'Using wrong personnel count. Forgetting reserve. Not accounting for changed duration. Reporting status without verifying ground truth.' },
    ],
  },
  {
    id: 'ccir', title: 'CCIR & FFIR', color: 'gold', emoji: '🎯', category: 'PLANNING',
    content: [
      { label: 'CCIR Definition', text: 'Commander\'s Critical Information Requirements. Information the commander needs to make timely decisions. Approved by the commander only.' },
      { label: 'PIR', text: 'Priority Intelligence Requirements. Information about the enemy or environment that the commander needs. Owned by S2.' },
      { label: 'FFIR', text: 'Friendly Force Information Requirements. Information about friendly forces that the commander needs. Owned by S3/S4/S1.' },
      { label: 'Key Rule', text: 'Only the commander approves CCIR. The staff recommends; the commander decides. CCIR drives information collection priorities.' },
      { label: 'Sustainment CCIR', text: 'Common sustainment CCIR: fuel status, ammo status, casualty count, vehicle FMC rate, water status.' },
      { label: 'Reporting', text: 'When CCIR is satisfied (information is received), it must be reported to the commander immediately — not at the next SITREP.' },
    ],
  },
  {
    id: 'math', title: 'MATH FORMULAS', color: 'green', emoji: '🧮', category: 'CALCULATIONS',
    content: [
      { label: 'Class I (Meals)', text: 'Meals = Personnel × 3 × Days' },
      { label: 'Class I (Cases)', text: 'Cases = ⌈Meals ÷ 12⌉ (round UP)' },
      { label: 'Class I (Pallets)', text: 'Pallets = ⌈Cases with reserve ÷ 48⌉ (round UP)' },
      { label: 'Class I (Reserve)', text: 'Cases with reserve = ⌈Cases × 1.15⌉' },
      { label: 'Water', text: 'Gallons = ⌈Personnel × Rate × Days × 1.15⌉' },
      { label: 'Fuel (Base)', text: 'Gallons = (Distance × 2 × Trips × Vehicles) ÷ MPG' },
      { label: 'Fuel (Reserve)', text: 'Fuel with reserve = ⌈Base × 1.20⌉' },
      { label: 'Ammo', text: 'Rounds with reserve = ⌈Shooters × Rate × 1.10⌉' },
      { label: 'Time Analysis', text: 'Commander keeps 1/3 of available time. Subordinates get 2/3.' },
      { label: 'Rounding Rule', text: 'ALWAYS round UP at packaging steps. Never round down for sustainment. Rounding down is a planning failure.' },
      { label: 'Weighted Matrix', text: 'Score = Σ(Criterion Score × Weight). Higher score = better COA.' },
      { label: 'Convoy Cycle Time', text: 'Cycle = (Distance × 2) ÷ Speed + Load/Unload time' },
    ],
  },
  {
    id: 'staff_roles', title: 'STAFF SECTIONS', color: 'purple', emoji: '👥', category: 'STAFF',
    content: [
      { label: 'S1 — Personnel', text: 'Human resources. PERSTAT, casualty reporting, awards, finance, morale. Provides personnel count for all sustainment calculations.' },
      { label: 'S2 — Intelligence', text: 'Intelligence preparation of the battlefield (IPB). Enemy analysis, weather, terrain. Drives route selection and timing decisions.' },
      { label: 'S3 — Operations', text: 'Plans and operations. Mission analysis, COA development, synchronization. Owns the OPORD and training schedule.' },
      { label: 'S4 — Logistics', text: 'Logistics planning and coordination. Maintenance, supply, transportation. Owns the logistics running estimate and LOGSTAT.' },
      { label: 'S6 — Signal', text: 'Communications and information systems. PACE plan, network, COMSEC. Ensures all command and control systems are operational.' },
      { label: 'SPO — Support Operations', text: 'Sustainment planning for the brigade/battalion. Commodity calculations (Class I/III/V), distribution planning, LOGPAC coordination.' },
      { label: 'XO — Executive Officer', text: 'Manages the staff. Ensures synchronization across all staff sections. Runs the battle rhythm. Speaks for the commander.' },
      { label: 'CSM — Command Sergeant Major', text: 'Senior NCO advisor. Soldier welfare, discipline, training standards. Advises commander on enlisted matters.' },
    ],
  },
  {
    id: 'warno', title: 'WARNO GUIDE', color: 'cyan', emoji: '📡', category: 'ORDERS',
    content: [
      { label: 'Purpose', text: 'Warning Order. Provides early warning to subordinates so they can begin planning. Issued as soon as possible after receipt of mission.' },
      { label: 'When to Issue', text: 'Issue WARNO 1 immediately upon receipt of mission. Issue WARNO 2 after Mission Analysis. Issue WARNO 3 after COA Approval.' },
      { label: 'Minimum Content', text: 'Situation (as known). Mission (as known). General instructions. Service support (as known). Command and signal (as known).' },
      { label: 'Key Rule', text: 'An incomplete WARNO is better than no WARNO. Issue what you know. Update as information becomes available.' },
      { label: 'vs FRAGORD', text: 'WARNO = advance notice before a complete order. FRAGORD = modifies an existing order when only parts change.' },
      { label: 'vs OPORD', text: 'WARNO buys time. OPORD provides the complete plan. The WARNO is not a substitute for the OPORD.' },
    ],
  },
];

const QUICK_FACTS = [
  { label: 'MRE case', value: '12 meals' },
  { label: 'MRE pallet', value: '48 cases' },
  { label: 'Water rate', value: '3 gal/Soldier/day' },
  { label: 'Water reserve', value: '15%' },
  { label: 'Fuel reserve', value: '20%' },
  { label: 'Ammo reserve', value: '10%' },
  { label: 'PLS capacity', value: '8 pallets' },
  { label: 'LMTV capacity', value: '2 pallets' },
  { label: 'PLS MPG', value: '6 MPG' },
  { label: 'LMTV MPG', value: '8 MPG' },
  { label: 'HMMWV MPG', value: '12 MPG' },
  { label: '1/3 rule', value: 'Cmd keeps 1/3' },
  { label: 'LOGSTAT interval', value: 'Every 6 hrs' },
  { label: 'COA criteria', value: 'SFADC' },
  { label: 'OPORD para 4', value: 'Sustainment' },
  { label: 'OPORD para 5', value: 'Cmd & Signal' },
];

const CATEGORIES = ['ALL', 'PLANNING', 'SUSTAINMENT', 'ORDERS', 'STAFF', 'CALCULATIONS'];

export default function RefScreen() {
  const { dispatch } = useGame();
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');

  const ref = REFS.find(r => r.id === selected);

  const filtered = REFS.filter(r => {
    const matchesSearch = !search ||
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.content.some(c =>
        c.text.toLowerCase().includes(search.toLowerCase()) ||
        c.label.toLowerCase().includes(search.toLowerCase())
      );
    const matchesCat = category === 'ALL' || r.category === category;
    return matchesSearch && matchesCat;
  });

  return (
    <ScreenWrap>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <button onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'hub' })} className="text-xs text-slate-500 mono mb-4 hover:text-slate-300 transition-colors">
          ← HUB
        </button>

        <SectionTitle color="cyan" sub={`${REFS.length} reference topics • Tap any card to expand`}>REFERENCE LIBRARY</SectionTitle>

        {ref ? (
          <div className="animate-fade-in-up">
            <button onClick={() => setSelected(null)} className="text-xs text-slate-500 mono mb-4 hover:text-slate-300 transition-colors">
              ← ALL REFERENCES
            </button>
            <div className={`mil-card mil-card-${ref.color} p-5 mb-4`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="text-3xl">{ref.emoji}</div>
                <div>
                  <div className={`text-[10px] text-${ref.color}-400/60 mono tracking-widest mb-0.5`}>{ref.category}</div>
                  <h2 className="text-xl font-black tracking-wide" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{ref.title}</h2>
                </div>
              </div>
              <div className="grid gap-4">
                {ref.content.map((c, i) => (
                  <div key={i} className="border-l-2 border-white/10 pl-4">
                    <div className={`text-xs font-bold text-${ref.color}-400 mb-1`} style={{ fontFamily: 'Rajdhani, sans-serif' }}>{c.label}</div>
                    <p className="text-sm text-slate-300 leading-relaxed">{c.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Search */}
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search references, formulas, doctrine..."
              className="mil-input mb-4"
            />

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 mb-5">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1 rounded-lg border text-xs mono transition-all ${
                    category === cat
                      ? 'border-cyan-400/60 bg-cyan-400/15 text-cyan-300'
                      : 'border-white/10 bg-white/3 text-slate-500 hover:border-white/20 hover:text-slate-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Reference Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              {filtered.map(r => (
                <div
                  key={r.id}
                  className="mil-card p-4 cursor-pointer hover:-translate-y-0.5 transition-transform"
                  onClick={() => setSelected(r.id)}
                >
                  <div className="text-2xl mb-2">{r.emoji}</div>
                  <div className={`text-xs font-bold text-${r.color}-400 mb-0.5`} style={{ fontFamily: 'Rajdhani, sans-serif' }}>{r.title}</div>
                  <div className="text-[10px] text-slate-600">{r.content.length} entries</div>
                  <div className={`text-[9px] mono text-${r.color}-400/40 mt-1`}>{r.category}</div>
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="col-span-3 text-center py-8 text-slate-600 text-xs mono">
                  No references match "{search}"
                </div>
              )}
            </div>

            <Divider label="QUICK REFERENCE CARD" />

            {/* Quick Facts Grid */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs mb-4">
              {QUICK_FACTS.map(({ label, value }) => (
                <div key={label} className="flex justify-between gap-2 py-1.5 border-b border-white/5">
                  <span className="text-slate-500">{label}</span>
                  <span className="text-yellow-400 mono font-bold">{value}</span>
                </div>
              ))}
            </div>

            <Divider label="RESERVE PERCENTAGES" />
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: 'FUEL', value: '20%', color: 'orange' },
                { label: 'WATER', value: '15%', color: 'cyan' },
                { label: 'AMMO', value: '10%', color: 'red' },
              ].map(({ label, value, color }) => (
                <div key={label} className={`p-3 rounded-xl border border-${color}-400/20 bg-${color}-400/5 text-center`}>
                  <div className={`text-2xl font-black text-${color}-400`} style={{ fontFamily: 'Rajdhani, sans-serif' }}>{value}</div>
                  <div className={`text-[10px] mono text-${color}-400/60`}>{label}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </ScreenWrap>
  );
}
