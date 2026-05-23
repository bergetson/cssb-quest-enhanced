import { useEffect, useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import { MilButton } from '../../components/GameUI';

const HERO_BG = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663646606947/etW7jUmZmV32EJoFW5ZKtJ/cssb-hero-title-UPZkbzdjqUmoWdoKDWrTX7.webp';

export default function TitleScreen() {
  const { state, dispatch } = useGame();
  const [glitch, setGlitch] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 150);
    }, 4000);
    const ticker = setInterval(() => setTick(t => t + 1), 1000);
    return () => { clearInterval(interval); clearInterval(ticker); };
  }, []);

  const hasPlayer = !!state.player;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4">
      {/* Hero background */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `url(${HERO_BG})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: 0.18,
      }} />
      {/* Dark overlay */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'linear-gradient(to bottom, oklch(0.08 0.01 240) 0%, oklch(0.06 0.01 240 / 80%) 50%, oklch(0.08 0.01 240) 100%)',
      }} />
      {/* Grid */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(oklch(1 0 0 / 2.5%) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0 / 2.5%) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />
      {/* Gold radial glow */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at 50% 40%, oklch(0.78 0.15 85 / 10%) 0%, transparent 60%)',
      }} />

      <div className="relative z-10 text-center max-w-lg w-full animate-fade-in-up">
        {/* Logo */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-2xl border-2 border-yellow-400/60 bg-yellow-400/10 flex items-center justify-center shadow-lg"
            style={{ boxShadow: '0 0 40px oklch(0.78 0.15 85 / 20%)' }}>
            <span className="text-yellow-400 font-black text-2xl" style={{ fontFamily: 'Rajdhani, sans-serif' }}>495</span>
          </div>
        </div>

        {/* Title */}
        <h1
          className={`title-logo-text font-black text-yellow-400 mb-2 transition-opacity ${glitch ? 'opacity-70' : 'opacity-100'}`}
          style={{ fontFamily: 'Rajdhani, sans-serif', textShadow: '0 0 60px oklch(0.78 0.15 85 / 50%), 0 0 120px oklch(0.78 0.15 85 / 20%)' }}
        >
          CSSB QUEST
        </h1>
        <div className="text-cyan-400 text-sm tracking-widest mono mb-1">STAFF OFFICER TRAINING SYSTEM</div>
        <div className="text-slate-600 text-xs mono mb-8">v2.0 - ENHANCED EDITION</div>

        {/* Status bar */}
        <div className="title-status-bar flex justify-center gap-4 mb-6 text-xs mono text-slate-600">
          <span className="text-emerald-500">SYSTEM ONLINE</span>
          <span>|</span>
          <span>{new Date().toLocaleTimeString()}</span>
          <span>|</span>
          <span>495 CSSB</span>
        </div>

        {/* Tagline */}
        <div className="mil-card p-4 mb-6 text-left">
          <div className="text-xs text-yellow-400/80 mono tracking-widest mb-2">// MISSION BRIEF</div>
          <p className="text-sm text-slate-300 leading-relaxed">
            Train as a staff officer. Master MDMP, commodity calculations, and staff work. 
            Earn credits. Unlock secrets. Prove you belong in the TOC.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {['MDMP', 'CLASS I-V', 'PACE', 'COA WARGAME', 'LOGSTAT', 'OPORD'].map(t => (
              <span key={t} className="mil-tag mil-tag-cyan">{t}</span>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          {hasPlayer ? (
            <>
              <MilButton color="gold" size="lg" className="w-full" onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'hub' })}>
                CONTINUE - {state.player!.rank} {state.player!.name}
              </MilButton>
              <MilButton color="cyan" className="w-full" onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'register' })}>
                NEW SOLDIER
              </MilButton>
            </>
          ) : (
            <MilButton color="gold" size="lg" className="w-full" onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'register' })}>
              BEGIN TRAINING
            </MilButton>
          )}
          <div className="grid grid-cols-2 gap-3">
            <MilButton color="cyan" className="w-full" onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'ref' })}>
              REFERENCE
            </MilButton>
            <MilButton color="green" className="w-full" onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'calc' })}>
              CALCULATOR
            </MilButton>
          </div>
        </div>

        {/* Footer */}
        <div className="title-footer mt-8 text-[10px] text-slate-700 mono tracking-widest">
          495 CSSB - THE PREMIER CSSB - STAFF EXCELLENCE - DEV BY CPT BERGET
        </div>
      </div>
    </div>
  );
}
