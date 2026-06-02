# V18 Migration Plan

## Current Staging Data

The current repository contains only a small staging catalog for runnable PWA validation:

- Equipment: basic scythe and traveler coat.
- Item: small herb.
- Skill: reaping arc.
- Magic: small ember.
- Enemy: one stray shadow.
- Reward: temporary coin/herb/appearance-scaled entries.

## Full V18 Catalog Targets

Next migration work should replace staging data with the integrated V18 catalog for:

- Equipment and equipment slots.
- Items, consumables, materials, and treasure.
- Skills and techniques.
- Magic definitions.
- Reward tables and reward candidate rules.
- Traits and character options.
- Enemy templates that still obey the current single-enemy constraint.

## Source Listing Plan

For each imported category, record:

1. Source document or sheet name.
2. Original V18 identifier/name.
3. Normalized TypeScript ID.
4. Mechanical fields used by the local engine.
5. Flavor fields allowed in compact client prompts.
6. Migration notes for omitted or simplified fields.

## Constraints Kept

- Map movement remains removed.
- Combat remains exactly one enemy at a time.
- Boss monsters remain out of scope.
- Local LLM, Ollama, llama.cpp, GPT4All, and WebLLM remain unused.
