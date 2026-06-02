# Token Policy

API use is optional and token-minimized.

- No local LLM, Ollama, llama.cpp, GPT4All, or WebLLM path is used.
- Basic play works without API calls.
- Full state, full catalogs, full rules, and API keys are never sent to APIs.
- `MinimalApiState` candidate IDs are capped at 5 each.
- Choices are capped at 3.
- APIs cannot create damage, healing, dice, rewards, enemy counts, HP/MP mutation, or state mutation.
- V18 absolute checks are resolved locally as `1d100 <= effectiveTarget`.
- If no API key exists, calls are skipped and `templateNarrator` is used.
