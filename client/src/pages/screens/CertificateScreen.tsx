import { useGame } from '../../contexts/GameContext';
import { ScreenWrap, MilButton, GradeBadge } from '../../components/GameUI';

export default function CertificateScreen() {
  const { state, dispatch } = useGame();
  const completed = Object.keys(state.completed).length;
  const totalScore = Object.values(state.missions).reduce((s, m) => s + m.score, 0);
  const maxScore = Object.values(state.missions).reduce((s, m) => s + m.max, 0);
  const overallGrade = maxScore > 0 ? (totalScore / maxScore >= 0.9 ? 'GOLD' : totalScore / maxScore >= 0.75 ? 'SILVER' : totalScore / maxScore >= 0.6 ? 'BRONZE' : 'FAILED') : 'BRONZE';
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <ScreenWrap>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <button onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'hub' })} className="text-xs text-slate-500 mono mb-6 hover:text-slate-300 transition-colors">
          ← HUB
        </button>

        {/* Certificate */}
        <div className="mil-card mil-card-gold p-8 text-center animate-fade-in-up" style={{
          background: 'linear-gradient(135deg, oklch(0.15 0.02 85) 0%, oklch(0.12 0.015 85) 100%)',
          border: '2px solid oklch(0.78 0.15 85 / 50%)',
        }}>
          {/* Header */}
          <div className="text-xs text-yellow-400/60 mono tracking-widest mb-4">495TH COMBAT SUSTAINMENT SUPPORT BATTALION</div>
          <div className="text-4xl mb-4">🎖️</div>
          <h1 className="text-3xl font-black text-yellow-400 tracking-wider mb-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
            CERTIFICATE OF TRAINING
          </h1>
          <div className="text-slate-500 text-sm mb-6">Staff Officer Qualification Program</div>

          {/* Recipient */}
          <div className="border-t border-b border-yellow-400/20 py-6 mb-6">
            <div className="text-xs text-slate-500 mono mb-2">THIS CERTIFIES THAT</div>
            <div className="text-2xl font-black text-white tracking-wide" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              {state.player?.rank} {state.player?.name}
            </div>
            <div className="text-sm text-slate-400">{state.player?.unit}</div>
          </div>

          {/* Achievement */}
          <div className="mb-6">
            <div className="text-xs text-slate-500 mono mb-2">HAS SUCCESSFULLY COMPLETED</div>
            <div className="text-lg font-bold text-cyan-400" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              {completed} OF 10 CAMPAIGN MISSIONS
            </div>
            <div className="flex items-center justify-center gap-3 mt-3">
              <GradeBadge grade={overallGrade} />
              <span className="text-sm text-slate-400">{totalScore}/{maxScore} points</span>
            </div>
          </div>

          {/* Badges */}
          {Object.values(state.badges).length > 0 && (
            <div className="mb-6">
              <div className="text-xs text-slate-500 mono mb-2">BADGES EARNED</div>
              <div className="flex flex-wrap justify-center gap-2">
                {Object.values(state.badges).map(b => (
                  <span key={b.id} className="text-xl" title={b.name}>{b.emoji}</span>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="text-xs text-slate-600 mono mt-6">{today}</div>
          <div className="text-xs text-yellow-400/60 mono mt-2 tracking-widest">
            THE 495 CSSB IS THE PREMIER CSSB
          </div>
        </div>

        <div className="mt-6">
          <MilButton color="gold" className="w-full" onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'hub' })}>
            ← RETURN TO HUB
          </MilButton>
        </div>
      </div>
    </ScreenWrap>
  );
}
