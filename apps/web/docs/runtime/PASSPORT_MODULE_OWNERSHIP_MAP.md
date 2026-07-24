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
| **Owned components** | `PassportStudio/PassportHero.tsx`, `PassportIdentityCard.tsx` (future) |
| **Owned styles** | Hero geometry tokens (`heroW/H`, left/right columns) |
| **Permitted hooks** | Identity/display sources when certified; `useAccount` for wallet presence only |
| **Forbidden** | Fake verified badges; labeling external wallet as Passport; mockup numbers |
| **Bounding box** | Desktop 1376×360; left 616 + gap 40 + right 680 |
| **Data sources** | Real display name / handle / member-since / verification / Passport id / connected-wallet count — or honest unavailable |
| **Depends on** | ARCHITECTURE_000 |

---

## MODULE 002 — Portfolio Overview

| | |
| --- | --- |
| **Owned components** | `PassportPortfolioOverview.tsx` (future) |
| **Owned styles** | `portfolioW/H` |
| **Permitted hooks** | Portfolio aggregation that can factually value categories; M-Credits provenance from Treasury Runtime |
| **Forbidden** | Treating M-Credits as ERC-20; fabricating totals; fake charts |
| **Bounding box** | 1376×176 |
| **Data sources** | Crypto assets value, M-Credits, projects, liquidity — omit unvalued categories from total with disclosure |
| **Depends on** | MODULE 001 certified |

---

## MODULE 003 — Assets

| | |
| --- | --- |
| **Owned components** | `PassportAssets.tsx` (future) |
| **Owned styles** | `assetsW/H` |
| **Permitted hooks** | External-wallet balances; M-Credits account (distinct) |
| **Forbidden** | Mixing M-Credits into indistinguishable token list; fake sparklines |
| **Bounding box** | 1376×176 |
| **Data sources** | Wallet asset inventory (upgrade beyond trade-pair-only); M-Credits ledger |
| **Depends on** | MODULE 002 |

---

## MODULE 004 — My Projects

| | |
| --- | --- |
| **Owned components** | `PassportProjects.tsx` (future) |
| **Owned styles** | `projectsW/H` |
| **Permitted hooks** | Project control / ownership / role assignments |
| **Forbidden** | Inferring ownership from token holdings alone; recreating List create-project form |
| **Bounding box** | 1376×176 |
| **Data sources** | Controlled/administered projects; Create → `/list?intent=create-project` |
| **Depends on** | MODULE 003 |

---

## MODULE 005 — Liquidity Positions

| | |
| --- | --- |
| **Owned components** | `PassportLiquidity.tsx` (future) |
| **Owned styles** | `liquidityW`, `liquidityMinH` |
| **Permitted hooks** | Certified Liquidity position model / wallet portfolio LP cutover |
| **Forbidden** | Farms in this section; duplicating full Liquidity management |
| **Bounding box** | 1376 wide, min 232px |
| **Data sources** | Manual LP + Liquidity Building where relevant; Manage → Liquidity page |
| **Depends on** | MODULE 004 |

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
