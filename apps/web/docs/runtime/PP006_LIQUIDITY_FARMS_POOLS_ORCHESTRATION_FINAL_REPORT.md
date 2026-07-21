# PP006 — Liquidity, Farms and Pools Orchestration — Final Report

## 1. Executive verdict

**PP006_LIQUIDITY_FARMS_POOLS_ORCHESTRATION_CERTIFIED**

PP006 adds project-scoped Liquidity / Farms / Pools discovery to the Project Page Participate section. Opportunities are attributed from the certified venue registry, destinations open existing studios only, wallet positions reuse PP004 without a second portfolio, and no APR/APY/TVL or execution payloads are introduced.

## 2. PP001–PP005 dependency audit

| Dependency | Commit | Status |
|---|---|---|
| PP001 | `4b4f2e66` | Frozen |
| PP002 | `ba58f41b` | Frozen |
| PP003 | `70514297` | Frozen |
| PP004 | `65441288` | Frozen — reused for positions |
| PP005 | `85cc5d4e` | Frozen — Markets remain first in Participate |

Branch base: `85cc5d4e`.

## 3. Liquidity Studio audit

- Route: `/liquidity-studio` (no currency query prefill)
- PP006 CTA: bare `/liquidity-studio` navigation only
- Studio code unmodified

## 4. Farms Studio audit

- Route: `/farms` — FarmsStudio entry; no project query params
- Venue `marco-bnb-farm` (pid 1) bound to melega-dex
- CTA: `/farms`

## 5. Pools Studio audit

- Route: `/pools` — PoolsStudio entry
- Venue `marco-stake-sous-0` (sousId 0) bound to melega-dex
- CTA: `/pools`
- Terminology: staking pools kept distinct from liquidity pools and farms

## 6. Attribution model

Venue-first via `getVenuesByProjectSlug`:

| Venue type | Participation type |
|---|---|
| `spot_lp` | `LIQUIDITY_POOL` |
| `farm` | `FARM` |
| `stake_pool` | `STAKING_POOL` |

Requires project asset address intersection. Symbol/name matching rejected. Source class: `VENUE_REGISTRY`.

## 7. Participation model

Module: `apps/web/src/registry/projects/identity/participation/`  
Schema: `melega.project-participation.v1`  
Resolver revision: `PP006_PARTICIPATION_V1`

Public opportunities vs contextual user relationships kept separate.

## 8. Pool implementation

`marco-bnb-lp` → LIQUIDITY_POOL with pair contract, related PP005 marketId when resolvable, destination Liquidity Studio.

## 9. Farm implementation

`marco-bnb-farm` → FARM with pid + MasterChef contract, destination Farms Studio. No emission/APR math.

## 10. Pool/staking implementation

`marco-stake-sous-0` → STAKING_POOL with sousId, destination Pools Studio.

## 11. Wallet integration

- Public document: no wallet fields
- Contextual API + client UI reuse PP004 `buildWalletRelationshipDocument` / `useProjectWalletRelationship`
- “Your positions” under Participate maps ACTIVE/CLAIMABLE L/F/P/reward rows to studio/Command Center deep links

## 12. Public API

`GET /api/public/projects/{slug}/participation/`  
Cache: `public, s-maxage=300, stale-while-revalidate=600`

## 13. Contextual API

`GET /api/projects/{slug}/participation/?account={caip10}`  
`Cache-Control: private, no-store`  
Server observation marks `LIVE_READ_CLIENT_REQUIRED` for live amounts (client supplies PP004 readers).

## 14. UX implementation

Participate hierarchy:

1. Markets (PP005 `ProjectMarketsSection`)
2. Liquidity
3. Farms
4. Pools
5. Your positions (client, PP004-backed)

## 15. Machine contract

Agents can read pools/farms/stakingPools, destinations, capabilities, warnings, limitations, and contextual userRelationships without prose parsing.

## 16. Privacy controls

No wallet data in public API, PP001 `participationSummary`, SEO, or JSON-LD.

## 17. Security controls

Navigation-only destinations; no tx/calldata/approvals; validated CAIP-10 on contextual API; sanitized registry labels via existing venue/project data.

## 18. Accessibility

Semantic h3s, status text, 44px CTAs, keyboard disclosures inherited from Markets section patterns, loading `role="status"`.

## 19. Responsive validation

Compact rows; no yield dashboard tables; word-break on labels.

## 20. Performance analysis

| Read | Type |
|---|---|
| Venue registry | In-process static |
| PP004 client readers | Only when wallet connected (existing hooks) |
| Factory/MasterChef scan | None introduced |

## 21. Tests

`participation/__tests__/pp006.participation.test.ts` — IDs, attribution, exclusion, privacy, destinations, PP001–PP005 + frozen regressions.

## 22. Commands

```bash
yarn test …/pp001…pp006…   # 119 passed
npx tsc --noEmit           # PP006 paths: zero errors
yarn next build            # PASS
```

## 23. Build

PASS. Routes present:

- `/api/public/projects/[slug]/participation`
- `/api/projects/[slug]/participation`

Pre-existing `next/babel` lint warning retained.

## 24. Regression results

PP001–PP005 suites green; Trust after Participate; Markets unchanged; studios/swap/Command Center paths unmodified.

## 25. Files changed

**Created:** `identity/participation/*`, public + contextual participation APIs, `ProjectParticipationSection.tsx`, `ProjectParticipationPositions*.tsx`, this report.

**Modified:** `identity/index.ts`, `normalizeProject.ts`, public `[slug].ts`, `project-hq/[slug].tsx`, `ProjectIdentityShell.tsx`.

## 26. Limitations

- Venue-registry opportunities only (project `resources.farms|liquidityPools|stakingPools` empty)
- Studio deep links are bare routes (studios lack project query prefill)
- No live reserve/reward metrics in public participation document

## 27. Deferred PP007+ work

Not started (per mission).

## 28. Final certification

Every opportunity/destination is traceable to a canonical project, venue binding, chain-aware participation ID, and existing studio route.

**PP006_LIQUIDITY_FARMS_POOLS_ORCHESTRATION_CERTIFIED**
