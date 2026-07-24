# PASSPORT_MODULE_004 — My Projects

## 1. Verdict

**PASSPORT_MODULE_004_MY_PROJECTS_CERTIFIED**

## 2. Branch

`mission-passport-module-004-my-projects`

## 3. Commit

937b7138a7f636b0e2d25ebf2ae742681486cd27

## 4. Certified base

- `PASSPORT_MODULE_003_ASSETS_CERTIFIED`
- Tip `36d1ce8b`

## 5. Modules 001–003 freeze

SHA-256 locks in `passportModule001_002_003.freeze.sha256.json` — verified unchanged (25 files).

Measured frozen heights: hero 360 / portfolio 176 / assets 176; gaps 16.

## 6. Desktop geometry (measured)

| Target | Result |
| --- | --- |
| Module | 1376×176 @ left 32 |
| Cards | 256×144 (Create New Project) |
| Gap Assets → Projects | 16 |
| Pad X/Y | 16 |
| Empty state | explanation + Create card only (0 project cards) |
| Create CTA href | `/list?intent=create-project` (Next may render `/list/?…`) |

Five-card grid math when populated: `256×5 + 16×4 = 1344` content + `16×2` pad = 1376.

## 7. Mobile

Cards stack. No carousel. No horizontal overflow (390 viewport).

## 8. Scope

Modified only My Projects + mount wiring + tokens + ownership map + freeze/tests/cert.

Did **not** touch Hero, Identity, Portfolio, Assets internals, Liquidity, Activity, Security, Header, Trending, Footer, Navigation, or DEX core.

## 9. Data honesty

- No Passport controlled-projects producer in production → empty + Create.
- Status / Role / KPI only from factual control records when available; never invent or infer ownership from holdings.
- Create routes to List: `/list?intent=create-project`. No in-Passport project creation.

## 10. Evidence

- `apps/web/docs/runtime/passport-module-004-my-projects/geometry-measurements.json`
- `apps/web/docs/runtime/passport-module-004-my-projects/data-source-map.json`
- Screenshots: `desktop-1440.png`, `desktop-module-crop.png`, `mobile-390.png`
- Vitest: Module 004 + 001/002/003 freeze guards + nav/header
- `yarn next build`: pass

## 11. Forbidden files

Untouched: `exchange.ts`, `contracts.ts`, router, wallet, swap, farms, pools, MasterChef, NFT, token lists.

## 12. Push

PUSH_PENDING
