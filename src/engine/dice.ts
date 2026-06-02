export type Die = `d${number}`;
export type RollMode = 'normal' | 'advantage' | 'disadvantage';

export interface RollOptions {
  sides?: number;
  count?: number;
  modifier?: number;
  mode?: RollMode;
  rng?: () => number;
}

export interface RollResult {
  die: Die;
  rolls: number[];
  kept: number;
  modifier: number;
  total: number;
  mode: RollMode;
}

const defaultRng = (): number => Math.random();

const rollOne = (sides: number, rng: () => number): number => Math.floor(rng() * sides) + 1;

export function rollDice(options: RollOptions = {}): RollResult {
  const sides = options.sides ?? 100;
  const count = Math.max(1, options.count ?? 1);
  const modifier = options.modifier ?? 0;
  const mode = options.mode ?? 'normal';
  const rng = options.rng ?? defaultRng;
  const effectiveCount = mode === 'normal' ? count : Math.max(2, count);
  const rolls = Array.from({ length: effectiveCount }, () => rollOne(sides, rng));
  const kept = mode === 'advantage' ? Math.max(...rolls) : mode === 'disadvantage' ? Math.min(...rolls) : rolls.reduce((sum, roll) => sum + roll, 0);

  return {
    die: `d${sides}`,
    rolls,
    kept,
    modifier,
    total: kept + modifier,
    mode,
  };
}

export const rollD100 = (options: Omit<RollOptions, 'sides'> = {}): RollResult => rollDice({ ...options, sides: 100 });

export const rollD20 = (options: Omit<RollOptions, 'sides'> = {}): RollResult => rollDice({ ...options, sides: 20 });
