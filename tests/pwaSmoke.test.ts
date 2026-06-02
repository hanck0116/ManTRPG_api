import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { capChoices } from '../src/client/uiHelpers.js';

describe('PWA smoke checklist', () => {
  it('has a 390px mobile shell', () => {
    const css = readFileSync('src/client/styles.css', 'utf8');
    expect(css).toContain('390px');
    expect(css).toContain('flex-direction: column');
  });

  it('caps rendered choices to 3', () => {
    expect(capChoices(['a', 'b', 'c', 'd'])).toEqual(['a', 'b', 'c']);
    expect(capChoices(['a', 'b'])).toEqual(['a', 'b']);
  });
});
