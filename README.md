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

The prior ManRPG direction was map-centered and carried broader rule context. This project uses the V18 materials as a rule/data source, but restructures play into a compact TRPG engine:

1. The player writes a natural-language action.
2. The API/GM layer converts it into a short JSON command.
3. Engine modules roll dice and calculate judgments, combat, magic, skills, items, and rewards.
4. The engine returns result JSON.
5. The GM layer narrates only from the engine result.

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
npm test
```

## Basic API Flow

```text
PlayerInput -> ParsedAction -> EngineResult -> NarrationResult -> MinimalApiState
```

The API/GM layer does not roll dice, invent damage, calculate healing, or grant rewards. It only interprets player language, picks compact action JSON, and describes engine JSON like a TRPG master.

## Token-Saving Structure

- Full player sheets are not sent every turn.
- Equipment, skills, magic, and items are referenced by ID.
- Only minimal scene state is exposed to narration.
- Narration is short and choice lists are capped.
- Combat logs are summarized in code.

## First-Pass Scope

Implemented in this scaffold:

- TypeScript project setup.
- Engine modules for dice, judgment, and single-enemy combat.
- Basic player/session state and minimal API state summaries.
- GM prompt and narrator separation.
- API contract, token policy, and rule source documentation.
- Simple tests for dice, combat, and magic.

Not yet implemented:

- Full V18 data migration from the missing archive.
- External LLM integration for robust Korean natural-language parsing.
- Persistent session storage.
- Advanced inventory shop flows.
- Complete skill/magic/item catalogs.
