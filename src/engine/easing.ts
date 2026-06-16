export type EasingName = 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'easeInCubic' | 'easeOutCubic' | 'easeInOutCubic';

export const EASING_OPTIONS: { label: string; value: EasingName }[] = [
  { label: 'Linear', value: 'linear' },
  { label: 'Ease In', value: 'easeIn' },
  { label: 'Ease Out', value: 'easeOut' },
  { label: 'Ease In-Out', value: 'easeInOut' },
  { label: 'Ease In Cubic', value: 'easeInCubic' },
  { label: 'Ease Out Cubic', value: 'easeOutCubic' },
  { label: 'Ease In-Out Cubic', value: 'easeInOutCubic' },
];

export function applyEasing(t: number, name: EasingName): number {
  t = Math.max(0, Math.min(1, t));
  switch (name) {
    case 'linear':
      return t;
    case 'easeIn':
      return t * t;
    case 'easeOut':
      return t * (2 - t);
    case 'easeInCubic':
      return t * t * t;
    case 'easeOutCubic': {
      const u = 1 - t;
      return 1 - u * u * u;
    }
    case 'easeInOut':
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    case 'easeInOutCubic':
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
}
