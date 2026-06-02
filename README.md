# ManTRPG_api

ManTRPG_api is a TypeScript TRPG engine/API scaffold for a token-efficient tabletop RPG experience. It keeps the feeling of free-form TRPG play while moving calculations out of the API/GM layer and into deterministic code modules.

## Goals

- Preserve TRPG flavor, impact, and player freedom.
- Remove map-centered gameplay.
- Keep combat focused on exactly one enemy.
- Exclude boss monster systems.
- Keep UI/API state simple: HP, MP, enemy condition, and a few available actions.
- Minimize API token usage with ID references and compact state summaries.

## Difference from Existing ManRPG

The prior ManRPG direction was map-centered and carried broader rule context. This project uses `ManRPG_v18_FINAL_병합패키지.zip` as the rule/data source, but restructures play into a compact TRPG engine. The current scaffold is still before full V18 data migration; equipment, skills, magic, items, and enemies are represented by small placeholder catalogs with stable IDs.

## Current Turn Flow

```text
PlayerInput
  -> ParsedAction
  -> player EngineResult
  -> EnemyDecision | null
  -> enemy EngineResult | null
  -> MinimalApiState
  -> NarrationResult
```

1. The player writes a natural-language action.
2. The API/GM layer converts it into a short `ParsedAction` JSON command.
3. Engine modules calculate the player action: d100 roll, success grade, damage, MP cost, HP changes, blocked state, and battle end.
4. If combat continues, the local GM decision function returns compact `EnemyDecision` JSON.
5. Engine combat code calculates the enemy result.
6. The API returns only compact state and short narration.

The API/GM layer does not roll dice, invent damage, calculate healing, or grant rewards. It only interprets player language, chooses compact JSON intent, and describes engine JSON like a TRPG master.

## d100 Judgment Structure

All core checks use d100.

- `rollDie(100)` creates the natural roll.
- `total = roll + modifier`.
- `total >= target` succeeds.
- Natural `100` is `criticalSuccess`.
- Natural `1` is `criticalFail`.
- Modifiers affect only `total`, not the natural critical rules.

Example:

```json
{
  "roll": 72,
  "modifier": 5,
  "total": 77,
  "target": 60,
  "success": true,
  "grade": "success"
}
```

## EnemyDecision Structure

Enemy intent is separated from combat math so a future API/GM model can choose intent without calculating damage.

```json
{
  "intent": "attack",
  "target": "player",
  "method": "basic_attack",
  "reasonTag": "default_aggressive"
}
```

Current local rules are intentionally small: exactly one enemy exists, defeated enemies do not act, a down player is not attacked, and the default active enemy action is `attack`.

## API Integration Points

Future external API/LLM integration should replace only these interpretation/description points:

- Player natural language → `ParsedAction`.
- Enemy intent selection → `EnemyDecision`.
- Compact engine result → short `NarrationResult`.

It must not replace engine-side dice, judgment, damage, healing, MP cost, reward, or state mutation calculations.

## Catalog ID Convention

- Equipment weapon: `EQ_WEAPON_SCYTHE_BASIC`
- Equipment armor: `EQ_ARMOR_TRAVELER_COAT`
- Skill: `SK_REAPING_ARC`
- Magic: `MG_EMBER_01`
- Item: `IT_HERB_SMALL`
- Enemy: `ENEMY_STRAY_SHADOW`

## Install

```bash
npm install
```

## Run

```bash
npm run dev
```

Health check:

```bash
curl http://localhost:3000/health
```

Turn example:

```bash
curl -X POST http://localhost:3000/turn \
  -H 'Content-Type: application/json' \
  -d '{"sessionId":"demo","text":"낫을 크게 휘둘러 적의 다리를 노린다."}'
```

## Test

```bash
npm run build
npm test
npm run typecheck
```

## Token-Saving Structure

- Full player sheets are not sent every turn.
- Full catalogs are not sent to the API.
- Equipment, skills, magic, and items are referenced by ID.
- Only minimal scene state is exposed to narration.
- Narration is short and choice lists are capped at 3.
- Combat logs are summarized in code.
- Enemy behavior uses compact `EnemyDecision` JSON instead of long hidden reasoning.

## First-Pass Scope

Implemented in this scaffold:

- TypeScript project setup with `node:http`, `zod`, `tsx`, and `vitest`.
- Engine modules for d100 dice checks, judgment, and single-enemy combat.
- Basic player/session state and minimal API state summaries.
- Local enemy decision module with API-replaceable `EnemyDecision` shape.
- GM prompt and short narrator separation.
- API contract, token policy, and rule source documentation.
- Tests for dice, combat, magic blocking, and single-enemy constraints.

Not yet implemented:

- Full V18 data catalog migration from `ManRPG_v18_FINAL_병합패키지.zip`.
- External LLM integration for robust Korean natural-language parsing, enemy intent, and prose narration.
- Persistent session storage.
- Advanced inventory/shop flows.
- Complete skill/magic/item catalogs.

## Recommended Next Step

Move V18 equipment, skill, magic, item, and enemy data into ID-based catalogs under `src/data/*`, then add regression tests for each migrated rule before expanding API behavior.
