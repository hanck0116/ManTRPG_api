import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('PWA manifest', () => {
  const manifest = JSON.parse(readFileSync('public/manifest.webmanifest', 'utf8')) as { icons?: unknown[]; display?: string; orientation?: string };

  it('has installable mobile shell metadata', () => {
    expect(manifest.icons?.length).toBeGreaterThan(0);
    expect(manifest.display).toBe('standalone');
    expect(manifest.orientation).toBe('portrait');
  });
});
