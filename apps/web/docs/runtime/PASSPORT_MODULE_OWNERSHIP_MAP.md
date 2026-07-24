# MARCO Passport — Module Ownership Map

**Architecture:** `PASSPORT_ARCHITECTURE_000`  
**Route:** `/passport`  
**Product name:** MARCO Passport (never Melega Passport / Passport Wallet / Melega Wallet)

Visual source of truth:  
`apps/web/docs/runtime/passport-architecture-000/founder-approved-passport-mockup.png`

Live route continues to mount `views/Passport/PassportScreen.tsx` until MODULE_001 cutover.  
Architecture shell: `views/PassportStudio/PassportArchitectureShell.tsx` (not wired to route in ARCHITECTURE_000).

---

## Shared (all modules)

| Area | Ownership |
| --- | --- |
| Global Header | Frozen — `app-shell` / `MelegaGlobalHeader` |
| Trending Bar | Frozen — `SafeTrendingRibbon` via `GlobalTrendingBar` |
| Page tokens | `views/PassportStudio/passportTokens.ts` |
| Measurement contracts | `views/PassportStudio/passportModuleContracts.ts` |
| Forbidden | `exchange.ts`, `contracts.ts`, router/wallet/swap/farms/pools core, List forms, Liquidity ops duplication |

---

## MODULE 001 — Hero + Identity Card

| | |
| --- | --- |
| **Owned components** | `PassportHeroIdentityModule.tsx`, `PassportHeroCopy.tsx`, `PassportIdentityCard.tsx`, `PassportVerificationBadge.tsx`, `PassportIdentityMetadata.tsx`, `PassportHeroBackground.tsx`, `usePassportHeroIdentity.ts`, `buildPassportHeroIdentityViewModel.ts`, `passportHeroIdentityTypes.ts` |
| **Owned styles** | Module 001 geometry tokens (`heroW/H`, left 616 / gap 40 / right 664, identity card 640×304, CTA sizes) |
| **Permitted hooks** | `usePassportHeroIdentity` (normalized); `useAccount` for wallet presence / active address only |
| **Forbidden** | Fake verified badges; labeling external wallet as Passport; mockup numbers; inventing Create Passport routes; Modules 002–009 UI |
| **Bounding box** | Desktop 1376×360; pad 28; inner 1320×304; left 616 + gap 40 + right 664; card 640×304 |
| **Data sources** | Real display name / handle / member-since / verification / Passport id / connected-wallet count — or honest unavailable/guest/wallet-only |
| **Depends on** | ARCHITECTURE_000 |
| **Mount** | `PassportScreen` mounts Module 001; Command Center preserved below when connected |

---

## MODULE 002 — Portfolio Overview

| | |
| --- | --- |
| **Owned components** | `PassportPortfolioOverview.tsx`, `PassportPortfolioSummary.tsx`, `PassportPortfolioChart.tsx`, `PassportPortfolioKpiCard.tsx`, `usePassportPortfolioOverview.ts`, `buildPassportPortfolioOverviewViewModel.ts`, `passportPortfolioOverviewTypes.ts` |
| **Owned styles** | `portfolioW/H`, left 560 / chart 320 / right 480 (3×160 KPI), module chrome tokens |
| **Permitted hooks** | `usePassportPortfolioOverview`; `useAccount` for wallet presence; future certified valuation; M-Credits from Treasury Runtime |
| **Forbidden** | Treating M-Credits as ERC-20; including M-Credits or Projects in Total; fabricating totals; fake charts; modifying MODULE 001 files |
| **Bounding box** | Desktop 1376×176 |
| **Data sources** | Crypto + liquidity only in Total when valued; M-Credits (Treasury Runtime) and Projects as separate KPIs; honest — / Not Available otherwise |
| **Depends on** | MODULE 001 certified (frozen) |
| **Mount** | `PassportScreen` mounts Module 002 below Module 001 |

---

## MODULE 003 — Assets

| | |
| --- | --- |
| **Owned components** | `PassportAssets.tsx`, `PassportAssetCardShell.tsx`, `PassportAssetsCryptoCard.tsx`, `PassportAssetsMCreditsCard.tsx`, `PassportAssetsWalletsCard.tsx`, `PassportAssetsActionsCard.tsx`, `usePassportAssets.ts`, `buildPassportAssetsViewModel.ts`, `passportAssetsTypes.ts` |
| **Owned styles** | `assetsW/H`, four cards 320×144, gap 16, padX 24 |
| **Permitted hooks** | `usePassportAssets`; `useAccount` / `useNetwork` for linked wallet presence |
| **Forbidden** | Mixing M-Credits into crypto list; fake sparklines/trends; modifying MODULE 001–002 files; inventing unsupported actions |
| **Bounding box** | Desktop 1376×176 |
| **Data sources** | Crypto inventory (or unavailable); M-Credits from Treasury Runtime (or unavailable); connected wallets; supported quick actions only |
| **Depends on** | MODULE 002 certified (frozen) |
| **Mount** | `PassportScreen` mounts Module 003 below Module 002 |

