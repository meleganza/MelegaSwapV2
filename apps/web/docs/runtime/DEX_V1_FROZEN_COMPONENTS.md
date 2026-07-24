# Melega DEX V1 — Frozen Components

**Seal:** `DEX_V1_PRODUCTION_SEAL`  
**Baseline tip:** `258fb26e`

Unauthorized modification of frozen modules is forbidden for V1 release candidates.

## Passport V1 (SHA freeze)

Canonical lock:

`apps/web/src/views/PassportStudio/__tests__/passportV1.final.freeze.sha256.json`

- 46 module files under `PassportStudio/`
- Shared: `views/Passport/PassportScreen.tsx`, `passportTokens.ts`
- Seal validation: `dex-v1-production-seal/freeze-validation.json` → `passportV1.ok`

## List (composition freeze)

Integrity via module tests + documented `frozen-modules-integrity.json` under:

- `docs/runtime/list-module-004-how-it-works/`
- `docs/runtime/list-module-005-workspace/`
- `docs/runtime/list-module-006-workspace-premium/`
- `docs/runtime/list-module-007-ai-copilot/`

Guarded sources include (among others):

- `ListPageHero.tsx`, `ListActionCards.tsx`, `useListIntent.ts`
- `ListWhyBuildRail.tsx`, `ListHowItWorks.tsx`, `ListStudioScreen.tsx`

## Liquidity (module certification freeze)

No single SHA map on tip. Integrity enforced by certified module / one-page vitest suites, including:

- `liquidityModule007.visualPolish.test.ts`
- `dexLiqOne002.onePage.test.ts`
- Liquidity Studio view contracts (`liquidityStudioView.ts`)

## Global Information Architecture

- Canonical product/route maps under `docs/runtime/dex-v1-global-information-architecture/`
- Nav active-state contracts in `app-shell` tests
- IA freeze re-check of Passport SHA pack recorded in `frozen-module-integrity.json`

## Global chrome (design-system contracts)

- Header height / primary nav IA: `ds0012.globalHeader.test.ts`
- Bottom nav destinations: `dexUxRebuild.nav.test.ts`

## Seal-time verification

`docs/runtime/dex-v1-production-seal/freeze-validation.json`
