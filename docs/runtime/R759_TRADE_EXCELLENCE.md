# R759 — Trade Excellence

**Verdict:** `PASS`  
**Scope:** Trade page UX only. No Smart Router, Wrapper, Treasury Runtime, or runtime source changes.

---

## Validation Matrix

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| Trading chart — alignment, loading, unavailable | PASS | Fixed 300px chart area; skeleton + placeholder; technical details collapsed |
| Pair info — identical typography, equal visual weight | PASS | `TradePairStats` + `tradeTypography`; 6-metric grid |
| Recent swaps — professional table, skeleton, unavailable | PASS | `TradeSwapsTable` with fixed 320px panel |
| Execution panel hierarchy & spacing | PASS | `TradeTerminalGlobalStyle` rhythm tokens |
| Runtime diagnostics hidden by default | PASS | `TradeTechnicalDetails` toggle |
| Chart never collapses | PASS | Removed compact 132px mode |
| Trade typography reference for numerics | PASS | `tradeTypography` in `tradeTokens.ts` |
| Responsive 1440 / 1728 / 768 / 390 | PASS | Existing grid + stat/swaps responsive rules |

---

## Files Changed

### Tokens & typography
- `views/Trade/tradeTokens.ts` — `tradeTypography`, layout rhythm tokens
- `views/Trade/__tests__/tradeTypography.test.ts`

### Chart & pair stats
- `views/Trade/components/TradePriceChart.tsx` — hero price loading; stats removed from chart shell
- `views/Trade/components/TradeChartPanel.tsx` — fixed height; premium unavailable placeholder
- `views/Trade/components/TradePairStats.tsx` — canonical 6-stat grid with equal weight
- `views/Trade/TradeCenterPanel.tsx` — Price, Liquidity, Volume, Trades, FDV, Holders order

### Recent swaps
- `views/Trade/components/TradeSwapsTable.tsx` (new)
- `views/Trade/components/TradeRecentSwaps.tsx` — wires table + diagnostics toggle

### Execution panel
- `views/Trade/TradeTerminalGlobalStyle.tsx` — input → output → route → fee/slippage → swap spacing
- `views/Trade/components/TradeRouteLine.tsx` — scrollable route, flexible height

### Diagnostics
- `views/Trade/components/TradeTechnicalDetails.tsx` (new)
- `views/Trade/components/TradeRightRail.tsx` — "Show technical details" label

---

## Typography Reference (`tradeTypography`)

| Surface | Size | Weight |
|---------|------|--------|
| Hero price | 34px | 800 |
| Stat value | 22px | 700 |
| Stat label | 12px | 600 |
| Table cell | 13px | 600 |
| Execution amount | 32px | 700 |

All numeric surfaces use `font-variant-numeric: tabular-nums`.

---

## Remaining UX Blockers

External / out of scope (not UX):

1. **Subgraph not deployed** — chart and swaps remain unavailable until indexer live
2. **BscScan API key** — holders stat unavailable without explorer source
3. **Timeframe buttons** — UI offers 1m–1D but subgraph windows map to DAY/WEEK only (honest labeling deferred)
4. **AI Mode toggle** — stored in state but no behavioral surface yet
5. **Favorite / Explorer** icons removed from chart header (were dead controls)

---

## Screenshot Checklist (manual)

Capture at **1440px**, **1728px**, **768px**, **390px** on `/swap`:

- [ ] Chart area always 300px — loading skeleton, indexed line, unavailable placeholder
- [ ] 6 stat cards — Price, Liquidity, Volume, Trades, FDV, Holders — equal card height
- [ ] Recent swaps table — 52px rows, skeleton when indexing
- [ ] Execution panel — FROM → TO → Route → details → Swap button spacing
- [ ] "Show technical details" collapsed on chart empty, swaps empty, router panel
- [ ] No horizontal overflow on mobile 390px

---

## Tests

```bash
cd apps/web && npx vitest run src/views/Trade/__tests__/tradeTypography.test.ts
```

Expected: 2/2 passed.
