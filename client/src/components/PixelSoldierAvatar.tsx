import type { AvatarConfig } from '../lib/gameData';

type AvatarSize = 'sm' | 'md' | 'lg';

const skinColors: Record<AvatarConfig['body'], { base: string; shadow: string; light: string }> = {
  light: { base: '#f0c7a5', shadow: '#c58d6a', light: '#ffd9b8' },
  tan: { base: '#c88b55', shadow: '#8d5c36', light: '#e3aa71' },
  brown: { base: '#8a5533', shadow: '#5e371f', light: '#ad7047' },
  dark: { base: '#5b3525', shadow: '#321f18', light: '#7b4b35' },
};

const hairColors: Record<AvatarConfig['hair'], string> = {
  black: '#101820',
  brown: '#4c2e19',
  blond: '#d5b45b',
  red: '#9f3f22',
  gray: '#8c96a3',
};

const uniformPalette: Record<AvatarConfig['uniform'], { main: string; dark: string; accent: string; strap: string }> = {
  ocp: { main: '#52683f', dark: '#28351f', accent: '#8d9a68', strap: '#1f2719' },
  pt: { main: '#1b2433', dark: '#0b1220', accent: '#f0d86d', strap: '#324052' },
  dress: { main: '#21345d', dark: '#0e1935', accent: '#f3d069', strap: '#101827' },
  field: { main: '#3b4d2c', dark: '#172414', accent: '#7f8d55', strap: '#121a11' },
};

const patchLabels: Record<AvatarConfig['patch'], string> = {
  cssb: '495',
  s1: 'S1',
  s2: 'S2',
  s3: 'S3',
  s4: 'S4',
  s6: 'S6',
  spo: 'SPO',
};

const backdropLabels: Record<AvatarConfig['backdrop'], string> = {
  toc: 'TOC',
  motorpool: 'MOTOR',
  field: 'FIELD',
  mountains: 'MT',
};

function Backdrop({ type }: { type: AvatarConfig['backdrop'] }) {
  if (type === 'motorpool') {
    return (
      <>
        <rect x="0" y="0" width="96" height="68" fill="#132031" />
        <rect x="0" y="68" width="96" height="44" fill="#182012" />
        <rect x="10" y="72" width="28" height="10" fill="#45552e" />
        <rect x="16" y="68" width="10" height="4" fill="#6f7a50" />
        <rect x="11" y="82" width="6" height="6" fill="#0a0e12" />
        <rect x="31" y="82" width="6" height="6" fill="#0a0e12" />
        <rect x="68" y="14" width="18" height="5" fill="#d3aa45" opacity="0.8" />
      </>
    );
  }
  if (type === 'field') {
    return (
      <>
        <rect x="0" y="0" width="96" height="66" fill="#112b2d" />
        <rect x="0" y="66" width="96" height="46" fill="#1f3a23" />
        <rect x="9" y="73" width="16" height="4" fill="#8a7f4a" />
        <rect x="64" y="71" width="21" height="5" fill="#7c8751" />
        <rect x="76" y="64" width="3" height="7" fill="#7c8751" />
        <rect x="68" y="20" width="8" height="8" fill="#e0bd57" opacity="0.75" />
      </>
    );
  }
  if (type === 'mountains') {
    return (
      <>
        <rect x="0" y="0" width="96" height="70" fill="#10243a" />
        <rect x="0" y="70" width="96" height="42" fill="#19291d" />
        <polygon points="0,70 20,35 40,70" fill="#2f5b62" />
        <polygon points="16,70 48,24 82,70" fill="#35556f" />
        <polygon points="52,70 78,40 96,70" fill="#2a4b5b" />
        <polygon points="42,32 48,24 55,33" fill="#dce9ef" />
      </>
    );
  }
  return (
    <>
      <rect x="0" y="0" width="96" height="68" fill="#111827" />
      <rect x="0" y="68" width="96" height="44" fill="#10151f" />
      <rect x="9" y="13" width="24" height="16" fill="#13263b" stroke="#31536f" strokeWidth="2" />
      <rect x="13" y="18" width="16" height="2" fill="#67e8f9" opacity="0.7" />
      <rect x="13" y="23" width="10" height="2" fill="#eab308" opacity="0.8" />
      <rect x="63" y="12" width="24" height="18" fill="#182638" stroke="#4b5563" strokeWidth="2" />
      <rect x="67" y="17" width="7" height="2" fill="#94a3b8" />
      <rect x="67" y="22" width="13" height="2" fill="#94a3b8" />
    </>
  );
}

