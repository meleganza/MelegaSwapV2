# Home Trade Screen Route Fix Report

**Branch:** `home-trade-screen-redesign`  
**Date:** 2026-06-30  
**Scope:** Routing / rendering wiring only

---

## Root Cause

1. **`IndexPage.pure` stripped the app shell** — `_app.tsx` returned only `<Component />` for pure pages, skipping `ProductionErrorBoundary`, `ToastListener`, `NetworkModal`, and `TransactionsDetailModal`. Home could fail to hydrate or appear broken/empty.
2. **Indirect route wiring** — `/` rendered `<Home />` through a legacy SWR/getStaticProps wrapper with unused graph fetches, instead of directly mounting `HomeTradeScreen`.
3. **Production domain on `main`** — `views/Home/index.tsx` on `main` still exports `CivilizationEntryPoint` (old shell). Preview branch code was correct but not merged to production.
4. **404 used UIKit `NotFound`** — generic Pancake-style 404 with `/logo.png`, not Melega DEX branded shell.

---

## Fixes Applied

| File | Change |
|------|--------|
| `apps/web/src/pages/index.tsx` | Direct `HomeTradeScreen` render; `hideMenu = true`; removed fragile `getStaticProps` |
| `apps/web/src/pages/_app.tsx` | `hideMenu` / `pure` keeps modals + error boundary; hides Menu only |
| `apps/web/src/views/Home/index.tsx` | Explicit `HomeTradeScreen` export |
| `apps/web/src/views/HomeTrade/HomeTradeScreen.tsx` | `data-home-trade-screen="true"` marker |
| `apps/web/src/pages/404/index.tsx` | Melega DEX branded 404; `hideMenu = true` |
| `apps/web/public/manifest.json` | Black theme/background (removed teal) |
| `vercel.json` | Enable deploy for `home-trade-screen-redesign` branch |

---

## Confirmation

- `/` → `HomeTradeScreen` via `pages/index.tsx`
- `hideMenu` hides global Pancake/legacy Menu shell
- Providers remain in `MyApp` wrapper (unchanged)
- Swap execution logic untouched (`SmartSwapForm` embedded as before)
- Local `next start`: `/` returns **HTTP 200**
- `MelegaSwap` not present in homepage or 404 page source

---

## Forbidden Files

Untouched: `exchange.ts`, `contracts.ts`, `wagmi.ts`, token lists, router/swap/wallet/farm/pool/NFT logic.

---

## Build

`next build` — **Pass**
