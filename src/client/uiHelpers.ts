export function capChoices<T>(choices: readonly T[], limit = 3): T[] {
  return choices.slice(0, limit);
}
