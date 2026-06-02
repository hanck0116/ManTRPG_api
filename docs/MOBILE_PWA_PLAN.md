# Mobile PWA Plan

The PWA is mobile-first at 390px portrait width.

## Implemented Shell

- `index.html`
- `src/client/main.ts`
- `src/client/styles.css`
- `public/manifest.webmanifest`
- `public/service-worker.js`

## Screens

1. Main play screen: player HP/MP, single enemy HP/status, short narration, max 3 choices, natural-language input, send button.
2. API settings screen: no API, Groq, Gemini, OpenRouter, Custom OpenAI-compatible, key/model/endpoint fields, session-only/device/encrypted persistence, test/save, delete.
3. Session screen: new game, continue, delete save.

## Runtime

`src/client/gameRuntime.ts` loads IndexedDB sessions, runs the local parser, optionally calls client-side BYOK adapters, runs the local engine, applies template/LLM narration, saves IndexedDB, and returns `TurnResult`.
