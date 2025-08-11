// utils/seed.ts

export function createSeededRandom(seed: string | number) {
  let h = typeof seed === 'string' ? hashString(seed) : seed;

  return function rng() {
    h ^= h << 13;
    h ^= h >> 17;
    h ^= h << 5;
    return ((h < 0 ? ~h + 1 : h) % 10000) / 10000;
  };
}

function hashString(str: string) {
  let h = 2168133561 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  return h >>> 0;
}

// Générateur pseudo-aléatoire avec seed
export function mulberry32(seed: number) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
