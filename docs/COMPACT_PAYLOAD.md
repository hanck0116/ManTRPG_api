# Compact Payload

API에는 전체 상태 대신 짧은 payload만 보냅니다.

Example:

```json
{"t":"narrate","p":[32,18,"normal","낫"],"ids":{"sk":["SK_REAPING_ARC"],"mg":["MG_EMBER_01"],"it":["IT_HERB_SMALL"]},"s":"직전 턴 요약","pa":{"i":"attack","tg":"enemy","sk":null,"mg":null,"it":null,"aim":"slash"},"r":{"ok":true,"hit":true,"dmg":7,"heal":0,"end":false,"tags":["physical"],"hint":"player_hit_enemy"},"eh":"상처 입은 듯함"}
```

Never include: API Key, full character sheet, full equipment/skill/magic/item catalog, full enemy stats, full logs, full V18 rulebook.
