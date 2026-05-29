// Accent color helpers. Tailwind v4 only emits utility classes whose exact
// names appear literally in source, so dynamically-built classes like
// `text-${color}-400` are unreliable (and `gold` isn't a Tailwind color at all).
// These helpers return inline styles, which always render regardless of the
// mission's accent color.

import type { CSSProperties } from 'react';

export const ACCENT_HEX: Record<string, string> = {
  cyan: '#22d3ee',
  purple: '#a78bfa',
  green: '#4ade80',
  orange: '#fb923c',
  red: '#ef4444',
  gold: '#f5c842',
  lime: '#a3e635',
  yellow: '#facc15',
};

export function accentHex(color: string): string {
  return ACCENT_HEX[color] ?? ACCENT_HEX.cyan;
}

function withAlpha(hex: string, alpha: number): string {
  const a = Math.round(Math.max(0, Math.min(1, alpha)) * 255).toString(16).padStart(2, '0');
  return `${hex}${a}`;
}

/** Text color (optionally translucent) for an accent. */
export function accentText(color: string, alpha = 1): CSSProperties {
  return { color: alpha >= 1 ? accentHex(color) : withAlpha(accentHex(color), alpha) };
}

/** Tinted chip/card style: accent text + faint background + soft border. */
export function accentTint(color: string, bgAlpha = 0.1, borderAlpha = 0.3): CSSProperties {
  const h = accentHex(color);
  return { color: h, backgroundColor: withAlpha(h, bgAlpha), borderColor: withAlpha(h, borderAlpha) };
}