---

## MODULE 004 — My Projects

| | |
| --- | --- |
| **Owned components** | `PassportProjects.tsx`, `PassportProjectCard.tsx`, `PassportCreateProjectCard.tsx`, `usePassportProjects.ts`, `buildPassportProjectsViewModel.ts`, `passportProjectsTypes.ts` |
| **Owned styles** | `projectsW/H`, cards 256×144, gap 16, padX 16 |
| **Permitted hooks** | `usePassportProjects`; `useAccount` for session only; future controlled-projects producer |
| **Forbidden** | Inferring ownership from token holdings; inventing status/role; recreating List create-project form; modifying MODULE 001–003 |
| **Bounding box** | Desktop 1376×176 |
| **Data sources** | Controlled/administered projects only; Create → `/list?intent=create-project` |
| **Depends on** | MODULE 003 certified (frozen) |
| **Mount** | `PassportScreen` mounts Module 004 below Module 003 |

---

## MODULE 005 — Liquidity Positions

| | |
| --- | --- |
| **Owned components** | `PassportLiquidity.tsx`, `PassportLiquidityRow.tsx`, `usePassportLiquidityPositions.ts`, `buildPassportLiquidityPositionsViewModel.ts`, `passportLiquidityTypes.ts` |
| **Owned styles** | `liquidityW`, `liquidityMinH`, table 1336 / cols 300·160·180·180·180·156·180, header 64, row 68 |
| **Permitted hooks** | `usePassportLiquidityPositions`; `useLiquidityPositions`; `useProgramReadModel`; `useAccount` |
| **Forbidden** | Farms; duplicating Liquidity management; modifying MODULE 001–004; inventing valuations |
| **Bounding box** | Desktop 1376×232 empty; up to 332 with 3 rows |
| **Data sources** | Manual wallet LP + Liquidity Building on-chain read; Manage → `/liquidity-studio` |
| **Depends on** | MODULE 004 certified (frozen) |
| **Mount** | `PassportScreen` mounts Module 005 below Module 004 |

---

## MODULE 006 — Recent Activity

| | |
| --- | --- |
| **Owned components** | `PassportActivity.tsx` (future) |
| **Owned styles** | Bottom grid left `680px` |
| **Permitted hooks** | Passport / connected-identity activity feeds |
| **Forbidden** | Fake activity; fabricated positive values |
| **Bounding box** | 680px wide (desktop bottom grid) |
| **Data sources** | Real events (credits, list, liquidity, identity/security) or compact empty state |
| **Depends on** | MODULE 005 |

---

## MODULE 007 — Security

| | |
| --- | --- |
| **Owned components** | `PassportSecurity.tsx` (future) |
| **Owned styles** | Bottom grid right `680px` |
| **Permitted hooks** | Verification, wallets, sessions — only if implemented |
| **Forbidden** | Inventing 2FA; claiming verified without evidence; exposing secrets |
| **Bounding box** | 680px wide |
| **Data sources** | Real security capabilities only |
| **Depends on** | MODULE 006 |

---

## MODULE 008 — Mobile Composition

| | |
| --- | --- |
| **Owned components** | Responsive rules across MODULE 001–007 |
| **Owned styles** | Mobile stack order; no desktop fixed heights unless certified |
| **Forbidden** | Horizontal tables; content under bottom nav |
| **Bounding box** | Content 358 @ 390; touch ≥ 44px |
| **Depends on** | MODULE 001–007 desktop certified |

---

## MODULE 009 — Visual Polish and Production

| | |
| --- | --- |
| **Owned** | Cross-module polish, production certification, mockup deviation &lt; 3% |
| **Forbidden** | Geometry changes to certified modules; fake data |
| **Depends on** | MODULE 008 |

---

## Regression rule

No later module may modify:

- previously certified module component files;
- previously certified geometry tokens for earlier modules;
- Global Header / Trending Bar;
- List / Liquidity / Farms / Pools / DEX core.

Certification dependency chain:  
`000 → 001 → 002 → 003 → 004 → 005 → 006 → 007 → 008 → 009`
