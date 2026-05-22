import type { CSSProperties } from 'react';

export function OutcomeFX({ outcome, label }: { outcome: 'pass' | 'fail'; label?: string }) {
  const pixels = Array.from({ length: outcome === 'pass' ? 20 : 14 }, (_, index) => index);
  return (
    <div className={`outcome-fx outcome-fx-${outcome}`} aria-hidden="true">
      {pixels.map(index => (
        <span
          key={index}
          className="outcome-pixel"
          style={{
            '--i': index,
            '--x': `${((index * 37) % 120) - 60}px`,
            '--y': `${-18 - ((index * 19) % 78)}px`,
            '--delay': `${(index % 7) * 0.045}s`,
          } as CSSProperties}
        />
      ))}
      {label && <span className="outcome-fx-label">{label}</span>}
    </div>
  );
}

export default OutcomeFX;
