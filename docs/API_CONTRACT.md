# API Contract

ManTRPG_api keeps API payloads small. The API layer interprets natural language and narrates engine JSON, while the TypeScript engine owns all rules, dice, damage, healing, reward, stat, equipment, skill, magic, item, and state calculations.

## PlayerInput

```json
{
  "sessionId": "string",
  "text": "string"
}
```

## ParsedAction

```json
{
  "intent": "attack | skill | magic | item | defend | talk | inspect | rest | unknown",
  "target": "enemy | self | none",
  "skillId": "string | null",
  "magicId": "string | null",
  "itemId": "string | null",
  "method": "string | null",
  "rawText": "string"
}
```

Current scaffold IDs use stable catalog naming: `EQ_WEAPON_SCYTHE_BASIC`, `EQ_ARMOR_TRAVELER_COAT`, `SK_REAPING_ARC`, `MG_EMBER_01`, `IT_HERB_SMALL`, and `ENEMY_STRAY_SHADOW`.

## CheckResult

All checks use d100. Natural `100` is `criticalSuccess`; natural `1` is `criticalFail`; otherwise `total >= target` succeeds. Modifiers affect `total` only.

```json
{
  "roll": 72,
  "modifier": 5,
  "total": 77,
  "target": 60,
  "success": true,
  "grade": "criticalSuccess | success | fail | criticalFail"
}
```

## EngineResult

```json
{
  "ok": true,
  "scene": "combat | rest | dialogue",
  "result": "success | fail | partial | blocked",
  "check": "CheckResult | null",
  "roll": 72,
  "target": 60,
  "total": 77,
  "grade": "success",
  "success": true,
  "damage": 8,
  "healing": 0,
  "playerHp": 32,
  "playerMp": 18,
  "enemyHp": 12,
  "battleEnded": false,
  "tags": ["hit", "physical"],
  "messageHint": "short hint for narrator"
}
```

## EnemyDecision

The GM/API decision layer may choose the enemy's intent later. The current scaffold uses a local compact decision function and keeps all damage calculation in `combat.ts`.

```json
{
  "intent": "attack",
  "target": "player",
  "method": "basic_attack",
  "reasonTag": "default_aggressive"
}
```

Enemy decision rules: there is exactly one enemy; defeated enemies do not act; a down player is not attacked; the default intent is `attack`.

## TurnResult

```json
{
  "action": "ParsedAction",
  "playerResult": "EngineResult",
  "enemyDecision": "EnemyDecision | null",
  "enemyResult": "EngineResult | null",
  "narration": "NarrationResult",
  "state": "MinimalApiState"
}
```

Turn order is: player input validation → parsed action → player engine result → optional enemy decision → enemy engine result → minimal state summary → GM narration.

## NarrationResult

```json
{
  "text": "string",
  "choices": ["string", "string", "string"]
}
```

Narration stays at 2 to 4 short sentences, uses only engine-produced numbers, and returns at most 3 choices.

## MinimalApiState

```json
{
  "scene": "combat",
  "player": {
    "hp": "36/40",
    "mp": "25/25",
    "weapon": "낫",
    "condition": "normal"
  },
  "enemy": {
    "hp": "16/20",
    "condition": "normal"
  },
  "availableActions": ["attack", "skill", "magic", "item", "defend"]
}
```

## Endpoints

### `GET /health`

Returns service health.

### `POST /turn`

Accepts `PlayerInput` and returns `TurnResult`.
