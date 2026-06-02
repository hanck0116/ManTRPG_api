# Cost-free BYOK Structure

- Default play costs the developer 0원.
- No local LLM is used.
- No developer/operator env API key is used as automatic fallback.
- Browser client-side BYOK provider calls are the recommended/default API route.
- API calls require a player-entered key and can be disabled entirely.
- API key 없는 플레이는 local parser + TypeScript engine + code enemy AI + template narrator로 진행됩니다.
- Worker proxy is optional only; if enabled, users must be warned that their API key may pass through the Worker.
- The Worker `/health` endpoint does not disclose operator key presence, and `/llm` is disabled/fallback in default mode.