function Hair({ style, color }: { style: AvatarConfig['hairStyle']; color: string }) {
  if (style === 'bald') return null;
  if (style === 'fade') {
    return (
      <>
        <rect x="34" y="20" width="28" height="8" fill={color} />
        <rect x="32" y="28" width="4" height="14" fill={color} />
        <rect x="60" y="28" width="4" height="14" fill={color} />
        <rect x="38" y="20" width="20" height="4" fill="#0b1118" opacity="0.35" />
      </>
    );
  }
  if (style === 'bun') {
    return (
      <>
        <rect x="34" y="20" width="28" height="9" fill={color} />
        <rect x="30" y="28" width="7" height="11" fill={color} />
        <rect x="59" y="28" width="7" height="11" fill={color} />
        <rect x="64" y="26" width="9" height="9" fill={color} />
        <rect x="66" y="28" width="5" height="5" fill="#0b1118" opacity="0.25" />
      </>
    );
  }
  return (
    <>
      <rect x="34" y="19" width="28" height="10" fill={color} />
      <rect x="32" y="25" width="7" height="7" fill={color} />
      <rect x="57" y="25" width="7" height="7" fill={color} />
      <rect x="41" y="19" width="9" height="3" fill="#ffffff" opacity="0.12" />
    </>
  );
}

function Face({ face, stress }: { face: AvatarConfig['face']; stress: 'low' | 'medium' | 'high' }) {
  const expression = stress === 'high' ? 'serious' : face;
  const eyeY = expression === 'focused' ? 35 : 36;

  return (
    <>
      <rect x="40" y={eyeY} width="4" height={expression === 'focused' ? 2 : 4} fill="#101820" />
      <rect x="53" y={eyeY} width="4" height={expression === 'focused' ? 2 : 4} fill="#101820" />
      {expression === 'focused' && (
        <>
          <rect x="39" y="32" width="7" height="2" fill="#101820" />
          <rect x="52" y="32" width="7" height="2" fill="#101820" />
        </>
      )}
      {expression === 'serious' && <rect x="44" y="47" width="10" height="2" fill="#321f18" />}
      {expression === 'calm' && <rect x="46" y="47" width="6" height="2" fill="#5f3326" />}
      {expression === 'smirk' && (
        <>
          <rect x="45" y="47" width="11" height="2" fill="#5f3326" />
          <rect x="53" y="45" width="3" height="2" fill="#5f3326" />
        </>
      )}
      {stress !== 'low' && <rect x="59" y="33" width="3" height="6" fill="#7dd3fc" opacity="0.9" />}
      {stress === 'high' && (
        <>
          <rect x="36" y="31" width="6" height="2" fill="#7f1d1d" />
          <rect x="54" y="31" width="6" height="2" fill="#7f1d1d" />
        </>
      )}
    </>
  );
}

