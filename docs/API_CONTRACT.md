# API Contract

The server API is keyless by default. `/turn` accepts only local-engine input and never receives player API keys. Optional BYOK calls happen in the browser client runtime unless a future, explicitly opt-in proxy is added.

## PlayerInput

```json
{ "sessionId": "string", "text": "string" }
```

`llm`, `apiKey`, and provider settings are not accepted by `/turn`.

## CheckResult

V18 absolute checks use `1d100 <= effectiveTarget`.

```json
{
  "roll": 65,
  "baseTarget": 60,
  "modifier": 5,
  "effectiveTarget": 65,
  "success": true,
  "grade": "criticalSuccess | success | fail | criticalFail",
  "formula": "1d100 <= effectiveTarget"
}
```

Natural `1` is `criticalSuccess`; natural `100` is `criticalFail`.

## EngineResult

```json
{
  "ok": true,
  "scene": "combat | rest | dialogue",
  "result": "success | fail | partial | blocked",
  "check": "CheckResult | null",
  "roll": 65,
  "baseTarget": 60,
  "effectiveTarget": 65,
  "grade": "success",
  "success": true,
  "damage": 4,
  "healing": 0,
  "playerHp": 32,
  "playerMp": 18,
  "enemyHp": 16,
  "battleEnded": false,
  "tags": ["hit", "physical"],
  "messageHint": "player_hit_enemy"
}
```

## MinimalApiState

Only compact state and up to five candidate IDs per category are exposed. Full catalogs and full character sheets are not sent to APIs.

## NarrationResult

Narration is 1-3 short sentences and up to 3 choices. API narration may only restate engine-produced numbers.

## Forbidden API Authority

APIs do not generate dice rolls, damage, healing, rewards, enemy counts, HP/MP changes, or state mutation. There is exactly one enemy.
