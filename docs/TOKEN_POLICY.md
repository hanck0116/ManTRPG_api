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
- API에는 전체 catalog를 보내지 않는다.
- API에는 현재 행동에 필요한 후보 ID만 보낸다.
- 적 행동 판단도 긴 설명 대신 EnemyDecision JSON만 사용한다.
- GM 묘사는 엔진 결과를 압축해 표현한다.
- 한 턴 응답은 action, result, state, narration 중심으로 유지한다.
