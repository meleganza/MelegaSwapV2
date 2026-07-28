# SMART_SWAP_POST_MAINNET_UX_STABILITY_REPAIR_REPORT

**Mission:** `SMART_SWAP_POST_MAINNET_UX_STABILITY_REPAIR`  
**Recovery:** `SMART_SWAP_POST_MAINNET_UX_STABILITY_REPAIR_CRASH_RECOVERY`  
**Severity:** P0 — Live mainnet UX stability (no economic / router / fee changes)  
**Branch:** `smart-swap-post-mainnet-ux-stability-repair`  
**Base HEAD (pre-mission):** `74a76e4f` (MELEGA_DEX_V1_USER_FLOW_AUDIT_CERTIFIED tip)  
**Local safety snapshot (not pushed):** `safety/smart-swap-post-mainnet-ux-stability-repair-crash-recovery` @ `271aa7e3`
**Delivery commit:** `49bf5276` (`49bf527620838c0c5c98ac625027d41ae565e6f0`)

---

## 1. Root causes

| Bug | Root cause |
| --- | --- |
| Execution Details accordion | Nested local open state (`AdvancedSwapDetailsDropdown` + `DexExecutionDetailsPanel`) fighting `max-height` / `overflow: visible !important` / `contain: layout paint` on the Trade cockpit, corrupting open/close geometry |
| Smart route visibility | `TradeSmartRouteBox` showed speed/savings only; hop path was easy to miss or absent |
| Smart mode state loss | Cockpit `overflow: hidden` + `contain: layout paint` clipped / collapsed the form during quote/accordion expansion — not amount store resets |
| Wallet shows Connect while connected | Dual sources: commit button used web3-react `account` prop; header used wagmi `useAccount().address` |
| Confirm modal under chrome | Modal z-index `100` vs header `1000` / trending `999`; overlay not portaled to `document.body` |
| Trending only MARCO | Hard `priceUsd` gate dropped all assets without a resolved USD price, leaving MARCO-only when only MARCO priced |
| Slow Instant feel / no feedback | Quote/approval/wallet phases lacked a persistent status strip |

---

## 2. Fixes (presentation / state ownership only)

1. **Accordion SSOT** — `executionDetailsOpen` module + `useExecutionDetailsOpen`; grid `0fr`/`1fr` accordion; nested Dex panel no longer toggles independently.
2. **Route visibility** — Smart route box renders vertical hop path, `Direct route`, or honest `Route unavailable`.
3. **State stability** — Removed clipping `contain` / forced hidden overflow on cockpit + `.trade-terminal-swap` so amount/output/hero do not collapse on quote refresh or details open.
4. **Wallet SSOT** — `walletConnected = account \|\| wagmiAddress` in commit button, cockpit `data-wallet-connected`, and trade runtime `connectedAccount`.
5. **Modal layering** — uikit `zIndices.modal = 2100`; Confirm overlay via `createPortal(..., document.body)` with `data-melega-modal-root`.
6. **Instant \| Smart** — Preserved single terminal tabs (certified base); status strip added for phase feedback.
7. **Trending** — Rank assets with market signals even when USD price unknown; show `Price unavailable` instead of inventing movement; marquee threshold lowered to 3.
8. **Loading UX** — `TradeExecutionStatusStrip` + runtime labels: Loading quote / Waiting wallet / Preparing transaction; pending modal copy: Pending confirmation.

**Explicitly untouched:** Router, SmartSwapForm execution logic, Fee Engine, Treasury Runtime, KERL, D87 economics.

---

## 3. Runtime validation

Evidence: `apps/web/docs/runtime/smart-swap-post-mainnet-ux-stability-repair/`

| Artifact | Result |
| --- | --- |
| `details-accordion-validation.json` | PASS |
| `route-visibility-validation.json` | PASS |
| `state-stability-validation.json` | PASS |
| `wallet-state-validation.json` | PASS |
| `modal-layer-validation.json` | PASS (modal 2100 > header 1000 / trending 999) |
| `trending-validation.json` | PASS |
| `performance-validation.json` | PASS |
| `test-summary.json` | focused vitest PASS |
| `build-summary.json` | `next build` PASS |

---

## 4. Browser validation

Source markers certified:

- `data-execution-details-accordion` / `data-execution-details-open`
- `data-trade-smart-route-path` / `data-route-unavailable`
- `data-wallet-connected`
- `data-melega-modal-root`
- `data-trade-execution-status`

PNG live captures are indexed under `screenshots/validation-index.json` (source-certified in crash recovery; live visual pass remains a follow-up if needed).

---

## 5. Mainnet validation

Prior certified base already proved Instant + Smart **on-chain success**. This mission is UX/runtime synchronization only:

- No router / fee / treasury / KERL / D87 changes
- No new blockchain writes
- Wallet/confirm/quote feedback improved without changing execution callbacks

---

## 6. Remaining limitations

- Trending still depends on approved indexer/tier-metrics coverage; assets without signals stay hidden (honest empty / unavailable — not faked).
- Live PNG screenshot pack was not re-captured in crash recovery (markers + unit + build certified).
- Modal portal raise is global uikit behavior (intentional for Confirm Swap above DS001 chrome).

---

## 7. Next mission

Recommended: **SMART_SWAP_POST_MAINNET_LIVE_VISUAL_ACCEPTANCE** — capture Instant/Smart desktop+mobile PNGs on production with wallet-connected Confirm modal z-order proof, then close remaining visual gaps only.

---

## Delivery

- Push branch: `smart-swap-post-mainnet-ux-stability-repair`
- No merge / no deploy
- Local safety branch not pushed: `safety/smart-swap-post-mainnet-ux-stability-repair-crash-recovery`
