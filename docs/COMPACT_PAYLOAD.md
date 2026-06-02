# Compact Payload

API receives a compact turn payload, not `GameState`.

Example:

```json
{"t":"narrate","a":"낫으로 다리를 노린다","p":[32,18,"normal","낫"],"ids":{"sk":["SK_REAPING_ARC"],"mg":["MG_EMBER_01"],"it":["IT_HERB_SMALL"]},"r":{"ok":true,"hit":true,"dmg":7,"heal":0,"end":false,"tags":["physical"],"hint":"player_hit_enemy"},"eh":"상처 입은 기척","s":"직전 턴 요약"}
```

Allowed fields:

- task, player action text, compact visible player tuple, candidate skill/magic/item IDs (max 5 each), code engine result summary, hidden `enemyHint`, and recent summary (max 300 chars).

Forbidden fields:

- API key, full character sheet, full equipment/skill/magic/item lists, full catalogs, hidden enemy HP/attack/defense/name/stats, full logs, and the V18 rulebook.
