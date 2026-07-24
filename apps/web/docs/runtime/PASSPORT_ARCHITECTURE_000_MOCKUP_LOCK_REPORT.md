# PASSPORT_ARCHITECTURE_000 — Mockup Lock

## 1. Verdict

**PASSPORT_ARCHITECTURE_000_MOCKUP_LOCK_CERTIFIED**

## 2. Branch

`mission-passport-architecture-000-mockup-lock`

## 3. Commit

(filled after commit)

## 4. Current Passport audit

| Item | Finding |
| --- | --- |
| Route | `/passport` → `pages/passport/index.tsx` → `PassportScreen` |
| Connected UX | Intro + `CommandCenterScreen` (portfolio orchestration reuse) |
| Disconnected UX | Connect CTA; truthful non-wallet copy; Home/List links |
| Shell | Global Header + `SafeTrendingRibbon` via AppShell (not duplicated) |
| Nav | Label **Passport**; title **MARCO Passport** |
| Gap | No PassportStudio modules yet; Command Center chrome still shows when connected |

Working `/passport` behavior is **preserved**. Architecture shell is **not** wired to the route.

## 5. Founder-approved mockup path

`apps/web/docs/runtime/passport-architecture-000/founder-approved-passport-mockup.png`

Source (Cursor asset):  
`.../assets/Generated_image_1__14_-12ce7bdf-2c15-4923-9fea-3a8fa509ab82.png`

## 6. Image SHA-256 and dimensions

| | |
| --- | --- |
| SHA-256 | `14e0f0e570583aa05d06dc67b1e3f327bf890a17f6bd06b5787664bd699024df` |
| Bytes | 147547 |
| Dimensions | 844 × 1024 |
| Format | JPEG JFIF (stored at mission `.png` path; **not** recompressed/regenerated) |
| Byte-identical to source | **yes** |

Evidence: `passport-architecture-000/mockup-integrity.json`

## 7. Canonical terminology

- Public name: **MARCO Passport**
- Nav: **Passport**
- Forbidden: Melega Passport, Passport Wallet, Melega Wallet, user wallet, exchange account
- Distinct from: external non-custodial wallet, M-Credits, DEX/SmartDrop/Space/Radar/MAIORA

## 8. Product boundaries

| Authority | Owns |
| --- | --- |
| MARCO Passport | Identity presentation, account relationships, M-Credits presentation, wallet overview, ecosystem overview, security controls |
| Treasury Runtime | M-Credits issuance, balances, provenance, reservations, receipts |
| Melega DEX | Swaps, pools, liquidity ops, farms |
| List | Token import/create, project claim/create (`/list?intent=…`) |

Passport summarizes and routes — does not duplicate List/Liquidity ops.

## 9. Desktop geometry plan (1440)

Content 1376 · inset 32 · top after trending 24 · module gap 16 · bottom pad 48 · bg `#050505`

| Module | Target |
| --- | --- |
| 001 Hero + Identity | 1376×360 (616 + 40 + 680) |
| 002 Portfolio | 1376×176 |
| 003 Assets | 1376×176 |
| 004 Projects | 1376×176 |
| 005 Liquidity | 1376 × min 232 |
| 006 Activity | 680 |
| 007 Security | 680 (bottom grid 680+16+680) |

## 10. Mobile composition plan (390)

Content 358 · pad 16 · order: Hero → Identity Card → Portfolio → Assets → Projects → Liquidity → Activity → Security · touch ≥ 44 · safe bottom pad for bottom nav.

## 11. Module ownership map

`apps/web/docs/runtime/PASSPORT_MODULE_OWNERSHIP_MAP.md`

## 12. Existing data-source inventory

| Domain | Source today | Notes |
| --- | --- | --- |
| Wallet presence | `useAccount` | Single active address |
| Portfolio / LP | Command Center orchestration + `buildCommandCenterWalletPortfolio` | Real LP/farm/pool cutover |
| Trade balances | `useTradeSwapRuntime` assets | Pair-scoped, not full inventory |
| Projects | `useProjectsIntelligenceRuntime` | Registry — not control ownership |
| Activity | `useAllTransactions` + studio activity | Partial; liquidity activity often empty |
| Collectible tiers | DNFT ownership hooks | Not Passport profile |
| M-Credits | — | **Missing** (treasury endpoint status only) |
| Identity profile | — | **Missing** display name / handle / verification product |
| Security / 2FA / sessions | — | **Missing** |

## 13. Missing factual sources

- Passport identity profile (name, handle, member-since, verification evidence)
- M-Credits balance + provenance from Treasury Runtime
- Full external-wallet asset inventory
- Controlled-projects producer (`PROJECT_CONTROL`)
- Security sessions / auth factors
- Dedicated Passport activity feed

## 14. Existing functionality to preserve

- `/passport` route and nav matching
- Disconnected connect CTA and non-wallet messaging
- Connected Command Center portfolio bridge until MODULE_001+
- `SafeTrendingRibbon` single instance
- List New Project → `/list`
- `PassportPage.chains = []`

## 15. Accessibility baseline

Future modules: semantic sections/headings; status not color-only; 44px touch; no info only via gold; honest empty/unavailable states.

## 16. Regression strategy

- Vitest: mockup SHA, tokens, terminology, route preservation, ownership map
- Per-module missions: frozen predecessors byte-identical vs certified tip
- No Header/Trending/List/Liquidity/DEX core edits in Passport modules

## 17. Tests

`passportArchitecture000.mockupLock.test.ts` + existing Passport nav / shell tests.

## 18. Typecheck

Scoped via `next build` (`ignoreBuildErrors` repo policy for unrelated Trade errors).

## 19. Build

`yarn next build` — required pass for delivery.

## 20. Exact next mission

**PASSPORT_MODULE_001_HERO_IDENTITY**  
Implement Hero + Identity Card (1376×360) against the Founder mockup, factual identity only, preserve `/passport` compatibility, freeze ARCHITECTURE_000 artifacts.

---

## Roadmap

1. MODULE 001 — Hero + Identity  
2. MODULE 002 — Portfolio  
3. MODULE 003 — Assets  
4. MODULE 004 — Projects  
5. MODULE 005 — Liquidity  
6. MODULE 006 — Activity  
7. MODULE 007 — Security  
8. MODULE 008 — Mobile  
9. MODULE 009 — Polish + production certification  
