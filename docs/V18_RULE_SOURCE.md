# V18 Rule Source

Baseline source for this branch is the uploaded `ManRPG_v18_통합시트기준_수정본_패키지.zip`.
When package files conflict, the integrated sheet 기준 wins.

Required V18 rules preserved in code/docs:

- Absolute judgment: `1d100 <= effectiveStat + modifier`.
- General stat judgment: `1d[effectiveStat]`.
- Use `MP` only; `LM` notation is forbidden.
- Each floor/combat has exactly one enemy.
- No boss monster system and no map system.
- Skill reset tickets are removed from the normal reward pool and handled only as shop items.
- Rewards, shop, magic books, magic, sale price, and traits follow the integrated sheet 기준 as catalog migration proceeds.

The code engine owns all HP/MP, equipment, stats, inventory, skills, magic, enemy state, rewards, and dice calculations. API calls may only help interpret text, choose hidden enemy intent, narrate code results, and draft flavor text.
