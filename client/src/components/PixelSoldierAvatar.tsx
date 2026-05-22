import type { CSSProperties } from 'react';
import type { AvatarConfig } from '../lib/gameData';

type AvatarSize = 'sm' | 'md' | 'lg';

const bodyColors: Record<AvatarConfig['body'], string> = {
  light: '#f0c8a8',
  tan: '#c98f61',
  brown: '#9a5c38',
  dark: '#5c321f',
};

const hairColors: Record<AvatarConfig['hair'], string> = {
  black: '#171717',
  brown: '#5a321f',
  blond: '#d8b45b',
  red: '#9d3f22',
  gray: '#9aa0a6',
};

const uniformColors: Record<AvatarConfig['uniform'], { main: string; trim: string; gear: string }> = {
  ocp: { main: '#5f6f43', trim: '#2d3d27', gear: '#9a8f5e' },
  pt: { main: '#2d3138', trim: '#f0c542', gear: '#111827' },
  dress: { main: '#173050', trim: '#d3a842', gear: '#0b1220' },
  field: { main: '#3d4a31', trim: '#1f2b1d', gear: '#77724a' },
};

const backdropLabel: Record<AvatarConfig['backdrop'], string> = {
  toc: 'TOC',
  motorpool: 'MTPL',
  field: 'FIELD',
  mountains: 'MTN',
};

const patchLabel: Record<AvatarConfig['patch'], string> = {
  cssb: '495',
  s1: 'S1',
  s2: 'S2',
  s3: 'S3',
  s4: 'S4',
  s6: 'S6',
  spo: 'SPO',
};

export function PixelSoldierAvatar({
  avatar,
  cosmeticId,
  chaos = 0,
  size = 'md',
  className = '',
  showLabel = false,
}: {
  avatar: AvatarConfig;
  cosmeticId?: string | null;
  chaos?: number;
  size?: AvatarSize;
  className?: string;
  showLabel?: boolean;
}) {
  const uniform = uniformColors[avatar.uniform];
  const stress = chaos >= 70 ? 'high' : chaos >= 40 ? 'medium' : 'low';
  const face = stress === 'high' ? 'serious' : avatar.face;
  const hasAccessory = !!cosmeticId;

  return (
    <div
      className={`pixel-avatar pixel-avatar-${size} pixel-avatar-${stress} ${className}`}
      style={{
        '--skin': bodyColors[avatar.body],
        '--hair': hairColors[avatar.hair],
        '--uniform': uniform.main,
        '--uniform-trim': uniform.trim,
        '--gear': uniform.gear,
      } as CSSProperties}
      data-backdrop={avatar.backdrop}
      data-face={face}
      aria-label="Player avatar"
    >
      <div className="pixel-stage">
        <div className="pixel-grid" />
        <div className="pixel-backdrop-label">{backdropLabel[avatar.backdrop]}</div>
        <div className="pixel-shadow" />
        <div className="pixel-leg pixel-leg-left" />
        <div className="pixel-leg pixel-leg-right" />
        <div className="pixel-body" />
        <div className="pixel-arm pixel-arm-left" />
        <div className="pixel-arm pixel-arm-right" />
        <div className="pixel-neck" />
        <div className="pixel-head" />
        {avatar.hairStyle !== 'bald' && <div className={`pixel-hair pixel-hair-${avatar.hairStyle}`} />}
        <div className="pixel-eye pixel-eye-left" />
        <div className="pixel-eye pixel-eye-right" />
        <div className="pixel-mouth" />
        <div className="pixel-patch">{patchLabel[avatar.patch]}</div>
        <div className="pixel-vest" />
        {stress !== 'low' && <div className="pixel-sweat" />}
        {cosmeticId === 'beret' && <div className="pixel-beret" />}
        {cosmeticId === 'funny_hat' && <div className="pixel-funny-hat" />}
        {cosmeticId === 'aviator_glasses' && <div className="pixel-aviators" />}
        {cosmeticId === 'iron_man_mustache' && <div className="pixel-mustache" />}
        {cosmeticId === 'coffee_mug' && <div className="pixel-mug" />}
        {cosmeticId === 'whiteboard_marker' && <div className="pixel-marker" />}
        {hasAccessory && <div className="pixel-spark pixel-spark-a" />}
        {hasAccessory && <div className="pixel-spark pixel-spark-b" />}
      </div>
      {showLabel && (
        <div className="pixel-avatar-caption">
          {avatar.uniform.toUpperCase()} / {patchLabel[avatar.patch]}
        </div>
      )}
    </div>
  );
}

export default PixelSoldierAvatar;
