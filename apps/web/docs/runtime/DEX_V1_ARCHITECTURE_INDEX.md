# Melega DEX V1 — Architecture Index

**Seal:** `DEX_V1_PRODUCTION_SEAL`  
**Baseline:** `258fb26e`

## Product domains

| Domain | Canonical entry | Operational owner |
| --- | --- | --- |
| Discover | `/?focus=projects`, `/@{slug}` | Home / Project Page |
| Trade | `/?focus=swap`, `/swap` | Home Instant Swap / Trade terminal |
| Build | `/list` (+ intents) | List |
| Liquidity | `/liquidity-studio` (+ `view=`) | Liquidity Studio |
| Earn | `/farms`, `/pools` | Farms / Pools |
| Passport | `/passport` | MARCO Passport |

Full map: `DEX_V1_CANONICAL_PRODUCT_MAP.md`  
IA evidence: `docs/runtime/dex-v1-global-information-architecture/`

## Key source roots

| Area | Path |
| --- | --- |
| Global header nav | `src/app-shell/config/globalHeaderNav.ts` |
| Mobile bottom nav | `src/app-shell/config/navigation.ts` |
| App shell | `src/app-shell/MelegaAppShell.tsx` |
| Home / Trade | `src/views/HomeTrade/` |
| List | `src/views/ListStudio/` |
| Liquidity | `src/views/LiquidityStudio/` |
| Passport | `src/views/Passport/`, `src/views/PassportStudio/` |
| Project Pages | `src/views/ProjectPage/`, `src/pages/project-hq/` |
| Farms / Pools | `src/views/FarmsStudio/`, `src/views/PoolsStudio/` |
| Redirects / rewrites | `next.config.mjs` |

## Certification reports (selected)

- `PASSPORT_V1_FINAL_CERTIFICATION_REPORT.md`
- `PASSPORT_MODULE_OWNERSHIP_MAP.md`
- `DEX_V1_GLOBAL_INFORMATION_ARCHITECTURE_REPORT.md`
- `LIST_MODULE_00{1–7}_*.md`
- `LIQUIDITY_MODULE_00{1–7}_*.md` / one-page / pixel reports
- This seal: `DEX_V1_CERTIFICATION_REPORT.md`

## Evidence packs

- Passport: `docs/runtime/passport-v1-final-certification/`
- Global IA: `docs/runtime/dex-v1-global-information-architecture/`
- Production seal: `docs/runtime/dex-v1-production-seal/`
