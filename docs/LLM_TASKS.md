# LLM Tasks

Allowed compact tasks:

- `interpret`: convert player natural language to `{intent,target,id,aim}`.
- `enemy-action`: choose hidden enemy `{intent,style,hint}` only.
- `narrate`: return `{n,c}` where `n` is short Korean narration and `c` has up to 3 choices.
- `generate-skill`: draft `{name,summary,flavor,tags}` only.
- `compact-summary`: produce a visible-log summary of 300 Korean characters or less.

Forbidden outputs:

- HP/MP changes, damage/healing math, dice rolls, rewards, coin changes, item counts, equipment changes, level changes.
- Enemy counts, boss monsters, maps/movement, V18-unsupported numeric effects.
- `stateDeltas` or equivalent mutation instructions.

All state and arithmetic authority belongs to the TypeScript engine.
