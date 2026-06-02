# API Key Policy

ManTRPG uses optional BYOK. API keys belong to the player.

## Default Security Boundary

- Default API use is browser-client-side provider calls.
- `/turn` does not accept `llm.apiKey` and does not proxy provider traffic.
- API keys are not stored in `TurnResult`, `SessionState`, `logSummary`, prompts, or saved sessions.
- Proxy mode is not implemented. If added later, it must be opt-in and must warn: **player API keys pass through the proxy server**.

## Storage Modes

- `sessionOnly` is the default and keeps the key in memory only.
- `deviceIndexedDb` stores the key as plain IndexedDB data and must show: **공용 기기에서는 API Key를 저장하지 마세요.**
- `deviceIndexedDbEncrypted` requires a user PIN/passphrase, derives an AES-GCM key with PBKDF2-SHA256, and stores provider-specific random salt and IV.
- PIN/passphrase is never stored. Encrypted save fails if no PIN/passphrase is provided.

## API Key Test Flow

1. The player selects a provider: Groq, Gemini, OpenRouter, or Custom OpenAI-compatible.
2. The player enters the API Key and optional model/endpoint.
3. The player selects one of the three storage modes.
4. The browser calls `testClientApiKey(settings)` directly against the provider adapter.
5. Success stores the key with the selected persistence mode.
6. Failure does not store the key and shows a message in the API settings screen.

Provider tests can fail because of an invalid key, model/endpoint mismatch, rate limits, or browser CORS policy. The app must present CORS failure as a possible browser/provider limitation rather than silently saving the key.

## No Local LLM

Local LLM, Ollama, llama.cpp, GPT4All, and WebLLM are not used.
