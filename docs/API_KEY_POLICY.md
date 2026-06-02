# API Key Policy

- Local LLMs are forbidden.
- Developer/operator API keys are not used as a default fallback.
- The default cost structure is 0원 for the developer: API calls occur only with a player-entered BYOK key.
- Without an API key, play continues through the local parser, engine, enemy AI, and template narration.
- Default key persistence is memory/session only.
- Optional device persistence is encrypted only: PBKDF2-SHA256 derives an AES-GCM key from a user passphrase/PIN.
- Passphrase/PIN is never stored.
- Salt and IV are random per provider and stored with the encrypted key envelope.
- Plain API keys must never appear in localStorage AI settings, exported state, usage logs, prompts, compact payloads, or game logs.
- Worker proxy is not the default route. If opt-in proxy mode is enabled, UI/docs must warn that the player API key can pass through the Worker.
