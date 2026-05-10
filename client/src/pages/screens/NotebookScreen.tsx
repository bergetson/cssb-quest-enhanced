import { useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import { ScreenWrap, SectionTitle, MilCard, Divider } from '../../components/GameUI';

export default function NotebookScreen() {
  const { state, dispatch } = useGame();
  const [search, setSearch] = useState('');

  const entries = state.notebook.filter(e =>
    !search || e.title.toLowerCase().includes(search.toLowerCase()) || e.text.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ScreenWrap>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <button onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'hub' })} className="text-xs text-slate-500 mono mb-4 hover:text-slate-300 transition-colors">
          ← HUB
        </button>

        <SectionTitle color="cyan">NOTEBOOK / AAR LOG</SectionTitle>

        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search entries..."
          className="mil-input mb-6"
        />

        {entries.length === 0 ? (
          <div className="text-center py-12 text-slate-600 text-sm">
            No entries yet. Complete missions to generate AAR notes.
          </div>
        ) : (
          <div className="grid gap-3">
            {entries.map((e, i) => (
              <MilCard key={i} className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="text-xs font-bold text-cyan-400" style={{ fontFamily: 'Rajdhani, sans-serif' }}>{e.title}</div>
                  <div className="text-[10px] text-slate-600 mono shrink-0">{new Date(e.ts).toLocaleString()}</div>
                </div>
                <pre className="text-xs text-slate-400 whitespace-pre-wrap font-mono leading-relaxed">{e.text}</pre>
              </MilCard>
            ))}
          </div>
        )}

        {state.log.length > 0 && (
          <>
            <Divider label="ACTIVITY LOG" />
            <div className="grid gap-1">
              {state.log.slice(0, 20).map((l, i) => (
                <div key={i} className="text-[10px] text-slate-600 mono">{l}</div>
              ))}
            </div>
          </>
        )}
      </div>
    </ScreenWrap>
  );
}
