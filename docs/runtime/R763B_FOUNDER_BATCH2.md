# R763B — Founder Review Corrections Batch 2

**Verdict:** `PASS`  
**Final verdict:** `FOUNDER_BATCH2_COMPLETE`  
**Scope:** Founder observations from Liquidity Studio and Farms usage only. No runtime architecture, Smart Router, Treasury, or redesign.

---

## Mission Summary

### Liquidity Studio

1. **Position Preview visualization** — BNB/MARCO 50/50 bars and split badge always visible; mint-phase status shown as inline note, never replacing the chart.
2. **Bottom alignment** — Desktop grid row uses equal stretch height; right column stacks Market Intelligence + AI Advisor in a flex grow region with Top Pools pinned at the shared baseline with Builder and Position Preview.
3. **Market Intelligence** — Removed permanent `Loading…`; shows `Unavailable` + explicit reason when pool metrics are not indexed.
4. **AI Liquidity Advisor** — Removed `Indexing` copy; shows `Unavailable` + reason when pool health data is missing.
5. **Top Pools** — Replaced `Loading…` with `Unavailable` + explicit reason.

### Farms

6. **Featured Farm** — Connect Wallet uses the same gold primary styling as Stake; Analyze remains gold-outline secondary.
7. **Stake (grid cards)** — When wallet is disconnected, Connect Wallet replaces Stake and opens the wallet modal (no silent no-op).

---

## Files Changed

### Liquidity Studio
- `views/LiquidityStudio/components/PositionPreviewPanel.tsx`
- `views/LiquidityStudio/LiquidityStudioScreen.tsx`
- `views/LiquidityStudio/components/MarketIntelligencePanel.tsx`
- `views/LiquidityStudio/components/AILiquidityAdvisorPanel.tsx`
- `views/LiquidityStudio/components/TopPoolsPanel.tsx`
- `views/LiquidityStudio/liquidityRuntime/useLiquidityTerminalData.ts`

### Farms
- `views/FarmsStudio/components/FeaturedFarmPanel.tsx`
- `views/FarmsStudio/components/FarmGridCard.tsx`

### Documentation
- `docs/runtime/R763B_FOUNDER_BATCH2.md`

---

## Founder Screenshot Checklist (manual)

- [ ] `/liquidity-studio` — Position Preview always shows BNB 50% / MARCO 50% bars + split badge
- [ ] `/liquidity-studio` desktop — Builder, Position Preview, and Top Pools share the same bottom baseline
- [ ] `/liquidity-studio` — Market Intelligence never stuck on `Loading…`; shows `Unavailable` + reason when needed
- [ ] `/liquidity-studio` — AI Liquidity Advisor never shows `Indexing`
- [ ] `/liquidity-studio` — Top Pools shows `Unavailable` + reason when empty
- [ ] `/farms` Featured Farm — Connect Wallet and Analyze share primary/secondary hierarchy (gold filled vs gold outline)
- [ ] `/farms` grid card — disconnected Stake opens Connect Wallet flow

---

## Remaining Founder Observations

- Liquidity Activity table may still show skeleton loading while subgraph requests are in flight (separate surface from Batch 2 scope)
- LP Info panel transaction row may still reflect mint-phase `loadingLabel` during user-initiated actions (expected)
- Featured Farm still swaps Stake label to Connect Wallet when disconnected (intentional — same primary slot)

---

## Out of Scope (confirmed untouched)

- Smart Router, Wrapper, KERL, Treasury Runtime
- Subgraph / wagmi / contract execution paths
- Build Studio, Trade, Home surfaces
