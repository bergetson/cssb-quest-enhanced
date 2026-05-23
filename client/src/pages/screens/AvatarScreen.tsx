import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Shuffle, RotateCcw, Save, X } from 'lucide-react';
import { useGame } from '../../contexts/GameContext';
import { MilButton, MilCard, MilTag, ScreenWrap, SectionTitle } from '../../components/GameUI';
import PixelSoldierAvatar from '../../components/PixelSoldierAvatar';
import { defaultAvatar, type AvatarConfig } from '../../lib/gameData';

const options: {
  [K in keyof AvatarConfig]: { value: AvatarConfig[K]; label: string }[];
} = {
  body: [
    { value: 'light', label: 'Light' },
    { value: 'tan', label: 'Tan' },
    { value: 'brown', label: 'Brown' },
    { value: 'dark', label: 'Dark' },
  ],
  hair: [
    { value: 'black', label: 'Black' },
    { value: 'brown', label: 'Brown' },
    { value: 'blond', label: 'Blond' },
    { value: 'red', label: 'Red' },
    { value: 'gray', label: 'Gray' },
  ],
  hairStyle: [
    { value: 'short', label: 'Short' },
    { value: 'fade', label: 'Fade' },
    { value: 'bun', label: 'Bun' },
    { value: 'bald', label: 'Bald' },
  ],
  face: [
    { value: 'calm', label: 'Calm' },
    { value: 'focused', label: 'Focused' },
    { value: 'smirk', label: 'Smirk' },
    { value: 'serious', label: 'Serious' },
  ],
  uniform: [
    { value: 'ocp', label: 'OCP' },
    { value: 'pt', label: 'PT Gear' },
    { value: 'dress', label: 'Dress' },
    { value: 'field', label: 'Field Kit' },
  ],
  patch: [
    { value: 'cssb', label: '495 CSSB' },
    { value: 's1', label: 'S1' },
    { value: 's2', label: 'S2' },
    { value: 's3', label: 'S3' },
    { value: 's4', label: 'S4' },
    { value: 's6', label: 'S6' },
    { value: 'spo', label: 'SPO' },
  ],
  backdrop: [
    { value: 'toc', label: 'TOC' },
    { value: 'motorpool', label: 'Motor Pool' },
    { value: 'field', label: 'Field Site' },
    { value: 'mountains', label: 'Montana' },
  ],
};

const optionLabels: Record<keyof AvatarConfig, string> = {
  body: 'Skin Tone',
  hair: 'Hair Color',
  hairStyle: 'Hair Style',
  face: 'Face',
  uniform: 'Uniform',
  patch: 'Patch',
  backdrop: 'Backdrop',
};

const randomPick = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];

export default function AvatarScreen() {
  const { state, dispatch } = useGame();
  const [draft, setDraft] = useState<AvatarConfig>(state.avatar || defaultAvatar());

  const stressPreview = useMemo(() => Math.max(state.chaosMeter, state.stats.chaos), [state.chaosMeter, state.stats.chaos]);
  const statusLabel = stressPreview >= 70 ? 'STRESSED' : stressPreview >= 40 ? 'BUSY' : 'STEADY';

  function randomize() {
    setDraft({
      body: randomPick(options.body).value,
      hair: randomPick(options.hair).value,
      hairStyle: randomPick(options.hairStyle).value,
      face: randomPick(options.face).value,
      uniform: randomPick(options.uniform).value,
      patch: randomPick(options.patch).value,
      backdrop: randomPick(options.backdrop).value,
    });
  }

  function save() {
    dispatch({ type: 'SET_AVATAR', avatar: draft });
    dispatch({
      type: 'ADD_ACHIEVEMENT',
      achievement: {
        id: 'pixel_persona',
        name: 'Pixel Persona',
        desc: 'Built a custom staff officer avatar.',
        emoji: 'PX',
        earnedAt: Date.now(),
      },
    });
    toast.success('Avatar saved. Equipped shop cosmetics now show on your portrait.');
    dispatch({ type: 'SET_SCREEN', screen: 'hub' });
  }

  return (
    <ScreenWrap>
      <div className="avatar-screen max-w-6xl mx-auto px-4 py-6">
        <button onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'hub' })} className="text-xs text-slate-500 mono mb-4 hover:text-slate-300 transition-colors">
          BACK TO HUB
        </button>

        <SectionTitle color="gold" sub="Build your 8-bit staff officer. Shop items update the portrait when equipped.">
          AVATAR BUILDER
        </SectionTitle>

        <div className="avatar-builder-layout">
          <MilCard color="gold" className="avatar-preview-card">
            <div className="avatar-preview-mobile-row">
              <div className="avatar-preview-main">
                <PixelSoldierAvatar
                  avatar={draft}
                  cosmeticId={state.activeCosmeticId}
                  chaos={stressPreview}
                  size="lg"
                  showLabel
                />
              </div>

              <div className="avatar-preview-meta">
                <div className="text-[10px] mono tracking-[0.2em] text-yellow-400/70 mb-2">// SOLDIER PREVIEW</div>
                <div className="text-2xl font-black text-yellow-400 leading-none" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                  {state.player?.rank || 'CPT'} {state.player?.name || 'PLAYER'}
                </div>
                <div className="text-xs text-slate-500 mt-1">{state.player?.unit || '495 CSSB'}</div>

                <div className="avatar-tag-row">
                  <MilTag color="gold">{draft.uniform.toUpperCase()}</MilTag>
                  <MilTag color={stressPreview >= 70 ? 'red' : stressPreview >= 40 ? 'orange' : 'cyan'}>{statusLabel}</MilTag>
                  {state.activeCosmeticId && <MilTag color="purple">{state.activeCosmeticId.replace(/_/g, ' ').toUpperCase()}</MilTag>}
                </div>

                <div className="avatar-preview-actions">
                  <button type="button" className="avatar-icon-button avatar-icon-button-cyan" onClick={randomize} aria-label="Randomize avatar">
                    <Shuffle size={17} />
                    <span>RANDOM</span>
                  </button>
                  <button type="button" className="avatar-icon-button" onClick={() => setDraft(defaultAvatar())} aria-label="Reset avatar">
                    <RotateCcw size={17} />
                    <span>RESET</span>
                  </button>
                </div>
              </div>
            </div>
          </MilCard>

          <div className="avatar-control-grid">
            {(Object.keys(options) as (keyof AvatarConfig)[]).map(key => (
              <MilCard key={key} className="avatar-control-card">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="text-sm font-bold text-slate-200" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                    {optionLabels[key].toUpperCase()}
                  </div>
                  <MilTag color="cyan">{String(draft[key]).toUpperCase()}</MilTag>
                </div>
                <div className="avatar-choice-grid">
                  {options[key].map(option => (
                    <button
                      key={String(option.value)}
                      onClick={() => setDraft(current => ({ ...current, [key]: option.value } as AvatarConfig))}
                      className={`avatar-option ${draft[key] === option.value ? 'avatar-option-active' : ''}`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </MilCard>
            ))}
          </div>
        </div>

        <div className="avatar-save-bar">
          <MilButton onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'hub' })}>
            <span className="inline-flex items-center justify-center gap-2"><X size={16} /> CANCEL</span>
          </MilButton>
          <MilButton color="gold" onClick={save}>
            <span className="inline-flex items-center justify-center gap-2"><Save size={16} /> SAVE AVATAR</span>
          </MilButton>
        </div>
      </div>
    </ScreenWrap>
  );
}
