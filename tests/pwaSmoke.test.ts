import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

describe('PWA smoke checklist', () => {
  it('has a 390px mobile shell and caps rendered choices to 3', () => {
    const css = readFileSync('src/client/styles.css', 'utf8');
    const main = readFileSync('src/client/main.ts', 'utf8');
    expect(css).toContain('390px');
    expect(css).toContain('flex-direction: column');
    expect(main).toMatch(/slice\(\s*0\s*,\s*3\s*\)/);
  });
});
