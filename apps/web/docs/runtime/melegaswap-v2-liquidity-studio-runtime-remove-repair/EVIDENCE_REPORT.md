# MELEGASWAP_V2_LIQUIDITY_STUDIO_RUNTIME_REMOVE_REPAIR — Evidence

**Verdict:** `MELEGASWAP_V2_LIQUIDITY_STUDIO_RUNTIME_REMOVE_REPAIR_COMPLETE`

## Scope

P0 functional repair only:

- Base / multi-chain position hydration stability
- Remove % selector + expected receive
- MelegaModal V3 remove confirmation + wallet lifecycle
- Cross-chain switch resume for Remove

No AMM / router / fee / Treasury / contract changes.

## Issue 1 — Base indexing freeze

**Cause:** Factory pair discovery always called the BSC indexer and stamped tokens as `chainId=56`, then balance-scanned those LPs on Base → long load / hang.

**Fix:**

- `useFactoryLiquidityTokenPairs(enabled, chainId)` — factory enabled only on BNB (`56` / `97`)
- 10s factory fetch abort timeout
- Positions lifecycle: `connecting → fetching → ready → empty`
- 12s overall fetch timeout → honest empty (`emptyTimedOut`)

## Issue 2 — Remove % stuck

**Cause:** `onBurnInput(pct)` called with one argument; burn reducer expects `(Field.LIQUIDITY_PERCENT, pct)`.

**Fix:** `onBurnInput(BurnField.LIQUIDITY_PERCENT, pct)` (and default `'50'` / clear `'0'`).

Panel exposes `data-remove-percent`, `LP removed`, Expected receive A/B.

## Issue 3–4 — Modal + wallet

Replaced Pancake `You will receive` modal with `LiquidityRemoveConfirmModal` (MelegaModal V3):

- Position / Network / Removal / Receive / Min / Impact / Slippage
- Footer: Cancel + Confirm Withdrawal
- Lifecycle: Preparing → Waiting wallet → Submitted → Confirmed / Failed
- Confirm calls existing `removeLiquidity` / `removeLiquidityETH` path (wallet popup)

## Issue 5 — Chain switch

Remove after switch no longer forced into Add — `pendingSwitch.intent: 'manage' | 'remove'`.

## Tests

- `liquidityStudioRuntimeRemoveRepair.test.ts` (7)
- Existing V3 / module-006 / tab stability suites

`next build` — required for ship.

## Browser

`accept-runtime-remove.mjs` — tab stability, positions phase, viewports 1440/1280/1024/390; percent clicks when remove panel mounted.

Live Base wallet approve/reject is environment-dependent; wiring + lifecycle are covered in runtime.
