# MelegaDEX EVO R031 release candidate

Base: `63055e6832cf1ece1eb7171ea3e5ed400781430a` (R030)

## Scope delivered

- BNB Chain remains the only active Melega Farms/Pools entry network.
- Ethereum, Polygon and Base Farms/Pools are forced into terminated lifecycle presentation.
- Create/stake requests fail closed at route, runtime and action-host boundaries on terminated networks.
- Reads, claim, unstake, withdraw and emergency-withdraw paths remain available where the underlying contract supports them.
- Swap and liquidity removal remain independent and are not disabled by the native-yield termination policy.
- `/liquidity` opts out of the page Suspense wrapper to prevent the hydration failure observed during real browser QA.

## Verification

- TypeScript: PASS.
- Production build: PASS (114 static pages generated).
- Native-yield policy: 9/9 PASS.
- Action-host modal safety: 13/13 PASS.
- Browser route audit: 85/85 navigation checks PASS at 320, 390, 430, 768 and 1440 px.
- Horizontal overflow: 0/85.
- Next runtime error overlays: 0/85.
- Empty consumer surfaces: 0/85.
- Screenshots: 34 (mobile 390 + desktop 1440 for each audited route/funnel).

The browser audit report is `docs/screenshots/r031-final-all-routes/route-matrix.json`.

## Route matrix

| Surface | Routes / funnel | Result | Notes |
| --- | --- | --- | --- |
| Home | `/` | PASS | Premium shell and SmartSwap surface rendered. |
| Swap | `/swap` | PASS | Canonical Trade/SmartSwap preserved. |
| Bridge | `/bridge` | PASS | MARCO Bridge workspace rendered. |
| Liquidity | `/liquidity`, `?view=add`, `?view=remove` | PASS | Add/remove UI preserved; hydration overlay fixed. |
| Remove deep link | `/remove/BNB/0x55d…7955` | PASS | Legacy deep link rendered without disabling exits. |
| Farms | `/farms?view=explore` | PASS | BNB active; terminated chains are exits-only. |
| Pools | `/pools?view=explore` | PASS | BNB active; terminated chains are exits-only. |
| Portfolio | `/portfolio` | PASS | Wallet-first premium surface rendered. |
| Projects | `/projects` | PASS | Premium discovery surface rendered. |
| Project detail | `/project/marco` | PASS | Canonical redirect/deep link preserved. |
| Tools | `/list` | PASS | Four approved services only. |
| Featured service | `/list?intent=featured` | PASS | Funnel surface rendered. |
| Trend Boost service | `/list?intent=trend-boost` | PASS | Funnel surface rendered. |
| Liquidity service | `/list?intent=liquidity` | PASS | Funnel surface rendered. |
| Project service | `/list?intent=create-project` | PASS | Funnel surface rendered. |
| Wallet-signed execution | all financial funnels | PARTIAL | No real wallet signature or transaction was executed by mandate. Read-only/disconnected flows and action gating were verified. |

## Known inherited test debt

Three legacy `*V1.finalCertification` suites remain inconsistent with R030: they expect removed modules, missing Founder evidence packs and stale frozen hashes. In the focused run they produced 12 failures. Their snapshot/freeze contracts were not rewritten because R031 has no Founder approval to redefine those historical certifications.

## Stop gate

This is an isolated RC only. No merge, deployment, DNS change or transaction was performed. Founder Review is still required; this document does not declare UX approval.
