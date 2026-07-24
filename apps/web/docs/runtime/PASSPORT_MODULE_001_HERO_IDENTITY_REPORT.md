# PASSPORT_MODULE_001 — Hero + Identity Card

## 1. Verdict

**PASSPORT_MODULE_001_HERO_IDENTITY_CERTIFIED**

## 2. Crash recovery method

Prior Cursor session crashed during worktree setup with **no Module 001 implementation files created**.

Recovery actions:

1. Located isolated worktree at `MelegaSwapV2/MelegaSwapV2-passport001`
2. Confirmed branch `mission-passport-module-001-hero-identity` at certified tip `97cb724d`
3. Confirmed clean working tree (no partial implementation to salvage)
4. Tagged `PASSPORT-MODULE-001-CRASH-RECOVERY-SNAPSHOT` at `97cb724d` (stash was empty — nothing to save)
5. Continued implementation from that worktree without resetting the Founder’s primary checkout

## 3. Recovered worktree path

`/Users/marcomelega/Projects/MelegaSwapV2/MelegaSwapV2-passport001`

## 4. Starting HEAD

`97cb724d` (`mission-passport-architecture-000-mockup-lock` tip)

## 5. Final commit

(filled after commit)

## 6. Certified architecture base

- Branch: `mission-passport-architecture-000-mockup-lock`
- Tip: `97cb724d`
- Ancestry verified before edits

## 7. Mockup integrity

| | |
| --- | --- |
| Path | `apps/web/docs/runtime/passport-architecture-000/founder-approved-passport-mockup.png` |
| SHA-256 | `14e0f0e570583aa05d06dc67b1e3f327bf890a17f6bd06b5787664bd699024df` |
| Bytes | 147547 |
| Dimensions | 844 × 1024 |
| Status | Unchanged / byte-identical |

## 8. Files recovered

None — crash occurred before implementation. Architecture_000 artifacts were already present on the branch tip.

## 9. Files changed

- `apps/web/src/views/Passport/PassportScreen.tsx` — mount Module 001; preserve Command Center + guest connect bridge
- `apps/web/src/views/PassportStudio/PassportHeroIdentityModule.tsx`
- `apps/web/src/views/PassportStudio/PassportHeroCopy.tsx`
- `apps/web/src/views/PassportStudio/PassportIdentityCard.tsx`
- `apps/web/src/views/PassportStudio/PassportVerificationBadge.tsx`
- `apps/web/src/views/PassportStudio/PassportIdentityMetadata.tsx`
- `apps/web/src/views/PassportStudio/PassportHeroBackground.tsx`
- `apps/web/src/views/PassportStudio/usePassportHeroIdentity.ts`
- `apps/web/src/views/PassportStudio/buildPassportHeroIdentityViewModel.ts`
- `apps/web/src/views/PassportStudio/passportHeroIdentityTypes.ts`
- `apps/web/src/views/PassportStudio/passportTokens.ts` — Module 001 geometry (right 664, card 640×304)
- `apps/web/src/views/PassportStudio/passportModuleContracts.ts`
- `apps/web/src/views/PassportStudio/index.ts`
- `apps/web/src/views/PassportStudio/__tests__/passportModule001.heroIdentity.test.ts`
- `apps/web/docs/runtime/PASSPORT_MODULE_OWNERSHIP_MAP.md` — Module 001 ownership update
- `apps/web/docs/runtime/passport-module-001-hero-identity/*` — evidence + certify script
- `apps/web/docs/runtime/PASSPORT_MODULE_001_HERO_IDENTITY_REPORT.md`

## 10. Ownership compliance

- Only Module 001 + permitted PassportScreen mount boundary
- Header / SafeTrendingRibbon / List / Liquidity / Farms / Pools / swap / wallet-provider / Treasury untouched
- Modules 002–009 not implemented or mounted
- Forbidden product labels absent from Module 001 UI

