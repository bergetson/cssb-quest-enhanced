import { useGame } from '../../contexts/GameContext';
import { ScreenWrap, MilButton } from '../../components/GameUI';

export default function SecretScreen() {
  const { state, dispatch } = useGame();

  if (!state.secret) {
    return (
      <ScreenWrap>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-4xl mb-4">🔒</div>
            <div className="text-slate-500 mono text-sm">Access denied. Purchase the secret phrase from the Supply Depot.</div>
            <button onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'hub' })} className="mt-4 text-xs text-slate-600 mono hover:text-slate-300">← BACK</button>
          </div>
        </div>
      </ScreenWrap>
    );
  }

  return (
    <ScreenWrap showTopBar={false}>
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-lg text-center animate-fade-in-up">
          {/* Glowing title */}
          <div className="text-6xl mb-6">⭐</div>
          <h1 className="text-4xl font-black text-yellow-400 tracking-wider mb-4" style={{
            fontFamily: 'Rajdhani, sans-serif',
            textShadow: '0 0 60px oklch(0.78 0.15 85 / 60%)',
          }}>
            SECRET ENDING
          </h1>

          <div className="mil-card mil-card-gold p-6 mb-6 text-left">
            <div className="text-xs text-yellow-400/70 mono tracking-widest mb-4">// CLASSIFIED — EYES ONLY</div>

            <p className="text-slate-300 text-sm leading-relaxed mb-4">
              You found it. The phrase that separates the staff officers who get it from those who are still asking where the printer is.
            </p>

            <div className="text-center py-6 border border-yellow-400/30 rounded-xl bg-yellow-400/5 my-4">
              <div className="text-2xl font-black text-yellow-400 tracking-wide" style={{ fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.1em' }}>
                "THE 495 CSSB IS THE
              </div>
              <div className="text-3xl font-black text-yellow-400 tracking-wider mt-1" style={{ fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.12em', textShadow: '0 0 30px oklch(0.78 0.15 85 / 50%)' }}>
                PREMIER CSSB."
              </div>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed mt-4">
              Say it with conviction. Say it at the right moment. Say it when the supported unit questions your plan. 
              Say it when the printer jams. Say it when the weather report is wrong. 
              Say it when CPT PowerPoint adds another gradient.
            </p>
            <p className="text-slate-500 text-xs mt-3 italic">
              The 495 CSSB does not just support. It sustains. It enables. It delivers. 
              And it does it better than any other CSSB on the planet.
            </p>
          </div>

          {/* Characters react */}
          <div className="grid gap-3 mb-6 text-left">
            {[
              { emoji: '🕶️', name: 'SFC Ray', text: '"I already knew this. I just let you figure it out."' },
              { emoji: '📊', name: 'MAJ Cantrell', text: '"Put it in the sustainment annex. Paragraph 4, subparagraph b."' },
              { emoji: '🎯', name: 'LTC Figarelle', text: '"That is not a slogan. That is a standard."' },
              { emoji: '🤝', name: 'E4 Mafia', text: '"We\'ve known this since day one. Welcome to the club."' },
            ].map(c => (
              <div key={c.name} className="mil-card p-3 flex items-start gap-3">
                <div className="text-2xl">{c.emoji}</div>
                <div>
                  <div className="text-xs font-bold text-yellow-400 mb-0.5" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{c.name}</div>
                  <div className="text-xs text-slate-400 italic">{c.text}</div>
                </div>
              </div>
            ))}
          </div>

          <MilButton color="gold" className="w-full" onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'hub' })}>
            ← RETURN TO HUB
          </MilButton>
        </div>
      </div>
    </ScreenWrap>
  );
}
