# Home V2 Ecosystem Pass and Pools Audit

Mission completed on branch `design-system-foundation`. Surgical Home V2 refinements plus read-only pools visibility audit.

## Before / after summary

| Area | Before | After |
| --- | --- | --- |
| Lower-right homepage block | Generic “Intelligence” (Radar, Space Insights, Weekly Recap) | **Grow inside Melega** — Labs, DEX, Space, Radar, SmartDrop (human copy, horizontal scroll) |
| Swap panel (disconnected) | `#swap-page` clipped at 252px — empty void below fields | Full form visible: From/To, Connect Wallet, Details; flex layout in shell |
| CTA buttons | `MelegaButton as="span"` inside links looked like plain text | Styled `ActionLink` buttons: gold 170×44, outline 210×44 |
| Ticker | Raw strings (`sousId 0`, venue registry labels) | Sanitized labels: Top farm, Latest swap, New pool, Project listed |
| Market strip | Single-line value could clip/overlap APR | 2-line ellipsis on value; APR/meta pinned bottom |
| Sidebar (1440×900) | Portfolio could be clipped by MARCO card | Tighter nav: 28px items, 14px section gap; scroll at 820–920px height |
| Pools page | ~2 visible pools reported | **Diagnosed only** — ended on-chain pools filtered as finished (see pool audit) |

## Files changed

### Home V2 / presentation
- `apps/web/src/views/HomeTrade/GrowInsideMelegaPanel.tsx` — new ecosystem section
- `apps/web/src/views/HomeTrade/HomeTradeScreen.tsx` — grid layout, mobile order (CTA → Earn → Grow → Activity)
- `apps/web/src/views/HomeTrade/HomeTradeGlobalStyle.tsx` — swap panel visibility, Details on desktop
- `apps/web/src/views/HomeTrade/useHomeTradeData.ts` — ribbon label sanitization

### Design system
- `apps/web/src/design-system/melega/components/CtaCard/MelegaCtaCard.tsx` — real button-styled links
- `apps/web/src/design-system/melega/components/StatCard/MelegaStatCard.tsx` — 2-line ellipsis, APR separation
- `apps/web/src/design-system/melega/components/SwapPanelShell/MelegaSwapPanelShell.tsx` — flex swap body
- `apps/web/src/design-system/melega/components/Sidebar/MelegaSidebar.tsx` — viewport scroll tuning
- `apps/web/src/design-system/melega/components/SidebarSection/MelegaSidebarSection.tsx` — 14px section gap
- `apps/web/src/design-system/melega/components/SidebarItem/MelegaSidebarItem.tsx` — 28px item height

### Documentation
- `docs/POOLS_VISIBILITY_AUDIT.md` — full 267-pool inventory table
- `docs/HOME_V2_ECOSYSTEM_PASS_AND_POOLS_AUDIT.md` — this report
- `docs/screenshots/home-v2-ecosystem-pass/*.png` — validation screenshots

### Untouched (forbidden scope)
- Swap execution, contracts, router, wallet logic
- Farms/pools business logic (`state/pools`, `PoolControls`, `pools.tsx` config)
- Token lists, NFT, `exchange.ts`, `contracts.ts`, `wagmi.ts`

## Screenshots

| Viewport / route | File |
| --- | --- |
| Desktop 1440×900 | [desktop-1440x900.png](./screenshots/home-v2-ecosystem-pass/desktop-1440x900.png) |
| Desktop 1728×1117 | [desktop-1728x1117.png](./screenshots/home-v2-ecosystem-pass/desktop-1728x1117.png) |
| Mobile 390×844 | [mobile-390x844.png](./screenshots/home-v2-ecosystem-pass/mobile-390x844.png) |
| `/pools` | [pools-page.png](./screenshots/home-v2-ecosystem-pass/pools-page.png) |
| `/farms` (earn) | [farms-page.png](./screenshots/home-v2-ecosystem-pass/farms-page.png) |

## Pool audit summary

See [POOLS_VISIBILITY_AUDIT.md](./POOLS_VISIBILITY_AUDIT.md) for the full table.

| Metric | Value |
| --- | ---: |
| Total configured pools (all chains) | 267 |
| Config live flag (`isFinished: false`) | 189 |
| Config finished flag | 78 |
| Typical visible on `/pools` (BSC) | ~2 (pools still within on-chain `bonusEndBlock`) |

**Root cause:** Not a Melega Home V2 regression. `PoolControls` shows only open pools. Runtime marks pools finished when `currentBlock > bonusEndBlock`. Most legacy campaigns have ended.

**Pools issue fixed?** **No** — diagnosed only. No safe presentation-only fix on `/pools` without re-showing ended pools.

**Homepage-only fix applied:** Ribbon sanitization so venue registry does not surface `sousId` strings.

## Validation

```bash
yarn build                                    # pass
yarn vitest --run src/lib/homepage-live/...   # 2 tests pass
yarn vitest --run src/design-system/melega/__tests__/tokens.test.ts  # 5 tests pass
```

Production screenshots captured from `PORT=3010 yarn start` (post-build).
