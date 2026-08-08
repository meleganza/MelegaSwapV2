# PROJECT_PAGE_V5_DECONSTRUCTION

Baseline tip: `a12efabe` (Founder Review V4).  
Mounted shell: `ProjectPageV5Shell` via `/@{slug}` → `/project-hq/[slug]`.

## Mount

| Role | Path |
|------|------|
| Canonical URL | `/@{slug}/` |
| Page | `apps/web/src/pages/project-hq/[slug].tsx` |
| Shell | `apps/web/src/views/ProjectPage/v5/ProjectPageV5Shell.tsx` |

## V5 section order

1. Hero identity (left) + Chart then Smart Swap (right)
2. Market strip (8 metrics)
3. Project Economy (Liquidity / Farms / Pools — mostly `—`)
4. Boost Your Project (6 large tiles)
5. Claim strip (conditional)
6. About + Community
7. Technical Transparency accordion
8. Discover other projects
9. Sticky Buy (mobile)

## Findings (do not preserve layout for its own sake)

### Duplicated information
- Description in hero and About
- Socials in hero and Community
- Contract in hero and Transparency
- Price in chart header and market strip
- Liquidity/volume in strip and Economy
- Claim CTA in hero, strip, and Boost
- Buy Token CTA competes with in-hero Smart Swap

### Technical / registry language
- Transparency accordion: Markets registered, Readiness, raw chainId, Pipeline id
- Verification enum chips from registry states
- Meta alternates to control-center/developer APIs

### Redundant CTAs
- Buy Token → `/swap` (leaves page)
- Giant Add to Wallet
- Triple Claim entry
- Economy “View *” links not project-scoped
- Six oversized Boost tiles

### Excessive vertical sections
Tall hero + empty Economy sparks + gold Boost panel + Transparency + Related = dashboard scroll, not a trading product.

### Incorrect Smart Swap placement
Chart stacked above Swap as separate slots; Buy CTA navigates away; mobile buries swap under identity chrome; embed still shows nested “Smart Swap” title chrome.

### Chart / data gaps
Placeholder “Market history not available yet” reserves giant empty space; Economy APR/TVL/rewards hardcoded `—`; MiniSparks empty; ATH/ATL always dash.

### Economy disconnected from farms/pools
Participation counts from venue slug binding; UI never joins live farm/pool APR/TVL by `chainId + token address`. Pool count can fall through global chain inventory. CTAs open generic `/farms` `/pools` `/liquidity`.

### Oversized controls
76px logo, 148px Economy cards, 96px Boost tiles, home-sized swap padding, sticky Buy bar.

### Shown elsewhere
Directory cards, Home featured rail, public project APIs, Audit readiness — Project Page should not re-expose registry diagnostics.

## Reuse inventory

| Keep / evolve | Drop from consumer mount |
|---------------|--------------------------|
| `ProjectCharts`, `ProjectTradingEmbed`, `useProjectLiveMarket` | Technical Transparency |
| `projectPagePerf`, helpers, theme primitives | Buy Token + sticky Buy |
| CommercialCheckoutModal, ClaimProjectWizardModal | Giant Add to Wallet |
| Holder count hook, venues/participation docs | Empty Economy sparks |
| Featured markets / Data Truth | Registry pipeline UI |

## Community persistence

No project reaction/like persistence exists on Project Page. V6 may ship UI architecture with honest unavailable/local-preview state and report the missing dependency.

## V6 direction

One trading + discovery product: Hero → Market Strip → Economy (address-matched) → Activity/Holders/Score → Boost console → Community → About/Links → Related. No Technical Transparency. No duplicated identity. Progressive secondary loads.
