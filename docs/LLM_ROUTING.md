# LLM Routing

LLM use is optional browser-side BYOK GM assistance. No local LLM, Ollama, llama.cpp, GPT4All, or WebLLM path is used.

## Providers

- Groq
- Gemini
- OpenRouter
- Custom OpenAI-compatible endpoint

## Client Call Conditions

| Task | Purpose | Client call condition | Fallback |
| --- | --- | --- | --- |
| `interpret` | Unknown natural language to `ParsedAction`. | Only when the local parser returns `unknown` and API settings resolve to a stored/entered key. | Keep the local `unknown` action. |
| `narrate` | Short narration from engine JSON. | Only for `battleEnded`, `reward` tag, `scene_transition` tag, or generated skill/magic tags. General combat is forbidden from calling narrate. | `templateNarrator`. |
| `summarize` | Compact long logs. | Long log only in future flows. | Local log summary. |
| `generateSkill` | Flavor only. | Candidate IDs only in future generation moments. | Template text. |

`llm.used` is true only after an actual successful provider call. `llm.fallback` is true only when a provider call was attempted and failed. If no call is attempted, the result can include a skipped reason such as `api_disabled_or_missing_key` or `local_template_combat`.

## Proxy Warning

The default mode does not send API keys to the ManTRPG server. If a deployment adds a server proxy, the UI and docs must warn that player API keys pass through that proxy server.
