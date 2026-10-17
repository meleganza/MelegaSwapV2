# NG002 — BNB chain evidence

Read on 2026-10-12 from the Next Gen branch, whose `apps/web` tree is merge-base `add4a54266b969b2e4f741cafcc92eed5a8a18cc`. `origin/main` `2d537c4302e63fc1a62866b928409378ce44dbe3` (#138) does not touch these files. No RPC was sent. Next Gen execution stays off.

This is not a market listing and not an activation.

## Four layers

| Layer | What it is | Result |
| --- | --- | --- |
| (a) Existing DEX source | Flags and builders in `apps/web` | BNB chain 56 is the only chain `isProductionCutoverAllowed` can accept |
| (b) Recorded executor evidence | Repo artifacts, last written 2026-09-24 | Canary txs recorded. That file also says public execution was disabled |
| (c) Fee settlement receipts | A receipt that names contract, chain, path, recipient, and amount | Public-path Melega fee collection is **not certified** |
| (d) Next Gen | `apps/next-gen` `BETA_RUNTIME` | **Not operational** on every chain |

## Chain table

Identities are `EVM_CHAIN_IDS` in `apps/web/src/lib/smartswap-universal-engine/domain.ts` and `ChainId` in `packages/swap-sdk/src/constants.ts`. Registry `status: 'LIVE'` in `apps/web/src/config/melegaChainRegistry.ts` is a product flag. It is not an executor certificate. `solanaExecutionEnabled()` in the same `domain.ts` returns `false`.

| Chain | Id | Executor row | Next Gen |
| --- | --- | --- | --- |
| BNB Smart Chain | 56 (`EVM_CHAIN_IDS.BSC`, `ChainId.BSC`) | `V2_EXECUTION_RUNTIME_CONFIG[56]` is `CONFIGURED`, `enabled: true`, address `0x7c07082839edd5797737640bba6af47992b9861e` | Not operational |
| Ethereum | 1 | Same table, `NOT_CONFIGURED`, `enabled: false`, address null | Not certified |
| Polygon | 137 | Absent from that table, so `resolveV2ExecutorConfig` returns `NOT_CONFIGURED` | Not certified |
| Base | 8453 | Absent | Not certified |
| Arbitrum One | 42161 | Absent | Not certified |
| Avalanche | 43114 (`ChainId.AVAX`) | Absent | Not certified |
| Solana mainnet | `solana:mainnet` | `solanaExecutionEnabled()` is false | Not certified |

`isProductionCutoverAllowed` (`operatingMode.ts`) returns true only when `chainId === 56` and `BSC_V2_PUBLIC_CUTOVER_ENABLED === true`. The constant is `true`. `PRODUCTION_EXECUTION_MODE` is still `LEGACY_PRODUCTION`. `UNIVERSAL_ENGINE_MODE` is `SHADOW`. A missing chain id returns false.

`buildV2UserExecutionPlan` (`v2UserExecutionPlan.ts`) can label a plan `V2_PRODUCTION_READY` only when that cutover is allowed, the request chain is 56, and the executor address equals `BSC_SMARTSWAP_EXECUTOR_V2_ADDRESS`. That function prepares unsigned transactions. It does not submit them. `useSwapCallback` (`apps/web/src/hooks/useSwapCallback.ts`) sends the legacy router call it was given. The file does not reference `settleGasProtocolFeeOnChain`.

## Fee, kept separate from LP fees

AMM LP fees are not a Melega protocol fee. No LP fee amount is stated here.

| Kind | Source | What it proves |
| --- | --- | --- |
| D87 display policy | `D87_DEX_PRICING_RATIFIED.services.swap` in `apps/web/src/lib/d87-pricing/codex/ratified.ts`: standard 30 bps, buy-MARCO 20 bps | Policy numbers. `apps/web/docs/runtime/smartswap-universal-engine-m2-revenue-policy/PROTOCOL_FEE_CURRENT_VS_V2.md` says this fee is not collected on the live path |
| Revenue policy | `SMARTSWAP_REVENUE_POLICY_V1` in `revenuePolicy.ts`: `maxProtocolFeeBps` 25, `minimumRevenue.enabled` false, `mode` `OBSERVE_ONLY` | Shadow policy. Not a receipt |
| Gas-fee settler | `settleGasProtocolFeeOnChain` in `apps/web/src/lib/smart-swap-gas-protocol-fee/settleGasProtocolFee.ts` | Defined. Not called from `useSwapCallback`. Tests in `m1Foundation.test.ts` assert the callback source does not contain that name |
| Beneficiary constant | `CANONICAL_SMARTSWAP_FEE_BENEFICIARY` in `feeEnforcement.ts` is `0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b` | A configured address. Not proof that a public swap paid it |
| Registry notes | `melegaChainRegistry.ts` notes on Base, Polygon, Ethereum, Arbitrum, and Avalanche say a gas fee “settles” to treasury | Notes. No receipt is attached |

## Recorded canary, not the public path

`deployments/smartswap-executor-v2/bsc-mainnet-canary-evidence/evidence.json` field `recordedAt` is `2026-09-24T20:30:00Z`. Its classification says `PUBLIC_V2_EXECUTION: DISABLED`, `PRODUCTION_ENABLED: false`, `CUTOVER: false`. This mission did not repeat that RPC read.

The same file records two chain-56 canary executions whose status is 1:

- `0x4f167d5bb5abdf7ac438e596a91ac086ed5fe5b5b7966694b8e48eb28d79a9fe`, block 123812480. Recorded fee 20 bps, amount `2000000000000` wei WBNB, `treasuryDelta` the same amount.
- `0xe5826b8e28c58f3f52ed2b8bd5adfa521a3139e3d4569ccdfad892de6ef576fa`, recorded fee 20 bps, amount `776946406150968` USDC, `treasuryDelta` the same amount.

Executor and recorded treasury in that file match the constants above. Those rows are canary artifacts from when the file itself says cutover was false. They are not a receipt for the current source, where `BSC_V2_PUBLIC_CUTOVER_ENABLED` and the BSC runtime `enabled` flag are both true. No receipt in this repo links a later public user swap on that path to a treasury amount.

**Melega fee collection on the current public BNB path: not certified.** Next Gen does not quote or collect a fee.

## Next Gen

`BETA_RUNTIME` in `apps/next-gen/lib/betaRuntime.ts` keeps schedulers, polling, canonical reads, RPC, wallet, quotes, transactions, and fee collection disabled. No chain is execution-ready in this app.
