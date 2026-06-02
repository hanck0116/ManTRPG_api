# API Key Policy

ManTRPG uses a BYOK (Bring Your Own Key) model. External API keys belong to the player, not the developer, and API use is an optional GM-assist feature.

## Defaults

- The default API key mode is **이번 접속에서만 사용** (`sessionOnly`).
- Players may opt into **이 기기에 저장** (`deviceIndexedDb`).
- Players may opt into **암호화 저장** (`deviceIndexedDbEncrypted`) when Web Crypto is available.
- The game must remain fully playable without any API key.

## Storage

- Session-only keys are held in memory by `src/pwa/apiKeyStore.ts` and disappear when the page session ends.
- Device storage uses IndexedDB via `src/pwa/indexedDbStore.ts`.
- Encrypted device storage uses Web Crypto AES-GCM before writing to IndexedDB.
- API keys are not stored in `TurnResult`, `SessionState`, session logs, or saved sessions.
- Players can delete one provider key or all keys at any time.

## Logging and Redaction

- API keys must never be logged.
- LLM request payloads sent to provider adapters redact `settings.apiKey` before prompt serialization.
- Error messages must identify provider failures without echoing headers, request bodies, or key values.

## Cost Ownership

- API calls are made only with the player's chosen provider and key.
- The developer does not pay for API calls.
- The UI should show estimated token usage before or after optional calls when possible.
