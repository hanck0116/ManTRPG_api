# Rule Source

The baseline rule source is `ManRPG_v18_FINAL_병합패키지.zip`, with priority references expected inside the package:

- `ManRPG_v18_FINAL_통합본.txt`
- `최종_Obsidian_플레이어시트_원문.md`
- `충돌해결_요약.txt`
- `최종_적_시트_프론트매터_요약.txt`

## Current Scaffold Status

The current first-pass scaffold is a pre-migration step before full V18 data import. It preserves the V18-derived architectural direction and uses compact placeholder catalogs until the integrated V18 data is moved into code.

## Preserved Architectural Rules

- ManTRPG_api is a TRPG engine/API structure, not a map-centered RPG.
- Map systems are excluded.
- Combat assumes exactly one enemy.
- Boss monster systems are excluded.
- UI/API summaries stay compact.
- The engine calculates dice, judgments, stats, equipment, skills, magic, items, combat, and rewards.
- The API/GM layer interprets natural language, chooses compact action JSON, chooses enemy intent JSON, and narrates engine results.
- Full sheets and catalogs are not sent every turn; IDs and minimal state summaries are used.

## Data Migration Plan

1. Use `ManRPG_v18_FINAL_병합패키지.zip` as the rule/data source.
2. Move V18 equipment, skill, magic, item, and enemy data into ID-based catalogs under `src/data/*`.
3. Keep all numeric calculations inside `src/engine/*`.
4. Add regression tests for each migrated mechanic before expanding API behavior.
