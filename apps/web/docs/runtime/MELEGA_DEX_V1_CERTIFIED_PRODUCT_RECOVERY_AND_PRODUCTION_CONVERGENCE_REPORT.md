# MELEGA DEX V1 — Certified Product Recovery & Production Convergence

## 1. Executive summary

Production at **https://www.melega.finance** was forensically identified as serving commit **`2a887252`** (Liquidity V1 tip) via Vercel Production auto-deploy — **not** `origin/main`. That tip restored Liquidity modules 001–008 but retained **legacy** Farms/Pools studio UIs and pre–certified Home Instant/Smart CTAs, because Farms V1, Pools V1, and Smart Swap cumulative tips lived on divergent branches.

This mission rebuilt one cumulative recovery branch by content-restoring certified trees onto `2a887252`, removed the Liquidity legacy Pool body from production mount, and hardened Pools wallet last-good retention against empty clobber races.

## 2. Exact production regression cause

Vercel Production tracked successive mission branch tips. Deploying `liquidity-v1-final-integration-and-certification` (`2a887252`) overwrote previously deployed Smart Swap / product work with a branch ancestry that never contained Farms V1 modules or Pools V1 modules.

## 3. Deployed branch and SHA before recovery

| Field | Value |
| --- | --- |
| Production SHA | `2a887252` |
| Product | Liquidity V1 certification tip |
| Deployment ID | `5631594160` |
| Next buildId | `cxemHHwOsG-u8EDzQUG1o` |
| origin/main | `ff6d6179` (not serving) |

## 4. Certified product ancestry

See `CERTIFIED_PRODUCT_ANCESTRY_REPORT.md` and `certified-product-ancestry.json`.

Selected Smart Swap tip: **`95c1cbf4`** (contains `77ec697b`).

## 5. Files/commits that reintroduced legacy surfaces

Not a single “revert commit” — **missing merges**. Production tip simply lacked:

- `FarmsStudio/modules/*` (Farms V1)
- `PoolsStudio/modules/*` (Pools V1)
- HomeTrade Instant\|Smart tabbed terminal from `95c1cbf4`

## 6. Product recovery map

| Product | Source tip | Action |
| --- | --- | --- |
| Liquidity V1 | `2a887252` (base) | retained; legacy Pool unmounted |
| Farms V1 | `2f834b45` | checkout FarmsStudio + pages/farms |
| Pools V1 | `99258574` | checkout PoolsStudio + pages/pools |
| Smart Swap Home | `95c1cbf4` | checkout HomeTrade + SmartSwap + SmartSwapStudio |
| List Studio | `7a29e691` | checkout ListStudio + pages/list |
| Passport V1 | `70d2bd19` | checkout PassportStudio + PassportScreen |

## 7. Pool position disappearance root cause

Module 003 last-good existed on Pools V1, but **authoritative empty** could overwrite a non-empty last-good during refresh/race. Production tip lacked Module 003 entirely (legacy YourPoolsSection).

## 8. Wallet state-machine correction

`usePoolsWalletPositions.ts`: synchronous scope generation + never store empty over non-empty last-good.

## 9. Legacy surface removal

- Home: no Instant Swap / Smart Swap → hero CTAs
- Liquidity: `views/Pool` body unmounted (`data-liquidity-legacy-body="archived"`)
- Farms/Pools: certified module stacks replace legacy grids

## 10–15. Restorations

Smart Swap, Liquidity V1, Farms V1, Pools V1, List Studio, Passport V1 restored as above.

## 16. Top Movers / activity

Restored via `95c1cbf4` HomeTrade trending stack (true trending repair). Static “TRENDING ON MELEGA DEX · MARCO only” hero path removed with legacy HomeTrade.

## 17. Tests

- Focused recovery + product suites: **35/35** passed (re-run after Smart Swap lib restore).
- Recovery suite alone: **6/6**.
- Playwright multi-route certify: **pass** (`certify-summary.json`).

## 18. Build

`yarn next build` — **pass** (`build-summary.json`).

## 19–20. Responsive / Accessibility

Evidence pack: `responsive-validation.json`, `accessibility-validation.json`. Viewports 1440/1280/1024/430/390 — no horizontal overflow on mandatory routes.

## 21. Known limitations

1. List has no dedicated `list-v1-final` branch; latest List Studio tip `7a29e691` used.
2. Deep wallet-connected live E2E without Founder session is capability-gated (pool last-good covered by unit/source gates + race JSON).
3. Vercel Production auto-deploy from mission tips caused the regression — Production must track the certified recovery SHA after merge.
4. Mode tabs use certified labels STANDARD / SMARTSWAP (from tip `95c1cbf4`), not redesigned Instant|Smart copy.
5. Integration 009 full alias cleanup remains future work.

## 22. Candidate deployment SHA

- Recovery tip: `296eac5e999eb9077068343e2ee0118582a4a918`
- Production merge SHA: `cde7086703e68c18e51a8190f1a4c044b74170ce` (contains tip)
- Production deployment ID: `5632770591`
- Production buildId: `0puv09Bvgf-cb1t455Xm3`


## 23. Rollback target

Previous Production: **`2a887252`** (deployment `5631594160`). Prefer redeploy prior known-good Smart Swap tip **`95c1cbf4`** if recovery deploy fails smoke.

## 24. Final verdict

Production smoke on `/`, `/liquidity`, `/farms`, `/pools`, `/list`, `/passport` passed after trending-export hotfix.

MELEGA_DEX_V1_CERTIFIED_PRODUCT_RECOVERY_DEPLOYED
