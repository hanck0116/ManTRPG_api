export type Die = `d${number}`;
export type RollMode = 'normal' | 'advantage' | 'disadvantage';
export type CheckGrade = 'criticalSuccess' | 'success' | 'fail' | 'criticalFail';

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

export interface AbsoluteCheckInput {
  baseTarget: number;
  modifier?: number;
  rng?: () => number;
}

export interface StatDieInput {
  effectiveStat: number;
  modifier?: number;
  rng?: () => number;
}

export interface CheckResult {
  roll: number;
  baseTarget: number;
  modifier: number;
  effectiveTarget: number;
  success: boolean;
  grade: CheckGrade;
  formula: '1d100 <= effectiveTarget';
}

const defaultRng = (): number => Math.random();

export function rollDie(sides: number, rng: () => number = defaultRng): number {
  if (!Number.isInteger(sides) || sides < 1) throw new Error('sides must be a positive integer');
  return Math.floor(rng() * sides) + 1;
}

export function rollDice(options: RollOptions = {}): RollResult {
  const sides = options.sides ?? 100;
  const count = Math.max(1, options.count ?? 1);
  const modifier = options.modifier ?? 0;
  const mode = options.mode ?? 'normal';
  const rng = options.rng ?? defaultRng;
  const effectiveCount = mode === 'normal' ? count : Math.max(2, count);
  const rolls = Array.from({ length: effectiveCount }, () => rollDie(sides, rng));
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

/** V18 absolute check: low d100 is good, 1d100 <= effective stat + modifier succeeds. */
export function rollAbsoluteCheck(input: AbsoluteCheckInput): CheckResult {
  const modifier = input.modifier ?? 0;
  const roll = rollDie(100, input.rng ?? defaultRng);
  const effectiveTarget = input.baseTarget + modifier;
  const grade: CheckGrade = roll === 1 ? 'criticalSuccess' : roll === 100 ? 'criticalFail' : roll <= effectiveTarget ? 'success' : 'fail';

  return {
    roll,
    baseTarget: input.baseTarget,
    modifier,
    effectiveTarget,
    success: grade === 'criticalSuccess' || grade === 'success',
    grade,
    formula: '1d100 <= effectiveTarget',
  };
}

/** V18 regular stat die: roll 1d[effective stat], optionally add a small local modifier. */
export function rollStatDie(input: StatDieInput): RollResult {
  if (!Number.isInteger(input.effectiveStat) || input.effectiveStat < 1) throw new Error('effectiveStat must be a positive integer');
  return rollDice({ sides: input.effectiveStat, modifier: input.modifier ?? 0, rng: input.rng });
}

export const rollCheck = rollAbsoluteCheck;
