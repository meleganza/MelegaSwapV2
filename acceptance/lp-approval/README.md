# LP approval local browser acceptance

Run from repository root: `yarn vite --config acceptance/lp-approval/vite.config.ts`.
Open `http://127.0.0.1:4180/?chain=1` or `?chain=56`.

This fixture mounts the real `useLiquidityMintRuntime`, `useApproveCallback`, `useTokenAllowance`, `LiquidityRemovePanel`, and `LiquidityRemoveConfirmModal`. Only wallet/provider, position discovery, unrelated add/portfolio dependencies and transaction responses are mocked. No private keys, public RPC, signing or broadcasting. BSC positions are synthetic fixtures, not claims about a deployed LP at that address.

1. Click **Approve LP Token**. Check **Approving LP Token…** is disabled.
2. Click **Fixture: confirm approval on chain**. Multicall remains frozen at zero and the local receipt stays pending, while direct allowance becomes sufficient.
3. Within the 2.5-second polling interval, **Remove Liquidity** enables.
4. Click it: the real review modal opens. Confirm Withdrawal invokes the real remove runtime against the mocked router, ending at **Confirmed**.
5. Expand Local transaction evidence to inspect chain, approval spender, LP address, recipient and remove arguments.

Verified in Chrome at 1440×900 and 390×844 on Ethereum and BSC. The interface components are unchanged; this fixture is not included in Next.js production routes.

## Root cause and scope

On main `cf2575c290718e5bf9eacb24e70c1ee1728e11eb`, `resolveAllowanceRaw` always preferred any multicall result, including stale zero, over the direct allowance poll. Moreover, direct polling stopped when pending timed out or the receipt cleared. The UI could remain pending, or return to Approve indefinitely despite a mined approval.

Remove now opts into keyed direct-only allowance reads every 2.5 seconds while mounted in Remove mode. Polling survives receipt updates and pending timeout. Default shared-hook behavior stays unchanged for swaps/add/other consumers. No router or contract changes, no UI redesign.

The screenshot alone does not establish the user's transaction hash or receipt status. The defect is reproduced deterministically using the actual hooks and browser runtime; no live wallet transaction was performed.

## Validation

- New regression suite on original main: **8 failed / 2 passed**.
- Same suite with fix: **10 passed** (Ethereum + BSC).
- Focused suite: **54 passed** across 7 files.
- Production `next build`: completed, **114/114 static pages**. Existing ESLint configuration warning (`next/babel` missing) remains.
- Full `tsc --noEmit --incremental false`: **1,114 pre-existing diagnostics** on both main and fixed code; normalized file/message multisets are identical, no new diagnostics. The build is configured to skip type validation, so this comparison was run separately.
- Browser: actual runtime approval → review → mocked remove confirmation, desktop/mobile, chain 1 and 56.

Ethereum spender: `0xFF8EBf8edf1C533A02d066f852788773BdCD631C`; LP: `0x7f0183D7C1B0365A3580ecBdB2f0D8DB2D693c5E`; WETH: `0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2`.
BSC spender regression: `0xc25033218D181b27D4a2944Fbb04FC055da4EAB3`.

Draft only. No merge, deployment command, public approval or withdrawal performed.

## Post-#85 Ethereum transport regression

For the real Ethereum router fork proof and unavailable-app-RPC reproduction, see [eth-remove](../eth-remove/README.md). Add `&fork=1` to the Ethereum URL only with the documented localhost Anvil fork running. All writes stay local.
