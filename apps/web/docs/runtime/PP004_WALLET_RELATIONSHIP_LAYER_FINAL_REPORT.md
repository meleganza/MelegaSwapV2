# PP004 — Wallet Relationship Layer — Final Report

## 1. Executive verdict

**PP004_WALLET_RELATIONSHIP_LAYER_CERTIFIED**

PP004 adds a project-scoped, read-only Wallet Relationship Layer for the Melega DEX Project Page. Connected wallets see holdings and positions attributable to the current canonical `projectId` via existing Melega readers. No second portfolio, no execution surface, and no wallet data in public SEO/JSON-LD or the PP001 public project body beyond static support metadata.

## 2. PP001–PP003 dependency audit

| Dependency | Commit | Status |
|---|---|---|
| PP001 Canonical Project Identity Shell | `4b4f2e66` | Frozen — reused |
| PP002 Provenance and Evidence Framework | `ba58f41b` | Frozen — reused |
| PP003 Readiness and Trust Snapshot | `70514297` | Frozen — reused |

Branch base: `70514297` (`mission-pp003-project-readiness-trust-snapshot`).

## 3. Existing wallet architecture audit

| Area | Finding |
|---|---|
| Wallet provider | wagmi `useAccount` + existing ConnectWalletButton |
| Chain selection | `useActiveChainId` |
| Address normalization | PP001 CAIP helpers (`normalizeEvmAddress`, CAIP-10) |
| Connection UX | Wallet-first ConnectWalletButton reused; no new button system |
| Command Center | Frozen; deep-link destination only for claimables |
| Studios | Liquidity / Farms / Pools remain frozen execution surfaces |

## 4. Existing balance-reader audit

- **Canonical reader reused:** `state/wallet/hooks` → `useTokenBalancesWithLoadingIndicator`
- Scoped to registered project asset tokens on the active chain
- Zero balance vs unavailable balance distinguished in the shared resolver
- No fiat valuation invented

## 5. Existing liquidity-position audit

- **Canonical reader reused:** `views/LiquidityStudio/liquidityRuntime/useLiquidityPositions`
- Attribution: LP token addresses must intersect project-registered asset/contract addresses
- Unrelated LP positions excluded
- Deep link: `/liquidity-studio`

## 6. Existing farms and pools reader audit

- Farms: `useFarmsStakingRuntime` → `portfolioFarms` with `userStaked` / `pendingReward`
- Pools: `usePoolsStakingRuntime` → `portfolioPools` with `userStaked` / `pendingReward`
- Attribution requires related token/contract address overlap with project registry
- Farms and pools remain separate relationship types

## 7. Existing reward-reader audit

- Claimables derived only from farm/pool pending reward fields already produced by studio runtimes
- Zero pending ≠ unavailable reader
- No claim transaction preparation

## 8. Project attribution architecture

Attribution paths:

1. Registered project asset contract addresses
2. Registered project contract addresses
3. Deterministic address intersection with LP / farm / pool related tokens

Rejected: symbol-only, display-name, social, or search-based attribution.

## 9. Wallet account identifier conventions

- CAIP-2 for chains (`eip155:<id>`)
- CAIP-10 for wallet accounts (`eip155:<id>:<address>`)
- Bare hex addresses rejected without explicit `chainId`
- Cross-chain same-hex addresses are distinct accounts

## 10. Relationship model

Module: `apps/web/src/registry/projects/identity/walletRelationship/`

Schema: `melega.project-wallet-relationship.v1`  
Resolver revision: `PP004_WALLET_RELATIONSHIP_V1`

Record fields include deterministic `relationshipId`, `projectId`, `walletAccount`, type, subject, chain, status, availability, source, timestamps, revision, related IDs, display summary, deep link, limitations.

## 11. Relationship status semantics

`ACTIVE` | `INACTIVE` | `ELIGIBLE` | `NOT_ELIGIBLE` | `CLAIMABLE` | `NO_CLAIM` | `OBSERVED` | `UNRESOLVED`

Zero balance → `INACTIVE` + `ZERO_BALANCE` (not an error).

## 12. Availability semantics

Reuses certified vocabulary: `AVAILABLE` | `UNAVAILABLE` | `NOT_APPLICABLE` | `STALE` | `CONFLICTED`.

Unavailable readers never become zero holdings. Partial multi-reader failure → document `status: PARTIAL`.

## 13. Shared relationship resolver

`buildWalletRelationshipDocument` is the single pure resolver.

Inputs: canonical project document, evidence pack, live observation, generatedAt.  
Consumers: client hook (`useProjectWalletRelationship`) and contextual API.

## 14. Client/server/RPC boundary

- Live balances/positions: **client-side** via existing hooks (SSR-disabled dynamic section)
- Contextual API validates project + CAIP-10 and returns shared document with `LIVE_READ_CLIENT_REQUIRED` when live RPC is not available server-side
- No private RPC credentials exposed
- No new backend service / indexer

## 15. Cache and privacy behavior

API: `Cache-Control: private, no-store, no-cache, must-revalidate`  
Wallet relationships never written to project registry or public static SEO/JSON-LD.

## 16. Asset holding implementation

