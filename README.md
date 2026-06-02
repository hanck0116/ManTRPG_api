# ManTRPG_api

ManTRPG_api is a mobile-first PWA + browser-local TypeScript TRPG engine scaffold. The default game runs locally in the browser and stores sessions in IndexedDB. External AI APIs are optional BYOK (Bring Your Own Key) GM-assist tools.

## Current Direction

- Mobile portrait usability is the top priority; the shell targets a 390px-wide phone layout.
- Rules, dice, judgment, damage, healing, inventory, rewards, and single-enemy AI run in the local TypeScript engine.
- The game is fully playable without an API key.
- Local LLM, Ollama, llama.cpp, GPT4All, and WebLLM are not used.
- API keys are player-owned and optional.
- Default BYOK calls are made directly from the browser client-side adapters, not through `/turn`.
- `/turn` is a keyless local-engine server endpoint. It rejects `llm.apiKey` payloads.
- A server proxy, if added later, must be opt-in and must warn that player API keys pass through that proxy server.
- Enemies are always exactly one enemy; boss monsters and map movement are out of scope.
- Current data is a V18 migration staging layer, not the full V18 catalog import yet.

## Target Structure

```text
src/engine/  local deterministic rules
src/state/   player/session state and storage adapter contracts
src/gm/      template narration, local parser, prompt contracts
src/llm/     optional client-side BYOK provider adapters
src/pwa/     IndexedDB session/key helpers
src/client/  mobile PWA runtime and UI shell
src/api/     zod schemas and keyless /turn route
```

## V18 d100 Judgment

V18 absolute checks are low-roll checks:

- Formula: `1d100 <= effectiveTarget`.
- `effectiveTarget = baseTarget + modifier`.
- Natural `1` is `criticalSuccess` and succeeds.
- Natural `100` is `criticalFail` and fails.
- Otherwise `roll <= effectiveTarget` succeeds.
- General stat dice are separate via `rollStatDie()` as `1d[effectiveStat]`.

`CheckResult`:

```json
{
  "roll": 65,
  "baseTarget": 60,
  "modifier": 5,
  "effectiveTarget": 65,
  "success": true,
  "grade": "success",
  "formula": "1d100 <= effectiveTarget"
}
```

## BYOK API Model

Supported optional providers:

- Groq
- Gemini
- OpenRouter
- Custom OpenAI-compatible endpoint

API key policy:

- Default mode: **이번 접속에서만 사용** (`sessionOnly`).
- Optional **이 기기에 저장** (`deviceIndexedDb`) is plain IndexedDB and displays a warning.
- Optional **암호화 저장** derives an AES-GCM key from a user PIN/passphrase via PBKDF2; the PIN/passphrase is never stored.
- Provider-specific random salt and IV are stored with encrypted records.
- API keys are never included in `TurnResult`, `SessionState`, `logSummary`, prompts, or saved sessions.
- Do not store keys on public/shared devices.

## No-API Play Flow

```text
PlayerInput -> local parser -> local V18 absolute check/engine -> single-enemy AI -> templateNarrator -> TurnResult -> IndexedDB save
```

## Optional Browser BYOK Flow

```text
Browser PWA -> load session from IndexedDB -> local parser
  -> only if unknown and key exists: client-side interpret call
  -> local engine -> template or allowed client-side narrate call
  -> schema validation/fallback -> IndexedDB save
```

The API never creates dice, damage, healing, rewards, enemy counts, HP/MP mutation, or state mutation.

## PWA Run

```bash
npm install
npm run dev:web
```

Open the Vite URL on a phone-sized viewport. The mobile shell uses `index.html`, `src/client/main.ts`, and `public/` and builds to `dist-web`. The shell includes `manifest.webmanifest`, `service-worker.js`, a play screen, API settings screen, and session screen.

### BYOK API Key Test

1. Open the API tab.
2. Select Groq, Gemini, OpenRouter, or Custom OpenAI-compatible.
3. Enter an API Key plus optional model/endpoint.
4. Choose `sessionOnly`, `deviceIndexedDb`, or `deviceIndexedDbEncrypted`.
5. Press **API Key 테스트/저장**. The browser calls the provider test endpoint directly.
6. On success the key is stored by the selected mode; on failure it is not stored and the screen shows a CORS/provider configuration warning.

## Server Run

```bash
npm install
npm run dev:server
curl http://localhost:3000/health
curl -X POST http://localhost:3000/turn -H 'Content-Type: application/json' -d '{"sessionId":"demo","text":"/attack"}'
```

## Test

```bash
npm run build
npm test
npm run typecheck
```

## Implemented First-Pass Scope

- V18 low-roll absolute d100 checks and separate stat die helper.
- V18-ready stat mapping (`strength`, `agility`, `constitution`, `intelligence`, `wisdom`, `appearance`) plus migration compatibility aliases.
- zod-based API schemas.
- Keyless `/turn` server route.
- Client-side BYOK runtime and API key settings helpers.
- PBKDF2 + AES-GCM encrypted key records with random salt/IV.
- Mobile 390px PWA shell, manifest, and service worker.
- Stronger local command/synonym parser and improved template narration.

## Remaining Work

- Replace staging catalog data with the full V18 catalog.
- Add browser E2E tests for the API settings form and IndexedDB flows.
- Add an explicitly separate opt-in server proxy module if proxy mode is needed.
