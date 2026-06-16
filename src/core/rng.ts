/**
 * Deterministic seeded random number generator.
 * mulberry32 — small, fast, good enough for placement.
 */
export function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return function rng(): number {
    state = (state + 0x6D2B79F5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * 32-bit random seed drawn from Math.random (non-deterministic).
 */
export function randomSeed(): number {
  return Math.floor(Math.random() * 0x7fffffff);
}
