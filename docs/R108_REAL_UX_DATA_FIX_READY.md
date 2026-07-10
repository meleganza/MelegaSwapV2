# R108_REAL_UX_DATA_FIX_READY

**Mission:** R108 — Real UX + data fixing before production  
**Branch:** `design-system-foundation` (not merged to main)  
**SHA:** `3253d6f` (latest; base R108 `1710dcc`)  
**Preview URL:** https://v2.melega.finance  
**Deployed:** 2026-07-04T15:42:26Z  

---

## Fixed data issues

### Home
| Issue | Fix |
|-------|-----|
| Quick Market Strip rotated fake labels (Top Volume on farm cards, Latest Listing on LP pairs) | Removed label rotation; cards keep real `label` from runtime |
| "Melega DEX" shown as Top Pool via venue registry | Removed venue-registry pool injection from ticker/ribbon; pools use on-chain `useGetTopPoolsByApr` |
| Latest Listing showed platform project / wrong pairs | Exclude `melega-dex` from latest listing; add explicit Top Volume card from subgraph swaps when available |
| Cinematic pulse showed APR instead of names | Pulse rows now use farm/pool **names** (values), not APR meta |
| Live Activity long "waiting/indexing" copy | Compact honest empty state: "No recent activity" |

### Trade
| Issue | Fix |
|-------|-----|
| MARCO pair used Melega isologo | `TradePriceChart` uses `MARCO_LOGO_URI` token image |
| Chart huge fake skeleton panel | `TradeChartPanel` shows compact "Chart unavailable" when no TV data |
| Stats clipped "Indexing..." | Stats fallback `—`; holders shows `—` until indexed |
| Recent swaps perpetual "Indexing" | Distinguish loading (`transactions === undefined`) vs empty; copy "Loading swap activity…" / honest empty |

### Farms / Pools
| Issue | Fix |
|-------|-----|
| Finished pools labeled "Coming Soon" with live metrics | Status `ended`; hide metric grid; centered "Ended" pill |
| Finished farms labeled "Coming Soon" | Status pill/footer "Ended"; hide metrics on finished farms |
| MARCO token logo generic "M" | `PoolTokenIcon` + `FarmGridCard` use `MARCO_LOGO_URI` |

### Trending
| Issue | Fix |
|-------|-----|
| Only one card with no explanation | Notice when 1 indexed project; single-card grid capped at 560px for balance |

### Liquidity Studio
| Issue | Fix |
|-------|-----|
| Builder / preview / market intelligence top misalignment | Desktop grid `align-items: start` |
| Top Pools / Activity empty messaging | Existing honest compact empty lines retained |

### List Project / Nav
| Issue | Fix |
|-------|-----|
| Fragmented list flows | Shell "List Project" → `/import-existing-token`; `/launch` redirects to import; bottom-nav Build matches import route |

---

## Fixed layout issues

| Area | Fix |
|------|-----|
| Projects grid CTAs | Flexible button widths; mobile stacked full-width; Trade stays yellow primary |
| Projects metrics "Unavailable" wrap | `PrMetricValue` nowrap |
| Projects header CTA | "List Your Project" wired to `/import-existing-token` |
| Trending single-card layout | Balanced left-aligned column |

---

## Route smoke (11 routes, post-deploy)

| Route | Screen marker | Sentry |
|-------|---------------|--------|
| `/` | PASS | 0 |
| `/trade` | PASS | 0 |
| `/liquidity-studio` | PASS | 0 |
| `/farms` | PASS | 0 |
| `/pools` | PASS | 0 |
| `/projects` | PASS | 0 |
| `/trending` | PASS | 0 |
| `/radar` | PASS | 0 |
| `/build-studio` | PASS | 0 |
| `/import-existing-token` | PASS | 0 |
| `/command-center` | PASS | 0 |

**Build:** `yarn build` pass  
**Tests:** poolsViewActions 3/3, liquidityRuntime 4/4  

---

## Remaining visual blockers (Marco-reported, not fully closed)

| Area | Remaining issue |
|------|-----------------|
| **Subgraph data** | `INFO_CLIENT` still Pancake endpoint — Live Activity, recent swaps, pair stats may stay empty until Melega subgraph is wired |
| **Trade chart** | TradingView still targets `PANCAKESWAP:` pairs; unavailable state shows after TV no-data, not true Melega OHLC |
| **Radar** | Whale Monitor / MARCO panel / Opportunity Score vertical alignment and right-rail gaps — not fully passed |
| **Build Studio** | Second-row card height/overflow (Create Token, AI Advisor, templates) — not fully passed |
| **Command Center** | Desktop language-menu overlap with right rail; settlement card fit — not fully passed |
| **Responsive P3** | Full 13-route × 4-viewport screenshot matrix with zero overlap not re-certified |
| **Token logos** | Non-MARCO tokens still letter-fallback where registry URI not wired (Trending, Liquidity builder) |
| **Trending metrics** | holders/liquidity/volume still `Unavailable` until on-chain metrics indexer connected |

---

## Screenshot matrix

Not rerun in R108 (per mission: no cosmetic certification until UI clean). Prior R107-B audit still shows language-menu and bottom-nav false-positive overlaps on several routes.

---

## Final verdict

# **VISUAL_BLOCKED**

R108 closes the highest-severity **fake/mislabeled data** issues Marco reported on Home, Trade, Farms/Pools, Trending, and List Project nav. Studio routes render without Sentry errors.

Production candidate is **not** cleared: subgraph-backed metrics remain empty, Radar/Build/Command Center layout passes are incomplete, and full responsive overlap certification was not achieved.
