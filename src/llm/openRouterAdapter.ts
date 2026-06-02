import { createOpenAICompatibleAdapter } from './openAICompatible.js';

export const openRouterAdapter = createOpenAICompatibleAdapter({
  provider: 'openrouter',
  defaultEndpoint: 'https://openrouter.ai/api/v1/chat/completions',
  defaultModel: 'openai/gpt-4o-mini',
});
