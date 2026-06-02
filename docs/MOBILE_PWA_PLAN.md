# Mobile PWA Plan

The PWA is mobile-first at 390px portrait width and also works on PC.

## Implemented Shell

- `index.html`
- `src/client/main.ts`
- `src/client/styles.css`
- `public/manifest.webmanifest`
- `public/service-worker.js`
- `public/icons/icon.svg`
- `public/icons/maskable-icon.svg`

## Screens

1. Main play screen: player HP/MP/equipment/actions, hidden single-enemy hint only (no enemy name/HP/stats), short narration, max 3 choices, natural-language input, send button, API usage estimate if present.
2. API settings screen: API 사용 안 함, Groq, Gemini, OpenRouter, Custom OpenAI-compatible, key/model/endpoint fields, session-only/encrypted persistence, passphrase, confirm-before-call option, usage/cost estimate, delete key, CORS/proxy warnings.
3. Session screen: new game, continue, delete save.

## Runtime

`src/client/gameRuntime.ts` loads IndexedDB sessions, runs the local parser, optionally calls client-side BYOK adapters only under routing policy, runs the local engine, applies template/LLM narration, saves IndexedDB, and returns `TurnResult`.

## Service Worker Strategy

- Versioned shell cache stores `/`, `/index.html`, `/manifest.webmanifest`, and local icons.
- Static local assets use cache-first behavior.
- Navigation requests use network-first behavior with `/index.html` offline fallback.
- Activate deletes older `mantrpg-*` caches.
- Provider API requests are not cached.

## 390px UI Checklist

- Controls are at least 44px tall.
- Tabs, choices, and forms fit one column.
- No external fonts or downloaded images are required.
- API warnings are visible before encrypted key persistence or proxy mode.
