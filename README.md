# ManTRPG_api

ManTRPG_api is a mobile-first TypeScript TRPG engine/API scaffold. The default path is **PWA + browser-local TypeScript engine + IndexedDB save data**. External AI APIs are optional BYOK (Bring Your Own Key) GM-assist tools, not required game infrastructure.

## Current Direction

- Mobile usability is the top priority.
- Rules, dice, judgment, damage, healing, inventory, rewards, and enemy AI run in the local TypeScript engine.
- The game is fully playable without an API key.
- Local LLM, Ollama, llama.cpp, GPT4All, and WebLLM are not used.
- Players may enter their own API key for optional GM assistance.
- API call costs are paid by the player/provider account that owns the key, not by the developer.
- Enemies are always exactly one enemy.
- Boss monsters are excluded.
- No map system is planned.
- UI should be simple and mobile portrait first.

## Target Structure

```text
src/
├─ engine/       # local deterministic rules
├─ state/        # player/session state and storage adapter contracts
├─ gm/           # template narration, local action parser, prompt contracts
├─ llm/          # optional BYOK provider routing/adapters
├─ pwa/          # API-key settings/storage and IndexedDB session storage
└─ api/          # JSON schemas and turn route
```

## BYOK API Model

API integration is optional and provider-neutral. Supported provider settings are:

- Groq
- Gemini
- OpenRouter
- Custom OpenAI-compatible endpoint

API key policy:

- Default mode: **이번 접속에서만 사용**.
- Optional mode: **이 기기에 저장** using IndexedDB.
- Optional encrypted mode: Web Crypto AES-GCM before IndexedDB storage when available.
- API keys are not logged.
- API keys are not included in `TurnResult`, `SessionState`, combat logs, or saved sessions.
- Players can delete stored keys at any time.

See `docs/API_KEY_POLICY.md` for the full policy.

## LLM Routing

LLM calls are routed by task:

| Task | Use |
| --- | --- |
| `interpret` | Convert only unresolved natural-language actions into `ParsedAction` JSON. |
| `narrate` | Convert an engine-produced `EngineResult` into short mobile GM narration. |
| `summarize` | Compress long logs into a short session summary. |
| `generateSkill` | Generate short skill/magic flavor text without combat math. |

The API receives only compact inputs such as `MinimalApiState`, `EngineResult`, and needed candidate IDs. It must not receive full character sheets, full rules, or full catalogs. API output is validated with JSON schemas, and failures immediately fall back to local templates.

See `docs/LLM_ROUTING.md` and `docs/TOKEN_POLICY.md` for call conditions.

## No-API Play Flow

```text
PlayerInput
  -> local action parser
  -> local engine calculation
  -> local single-enemy AI
  -> local templateNarrator
  -> TurnResult
  -> IndexedDB save in PWA shell
```

No API key is needed. General attacks, defense, item use, and clear skill/magic choices remain fully local.

## Optional API Play Flow

```text
PlayerInput
  -> local parser
  -> if unknown and API key exists: interpret
  -> local engine calculation
  -> local single-enemy AI
  -> for allowed important scenes only: narrate/summarize/generateSkill
  -> JSON schema validation
  -> template fallback on failure
```

The API never creates damage, healing, dice values, rewards, enemy counts, or state mutation.

## d100 Judgment Structure

All core checks use d100.

- `rollDie(100)` creates the natural roll.
- `total = roll + modifier`.
- `total >= target` succeeds.
- Natural `100` is `criticalSuccess`.
- Natural `1` is `criticalFail`.
- Modifiers affect only `total`, not natural critical rules.

## MinimalApiState Example

```json
{
  "scene": "combat",
  "turn": 2,
  "player": { "hp": "36/40", "mp": "25/25", "weapon": "낫", "condition": "normal" },
  "enemy": { "hp": "16/20", "condition": "normal" },
  "availableActions": ["attack", "skill", "magic", "item", "defend"],
  "candidateIds": {
    "skills": ["SK_REAPING_ARC"],
    "magic": ["MG_EMBER_01"],
    "items": ["IT_HERB_SMALL"]
  }
}
```

## Install

```bash
npm install
```

## Run

```bash
npm run dev
```

Health check:

```bash
curl http://localhost:3000/health
```

Turn example without API key:

```bash
curl -X POST http://localhost:3000/turn \
  -H 'Content-Type: application/json' \
  -d '{"sessionId":"demo","text":"낫을 크게 휘둘러 적의 다리를 노린다."}'
```

## Test

```bash
npm run build
npm test
npm run typecheck
```

## Implemented First-Pass Scope

- TypeScript engine modules for dice, judgment, combat, skill, magic, inventory, reward, and single-enemy AI.
- Browser/PWA storage contracts and IndexedDB adapters.
- BYOK API key handling helpers with session-only and IndexedDB modes.
- Optional LLM router and provider adapters for Groq, Gemini, OpenRouter, and custom OpenAI-compatible endpoints.
- Template fallback narration.
- Documentation for API key policy, mobile PWA plan, token policy, and LLM routing.

## Remaining Work

- Build the actual mobile PWA UI shell, manifest, and service worker.
- Add browser/E2E tests for the 390px mobile viewport.
- Complete full V18 catalog migration using ID-based data.
- Add provider-specific pricing display for API usage estimates.
