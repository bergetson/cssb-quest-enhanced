import { useMemo, useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import { ScreenWrap, SectionTitle, MilCard, MilButton, MilTag } from '../../components/GameUI';
import { toast } from 'sonner';
import { shuffleWithSeed } from '../../lib/gameplayUtils';

// Daily question pool — rotates by day of year
const DAILY_POOL = [
  {
    q: 'What does the 1/3 - 2/3 rule protect?',
    a: 'subordinate planning time',
    options: ['Commander\'s sleep schedule', 'subordinate planning time', 'logistics reserve', 'fuel reserve'],
    learn: 'The 1/3-2/3 rule ensures subordinate units have enough time to plan and prepare. Issue WARNOs early.',
    category: 'MDMP',
  },
  {
    q: 'An MRE case contains how many meals?',
    a: '12',
    options: ['6', '12', '24', '48'],
    learn: 'MRE case = 12 meals. MRE pallet = 48 cases = 576 meals.',
    category: 'CLASS I',
  },
  {
    q: 'Standard water planning rate in field conditions is:',
    a: '3 gallons per Soldier per day',
    options: ['1 gallon per Soldier per day', '3 gallons per Soldier per day', '5 gallons per Soldier per day', '2 gallons per Soldier per day'],
    learn: '3 gal/Soldier/day is the standard field rate. Increase to 5-7 in extreme heat (WBGT > 90°F).',
    category: 'WATER',
  },
  {
    q: 'Standard fuel reserve percentage is:',
    a: '20%',
    options: ['10%', '15%', '20%', '25%'],
    learn: 'Fuel reserve is 20%. Water and Class I reserve is 15%. Ammo reserve is 10%.',
    category: 'FUEL',
  },
  {
    q: 'Standard ammunition reserve percentage is:',
    a: '10%',
    options: ['5%', '10%', '15%', '20%'],
    learn: 'Ammo reserve is 10%. Always apply after calculating base requirement.',
    category: 'CLASS V',
  },
  {
    q: 'The PACE plan goes in which paragraph of the OPORD?',
    a: 'Paragraph 5 — Command and Signal',
    options: ['Paragraph 3 — Execution', 'Paragraph 4 — Sustainment', 'Paragraph 5 — Command and Signal', 'Paragraph 1 — Situation'],
    learn: 'PACE plan belongs in Paragraph 5 (Command and Signal). Logistics goes in Paragraph 4.',
    category: 'OPORD',
  },
  {
    q: 'Which staff section produces the LOGSTAT?',
    a: 'S4 / SPO',
    options: ['S1', 'S2', 'S3', 'S4 / SPO'],
    learn: 'S4 and SPO produce and track the LOGSTAT. It reports current logistics status to higher.',
    category: 'STAFF',
  },
  {
    q: 'What does MDMP stand for?',
    a: 'Military Decision Making Process',
    options: ['Mission Directive Management Plan', 'Military Decision Making Process', 'Mission Design and Maneuver Plan', 'Military Deployment Management Process'],
    learn: 'MDMP = Military Decision Making Process. 7 steps: Receipt, Mission Analysis, COA Dev, Wargame, Comparison, Approval, Orders.',
    category: 'MDMP',
  },
  {
    q: 'A PLS truck gets approximately how many miles per gallon?',
    a: '6 MPG',
    options: ['4 MPG', '6 MPG', '8 MPG', '12 MPG'],
    learn: 'PLS: 6 MPG. LMTV: 8 MPG. HMMWV: 12 MPG. M1 Abrams: 0.6 MPG.',
    category: 'FUEL',
  },
  {
    q: 'The E in PACE stands for:',
    a: 'Emergency',
    options: ['Electronic', 'Emergency', 'Enhanced', 'Encrypted'],
    learn: 'PACE: Primary, Alternate, Contingency, Emergency. Emergency is always available — runner, visual signals, prearranged check-in.',
    category: 'PACE',
  },
  {
    q: 'Which OPORD paragraph contains the LRP location?',
    a: 'Paragraph 4 — Sustainment',
    options: ['Paragraph 2 — Mission', 'Paragraph 3 — Execution', 'Paragraph 4 — Sustainment', 'Paragraph 5 — Command and Signal'],
    learn: 'LRP (Logistics Release Point) locations go in Paragraph 4 (Sustainment). Commanders find logistics info in Para 4.',
    category: 'OPORD',
  },
  {
    q: 'What is the primary S3 product?',
    a: 'OPORD / FRAGORD',
    options: ['PERSTAT', 'LOGSTAT', 'OPORD / FRAGORD', 'IPB'],
    learn: 'S3 produces the OPORD and FRAGORDs. S3 is the primary planner and synchronizer for the commander.',
    category: 'STAFF',
  },
  {
    q: 'How many MRE cases fit on one pallet?',
    a: '48',
    options: ['24', '36', '48', '60'],
    learn: 'MRE pallet = 48 cases = 576 meals. Use this for transport and storage planning.',
    category: 'CLASS I',
  },
  {
    q: 'A FRAGORD differs from an OPORD because:',
    a: 'It changes only specific parts of the existing order',
    options: [
      'It is longer and more detailed',
      'It changes only specific parts of the existing order',
      'It replaces the OPORD entirely',
      'It is issued before the WARNO',
    ],
    learn: 'A FRAGORD (Fragmentary Order) modifies an existing OPORD. It only changes what is different — everything else remains in effect.',
    category: 'MDMP',
  },
  {
    q: 'Class III refers to:',
    a: 'Petroleum, oils, and lubricants (POL)',
    options: ['Ammunition', 'Petroleum, oils, and lubricants (POL)', 'Medical supplies', 'Construction materials'],
    learn: 'Class III = POL. Class IIIB = bulk fuel (JP-8, diesel). Class IIIP = packaged POL.',
    category: 'CLASS III',
  },
  {
    q: 'When rounding sustainment calculations, you should:',
    a: 'Always round up at packaging steps',
    options: [
      'Round to the nearest whole number',
      'Always round down to save resources',
      'Always round up at packaging steps',
      'Only round at the final answer',
    ],
    learn: 'Always round UP for sustainment. Rounding down creates shortages. Round at each packaging step.',
    category: 'MATH',
  },
  {
    q: 'The COA wargame is which step of MDMP?',
    a: 'Step 4 — COA Analysis',
    options: ['Step 2 — Mission Analysis', 'Step 3 — COA Development', 'Step 4 — COA Analysis', 'Step 5 — COA Comparison'],
    learn: 'Step 4 is COA Analysis (Wargame). You wargame each COA against enemy COAs to find advantages and risks.',
    category: 'MDMP',
  },
  {
    q: 'CCIR stands for:',
    a: 'Commander\'s Critical Information Requirements',
    options: [
      'Combat Coordination and Intelligence Report',
      'Commander\'s Critical Information Requirements',
      'Combat Command Intelligence Review',
      'Consolidated Critical Information Report',
    ],
    learn: 'CCIR = Commander\'s Critical Information Requirements. Includes FFIR (friendly) and PIR (intelligence). Drives reporting.',
    category: 'MDMP',
  },
  {
    q: 'What does a LOGSTAT color of RED indicate?',
    a: 'Mission capability degraded — commander must be notified',
    options: [
      'Fully capable',
      'Reduced capability but mission continues',
      'Mission capability degraded — commander must be notified',
      'Mission incapable — immediate resupply required',
    ],
    learn: 'RED = degraded capability. BLACK = mission incapable. GREEN = fully capable. AMBER = reduced but continuing.',
    category: 'LOGSTAT',
  },
  {
    q: 'The SPO is primarily responsible for:',
    a: 'Sustainment planning and CSS operations',
    options: [
      'Intelligence preparation of the battlefield',
      'Sustainment planning and CSS operations',
      'Fire support coordination',
      'Personnel readiness',
    ],
    learn: 'SPO = Support Operations Officer. Primary staff officer for sustainment planning at brigade and above.',
    category: 'STAFF',
  },
];

function getDailyQuestion(date: Date) {
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
  return DAILY_POOL[dayOfYear % DAILY_POOL.length];
}

export default function DailyScreen() {
  const { state, dispatch } = useGame();
  const [answered, setAnswered] = useState<string | null>(null);
  const today = new Date();
  const todayKey = today.toDateString();
  const q = getDailyQuestion(today);
  const options = useMemo(
    () => shuffleWithSeed(q.options, `daily:${todayKey}:${state.challenge}`),
    [q, state.challenge, todayKey],
  );
  const isDone = state.dailyDone && state.dailyDate === todayKey;

  function handleAnswer(opt: string) {
    if (answered || isDone) return;
    setAnswered(opt);
    const correct = opt === q.a;
    if (correct) {
      dispatch({ type: 'ADD_CREDS', amount: 15 });
      dispatch({ type: 'ADD_XP', amount: 30 });
      dispatch({ type: 'ADD_STREAK' });
      toast.success('Correct! +15 CR, +30 XP');
    } else {
      dispatch({ type: 'RESET_STREAK' });
      toast.error('Wrong. ' + q.a);
    }
    dispatch({ type: 'SET_DAILY_DONE' });
    dispatch({ type: 'ADD_NOTEBOOK', title: 'Daily Challenge', text: `Q: ${q.q}\nA: ${q.a}\nLesson: ${q.learn}` });
  }

  return (
    <ScreenWrap>
      <div className="max-w-xl mx-auto px-4 py-6">
        <button onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'hub' })} className="text-xs text-slate-500 mono mb-4 hover:text-slate-300 transition-colors">
          ← HUB
        </button>

        <div className="flex items-center justify-between mb-6">
          <SectionTitle color="gold">DAILY CHALLENGE</SectionTitle>
          <div className="text-right">
            <div className="text-xs text-slate-500 mono">{today.toLocaleDateString()}</div>
            <div className="text-xs text-yellow-400 mono">+15 CR</div>
          </div>
        </div>

        {isDone && !answered ? (
          <div className="text-center py-12 animate-fade-in-up">
            <div className="text-4xl mb-4">✅</div>
            <h2 className="text-xl font-black text-emerald-400 mb-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>DAILY COMPLETE</h2>
            <p className="text-sm text-slate-400">Come back tomorrow for a new question.</p>
            <div className="mt-4">
              <MilButton color="gold" onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'hub' })}>← HUB</MilButton>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in-up">
            <MilCard className="p-5 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <MilTag color="gold">{q.category}</MilTag>
                <span className="text-xs text-slate-500 mono">Daily Question</span>
              </div>
              <p className="text-base text-slate-200 leading-relaxed">{q.q}</p>
            </MilCard>

            <div className="grid gap-2 mb-4">
              {options.map((opt, i) => {
                const isSelected = answered === opt;
                const isCorrect = answered && opt === q.a;
                const isWrong = answered === opt && opt !== q.a;
                return (
                  <button
                    key={i}
                    onClick={() => handleAnswer(opt)}
                    disabled={!!answered || isDone}
                    className={`choice-btn ${isCorrect ? 'correct' : isWrong ? 'wrong' : ''}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {(answered || isDone) && (
              <div className={`animate-fade-in-up ${answered === q.a ? 'success-box' : 'danger-box'} mb-4`}>
                <div className="font-bold mb-1 text-xs" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                  {answered === q.a ? '✓ CORRECT — +15 CR' : '✗ INCORRECT'}
                </div>
                <p className="text-xs">{q.learn}</p>
              </div>
            )}

            {(answered || isDone) && (
              <MilButton color="gold" className="w-full" onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'hub' })}>
                ← RETURN TO HUB
              </MilButton>
            )}
          </div>
        )}
      </div>
    </ScreenWrap>
  );
}
