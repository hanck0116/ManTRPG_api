# Mobile PWA Plan

The PWA is mobile-first at 390px portrait width.

## Implemented Shell

- `index.html`
- `src/client/main.ts`
- `src/client/styles.css`
- `public/manifest.webmanifest`
- `public/service-worker.js`
- `public/icons/icon.svg`
- `public/icons/maskable-icon.svg`

## Screens

1. Main play screen: player HP/MP, single enemy HP/status, short narration, max 3 choices, natural-language input, send button, API usage estimate if present.
2. API settings screen: no API, Groq, Gemini, OpenRouter, Custom OpenAI-compatible, key/model/endpoint fields, session-only/device/encrypted persistence, test/save, delete, CORS warning.
3. Session screen: new game, continue, delete save.

## Runtime

`src/client/gameRuntime.ts` loads IndexedDB sessions, runs the local parser, optionally calls client-side BYOK adapters only under routing policy, runs the local engine, applies template/LLM narration, saves IndexedDB, and returns `TurnResult`.

## Service Worker Strategy

- Versioned shell cache stores `/`, `/index.html`, `/manifest.webmanifest`, and local icons.
- Static local assets use cache-first behavior.
- Navigation requests use network-first behavior with `/index.html` offline fallback.
- Activate deletes older `mantrpg-*` caches.
- Provider API requests are not cached.

## Manifest/Icon Requirements

- `display` remains `standalone`.
- `orientation` remains `portrait`.
- `icons` must not be empty and includes normal and maskable SVG icons from `public/icons/`.

## 390px UI Checklist

- Controls are at least 44px tall.
- Tabs, choices, and forms fit one column.
- No external fonts or downloaded images are required.
- API warnings are visible before saving keys on device.
