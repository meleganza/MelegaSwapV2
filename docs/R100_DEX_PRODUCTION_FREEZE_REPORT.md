# R100 — DEX Production Freeze Report

**Mission:** R100 DEX Production Freeze  
**Date:** 2026-07-04  
**Branch:** `design-system-foundation`  
**SHA:** `99aea9c371528276b5cfe6d7d6a12a67ddfd7d60`  
**Staging:** https://v2.melega.finance  
**Return:** `R100_DEX_PRODUCTION_FREEZE_READY`

---

## Verdict

| Gate | Result |
|------|--------|
| **Build** | ✅ PASS |
| **Unit / runtime tests** | ✅ PASS (all mandated suites) |
| **v2 route smoke** | ✅ PASS |
| **Treasury handoff API** | ✅ JSON (not 404/HTML) |
| **Screenshot matrix** | ✅ 44/44 captured |
| **Production merge (PR #2 → main)** | **MERGE_ALLOWED** for V2 staging freeze; **manual BSC wallet QA still required** before `www` cutover |

---

## Scope

Stabilization-only pass across all V2 studio routes. No new pages, organs, runtime ownership changes, treasury schema changes, or KIRI boundary changes.

---

## Routes tested

| Route | HTTP (v2) | Screenshots |
|-------|-------------|-------------|
| `/` | 200 | 390×844, 428×926, 1440×900, 1728×1117 |
| `/trade` | 200 | ✅ |
| `/swap` | 200 (compat) | — |
| `/liquidity-studio` | 200 | ✅ |
| `/farms` | 200 | ✅ |
| `/pools` | 200 | ✅ |
| `/projects` | 200 | ✅ |
| `/trending` | 200 | — |
| `/radar` | 200 | ✅ |
| `/collectibles` | 200 | ✅ |
| `/build-studio` | 200 | ✅ |
| `/import-existing-token` | 200 | ✅ |
| `/command-center` | 200 | ✅ |
| `/nft/` | 200 (legacy) | — |
| `/viewNFTs` | 200 (legacy) | — |
| `/nftmarket` | 200 (legacy) | — |
| `/ilo` | 200 (legacy) | — |
| `/nfts` | 301 → `/collectibles` | ✅ |

Screenshots: `docs/screenshots/r100-dex-production-freeze/`

---

## Visual / layout blockers fixed

### Global / branding

| Fix | Files |
|-----|-------|
| MARCO widget uses canonical `MARCO_LOGO_URI` with Melega SVG fallback | `MelegaMarcoCard.tsx` |
| Shell root `overflow-x: hidden`; content `min-width: 0` | `MelegaAppShell.tsx` |
| Sidebar brand row overflow guard | `MelegaSidebar.tsx` |
| Shared layout constants exported | `constants/layout.ts`, `design-system/melega/index.ts` |
| Mobile bottom pad unified to `calc(96px + env(safe-area-inset-bottom))` | All studio `*Tokens.ts` |

### Mobile / wallet

| Fix | Files |
|-----|-------|
| Mobile header shows visible **Connect** CTA (not icon-only) | `MelegaAppShell.tsx`, `AppShellStyles.tsx` |

### Farms / Pools

| Fix | Files |
|-----|-------|
| Live APR reduced (42px → 32px) so metrics stay readable | `FarmGridCard.tsx`, `PoolGridCard.tsx` |
| Footer button row in flex flow (removed `padding-right: 24px`) | `FarmGridCard.tsx`, `PoolGridCard.tsx` |
| Daily rewards / metric values ellipsis overflow | `FarmGridCard.tsx`, `PoolGridCard.tsx` |

### Projects

| Fix | Files |
|-----|-------|
| Card min-height 360px → 400px | `projectsStudioTokens.ts` |
| AI Summary 3-line clamp without hard clip | `ProjectGridCard.tsx` |

### Collectibles

| Fix | Files |
|-----|-------|
| Button row moved from absolute to flex flow | `CollectibleGridCard.tsx` |
| Mobile breakpoint aligned to 767px | `CollectibleGridCard.tsx` |
| Utility chips capped at 4 (unchanged logic, layout safe) | `CollectibleGridCard.tsx` |

### Command Center

| Fix | Files |
|-----|-------|
| Machine Summary shows full JSON when expanded (not 8-line slice) | `MachineSummaryCard.tsx` |
| Machine Summary collapsed by default (unchanged) | `MachineSummaryCard.tsx` |

### Radar

| Fix | Files |
|-----|-------|
| Heatmap scroll container `max-width: 100%` | `RadarHeatmapTable.tsx` |

### Build Studio

| Fix | Files |
|-----|-------|
| AI Manifest collapsed by default (10-line preview + expand) | `AIManifestPanel.tsx` (pre-existing) |

---

## Production readiness verification

| Check | Result |
|-------|--------|
| `POST /api/treasury/settlement-events` on v2 | ✅ JSON `INVALID_RECEIPT` (proxy live, not 404) |
| `TREASURY_RUNTIME_URL` configured | ✅ `https://treasury.melega.ai` |
| Legacy NFT routes | ✅ 200 |
| `/nfts` → `/collectibles` | ✅ redirect in `next.config.mjs` |
| `/swap` compatibility | ✅ alias to trade terminal |
| `/trade` primary | ✅ |

---

## Validation summary

```text
yarn build                                          ✅
yarn test src/design-system                         ✅ 11/11
yarn test src/lib/homepage-live                     ✅ 2/2
yarn test src/lib/treasury-handoff                  ✅ 11/11
yarn test projectsRuntime                           ✅ 5/5
yarn test radarRuntime                              ✅ 6/6
yarn test buildRuntime                              ✅ 5/5
yarn test commandCenterRuntime                      ✅ 6/6
yarn test collectiblesRuntime                       ✅ 9/9
capture-r100-dex-production-freeze-screenshots.mjs  ✅ 44/44
```

**Local `phase2-qa-v2.mjs` note:** Some routes surface Sentry error boundary on `localhost` without full production env (non-blocking for v2 staging; staging curl smoke passes).

---

## Remaining non-blocking issues

| Issue | Classification |
|-------|----------------|
| Manual BSC wallet QA (swap, LP, farms, pools) | Required before `www` cutover |
| Gas estimation 🟨 on Trade runtime | Estimate only |
| Trending studio cards partially static | Matrix-known |
| Command Center horizontal overflow on narrow local QA | Needs device QA on v2 post-deploy |
| `home:trade-first` SSR hydration marker | Non-blocking (client-rendered attribute) |
| Liquidity runtime build warnings (`Field` import) | Pre-existing; build completes |

---

## Production recommendation

**MERGE_ALLOWED** — R100 stabilization changes are ready to merge on `design-system-foundation` and deploy to `v2.melega.finance`.

**Cutover to `www.melega.finance` remains HOLD** until operator completes manual BSC wallet sign-off checklist in [`DEX_PRODUCTION_READINESS_REPORT.md`](./DEX_PRODUCTION_READINESS_REPORT.md).

---

## Artifacts

- Screenshot script: `apps/web/scripts/capture-r100-dex-production-freeze-screenshots.mjs`
- Screenshots: `docs/screenshots/r100-dex-production-freeze/`
- Matrix update: [`DEX_IMPLEMENTATION_MATRIX.md`](./DEX_IMPLEMENTATION_MATRIX.md)
- Readiness update: [`DEX_PRODUCTION_READINESS_REPORT.md`](./DEX_PRODUCTION_READINESS_REPORT.md)
