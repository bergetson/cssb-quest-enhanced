// Design: Modern Military Command Dashboard
// Captain PowerPoint Boss Battle — turn-based doctrine quiz combat

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/contexts/GameContext';
import { ACHIEVEMENTS_DEF } from '@/lib/gameData';

interface BossQuestion {
  id: string;
  attack: string; // CPT PPT's "attack" — a confusing slide-jargon question
  choices: { text: string; correct: boolean; explanation: string }[];
  damage: number; // damage dealt to PPT on correct answer
  pptLine: string; // PPT's quote when attacking
}

const BOSS_QUESTIONS: BossQuestion[] = [
  {
    id: 'b1',
    attack: 'Per my last slide, the MDMP step that produces the restated mission is...',
    pptLine: '"If you\'ll just refer to slide 12, you\'ll see that I\'ve color-coded the answer in a gradient that represents synergistic alignment."',
    choices: [
      { text: 'Mission Analysis', correct: true, explanation: 'Correct! Mission Analysis (Step 2) produces the restated mission. No slide deck required.' },
      { text: 'COA Development', correct: false, explanation: 'COA Development produces courses of action, not the restated mission.' },
      { text: 'COA Approval', correct: false, explanation: 'COA Approval is when the commander selects the COA.' },
      { text: 'Receipt of Mission', correct: false, explanation: 'Receipt of Mission initiates the process but does not produce the restated mission.' },
    ],
    damage: 25,
  },
  {
    id: 'b2',
    attack: 'As you can see on slide 23, the sustainment paragraph in an OPORD is paragraph number...',
    pptLine: '"I\'ve prepared a 14-slide deep-dive on OPORD paragraph numbering. Please hold your questions until slide 14."',
    choices: [
      { text: 'Paragraph 4', correct: true, explanation: 'Correct! Paragraph 4 is Sustainment. 1-Situation, 2-Mission, 3-Execution, 4-Sustainment, 5-Command & Signal.' },
      { text: 'Paragraph 3', correct: false, explanation: 'Paragraph 3 is Execution.' },
      { text: 'Paragraph 5', correct: false, explanation: 'Paragraph 5 is Command and Signal.' },
      { text: 'Paragraph 2', correct: false, explanation: 'Paragraph 2 is Mission.' },
    ],
    damage: 20,
  },
  {
    id: 'b3',
    attack: 'Leveraging cross-functional synergies, the PACE plan stands for...',
    pptLine: '"I\'ve animated each letter to fly in from a different direction. Please appreciate the effort."',
    choices: [
      { text: 'Primary, Alternate, Contingency, Emergency', correct: true, explanation: 'Correct! PACE = Primary, Alternate, Contingency, Emergency. Each method must be genuinely independent.' },
      { text: 'Primary, Alternate, Contingency, Expedient', correct: false, explanation: 'The E stands for Emergency, not Expedient.' },
      { text: 'Plan, Assess, Coordinate, Execute', correct: false, explanation: 'That is not PACE. PACE is a communications planning tool.' },
      { text: 'Primary, Alternate, Coordinate, Emergency', correct: false, explanation: 'The C stands for Contingency, not Coordinate.' },
    ],
    damage: 20,
  },
  {
    id: 'b4',
    attack: 'Optimizing operational effectiveness, the 1/3 - 2/3 rule means higher HQ keeps...',
    pptLine: '"I\'ve created a pie chart. It\'s on slide 31. The pie is not to scale. The pie is never to scale."',
    choices: [
      { text: '1/3 of planning time', correct: true, explanation: 'Correct! Higher HQ keeps 1/3 of available time so subordinates receive 2/3 for their own planning.' },
      { text: '2/3 of planning time', correct: false, explanation: 'Higher HQ keeps 1/3, NOT 2/3. The point is to give subordinates maximum planning time.' },
      { text: '1/2 of planning time', correct: false, explanation: 'The rule is 1/3 - 2/3, not 50/50.' },
      { text: '3/4 of planning time', correct: false, explanation: 'That would leave subordinates only 1/4. The rule is 1/3 - 2/3.' },
    ],
    damage: 25,
  },
  {
    id: 'b5',
    attack: 'Holistically speaking, Class V ammunition planning requires a reserve of...',
    pptLine: '"Slide 47 has a beautiful infographic. I spent 6 hours on the color scheme. Please look at the color scheme."',
    choices: [
      { text: '10%', correct: true, explanation: 'Correct! Class V (ammo) reserve is 10%. Class I/water is 15%, fuel is 20%.' },
      { text: '15%', correct: false, explanation: '15% is the Class I (food/water) reserve, not ammo.' },
      { text: '20%', correct: false, explanation: '20% is the fuel (Class IIIB) reserve, not ammo.' },
      { text: '25%', correct: false, explanation: '25% is not a standard reserve percentage for any class of supply.' },
    ],
    damage: 30,
  },
];

