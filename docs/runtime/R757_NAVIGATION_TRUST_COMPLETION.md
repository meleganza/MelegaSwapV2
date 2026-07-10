# R757 — Navigation Trust Completion

**Verdict:** `PASS`  
**Scope:** Navigation, social links, routes, and CTA trust only. No runtime data, typography, or spacing changes. Smart Router, Wrapper, KERL, and Treasury Runtime untouched.

---

## Validation Matrix

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| Canonical social links | PASS | `config/constants/social.ts` — Telegram, X, Instagram only |
| Discord removed | PASS | Removed from `homeTradeShared.tsx`; never in `MelegaSocialIcons` |
| Desktop/mobile nav parity | PASS | `shellNavigation` FIND has 5 visible items; mobile Find → `/trending` with full match paths |
| Identity separation | PASS | Collectibles (`/collectibles`), Identity Hub (page hero), Identity Console (`/identity`) |
| Dead CTAs | PASS | Build Studio + Collectibles show **Coming Soon** or scroll/navigate |
| `/info/*` broken routes | PASS | Redirect to `/radar`; rewrites removed |
| Sidebar cleanup | PASS | Disabled BUILD prep items removed from sidebar |

---

## Files Changed

### Canonical config
- `apps/web/src/config/constants/social.ts` (new)
- `apps/web/src/config/constants/__tests__/social.test.ts` (new)
- `apps/web/src/lib/navigation/comingSoon.ts` (new)

### Navigation shell
- `apps/web/src/app-shell/config/navigation.ts`
- `apps/web/src/app-shell/config/index.ts`
- `design-system/melega/components/SocialIcons/MelegaSocialIcons.tsx`
- `views/HomeTrade/homeTradeShared.tsx`
- `components/Menu/config/config.ts`
- `next.config.mjs`

### Identity / Collectibles
- `registry/collectibles/identity-hub-collections.config.ts`
- `pages/identity/index.tsx` (shell restored — removed `pure`)
- `config/localization/translations.json`
- `views/CollectiblesStudio/components/CollectiblesStudioPageHeader.tsx`
- `views/CollectiblesStudio/components/CollectiblesBottomCta.tsx`
- `views/CollectiblesStudio/components/CollectiblesGrid.tsx`
- `views/CollectiblesStudio/components/FeaturedCollectionPanel.tsx`
- `views/Collectibles/CollectibleDetail.tsx`
- `views/EconomicIdentity/EconomicIdentityConsole.tsx`
- `lib/surface-map/surface-map.ts`

### Dead CTA fixes
- `views/BuildStudio/components/CreateTokenPanel.tsx`
- `views/BuildStudio/components/SecondRowCards.tsx`

---

## Navigation Model (post-R757)

### FIND (desktop sidebar + mobile match)
| Label | Route |
|-------|-------|
| Trending | `/trending` |
| Projects | `/projects` |
| DEX Intelligence | `/radar` |
| Collectibles | `/collectibles` |
| Identity Console | `/identity` |

### Identity concepts
| Concept | Surface |
|---------|---------|
| **Identity Hub** | Page hero title on `/collectibles` (program brand) |
| **Collectibles** | Nav label + registry collections at `/collectibles` |
| **Identity Console** | Economic identity read model at `/identity` |

### Social (single source)
- X → `https://x.com/meleganews`
- Telegram → `https://t.me/melegacommunity`
- Instagram → `https://www.instagram.com/melega.finance/`

### BUILD sidebar
Only **Build Studio** visible. Create Token / Farm / Pool / Reward MARCO removed from sidebar (live inside Build Studio with Coming Soon).

---

## Tests

```
vitest run src/config/constants/__tests__/social.test.ts → 3/3 passed
```

---

## Remaining Navigation Blockers

1. **Legacy orphan nav** — `HomeSidebar.tsx`, `MobileBottomNav.tsx`, `HomeTopBar.tsx` still contain stale inline nav (not wired to shell; safe to delete in a future cleanup).
2. **Pancake `topConfig.ts` / `footerConfig.ts`** — unused; Explore submenu in `config.ts` only used by NetworkModal.
3. **`/launch` redirect** — always forwards to `/import-existing-token`; Build Studio intents that reference `/launch?intent=…` are not primary nav anymore.
4. **Collectible grid favorite/reserve toggles** — local UI state only (not navigation CTAs).
5. **Legacy `/nft/` mint** — separate on-chain surface; linked from collectibles registry, not primary nav.

---

## Screenshots

Screenshots were not captured in this agent session (no browser automation). Recommended manual verification:

1. Desktop header — social icons (3 only, correct URLs)
2. Sidebar FIND — 5 items including Collectibles + Identity Console
3. Mobile bottom nav — Find tab highlights on `/trending`, `/projects`, `/radar`, `/collectibles`, `/identity`
4. `/collectibles` — Explore Collections scrolls to grid; Create shows Coming Soon
5. `/identity` — renders inside app shell with Identity Console title
6. `/info` or `/info/tokens/0x…` — redirects to `/radar`