## 11. Desktop geometry (measured)

Viewport 1440×1200 — `getBoundingClientRect()`:

| Target | Measured |
| --- | --- |
| Module | 1376×360 |
| Module left | 32 |
| Trending → module gap | 24 |
| Inner | ~1318–1320 × 304 (±2) |
| Left / gap / right | 616 / 40 / 664 |
| Identity card | 640×304 |
| Primary / Secondary CTA | 186×44 / 124×44 |
| Verification badge | 112×44 |

## 12. Mobile geometry (measured)

Viewport 390×844:

| Target | Measured |
| --- | --- |
| Module width | 358 |
| Card | 356–358 × 244 (±3) |
| Module height | natural (~573; content-honest, no filler) |
| Overflow X | none |

Order: Hero copy → actions → Identity Card.

## 13. Hero implementation

- Eyebrow `MARCO PASSPORT`
- Three-line headline; gold highlight only on `Your ecosystem.`
- Supporting copy locked
- CTAs: Explore the Ecosystem → `/`; Learn More → `#passport-module-next`
- No Connect Wallet in Hero
- Static depth layers (radial, gold glow, horizon, grid/particles); no animation

## 14. Identity Card implementation

- 640×304 desktop card with wireframe globe, micro-pattern, watermark
- Brand mark + factual verification badge
- Display name / handle / metadata / wallet count / optional action
- Truncation for long names; no fake QR/NFC/seal

## 15. Data-source map

See `passport-module-001-hero-identity/data-source-map.json`.

Production sources today:

- `useAccount` → wallet presence + shortened address + wallet count 0|1
- No Passport profile API → `passportExists: false`
- Verification never defaults to verified

## 16. Guest behavior

Display name Guest · handle CTA copy · verification Unavailable · member — · account Guest · 0 wallets.

## 17. Wallet-only behavior

Shortened wallet · “No MARCO Passport yet” · Not Verified · Guest · 1 wallet · no invented Create Passport route.

## 18. Verification behavior

Unit fixtures cover unverified / pending / verified / review. Live production builder never emits verified.

## 19. Unavailable-source behavior

`sourceUnavailable` → UNAVAILABLE verification, Unavailable account type, honest handle copy; card remains visible.

## 20. Canonical terminology

MARCO Passport only. External wallet and M-Credits remain distinct in guest bridge copy.

## 21. Accessibility

Semantic `section` / `h1` / `article` / `role="status"` on verification; decorative layers `aria-hidden`; gold focus rings; reduced-motion safe.

## 22. Tests

`passportModule001.heroIdentity.test.ts` + architecture_000 + nav + header — **38 passed**.

## 23. Typecheck

Scoped via `yarn next build`.

## 24. Build

`yarn next build` — **passed**.

## 25. Evidence paths

`apps/web/docs/runtime/passport-module-001-hero-identity/`

- desktop-1440-guest.png
- desktop-1440-wallet-only.png
- desktop-1440-unverified.png
- desktop-1440-verified.png
- desktop-1440-unavailable.png
- tablet-1024.png
- mobile-390-guest.png
- mobile-390-passport.png
- desktop-overlay.png
- desktop-diff.png
- geometry-measurements.json
- identity-state-validation.json
- frozen-shell-integrity.json
- data-source-map.json

## 26. Deviations

- Mockup illustrative identity values intentionally not copied
- Mobile natural height ~573px (mission approx 640–700) — content-honest, no artificial spacer
- Inner width may measure 1318 vs 1320 (±2 tolerance)

## 27. Factual blockers

No Passport identity profile product (display name, handle, verification evidence, member-since, account type, Passport ID, multi-wallet registry, Create/Manage routes). Honest guest / wallet-only / unavailable states used instead.

## 28. Push result

(filled after push)

## 29. Working-tree status

(filled after push)

## 30. Exact next mission

**PASSPORT_MODULE_002_PORTFOLIO_OVERVIEW**
