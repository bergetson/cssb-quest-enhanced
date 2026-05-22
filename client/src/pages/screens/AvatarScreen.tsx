import { useMemo, useState } from 'react';
import { toast } from 'sonner';
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
    { value: 'dress', label: 'Dress Uniform' },
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
    { value: 'mountains', label: 'Montana Mountains' },
  ],
};

const randomPick = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];

export default function AvatarScreen() {
  const { state, dispatch } = useGame();
  const [draft, setDraft] = useState<AvatarConfig>(state.avatar || defaultAvatar());

  const stressPreview = useMemo(() => Math.max(state.chaosMeter, state.stats.chaos), [state.chaosMeter, state.stats.chaos]);

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
    toast.success('Avatar saved. Cosmetics from the shop will show up on your character.');
    dispatch({ type: 'SET_SCREEN', screen: 'hub' });
  }

  return (
    <ScreenWrap>
      <div className="max-w-5xl mx-auto px-4 py-6">
        <button onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'hub' })} className="text-xs text-slate-500 mono mb-4 hover:text-slate-300 transition-colors">
          BACK TO HUB
        </button>

        <SectionTitle color="gold" sub="Build your 8-bit staff officer. Shop cosmetics change the portrait in the header and hub.">
          AVATAR BUILDER
        </SectionTitle>

        <div className="grid lg:grid-cols-[320px_1fr] gap-5">
          <MilCard color="gold" className="p-5 sticky top-24 self-start">
            <div className="text-[10px] mono tracking-[0.2em] text-yellow-400/70 mb-3">// SOLDIER PREVIEW</div>
            <PixelSoldierAvatar
              avatar={draft}
              cosmeticId={state.activeCosmeticId}
              chaos={stressPreview}
              size="lg"
              showLabel
            />
            <div className="grid grid-cols-2 gap-2 mt-5">
              <MilButton color="cyan" onClick={randomize}>RANDOMIZE</MilButton>
              <MilButton onClick={() => setDraft(defaultAvatar())}>RESET</MilButton>
            </div>
            <div className="info-box mt-4">
              <div className="text-[10px] mono tracking-[0.16em] text-cyan-300 mb-1">// LIVE STATUS</div>
              High chaos makes your avatar look stressed. Useful, silly, and cosmetic shop items appear here after you equip them.
            </div>
          </MilCard>

          <div className="grid sm:grid-cols-2 gap-3">
            {(Object.keys(options) as (keyof AvatarConfig)[]).map(key => (
              <MilCard key={key} className="p-4">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="text-sm font-bold text-slate-200" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                    {key.replace(/([A-Z])/g, ' $1').toUpperCase()}
                  </div>
                  <MilTag color="cyan">{String(draft[key]).toUpperCase()}</MilTag>
                </div>
                <div className="grid grid-cols-2 gap-2">
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

        <div className="grid grid-cols-2 gap-3 mt-5">
          <MilButton onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'hub' })}>
            CANCEL
          </MilButton>
          <MilButton color="gold" onClick={save}>
            SAVE AVATAR
          </MilButton>
        </div>
      </div>
    </ScreenWrap>
  );
}
