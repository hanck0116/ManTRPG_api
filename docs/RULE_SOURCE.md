# Rule Source

The requested baseline rule archive is `/mnt/data/ManRPG_v18_FINAL_병합패키지.zip`, with priority references:

- `ManRPG_v18_FINAL_통합본.txt`
- `최종_Obsidian_플레이어시트_원문.md`
- `충돌해결_요약.txt`
- `최종_적_시트_프론트매터_요약.txt`

## Current Environment Note

During this first scaffold pass, `/mnt/data/ManRPG_v18_FINAL_병합패키지.zip` was not present in the container, so exact V18 tables could not be extracted. The implementation therefore preserves the user's stated direction as hard architectural constraints and uses small placeholder IDs/data that can be replaced when the archive is available.

## Preserved Architectural Rules

- ManTRPG_api is a TRPG engine/API structure, not a map-centered RPG.
- Map systems are excluded.
- Combat assumes exactly one enemy.
- Boss monster systems are excluded.
- UI/API summaries stay compact.
- The engine calculates dice, judgments, stats, equipment, skills, magic, items, combat, and rewards.
- The API/GM layer interprets natural language, chooses compact action JSON, and narrates engine results.
- Full sheets and catalogs are not sent every turn; IDs and minimal state summaries are used.

## Data Migration Plan

1. Unzip the V18 package when available.
2. Extract player stat names, equipment IDs, skill IDs, magic IDs, item IDs, and enemy frontmatter into `src/data/*` catalogs.
3. Keep all numeric calculations inside `src/engine/*`.
4. Add regression tests for each migrated mechanic before expanding API behavior.
