# Token Policy

Token reduction is a primary design goal.

- Do not send the full character sheet, full rulebook, or full catalogs every turn.
- Reference equipment, skills, magic, and items by stable IDs.
- Send only a minimal scene state to the API/GM layer.
- Recommended narration length is 2 to 4 short sentences.
- Return at most 3 choices.
- Never create arbitrary numeric damage, healing, rewards, or dice values in the API/GM layer.
- Do not repeat the same skill, item, equipment, or lore descriptions unless the player explicitly asks for details.
- Keep combat logs in summarized code-managed form.
- Use simple enemy action JSON rather than long hidden reasoning.
- Load detailed rule/data descriptions only when needed for authoring or debugging, not for every turn.
