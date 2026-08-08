# MELEGASWAP_V2_FOUNDER_PRODUCT_ACCEPTANCE_V5

## Baseline

- Branch base: `mission-my-melega-positions-drawer` @ `e544873f`
- Mission branch: `mission-founder-product-acceptance-v5`
- Mode: Phase 1 read-only walk → ledger → Phase 3 fix **only** confirmed P1

## Product coherence verdict

Melega DEX reads as one product shell: shared header, ticker, My Melega hub, V6 project pages, Liquidity V3, Farms/Pools studios, Audit security center, secondary Portfolio.

## Phase 1 findings

| ID | Severity | Status |
|---|---|---|
| FA-V5-000 home-stuck Liquidity | ~~P0~~ false positive | Invalidated |
| FA-V5-001 pools public fetch `_owner=""` | **P1** | **Fixed** |
| FA-V5-002 KPI “Unavailable” supporting copy | P2 | Deferred |
| FA-V5-003 Audit Owner/Upgrade UNAVAILABLE | P2 | Deferred (honest SSOT) |
| FA-V5-004 Top Farms hydrate flicker | P2 | Deferred |
| FA-V5-005 Home Unavailable classifier | ~~P1~~ false positive | Invalidated |

## FA-V5-001 fix

**Cause:** `getAddress()` returns `''` when `chainId` omitted; `fetchPools.ts` built `balanceOf` calls without chainId (and included empty-address configs), aborting `fetchPoolsPublicDataAsync`.

**Change:**
- `state/pools/fetchPools.ts` — chain-scoped pool lists, require 42-char chef + stake addresses, always pass `chainId` to `getAddress`
- `state/pools/index.ts` — safe default `{ totalStaked: '0' }` when sousId not in fetch map (e.g. vault sousId 0)

**No** Data Truth formula changes. **No** invented TVL/APR.

## Post-fix observed facts

- Home Top Pools: live rows with TVL (e.g. $19.8K / $5.8K) and APR where priced
- Pools overview: TVL $46.8K · 24H rewards $37.56
- Zero `[Pools Action] error` in console during re-verify

## Surface verdicts

| Surface | Verdict |
|---|---|
| Navigation | Pass — sequential remount OK; no Portfolio primary; My Melega present |
| Project V6 | Pass — five projects mount; economy farms address-matched; swap present |
| Liquidity V3 | Pass — V3 shell + My/Add/AI Builder |
| Farms | Pass — explore/create; no bigint leak |
| Pools | Pass after FA-V5-001 — economics hydrate; some Partial cards remain when unpriced (dash = B) |
| Projects | Pass |
| Audit | Pass — Score vs Runtime clear; truncated addresses listed |
| My Melega | Pass — multi-route open; z=10040; disconnected CTA |
| Portfolio | Pass — secondary shell |
| Commercial | Pass — Featured funnel opens (no payment) |
| Data Truth | Pass after fix — Top Pools class C→ok; remaining dashes class B |
| Responsive | Pass — 390–1440 triggers in-view; no overflow sampled |
| Performance | Pass — no >3s click P1; cold gotos ~1.5–2.2s local |

## Remaining P0 / P1

**0 / 0**

## Evidence

`apps/web/docs/runtime/melegaswap-v2-founder-product-acceptance-v5/`
