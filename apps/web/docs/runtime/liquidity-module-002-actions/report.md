# LIQUIDITY_MODULE_002_ACTIONS — Certification Report

## Status

**LIQUIDITY_MODULE_002_ACTIONS_CERTIFIED**

## Mission

Journey chooser after Hero — Manual Liquidity and AI Liquidity Builder. Navigation and explanation only.

## Base

- `LIQUIDITY_MODULE_001_HERO_CERTIFIED` @ `1afdc494`

## Mount

`/liquidity`: Hero → Actions → legacy `views/Pool`

## Geometry (desktop 1440 measured)

- Container: 1376
- Cards: 676 + 24 + 676
- Mobile 390 / 430: single column, no overflow

## CTAs

- Manual → `/add` (no form in Module 002)
- AI Builder → `/liquidity-studio` (no execution in Module 002)
- Unavailable UI path present when `aiBuilderAvailable` is false

## Tests / build

- Vitest: 19/19 passed (Module 001 + 002)
- `next build`: passed

## Freeze

- Module 001 Hero sources byte-identical
- Pool / liquidityRuntime / contracts not feature-edited
