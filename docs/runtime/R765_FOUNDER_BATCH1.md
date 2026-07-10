# R765 — Founder Review Corrections Batch 1

**Verdict:** `PASS`  
**Final verdict:** `FOUNDER_BATCH1_COMPLETE`  
**Authority:** `FOUNDER_ACCEPTANCE_READY`  
**Scope:** Founder observations from real platform usage only. No redesign, no runtime architecture changes, no new functionality.

---

## Mission Summary

Implemented nine founder corrections from live usage review:

1. **Canonical social links** — unified X, Telegram, Instagram URLs across remaining duplicate implementations.
2. **Build With Melega** — removed misleading “Import & Analyze Token” CTA; entire card links to Build Studio.
3. **Top Pool / Top Farm** — removed “No sustainable pool”; unavailable APR shows `Unavailable` with runtime reason.
4. **Live Activity** — removed misleading “Indexing activity” copy; empty state shows `Unavailable` + exact runtime reason.
5. **Trade numeric overflow** — amount inputs clip inside fields (desktop / tablet / mobile).
6. **Recent Swaps** — empty state always `Unavailable` + explicit reason; never empty or fake.
7. **Build sidebar** — removed build actions from global navigation; Build Studio only.
8. **Network switch** — BNB Smart Chain only visible in picker (Base / Polygon / Ethereum hidden).
9. **Validation** — founder-scope only; no unrelated refactors.

---

## Files Changed

### Social
- `apps/web/src/registry/projects/projects.data.ts`
- `apps/web/src/pages/nft/index.tsx`
- `apps/web/src/views/Home/components/CakeDataRow.tsx`
- `packages/uikit/src/components/Footer/config.tsx`

### Build With Melega
- `apps/web/src/design-system/melega/components/CtaCard/MelegaCtaCard.tsx`
- `apps/web/src/views/HomeTrade/ListProjectCta.tsx`

### Top Pool / Top Farm + Live Activity
- `apps/web/src/views/HomeTrade/formatTrendingLabels.ts`
- `apps/web/src/views/HomeTrade/useHomeTradeData.ts`
- `apps/web/src/views/HomeTrade/useDexTrendingTicker.ts`
- `apps/web/src/views/HomeTrade/TrendingRibbon.tsx`
- `apps/web/src/views/HomeTrade/LiveActivityFeed.tsx`
- `apps/web/src/views/HomeTrade/__tests__/formatTrendingLabels.test.ts` — **new**

### Trade
- `apps/web/src/views/Trade/TradeTerminalGlobalStyle.tsx`
- `apps/web/src/views/Trade/components/TradeRecentSwaps.tsx`
- `apps/web/src/views/Trade/components/TradeSwapsTable.tsx`

### Build sidebar / navigation
- `apps/web/src/views/HomeTrade/HomeSidebar.tsx`
- `apps/web/src/app-shell/config/navigation.ts`

### Network switch
- `apps/web/src/config/constants/supportChains.ts`
- `apps/web/src/components/NetworkSwitcher.tsx`
- `apps/web/src/components/Menu/UserMenu/NetworkSwitchModal.tsx`

### Documentation
- `docs/runtime/R765_FOUNDER_BATCH1.md`

---

## Founder Screenshot Checklist (manual)

Capture at **1728**, **1440**, **1024**, **768**, **430**, **390**:

- [ ] Home `/` — Build With Melega card fully clickable; no Import CTA; trending ribbon never shows “No sustainable pool” or “Indexing Melega DEX activity”
- [ ] Home `/` — Live Activity shows `Unavailable` + reason when empty
- [ ] Trade `/trade` — long numeric amounts stay inside FROM/TO fields (no overflow)
- [ ] Trade `/trade` — Recent swaps empty state shows `Unavailable` + reason
- [ ] Global header — network picker shows **BNB Smart Chain** only
- [ ] Sidebar BUILD — **Build Studio** only (no Reward MARCO / Create Token / Create Farm / Create Staking / Lock Liquidity)
- [ ] Footer / header social — X `x.com/meleganews`, Telegram `t.me/melegacommunity`, Instagram `melega.finance`

---

## Remaining Founder Observations

These were **not** in Batch 1 scope (deferred to future founder review):

- Legacy `/nft/` page still includes non-canonical links (Medium, YouTube) outside the three canonical socials
- `CakeDataRow` Services section still links `t.me/markmelly` for “Apply for listing” (not a social link — business contact)
- Build Studio internal cards (Create Token, Create Farm, etc.) remain **inside** Build Studio by design
- Multichain wagmi configuration unchanged under the hood — only the **visible** network picker is BNB-only
- Fear & Greed gauge may still show “Indexing” label when external API loads (separate surface)

---

## Test Plan

```bash
yarn test social
yarn test formatTrendingLabels
```

---

## Out of Scope (confirmed untouched)

- Smart Router, Wrapper, KERL, Treasury Runtime
- Runtime architecture / mainnet deployment
- Build Studio internal workflow cards
