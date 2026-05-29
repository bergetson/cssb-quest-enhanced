import { useMemo, useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import { ScreenWrap, SectionTitle, MilCard, MilButton, MilTag, Divider } from '../../components/GameUI';
import { toast } from 'sonner';
import { shuffleWithSeed } from '../../lib/gameplayUtils';
import { accentText } from '../../lib/colors';

const STAFF_SECTIONS = [
  {
    id: 's1', name: 'S1 — PERSONNEL', color: 'cyan', emoji: '👤',
    officer: 'Adjutant (S1)',
    nco: 'Senior HR NCO',
    mission: 'Provide personnel readiness, strength accounting, casualty operations, and essential personnel services.',
    tasks: ['PERSTAT reporting', 'Casualty reporting', 'Awards processing', 'Leave management', 'Strength accountability'],
    supports: 'Commander needs to know who is available to fight.',
    keyProduct: 'PERSTAT / Casualty Report',
    questions: [
      { q: 'What does S1 provide to support Class I planning?', a: 'personnel strength (PERSTAT)', options: ['vehicle status', 'personnel strength (PERSTAT)', 'route clearance', 'weather data'] },
      { q: 'What is the primary S1 report?', a: 'PERSTAT', options: ['LOGSTAT', 'PERSTAT', 'SITREP', 'FRAGORD'] },
      { q: 'S1 casualty operations include which of the following?', a: 'reporting and tracking wounded, ill, and injured', options: ['vehicle maintenance tracking', 'reporting and tracking wounded, ill, and injured', 'fuel distribution', 'route reconnaissance'] },
    ],
  },
  {
    id: 's2', name: 'S2 — INTELLIGENCE', color: 'purple', emoji: '🔍',
    officer: 'Intelligence Officer (S2)',
    nco: 'Intelligence NCO',
    mission: 'Provide intelligence preparation of the battlefield, threat analysis, and weather/terrain analysis.',
    tasks: ['IPB', 'THREATCON reporting', 'Weather analysis', 'Route threat assessment', 'CCIR support'],
    supports: 'Commander needs to know what the enemy can do and what terrain/weather mean for the mission.',
    keyProduct: 'IPB / THREATCON',
    questions: [
      { q: 'What does IPB stand for?', a: 'Intelligence Preparation of the Battlefield', options: ['Infantry Planning Brief', 'Intelligence Preparation of the Battlefield', 'Integrated Planning Board', 'Initial Planning Baseline'] },
      { q: 'Which S2 product helps identify terrain effects on movement?', a: 'MCOO (Modified Combined Obstacle Overlay)', options: ['PERSTAT', 'LOGSTAT', 'MCOO (Modified Combined Obstacle Overlay)', 'FRAGORD'] },
      { q: 'S2 weather analysis affects which planning factor?', a: 'All of the above', options: ['Route selection', 'SP timing', 'Aircraft availability', 'All of the above'] },
    ],
  },
  {
    id: 's3', name: 'S3 — OPERATIONS', color: 'gold', emoji: '🎯',
    officer: 'Operations Officer (S3)',
    nco: 'Operations NCO',
    mission: 'Plan, coordinate, and synchronize all operations. Primary staff officer for the commander.',
    tasks: ['MDMP facilitation', 'OPORD production', 'Synchronization matrix', 'Battle rhythm management', 'CCIR tracking'],
    supports: 'Commander needs a synchronized plan that integrates all warfighting functions.',
    keyProduct: 'OPORD / FRAGORD',
    questions: [
      { q: 'Which staff section is the primary planner for the commander?', a: 'S3', options: ['S1', 'S2', 'S3', 'S4'] },
      { q: 'What product does S3 produce to synchronize all warfighting functions?', a: 'Synchronization Matrix', options: ['LOGSTAT', 'Synchronization Matrix', 'PERSTAT', 'CASEVAC Plan'] },
      { q: 'S3 is responsible for which MDMP step?', a: 'All MDMP steps — S3 facilitates the entire process', options: ['Mission Analysis only', 'COA Development only', 'All MDMP steps — S3 facilitates the entire process', 'Orders Production only'] },
    ],
  },
  {
    id: 's4', name: 'S4 — LOGISTICS', color: 'orange', emoji: '🚛',
    officer: 'Logistics Officer (S4)',
    nco: 'Senior Logistics NCO',
    mission: 'Plan and coordinate all sustainment operations: supply, maintenance, transportation, and field services.',
    tasks: ['Class I-IX planning', 'Maintenance tracking', 'LOGPAC coordination', 'LOGSTAT reporting', 'Load planning'],
    supports: 'Commander needs to know if the unit can sustain itself through the operation.',
    keyProduct: 'LOGSTAT / Sustainment Annex',
    questions: [
      { q: 'Which paragraph of the OPORD contains the sustainment plan?', a: 'Paragraph 4 — Sustainment', options: ['Paragraph 2 — Mission', 'Paragraph 3 — Execution', 'Paragraph 4 — Sustainment', 'Paragraph 5 — Command and Signal'] },
      { q: 'What is the S4 primary report?', a: 'LOGSTAT', options: ['PERSTAT', 'SITREP', 'LOGSTAT', 'FRAGORD'] },
      { q: 'S4 coordinates which classes of supply?', a: 'All classes (I through IX)', options: ['Class I and III only', 'Class V only', 'All classes (I through IX)', 'Class III and V only'] },
    ],
  },
  {
    id: 's6', name: 'S6 — SIGNAL', color: 'lime', emoji: '📻',
    officer: 'Signal Officer (S6)',
    nco: 'Senior Signal NCO',
    mission: 'Plan, install, operate, and maintain all communications and information systems.',
    tasks: ['PACE plan development', 'Network architecture', 'COMSEC management', 'JBC-P maintenance', 'Frequency management'],
    supports: 'Commander needs reliable communications to command and control the force.',
    keyProduct: 'PACE Plan / Signal Annex',
    questions: [
      { q: 'What does PACE stand for?', a: 'Primary, Alternate, Contingency, Emergency', options: ['Plan, Assess, Communicate, Execute', 'Primary, Alternate, Contingency, Emergency', 'Prepare, Analyze, Coordinate, Execute', 'Primary, Assess, Contingency, Evaluate'] },
      { q: 'Which paragraph of the OPORD contains the PACE plan?', a: 'Paragraph 5 — Command and Signal', options: ['Paragraph 3 — Execution', 'Paragraph 4 — Sustainment', 'Paragraph 5 — Command and Signal', 'Paragraph 1 — Situation'] },
      { q: 'COMSEC refers to what?', a: 'Communications Security', options: ['Combat Security', 'Communications Security', 'Command Synchronization', 'Convoy Security'] },
    ],
  },
  {
    id: 'spo', name: 'SPO — SUPPORT OPERATIONS', color: 'green', emoji: '📊',
    officer: 'Support Operations Officer (SPO)',
    nco: 'Support Operations NCO',
    mission: 'The SPO is the primary staff officer for sustainment planning at brigade and above. Coordinates all CSS operations.',
    tasks: ['Commodity calculations', 'Distribution planning', 'Priority of support', 'LOGSTAT analysis', 'Running estimates'],
    supports: 'Commander needs a sustainment plan that matches operational requirements with available resources.',
    keyProduct: 'Running Estimate / Distribution Plan',
    questions: [
      { q: 'The SPO is primarily responsible for which type of planning?', a: 'Sustainment / CSS planning', options: ['Intelligence planning', 'Sustainment / CSS planning', 'Fire support planning', 'Engineer planning'] },
      { q: 'What is the SPO\'s primary product?', a: 'Running Estimate', options: ['OPORD', 'Running Estimate', 'PERSTAT', 'Intelligence Summary'] },
      { q: 'SPO coordinates priority of support based on what?', a: 'Commander\'s guidance and mission requirements', options: ['Available vehicles only', 'Commander\'s guidance and mission requirements', 'Unit seniority', 'Alphabetical order'] },
    ],
  },
];

export default function RolesScreen() {
  const { dispatch } = useGame();
  const [selected, setSelected] = useState<string | null>(null);
  const [quizMode, setQuizMode] = useState(false);
  const [quizSection, setQuizSection] = useState<typeof STAFF_SECTIONS[0] | null>(null);
  const [qIdx, setQIdx] = useState(0);
  const [answered, setAnswered] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const section = STAFF_SECTIONS.find(s => s.id === selected);
  const activeQuestion = quizSection?.questions[qIdx];
  const activeOptions = useMemo(
    () => activeQuestion && quizSection
      ? shuffleWithSeed(activeQuestion.options, `roles:${quizSection.id}:${qIdx}`)
      : [],
    [activeQuestion, qIdx, quizSection],
  );

  function startQuiz(sec: typeof STAFF_SECTIONS[0]) {
    setQuizSection(sec);
    setQIdx(0);
    setAnswered(null);
    setScore(0);
    setDone(false);
    setQuizMode(true);
  }

  function handleAnswer(opt: string) {
    if (answered) return;
    setAnswered(opt);
    if (quizSection && opt === quizSection.questions[qIdx].a) {
      setScore(s => s + 1);
      toast.success('Correct!');
    } else {
      toast.error('Wrong. ' + quizSection?.questions[qIdx].a);
    }
  }

  function nextQ() {
    if (!quizSection) return;
    if (qIdx + 1 >= quizSection.questions.length) {
      setDone(true);
    } else {
      setQIdx(q => q + 1);
      setAnswered(null);
    }
  }

  if (quizMode && quizSection) {
    const q = quizSection.questions[qIdx];
    return (
      <ScreenWrap>
        <div className="max-w-xl mx-auto px-4 py-6">
          <button onClick={() => setQuizMode(false)} className="text-xs text-slate-500 mono mb-4 hover:text-slate-300 transition-colors">
            ← BACK
          </button>
          {done ? (
            <div className="text-center animate-fade-in-up">
              <div className="text-4xl mb-4">{score === quizSection.questions.length ? '🏆' : score >= 2 ? '✅' : '📚'}</div>
              <h2 className="text-2xl font-black text-yellow-400 mb-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{quizSection.name} QUIZ COMPLETE</h2>
              <div className="text-slate-400 mb-6">{score}/{quizSection.questions.length} correct</div>
              <MilButton color="gold" className="w-full" onClick={() => setQuizMode(false)}>BACK TO ROLES</MilButton>
            </div>
          ) : (
            <div className="animate-fade-in-up">
              <div className="mil-card p-4 mb-4">
                <div className="text-xs text-slate-500 mono mb-2">{quizSection.name} — Q{qIdx + 1}/{quizSection.questions.length}</div>
                <p className="text-sm text-slate-200">{q.q}</p>
              </div>
              <div className="grid gap-2">
                {activeOptions.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleAnswer(opt)}
                    disabled={!!answered}
                    className={`choice-btn ${answered === opt ? (opt === q.a ? 'correct' : 'wrong') : answered && opt === q.a ? 'correct opacity-60' : ''}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              {answered && (
                <MilButton color="cyan" className="w-full mt-4" onClick={nextQ}>
                  {qIdx + 1 >= quizSection.questions.length ? 'FINISH' : 'NEXT →'}
                </MilButton>
              )}
            </div>
          )}
        </div>
      </ScreenWrap>
    );
  }

  return (
    <ScreenWrap>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <button onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'hub' })} className="text-xs text-slate-500 mono mb-4 hover:text-slate-300 transition-colors">
          ← HUB
        </button>

        <SectionTitle color="purple">STAFF SECTIONS</SectionTitle>

        {section ? (
          <div className="animate-fade-in-up">
            <button onClick={() => setSelected(null)} className="text-xs text-slate-500 mono mb-4 hover:text-slate-300 transition-colors">
              ← ALL SECTIONS
            </button>
            <div className={`mil-card mil-card-${section.color} p-5 mb-4`}>
              <div className="flex items-center gap-3 mb-3">
                <div className="text-3xl">{section.emoji}</div>
                <div>
                  <h2 className="text-xl font-black tracking-wide" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{section.name}</h2>
                  <div className="text-xs text-slate-500">{section.officer} / {section.nco}</div>
                </div>
              </div>
              <p className="text-sm text-slate-300 mb-4">{section.mission}</p>
              <div className="mb-4">
                <div className="text-xs text-slate-500 mono mb-2">KEY TASKS</div>
                <div className="flex flex-wrap gap-2">
                  {section.tasks.map(t => <MilTag key={t} color={section.color}>{t}</MilTag>)}
                </div>
              </div>
              <div className="info-box mb-4">
                <div className="text-xs font-bold mb-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>SUPPORTS COMMANDER BY:</div>
                <p className="text-xs">{section.supports}</p>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500 mono">KEY PRODUCT</div>
                  <div className="text-sm font-bold text-yellow-400" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{section.keyProduct}</div>
                </div>
                <MilButton color={section.color} onClick={() => startQuiz(section)}>
                  TAKE QUIZ
                </MilButton>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-3">
            {STAFF_SECTIONS.map(s => (
              <div
                key={s.id}
                className={`mil-card p-4 cursor-pointer hover:-translate-y-0.5 transition-transform`}
                onClick={() => setSelected(s.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{s.emoji}</div>
                  <div className="flex-1">
                    <div className="text-sm font-bold" style={{ fontFamily: 'Rajdhani, sans-serif', ...accentText(s.color) }}>{s.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{s.mission.substring(0, 80)}...</div>
                  </div>
                  <div className="text-slate-600">→</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Divider label="QUICK REFERENCE" />
        <div className="mil-card p-4">
          <div className="text-xs text-slate-500 mono mb-3">STAFF SECTION QUICK REFERENCE</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              ['S1', 'Personnel / Strength'],
              ['S2', 'Intelligence / IPB'],
              ['S3', 'Operations / MDMP'],
              ['S4', 'Logistics / Supply'],
              ['S6', 'Signal / PACE'],
              ['SPO', 'Support Ops / CSS'],
            ].map(([s, r]) => (
              <div key={s} className="flex gap-2">
                <span className="text-yellow-400 font-bold mono w-8">{s}</span>
                <span className="text-slate-400">{r}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ScreenWrap>
  );
}
