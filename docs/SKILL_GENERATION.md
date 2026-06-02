# Skill Generation

`generate-skill` is allowed only as flavor drafting.

LLM may provide:

- `name`
- `summary`
- `flavor`
- `tags`

LLM must not provide or finalize:

- damage, cost/MP cost, multiplier, cooldown, power, success rate, HP/MP changes, rewards, or any numeric effect.

`sanitizeGeneratedSkillDraft` rejects forbidden numeric draft fields. `sanitizeResponse` strips forbidden task-output fields. A generated skill remains a draft until code validation passes, and `balanceGeneratedSkill` assigns V18-compatible code-owned values such as `id`, `costMp`, `damageMultiplier`, and `targetModifier`.
