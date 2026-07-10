# R760 — Home Excellence

**Verdict:** `PASS`  
**Scope:** Home page UX only. No Smart Router, Wrapper, KERL, Treasury Runtime, or runtime source changes.

---

## Validation Matrix

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| Trending ribbon — spacing, no dupes, real assets, logos | PASS | Deduped ticker items + `MelegaTokenAvatar` icons |
| Market overview — Trade typography, 5 metrics | PASS | `HomeMarketOverview` + `TradePairStats` |
| Live activity — fixed height, skeleton, diagnostics hidden | PASS | 320px panel + `TradeTechnicalDetails` |
| Quick actions — identical buttons | PASS | `HomeQuickActions` + `MelegaStudioGhostBtn` |
| Hero hierarchy — studio subtitle width | PASS | `HomeSwapPanelShell` subtitle max 720px |
| Grow inside Melega — live or Coming Soon CTAs | PASS | Radar/Labs in-app; Space/Smartdrop Coming Soon |
| Responsive 1440 / 1728 / 768 / 390 | PASS | Grid breakpoints on stats, actions, grow cards |
| Institutional homepage reference | PASS | `premiumStudioColors` canvas/card surfaces |

---

## Files Changed

### Tokens & layout
- `views/HomeTrade/homeTradeTokens.ts` — `homeTypography`, constitution rhythm
- `views/HomeTrade/__tests__/homeTypography.test.ts`

### New components
- `views/HomeTrade/HomeMarketOverview.tsx`
- `views/HomeTrade/HomeQuickActions.tsx`

### Home sections
- `views/HomeTrade/HomeTradeScreen.tsx` — wired market overview + quick actions
- `views/HomeTrade/TrendingRibbon.tsx` — Title Case label, token avatars, empty copy
- `views/HomeTrade/useHomeTradeData.ts` — deduped ticker, indexed assets meta, import fix
- `views/HomeTrade/LiveActivityFeed.tsx` — fixed height, skeleton, technical details toggle
- `views/HomeTrade/GrowInsideMelegaPanel.tsx` — in-app routes + Coming Soon
- `views/HomeTrade/HomeSwapPanelShell.tsx` — hero subtitle width
- `views/HomeTrade/components/HomeMachinePanel.tsx` — "Show technical details"

### Design system
- `design-system/melega/components/StatCard/MelegaStatCard.tsx` — remove fake sparklines without data

### Reused from Trade (R759)
- `views/Trade/components/TradePairStats.tsx`
- `views/Trade/components/TradeTechnicalDetails.tsx`
- `views/Trade/useTradeTerminalData.ts` (read-only consumption)

---

## Market Overview Metrics

| Card | Source |
|------|--------|
| Market Cap | MARCO public market via Trade terminal data |
| Volume | Subgraph / CoinGecko |
| Liquidity | Subgraph |
| Trades | Subgraph tx count |
| Holders | BscScan holder count |

Unavailable states use identical `TradePairStats` typography and visual weight as Trade.

---

## Remaining Home Blockers

External / deferred (not UX regressions):

1. **Subgraph not deployed** — live activity and several market metrics unavailable
2. **BscScan API key** — holders stat unavailable
3. **Space / Smartdrop** — intentionally Coming Soon until in-app surfaces ship
4. **Market pulse panel** — still uses CoinGecko global data (separate from protocol overview)
5. **Earn opportunities rows** — not yet linked to `/farms` / `/pools` (pre-existing)

---

## Screenshot Checklist (manual)

Capture at **1440px**, **1728px**, **768px**, **390px** on `/`:

- [ ] Trending ribbon — no duplicate assets, uniform avatars
- [ ] Hero row — swap + cinematic panel alignment
- [ ] Market overview — 5 cards, Trade typography
- [ ] Quick actions — 5 identical ghost buttons
- [ ] Live activity — 320px fixed height, skeleton when indexing
- [ ] Grow inside Melega — Radar → `/radar`, Labs → `/runtime/labs`, Coming Soon badges
- [ ] No horizontal overflow on 390px

---

## Tests

```bash
cd apps/web && npx vitest run src/views/HomeTrade/__tests__/homeTypography.test.ts
```

Expected: 2/2 passed.
