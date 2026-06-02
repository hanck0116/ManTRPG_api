# API Contract

ManTRPG_api keeps API payloads small. The API layer interprets natural language and narrates engine JSON, while the TypeScript engine owns all rules, dice, damage, healing, reward, stat, equipment, skill, magic, and item calculations.

## 1. PlayerInput

```json
{
  "sessionId": "string",
  "text": "string"
}
```

## 2. ParsedAction

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

## 3. EngineResult

```json
{
  "ok": true,
  "scene": "combat",
  "result": "success | fail | partial | blocked",
  "roll": 17,
  "target": 14,
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

## 4. NarrationResult

```json
{
  "text": "string",
  "choices": ["string", "string", "string"]
}
```

## Endpoint Draft

### `GET /health`

Returns service health.

### `POST /turn`

Accepts `PlayerInput` and returns:

```json
{
  "action": "ParsedAction",
  "engineResult": "EngineResult",
  "narration": "NarrationResult",
  "state": "MinimalApiState"
}
```

`state` contains only the current scene, compact player HP/MP/weapon/condition, compact single-enemy HP/condition, and a short list of available actions.
