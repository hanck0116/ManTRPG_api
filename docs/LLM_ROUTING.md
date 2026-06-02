# LLM Routing

LLM use is optional browser-side BYOK GM assistance. No local LLM, Ollama, llama.cpp, GPT4All, or WebLLM path is used.

## Providers

- Groq
- Gemini
- OpenRouter
- Custom OpenAI-compatible endpoint

## Tasks

| Task | Purpose | Call condition | Fallback |
| --- | --- | --- | --- |
| `interpret` | Unknown natural language to `ParsedAction`. | Local parser returns `unknown` and browser has a key. | Keep `unknown`. |
| `narrate` | Short narration from engine JSON. | Important scene/reward/battle end policy. | `templateNarrator`. |
| `summarize` | Compact long logs. | Long log only. | Local log summary. |
| `generateSkill` | Flavor only. | Candidate IDs only. | Template text. |

## Proxy Warning

The default mode does not send API keys to the ManTRPG server. If a deployment adds a server proxy, the UI and docs must warn that player API keys pass through that proxy server.
