import { createOpenAICompatibleAdapter } from './openAICompatible.js';

export const groqAdapter = createOpenAICompatibleAdapter({
  provider: 'groq',
  defaultEndpoint: 'https://api.groq.com/openai/v1/chat/completions',
  defaultModel: 'llama-3.1-8b-instant',
});