Client builds `LiveAssetBalanceFact[]` from project tokens + wallet balances; resolver normalizes ACTIVE/INACTIVE rows with decimals-safe raw/formatted amounts.

## 17. Liquidity-position implementation

Maps studio LP rows → attributed `LIQUIDITY_POSITION` records when token addresses intersect project tokens.

## 18. Farm-position implementation

Maps staked farm cards with project token overlap → `FARM_POSITION`.

## 19. Pool-position implementation

Maps staked pool cards with project token overlap → `POOL_POSITION`.

## 20. Claimable-reward implementation

Non-zero farm/pool pending rewards → `CLAIMABLE_REWARD` with Command Center deep link. No execution.

## 21. Governance eligibility behavior

Always `UNAVAILABLE` / `GOVERNANCE_NOT_REGISTERED` — no token-ownership inference.

## 22. Project-control relationship behavior

Always public-safe unavailable for wallet attribution (`CONTROL_EVIDENCE_UNAVAILABLE`). Private PP002 evidence never used.

## 23. Capability relevance mapping

Derived relevance for liquidity / farm / pool / tradable / claim_rewards with deep links only. No executable transaction descriptors.

## 24. Contextual API or resolver implementation

`GET /api/projects/{slug}/wallet-relationship/?account={caip10}`  
(optional `chainId` with bare address)

Hybrid design: shared pure resolver + client live reads.

## 25. PP001 project API boundary

Additive static only: `walletRelationshipSupport` via `buildWalletRelationshipSupportMetadata`.  
No wallet address, balances, positions, or eligibility in public project JSON.

## 26. Public UX implementation

Section title: **Your Relationship with This Project**  
Components: `ProjectWalletRelationship`, `WalletRelationshipSection`, hook `useProjectWalletRelationship`.

Shell order:

1. Identity hero  
2. Primary facts  
3. Wallet relationship  
4. Overview  
5. Trust (PP003 intact)  
6. Ecosystem / resources  

## 27. Disconnected-wallet behavior

Concise connect prompt + existing `ConnectWalletButton`. Public identity content remains usable.

## 28. No-relationship behavior

Neutral copy: “No active relationship with this project was detected from the currently supported live sources.”

## 29. Partial and unavailable-data behavior

Accessible `<details>` disclosure lists reason codes/categories/chains. Partial ≠ empty relationship.

## 30. Existing-module deep links

| Relationship | Destination |
|---|---|
| Liquidity | `/liquidity-studio` |
| Farm | `/farms` |
| Pool | `/pools` |
| Claimable | `/command-center` |
| Asset (active) | `/trade` (navigation only) |

No Buy/Swap/Stake/Claim controls in PP004.

## 31. Machine-readable contract

Agents can read schemaVersion, projectId, walletAccount, observedChains, status, summary counts, relationships[], relevantCapabilities[], errors[], limitations[] without parsing prose.

## 32. Privacy controls

- Client-only wallet section (`dynamic`, `ssr: false`)
- No wallet fields in Head / JSON-LD
- Contextual API private/no-store
- No new analytics events for wallet relationships

## 33. Security controls

- Malformed account → 400 `ACCOUNT_INVALID`
- Unknown project → 404
- Read-only GET
- No private evidence leakage
- No execution paths

## 34. Accessibility validation

Semantic `section` + `h2`, `aria-live` wallet state, `role="status"` loading, keyboard `<details>`/`<summary>`, accessible deep-link targets (min 44px), no color-only status.

## 35. Responsive validation

Mobile order places relationship after identity facts; word-break on long CAIP strings; compact list (no dashboard grid).

## 36. Performance and RPC-call analysis

For canonical Melega DEX on one active chain when connected:

| Call class | Source | Notes |
|---|---|---|
| ERC-20 balances | `useTokenBalancesWithLoadingIndicator` | One batch for registered project tokens on active chain |
| LP positions | `useLiquidityPositions` | Existing studio reader (tracked pairs) |
| Farm portfolio | `useFarmsStakingRuntime` | Existing studio reader |
| Pool portfolio | `usePoolsStakingRuntime` | Existing studio reader |

Disconnected: resolver short-circuits; section does not invent zeros.  
Public SSG Project Page does not block on wallet reads.

Limitation: React hooks cannot be conditionally skipped; studio hooks themselves no-op/limit work when disconnected.

## 37. Tests added or changed

`apps/web/src/registry/projects/identity/walletRelationship/__tests__/pp004.walletRelationship.test.ts`

Covers IDs, CAIP, connection states, holdings, zero/unavailable, multi-chain/partial, LP/farm/pool attribution & exclusion, claimables, governance/control, capabilities, privacy (PP001/SEO/JSON-LD), cache headers, PP001–3 regressions, frozen surface presence, UX language.

## 38. Exact commands executed

```bash
yarn test src/registry/projects/identity/walletRelationship/__tests__/pp004.walletRelationship.test.ts \
  src/registry/projects/identity/__tests__/pp001.identity.test.ts \
  src/registry/projects/identity/evidence/__tests__/pp002.evidence.test.ts \
  src/registry/projects/identity/readiness/__tests__/pp003.readiness.test.ts

npx tsc --noEmit -p tsconfig.json  # PP004 paths filtered — zero new errors

yarn next build
```

