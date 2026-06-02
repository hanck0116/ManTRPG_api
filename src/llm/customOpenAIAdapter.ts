import { createOpenAICompatibleAdapter } from './openAICompatible.js';

export const customOpenAIAdapter = createOpenAICompatibleAdapter({
  provider: 'customOpenAI',
  defaultEndpoint: 'https://example.invalid/v1/chat/completions',
  defaultModel: 'custom-model',
});
