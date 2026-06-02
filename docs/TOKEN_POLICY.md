# Token Policy

Token minimization is a core rule.

- Send compact payloads only; never send the full sheet, full V18 rulebook, full catalogs, full logs, or hidden enemy stats.
- Use minified `JSON.stringify(payload)` immediately before provider calls.
- Prompts are short English system/task instructions; narration output remains Korean.
- Do not call API when no key exists, API is disabled, confirmation is required but missing, or session/daily budgets would be exceeded.
- Clear button/command actions are parsed locally and skip `interpret`.
- Normal combat narration uses the template narrator; API `narrate` is reserved for important scenes such as battle start/end, criticals, generated skill/magic, and compact summary refresh.
- Current completion caps: interpret 80, enemy-action 80, narrate 180, compact-summary 160, generate-skill 220.
- UI should show estimated tokens/cost before calls; cost belongs to the player BYOK provider account.
