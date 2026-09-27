/** Hex helpers for CSS-variable theme tokens (Aurora channel / tint pattern). */

export function normalizeHex(hex: string): string {
  const value = hex.trim().replace('#', '');
  if (value.length === 3) {
    return `#${value.split('').map((char) => `${char}${char}`).join('')}`.toUpperCase();
  }
  return `#${value.slice(0, 6).toUpperCase()}`;
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const normalized = normalizeHex(hex).slice(1);
  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16),
  };
}

export function hexToRgbChannel(hex: string): string {
  const { r, g, b } = hexToRgb(hex);
  return `${r} ${g} ${b}`;
}

export function mixHex(hex: string, target: string, amount: number): string {
  const from = hexToRgb(hex);
  const to = hexToRgb(target);
  const mix = (a: number, b: number) => Math.round(a + (b - a) * amount);
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(mix(from.r, to.r))}${toHex(mix(from.g, to.g))}${toHex(mix(from.b, to.b))}`.toUpperCase();
}

export function darkenHex(hex: string, amount = 0.12): string {
  return mixHex(hex, '#000000', amount);
}

export function lightenHex(hex: string, amount = 0.88): string {
  return mixHex(hex, '#FFFFFF', amount);
}

export function cssVarRgba(channel: string, alpha: number): string {
  return `rgba(${channel} / ${alpha})`;
}
