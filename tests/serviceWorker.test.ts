import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('service worker shell caching', () => {
  const source = readFileSync('public/service-worker.js', 'utf8');

  it('cleans old caches during activate', () => {
    expect(source).toContain('activate');
    expect(source).toContain('caches.keys');
    expect(source).toContain('caches.delete');
  });

  it('does not cache provider API calls', () => {
    expect(source).toContain('isProviderApiRequest');
    expect(source).toContain('api.groq.com');
    expect(source).toContain('openrouter.ai');
    expect(source).toContain('generativelanguage.googleapis.com');
  });

  it('has navigation fallback to the scoped index.html shell', () => {
    expect(source).toContain('networkFirstNavigation');
    expect(source).toContain("cache.match(shellUrl('index.html'))");
    expect(source).toContain("cache.match(shellUrl('./'))");
    expect(source).not.toContain("cache.match('/index.html')");
  });

  it('resolves shell files relative to the service worker scope', () => {
    expect(source).toContain('self.registration.scope');
    expect(source).toContain('const shellUrl = (path) => new URL(path, self.registration.scope).href');
    expect(source).toContain('url.pathname.startsWith(BASE_PATH)');
  });
});
