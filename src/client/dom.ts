export function getAppRoot(): HTMLElement {
  const appRoot = document.querySelector<HTMLElement>('#app');
  if (!appRoot) throw new Error('app root missing');
  return appRoot;
}

export function readInput(root: ParentNode, selector: string): string {
  return root.querySelector<HTMLInputElement>(selector)?.value.trim() ?? '';
}

export function readSelect<T extends string>(root: ParentNode, selector: string, fallback: T): T {
  return (root.querySelector<HTMLSelectElement>(selector)?.value as T | undefined) ?? fallback;
}