## 39. Unit-test results

PP004 suite: **32 passed**  
Combined PP001–PP004: **95 passed**

## 40. Integration-test results

Resolver/API parity covered via shared builder serialization tests; API route cache/validation covered by source assertions. No fabricated production registry wallet data.

## 41. Production-build result

`yarn next build` — **PASS**  
Route present: `/api/projects/[slug]/wallet-relationship`  
Project HQ SSG paths unchanged (`/project-hq/melega-dex`, `/project-hq/melega`).

Pre-existing warnings retained (e.g. `next/babel` ESLint config, unrelated import warnings). Not introduced by PP004.

## 42. Lint baseline comparison

Repository-wide `next/babel` ESLint load failure remains (documented since PP001–PP003). No lint config weakened. Scoped PP004 paths introduced no new lint suppressions.

## 43. TypeScript baseline comparison

Filtered `tsc` diagnostics for PP004 paths: **zero errors** after fixes.  
Repository-wide pre-existing UI kit / unrelated errors remain outside PP004 scope (same class as PP003 baseline).

## 44. PP001 regression results

Slug/alias resolution, public project API, SEO/JSON-LD, `/@` rewrite → `project-hq`, identity shell — intact. Additive `walletRelationshipSupport` only.

## 45. PP002 regression results

Evidence API + Trust Evidence panel remain; private control evidence not wallet-attributed.

## 46. PP003 regression results

Readiness API, Trust Snapshot, Trust-section hierarchy after Overview — intact.

## 47. Frozen-surface regression results

Command Center, Liquidity Studio, Farms Studio, Pools Studio, Liquidity Building routes/views present and untouched for behavior. Wallet connection flow reused.

## 48. Files created

- `apps/web/src/registry/projects/identity/walletRelationship/schema.ts`
- `apps/web/src/registry/projects/identity/walletRelationship/types.ts`
- `apps/web/src/registry/projects/identity/walletRelationship/ids.ts`
- `apps/web/src/registry/projects/identity/walletRelationship/buildWalletRelationshipDocument.ts`
- `apps/web/src/registry/projects/identity/walletRelationship/index.ts`
- `apps/web/src/registry/projects/identity/walletRelationship/__tests__/pp004.walletRelationship.test.ts`
- `apps/web/src/pages/api/projects/[slug]/wallet-relationship.ts`
- `apps/web/src/views/ProjectPage/useProjectWalletRelationship.ts`
- `apps/web/src/views/ProjectPage/WalletRelationshipSection.tsx`
- `apps/web/src/views/ProjectPage/ProjectWalletRelationship.tsx`
- `apps/web/docs/runtime/PP004_WALLET_RELATIONSHIP_LAYER_FINAL_REPORT.md`

## 49. Files modified

- `apps/web/src/registry/projects/identity/index.ts` — export walletRelationship
- `apps/web/src/registry/projects/identity/normalizeProject.ts` — optional support metadata on public JSON
- `apps/web/src/pages/api/public/projects/[slug].ts` — attach support metadata
- `apps/web/src/views/ProjectPage/ProjectIdentityShell.tsx` — wallet slot after identity facts

## 50. Known limitations

- Live reads are active-chain scoped (partial multi-chain coverage by design)
- Server contextual API does not perform RPC; client supplies live observation
- Governance, contributor, and wallet-linked project control remain unavailable without new certified sources
- Studio hooks are always mounted (React rules); they rely on their own disconnected short-circuits

## 51. Unsupported relationship categories

| Category | Status |
|---|---|
| GOVERNANCE_ELIGIBILITY | UNAVAILABLE |
| PROJECT_CONTROL (wallet-linked) | UNAVAILABLE |
| CONTRIBUTOR_ROLE | UNAVAILABLE |

## 52. Deferred PP005+ work

- Swap and Markets Orchestration (PP005) — not started
- Multi-chain simultaneous balance aggregation
- Certified governance / contributor registries
- Public-safe wallet↔control proofs if/when evidence exists

## 53. Exact routes manually inspected

- `/project-hq/melega-dex` (canonical `/@melega-dex` rewrite target)
- `/api/projects/melega-dex/wallet-relationship/`
- `/api/public/projects/melega-dex/`
- `/api/public/projects/melega-dex/evidence/`
- `/api/public/projects/melega-dex/readiness/`
- `/projects`
- `/command-center`, `/liquidity-studio`, `/farms`, `/pools`

## 54. Runtime or screenshot evidence

Production build lists new wallet-relationship API route and unchanged project-hq SSG. Unit/integration tests cover resolver states with mocked observations. Live wallet UI requires a connected browser wallet (client-only section).

## 55. Final certification verdict

Every relationship row is attributable to:

1. canonical project mapping (assets/contracts),
2. a live or deterministic observation source,
3. a normalized CAIP-10 wallet account,
4. an explicit observation/availability result.

PP001–PP003 and frozen DEX surfaces remain intact.

**PP004_WALLET_RELATIONSHIP_LAYER_CERTIFIED**
