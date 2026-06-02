# LLM Routing

LLM use is optional BYOK GM assistance. No local LLM, Ollama, llama.cpp, GPT4All, or WebLLM path is used.

## Providers

- Groq: OpenAI-compatible chat completions adapter.
- Gemini: Gemini `generateContent` adapter.
- OpenRouter: OpenAI-compatible chat completions adapter.
- Custom OpenAI-compatible endpoint: player-provided endpoint and model.

## Tasks

| Task | Purpose | API allowed? | Fallback |
| --- | --- | --- | --- |
| `interpret` | Convert unresolved natural language to `ParsedAction` JSON. | Only when the local parser returns `unknown` and the player provided a key. | Keep `unknown` and block safely. |
| `narrate` | Convert `EngineResult` into short GM narration. | Only for important scenes, rewards, scene transitions, or battle end. | `templateNarrator`. |
| `summarize` | Compress long logs into a session summary. | Only when logs are long enough to need compaction. | Keep local short log summary. |
| `generateSkill` | Generate short flavor text for a new skill or magic. | Only with candidate IDs/theme and no combat math. | Template description. |

## Data Boundary

Allowed API input:

- `MinimalApiState`.
- `EngineResult` already created by the local engine.
- Current raw text for `interpret`.
- Needed candidate IDs only.
- Short log summary when summarizing.

Forbidden API input:

- Full character sheets.
- Full rules.
- Full skill, magic, equipment, item, or enemy catalogs.
- API keys in prompt content.

Forbidden API output authority:

- Dice rolls.
- Damage, healing, rewards, HP/MP mutation.
- Enemy counts.
- Boss mechanics.
