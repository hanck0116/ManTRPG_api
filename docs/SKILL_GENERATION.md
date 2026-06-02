# Skill Generation

`generate-skill` API 호출은 설명 초안만 허용합니다.

Allowed draft fields:

- `name`
- `summary`
- `flavor`
- `tags`

Forbidden from LLM:

- damage, cost, multiplier, cooldown, power, HP/MP 변화 등 확정 수치.

`sanitizeGeneratedSkillDraft`가 금지 수치를 거부하고, `balanceGeneratedSkill`이 V18 기준의 코드 밸런스 값(`id`, `costMp`, `damageMultiplier`, `targetModifier`)을 부여합니다.
