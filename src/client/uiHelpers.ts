export function capChoices<T>(choices: T[], limit = 3): T[] {
  return choices.slice(0, limit);
}
