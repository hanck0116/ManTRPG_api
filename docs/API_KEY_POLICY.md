# API Key Policy

ManTRPG uses optional BYOK. API keys belong to the player.

## Default Security Boundary

- Default API use is browser-client-side provider calls.
- `/turn` does not accept `llm.apiKey` and does not proxy provider traffic.
- API keys are not stored in `TurnResult`, `SessionState`, `logSummary`, prompts, or saved sessions.
- A future server proxy must be opt-in and must warn: **player API keys pass through the proxy server**.

## Storage Modes

- `sessionOnly` is the default and keeps the key in memory only.
- `deviceIndexedDb` stores the key as plain IndexedDB data and must show: **공용 기기에서는 API Key를 저장하지 마세요.**
- `deviceIndexedDbEncrypted` requires a user PIN/passphrase, derives an AES-GCM key with PBKDF2-SHA256, and stores provider-specific random salt and IV.
- PIN/passphrase is never stored. Encrypted save fails if no PIN/passphrase is provided.

## No Local LLM

Local LLM, Ollama, llama.cpp, GPT4All, and WebLLM are not used.
