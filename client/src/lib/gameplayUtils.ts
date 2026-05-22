export function hashSeed(input: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function seededRandom(seed: number) {
  let a = seed >>> 0;
  return function next() {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffleWithSeed<T>(items: readonly T[], seedInput: string): T[] {
  const next = seededRandom(hashSeed(seedInput));
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function randomScenarioCode() {
  const terrain = ['MOOSE', 'GRANITE', 'COYOTE', 'GLACIER', 'COPPER', 'TIMBER', 'BISON', 'ASPEN'];
  const action = ['LIFT', 'MARCH', 'PACK', 'FORGE', 'HAUL', 'SYNC', 'READY', 'SPUR'];
  const n = Math.floor(100 + Math.random() * 900);
  return `${terrain[Math.floor(Math.random() * terrain.length)]}-${action[Math.floor(Math.random() * action.length)]}-${n}`;
}

export function missionCreditReward(score: number, difficultyMult = 1) {
  const base = Math.max(0, Math.round(score / 5));
  const difficultyBonus = Math.max(0, Math.round(base * Math.max(0, difficultyMult - 1) * 0.35));
  return base + difficultyBonus;
}

export function minigameCreditReward(score: number) {
  return Math.max(0, Math.ceil(score / 3));
}
