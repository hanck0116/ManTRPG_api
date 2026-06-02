import { describe, expect, it } from 'vitest';
import { handleTurn } from '../src/api/routes.js';

describe('no API flow', () => {
  it('plays one turn without an API key and uses template narration', async () => {
    const result = await handleTurn({ sessionId: 'no-api-flow', text: '/attack' });
    expect(result.llm.used).toBe(false);
    expect(result.llm.tasks).toEqual([]);
    expect(result.narration.text.length).toBeGreaterThan(0);
    expect(result.narration.choices.length).toBeLessThanOrEqual(3);
  });
});
