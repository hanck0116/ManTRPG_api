# Token Policy

Token reduction is a primary design goal, and API use is optional BYOK GM assistance rather than a required runtime dependency.

## Data Sent to APIs

- Do not send the full character sheet, full rulebook, or full catalogs every turn.
- Reference equipment, skills, magic, and items by stable IDs.
- Send only `MinimalApiState`, `EngineResult`, raw unresolved text, compact logs, and needed candidate IDs.
- Never send API keys inside prompt content.
- API에는 전체 catalog를 보내지 않는다.
- API에는 현재 행동에 필요한 후보 ID만 보낸다.

## API Call Conditions

- General attack, defense, item use, and clear skill/magic selection must not call an API.
- Call `interpret` only when the local parser cannot resolve natural language and an API key exists.
- Use `templateNarrator` for ordinary combat narration.
- Call `narrate` only for important scenes, rewards, generated-skill moments, scene transitions, or battle end.
- Call `summarize` only when logs are long enough to need compaction.
- Call `generateSkill` only for flavor/description generation, never for combat math.
- If no API key exists, skip every LLM call and use templates/local rules immediately.
- If the API fails or JSON validation fails, immediately use the template fallback.

## Output Limits

- Recommended narration length is 1 to 3 short mobile-friendly sentences.
- Return at most 3 choices.
- Never create arbitrary numeric damage, healing, rewards, or dice values in the API/GM layer.
- Do not repeat the same skill, item, equipment, or lore descriptions unless the player explicitly asks for details.
- Keep combat logs in summarized code-managed form.
- Use simple enemy action JSON rather than long hidden reasoning.