function Cosmetic({ id }: { id?: string | null }) {
  switch (id) {
    case 'beret':
      return (
        <>
          <rect x="31" y="16" width="32" height="8" fill="#23492f" />
          <rect x="35" y="12" width="23" height="6" fill="#2e6a43" />
          <rect x="52" y="15" width="5" height="4" fill="#d6b34d" />
        </>
      );
    case 'funny_hat':
      return (
        <>
          <rect x="36" y="10" width="24" height="6" fill="#6d28d9" />
          <rect x="40" y="4" width="16" height="8" fill="#a855f7" />
          <rect x="45" y="1" width="6" height="4" fill="#facc15" />
        </>
      );
    case 'aviator_glasses':
      return (
        <>
          <rect x="38" y="34" width="9" height="7" fill="#0f172a" />
          <rect x="51" y="34" width="9" height="7" fill="#0f172a" />
          <rect x="47" y="36" width="4" height="2" fill="#0f172a" />
          <rect x="40" y="35" width="5" height="2" fill="#67e8f9" opacity="0.65" />
          <rect x="53" y="35" width="5" height="2" fill="#67e8f9" opacity="0.65" />
        </>
      );
    case 'iron_man_mustache':
      return (
        <>
          <rect x="42" y="43" width="6" height="4" fill="#3b1d12" />
          <rect x="50" y="43" width="6" height="4" fill="#3b1d12" />
          <rect x="39" y="44" width="4" height="2" fill="#3b1d12" />
          <rect x="55" y="44" width="4" height="2" fill="#3b1d12" />
        </>
      );
    case 'coffee_mug':
      return (
        <>
          <rect x="18" y="67" width="8" height="9" fill="#e5e7eb" />
          <rect x="26" y="69" width="3" height="5" fill="none" stroke="#e5e7eb" strokeWidth="2" />
          <rect x="20" y="69" width="4" height="2" fill="#1f2937" />
        </>
      );
    case 'whiteboard_marker':
      return (
        <>
          <rect x="70" y="67" width="15" height="4" fill="#e5e7eb" />
          <rect x="82" y="67" width="4" height="4" fill="#22d3ee" />
          <rect x="68" y="67" width="3" height="4" fill="#111827" />
        </>
      );
    default:
      return null;
  }
}

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
  const skin = skinColors[avatar.body];
  const hair = hairColors[avatar.hair];
  const uniform = uniformPalette[avatar.uniform];
  const stress = chaos >= 70 ? 'high' : chaos >= 40 ? 'medium' : 'low';
  const patch = patchLabels[avatar.patch];

  return (
    <div
      className={`pixel-avatar pixel-avatar-v2 pixel-avatar-${size} pixel-avatar-${stress} ${className}`}
      data-backdrop={avatar.backdrop}
      data-face={avatar.face}
    >
      <svg
        className="pixel-avatar-art"
        viewBox="0 0 96 112"
        role="img"
        aria-label="8-bit staff officer avatar"
        shapeRendering="crispEdges"
      >
        <Backdrop type={avatar.backdrop} />
        <rect x="5" y="5" width="86" height="102" fill="none" stroke="#ffffff" strokeOpacity="0.08" strokeWidth="2" />
        <rect x="68" y="6" width="20" height="8" fill="#020617" opacity="0.55" />
        <text x="78" y="12" textAnchor="middle" fontFamily="monospace" fontSize="6" fill="#cbd5e1">
          {backdropLabels[avatar.backdrop]}
        </text>

        <rect x="24" y="91" width="48" height="7" fill="#020617" opacity="0.45" />

        <rect x="37" y="74" width="10" height="19" fill={uniform.dark} />
        <rect x="51" y="74" width="10" height="19" fill={uniform.dark} />
        <rect x="35" y="92" width="14" height="5" fill="#111827" />
        <rect x="49" y="92" width="14" height="5" fill="#111827" />

        <rect x="25" y="58" width="12" height="26" fill={uniform.dark} />
        <rect x="60" y="58" width="12" height="26" fill={uniform.dark} />
        <rect x="27" y="80" width="9" height="5" fill={skin.shadow} />
        <rect x="61" y="80" width="9" height="5" fill={skin.shadow} />

        <rect x="33" y="54" width="31" height="31" fill={uniform.main} />
        <rect x="33" y="54" width="31" height="7" fill={uniform.accent} opacity="0.55" />
        <rect x="38" y="54" width="4" height="31" fill={uniform.strap} opacity="0.75" />
        <rect x="55" y="54" width="4" height="31" fill={uniform.strap} opacity="0.75" />
        <rect x="47" y="56" width="3" height="28" fill="#111827" opacity="0.5" />

        <rect x="58" y="61" width="12" height="8" fill="#111827" stroke="#d6b34d" strokeWidth="1" />
        <text x="64" y="67" textAnchor="middle" fontFamily="monospace" fontSize={patch.length > 2 ? 4 : 5} fill="#f8fafc">
          {patch}
        </text>

        <rect x="31" y="32" width="5" height="12" fill={skin.shadow} />
        <rect x="60" y="32" width="5" height="12" fill={skin.shadow} />
        <rect x="34" y="24" width="28" height="30" fill={skin.base} />
        <rect x="37" y="27" width="22" height="6" fill={skin.light} opacity="0.5" />
        <rect x="34" y="48" width="28" height="6" fill={skin.shadow} opacity="0.25" />

        <Hair style={avatar.hairStyle} color={hair} />
        <Face face={avatar.face} stress={stress} />
        <Cosmetic id={cosmeticId} />

        {stress === 'high' && (
          <>
            <rect x="18" y="24" width="4" height="8" fill="#ef4444" opacity="0.85" />
            <rect x="74" y="26" width="4" height="8" fill="#ef4444" opacity="0.85" />
            <rect x="21" y="18" width="3" height="3" fill="#ef4444" opacity="0.75" />
            <rect x="71" y="20" width="3" height="3" fill="#ef4444" opacity="0.75" />
          </>
        )}
      </svg>
      {showLabel && (
        <div className="pixel-avatar-caption">
          {avatar.uniform.toUpperCase()} / {patch}
        </div>
      )}
    </div>
  );
}

export default PixelSoldierAvatar;