const PPT_ATTACKS = [
  '"Per my last slide..."',
  '"If you\'ll just look at the chart..."',
  '"I\'ve color-coded this for clarity..."',
  '"This is all in the read-ahead I sent..."',
  '"Slide 47 covers this in detail..."',
  '"Let me just share my screen..."',
];

export default function PptBossScreen() {
  const { state, dispatch } = useGame();
  const [playerHP, setPlayerHP] = useState(100);
  const [bossHP, setBossHP] = useState(100);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [phase, setPhase] = useState<'intro' | 'player_turn' | 'boss_turn' | 'result' | 'victory' | 'defeat'>('intro');
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ correct: boolean; text: string } | null>(null);
  const [bossMessage, setBossMessage] = useState('');
  const [shakePlayer, setShakePlayer] = useState(false);
  const [shakeBoss, setShakeBoss] = useState(false);
  const [turn, setTurn] = useState(0);

  const currentQ = BOSS_QUESTIONS[currentQIdx % BOSS_QUESTIONS.length];

  const handleAnswer = useCallback((idx: number) => {
    if (phase !== 'player_turn' || selectedAnswer !== null) return;
    setSelectedAnswer(idx);
    const choice = currentQ.choices[idx];

    if (choice.correct) {
      const dmg = currentQ.damage;
      const newBossHP = Math.max(0, bossHP - dmg);
      setBossHP(newBossHP);
      setShakeBoss(true);
      setTimeout(() => setShakeBoss(false), 500);
      setFeedback({ correct: true, text: choice.explanation });

      if (newBossHP <= 0) {
        setTimeout(() => setPhase('victory'), 1500);
      } else {
        setTimeout(() => {
          setPhase('boss_turn');
          setBossMessage(PPT_ATTACKS[Math.floor(Math.random() * PPT_ATTACKS.length)]);
          setTimeout(() => {
            const bossDmg = 10 + Math.floor(Math.random() * 15);
            const newPlayerHP = Math.max(0, playerHP - bossDmg);
            setPlayerHP(newPlayerHP);
            setShakePlayer(true);
            setTimeout(() => setShakePlayer(false), 500);
            if (newPlayerHP <= 0) {
              setTimeout(() => setPhase('defeat'), 1000);
            } else {
              setTimeout(() => {
                setPhase('player_turn');
                setSelectedAnswer(null);
                setFeedback(null);
                setCurrentQIdx(prev => prev + 1);
                setTurn(prev => prev + 1);
              }, 2000);
            }
          }, 1500);
        }, 2000);
      }
    } else {
      const bossDmg = 15;
      const newPlayerHP = Math.max(0, playerHP - bossDmg);
      setPlayerHP(newPlayerHP);
      setShakePlayer(true);
      setTimeout(() => setShakePlayer(false), 500);
      setFeedback({ correct: false, text: choice.explanation });

      if (newPlayerHP <= 0) {
        setTimeout(() => setPhase('defeat'), 1500);
      } else {
        setTimeout(() => {
          setPhase('boss_turn');
          setBossMessage('"Wrong answer! Per my last slide, you should have known this."');
          setTimeout(() => {
            setTimeout(() => {
              setPhase('player_turn');
              setSelectedAnswer(null);
              setFeedback(null);
              setCurrentQIdx(prev => prev + 1);
              setTurn(prev => prev + 1);
            }, 2000);
          }, 1500);
        }, 2000);
      }
    }
  }, [phase, selectedAnswer, currentQ, bossHP, playerHP]);

  const handleVictory = useCallback(() => {
    dispatch({ type: 'DEFEAT_PPT_BOSS' });
    dispatch({ type: 'ADD_XP', amount: 100 });
    dispatch({ type: 'ADD_CREDS', amount: 150 });
    dispatch({ type: 'ADD_ACHIEVEMENT', achievement: {
      id: 'beat_ppt', name: 'Death to Slides',
      desc: 'Defeated CPT PowerPoint in battle.',
      emoji: '📊', earnedAt: Date.now(),
    }});
    dispatch({ type: 'ADD_LOG', text: 'Defeated CPT PowerPoint in boss battle!' });
    dispatch({ type: 'SET_SCREEN', screen: 'hub' });
  }, [dispatch]);

  const handleDefeat = useCallback(() => {
    dispatch({ type: 'SET_SCREEN', screen: 'hub' });
  }, [dispatch]);

  const hpColor = (hp: number) => hp > 60 ? '#4ade80' : hp > 30 ? '#facc15' : '#ef4444';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-red-950/20 to-slate-950 flex flex-col items-center justify-center p-4">

      {/* Intro */}
      <AnimatePresence>
        {phase === 'intro' && (
          <motion.div
            className="max-w-lg w-full text-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <div className="text-8xl mb-4">📊</div>
            <h1 className="text-4xl font-black text-red-400 mb-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              BOSS BATTLE
            </h1>
            <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              CPT POWERPOINT
            </h2>
            <div className="bg-slate-900/80 border border-red-500/30 rounded-xl p-6 mb-6 text-left">
              <p className="text-slate-300 text-sm leading-relaxed mb-3">
                CPT PowerPoint has entered the TOC with a 47-slide deck and a laser pointer. He believes
                that all problems can be solved with the right font size and enough gradient fills.
              </p>
              <p className="text-slate-300 text-sm leading-relaxed mb-3">
                He attacks with confusing jargon and slide-deck obfuscation. You fight back with
                clear, concise doctrine knowledge.
              </p>
              <p className="text-yellow-400 text-sm font-bold">
                ⚔ Answer doctrine questions correctly to deal damage. Wrong answers let him hit back harder.
              </p>
            </div>
            <div className="text-slate-400 text-xs mb-6">
              "Per my last slide..." — CPT PowerPoint, constantly
            </div>
            <button
              onClick={() => setPhase('player_turn')}
              className="px-8 py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl tracking-widest transition-all hover:scale-105"
              style={{ fontFamily: 'Rajdhani, sans-serif' }}
            >
              ENGAGE THE ENEMY
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Battle */}
      {(phase === 'player_turn' || phase === 'boss_turn') && (
        <div className="max-w-2xl w-full">
          {/* HP Bars */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Player HP */}
            <motion.div
              className="bg-slate-900/80 border border-slate-700 rounded-xl p-4"
              animate={shakePlayer ? { x: [-8, 8, -4, 4, 0] } : {}}
              transition={{ duration: 0.3 }}
            >
              <div className="text-xs text-slate-400 mb-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                {state.player?.rank} {state.player?.name}
              </div>
              <div className="text-lg font-bold text-white mb-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                YOU
              </div>
              <div className="h-3 bg-slate-800 rounded-full overflow-hidden mb-1">
                <motion.div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${playerHP}%`, backgroundColor: hpColor(playerHP) }}
                />
              </div>
              <div className="text-xs font-mono" style={{ color: hpColor(playerHP) }}>
                {playerHP}/100 HP
              </div>
            </motion.div>

            {/* Boss HP */}
            <motion.div
              className="bg-slate-900/80 border border-red-700/50 rounded-xl p-4"
              animate={shakeBoss ? { x: [-8, 8, -4, 4, 0] } : {}}
              transition={{ duration: 0.3 }}
            >
              <div className="text-xs text-red-400 mb-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                SLIDE RANGER
              </div>
              <div className="text-lg font-bold text-red-300 mb-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                CPT POWERPOINT
              </div>
              <div className="h-3 bg-slate-800 rounded-full overflow-hidden mb-1">
                <motion.div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${bossHP}%`, backgroundColor: hpColor(bossHP) }}
                />
              </div>
              <div className="text-xs font-mono" style={{ color: hpColor(bossHP) }}>
                {bossHP}/100 HP
              </div>
            </motion.div>
          </div>

          {/* Turn indicator */}
          <div className="text-center mb-4">
            <span
              className="px-4 py-1 rounded-full text-xs font-bold tracking-widest"
              style={{
                backgroundColor: phase === 'player_turn' ? '#16a34a20' : '#dc262620',
                color: phase === 'player_turn' ? '#4ade80' : '#f87171',
                border: `1px solid ${phase === 'player_turn' ? '#4ade8040' : '#f8717140'}`,
                fontFamily: 'Rajdhani, sans-serif',
              }}
            >
              {phase === 'player_turn' ? '⚔ YOUR TURN — Answer to attack!' : '📊 CPT POWERPOINT ATTACKS!'}
            </span>
          </div>

          {/* Boss turn message */}
          {phase === 'boss_turn' && (
            <motion.div
              className="bg-red-950/40 border border-red-500/30 rounded-xl p-4 mb-4 text-center"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="text-4xl mb-2">📊</div>
              <p className="text-red-300 text-sm italic">{bossMessage}</p>
            </motion.div>
          )}

          {/* Question */}
          {phase === 'player_turn' && (
            <motion.div
              key={currentQIdx}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-slate-900/80 border border-slate-700 rounded-xl p-6 mb-4"
            >
              {/* PPT attack line */}
              <div className="text-red-400 text-xs italic mb-3 flex items-start gap-2">
                <span className="text-lg">📊</span>
                <span>{currentQ.pptLine}</span>
              </div>

              <div className="text-white font-bold text-base mb-4" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                {currentQ.attack}
              </div>

              <div className="space-y-2">
                {currentQ.choices.map((choice, idx) => {
                  let bg = 'bg-slate-800/60 border-slate-600 hover:border-cyan-500/50 hover:bg-slate-700/60';
                  let textColor = 'text-slate-200';
                  if (selectedAnswer !== null) {
                    if (idx === selectedAnswer) {
                      bg = choice.correct
                        ? 'bg-green-900/60 border-green-500'
                        : 'bg-red-900/60 border-red-500';
                      textColor = choice.correct ? 'text-green-300' : 'text-red-300';
                    } else if (choice.correct) {
                      bg = 'bg-green-900/40 border-green-500/50';
                      textColor = 'text-green-400';
                    }
                  }
                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(idx)}
                      disabled={selectedAnswer !== null}
                      className={`w-full text-left p-3 rounded-lg border text-sm transition-all duration-200 ${bg} ${textColor}`}
                    >
                      <span className="font-bold mr-2">{String.fromCharCode(65 + idx)}.</span>
                      {choice.text}
                    </button>
                  );
                })}
              </div>

              {/* Feedback */}
              {feedback && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-4 p-3 rounded-lg text-sm ${feedback.correct ? 'bg-green-900/40 border border-green-500/30 text-green-300' : 'bg-red-900/40 border border-red-500/30 text-red-300'}`}
                >
                  {feedback.correct ? '✓ ' : '✗ '}{feedback.text}
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Turn counter */}
          <div className="text-center text-xs text-slate-500" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
            ROUND {turn + 1} / {BOSS_QUESTIONS.length}
          </div>
        </div>
      )}

      {/* Victory */}
      <AnimatePresence>
        {phase === 'victory' && (
          <motion.div
            className="max-w-lg w-full text-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <motion.div
              className="text-8xl mb-4"
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 0.8, repeat: 2 }}
            >
              🏆
            </motion.div>
            <h1 className="text-4xl font-black text-yellow-400 mb-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              VICTORY!
            </h1>
            <h2 className="text-xl font-bold text-white mb-6">CPT PowerPoint has been defeated!</h2>
            <div className="bg-slate-900/80 border border-yellow-500/30 rounded-xl p-6 mb-6">
              <p className="text-slate-300 text-sm mb-4">
                CPT PowerPoint retreats, muttering something about "leveraging synergies" and
                "circling back offline." His 47-slide deck lies scattered across the TOC floor.
              </p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-yellow-900/30 rounded-lg p-3 border border-yellow-500/20">
                  <div className="text-yellow-400 font-bold">+100 XP</div>
                  <div className="text-slate-400 text-xs">Combat bonus</div>
                </div>
                <div className="bg-cyan-900/30 rounded-lg p-3 border border-cyan-500/20">
                  <div className="text-cyan-400 font-bold">+150 CR</div>
                  <div className="text-slate-400 text-xs">Victory reward</div>
                </div>
              </div>
              <div className="mt-3 text-yellow-400 text-xs font-bold">
                🏆 Achievement Unlocked: Death to Slides
              </div>
            </div>
            <button
              onClick={handleVictory}
              className="px-8 py-4 bg-yellow-600 hover:bg-yellow-500 text-black font-bold rounded-xl tracking-widest transition-all hover:scale-105"
              style={{ fontFamily: 'Rajdhani, sans-serif' }}
            >
              RETURN TO HUB
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Defeat */}
      <AnimatePresence>
        {phase === 'defeat' && (
          <motion.div
            className="max-w-lg w-full text-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="text-8xl mb-4">📊</div>
            <h1 className="text-4xl font-black text-red-400 mb-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              DEFEATED
            </h1>
            <h2 className="text-xl font-bold text-slate-300 mb-6">CPT PowerPoint wins this round.</h2>
            <div className="bg-slate-900/80 border border-red-500/30 rounded-xl p-6 mb-6">
              <p className="text-slate-300 text-sm mb-4">
                You are buried under 47 slides. The last thing you see is a pie chart with
                "SYNERGY" written in Comic Sans. You have failed the TOC.
              </p>
              <p className="text-red-400 text-xs">
                Study your doctrine and try again. The boss battle is still available.
              </p>
            </div>
            <button
              onClick={handleDefeat}
              className="px-8 py-4 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl tracking-widest transition-all hover:scale-105"
              style={{ fontFamily: 'Rajdhani, sans-serif' }}
            >
              RETREAT TO HUB
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
