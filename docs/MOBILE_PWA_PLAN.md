# Mobile PWA Plan

ManTRPG's default delivery path is a mobile-first PWA with a browser-local TypeScript engine and IndexedDB persistence.

## Mobile-First UX

- Design for a 390px-wide portrait viewport first.
- Keep primary controls large, stacked, and reachable with one hand.
- Show only essential state: player HP/MP, one enemy HP/condition, 3 or fewer choices, and a short narration.
- Do not build a map system.
- Do not add boss-specific UI because enemies are always a single non-boss enemy.

## PWA Features

- Installable home-screen experience using a manifest and service worker in the eventual web app shell.
- Offline default play with no API dependency.
- IndexedDB session save/load through `IndexedDbSessionStorageAdapter`.
- API settings screen for provider, model, endpoint, key persistence, key deletion, test button, and usage estimate.

## Runtime Architecture

```text
Mobile PWA
  -> browser-local TypeScript engine
  -> IndexedDB session storage
  -> optional BYOK LLM adapters
```

The local engine owns dice, judgment, damage, healing, inventory, rewards, and enemy AI. Optional APIs provide only natural-language interpretation, short narration, log summary, or skill/magic flavor text.

## 390px Acceptance Checklist

- Main action buttons fit without horizontal scrolling.
- Narration is short enough to read above action buttons.
- API settings are a simple vertical form.
- Provider test and delete-key buttons are visible without nested desktop panels.
