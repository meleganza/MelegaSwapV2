# PROTOCOL_FEE_AUDIT

**Verdict: SMARTSWAP_PROTOCOL_FEE_ENFORCEMENT_GAP**

No economic policy was changed in M1. This is an audit of repository truth.

## Two formulas coexist

### 1) D87 swap protocol fee (policy / display)

Source: `lib/d87-pricing/codex/ratified.ts`

- Standard: **30 bps**
- Buy MARCO (output is MARCO): **20 bps**
- LP fee: unaffected (25 bps V2 `BASE_FEE` stays with LPs)
- FSC-01: DEX must forward protocol fee only to MELEGA TREASURY WALLET — DEX must not locally split waterfall

Computation helper: `lib/melega-smart-router/protocolFee.ts` (`gross * bps / 10_000`).

**Collected on live SmartSwap path?** No.

### 2) Founder Smart Router gas protocol fee

Source: `lib/smart-swap-gas-protocol-fee/calculateGasProtocolFee.ts`  
Schedule: `fee-schedule.json` → `services.smartRouter.fee`

```
feeWei = floor(gasEstimateUnits * gasPriceWei * 2500 / 10000)
```

25% of estimated DEX gas. Asset = chain native. Recipient lock:

`0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b`

Settlement helper `settleGasProtocolFeeOnChain` builds a **separate native transfer**.

**Called from `useSwapCallback`?** No. Test `melegaDexV1.smartSwapGasProtocolFee.test.ts` forbids that wiring (non-atomic second tx).

Architecture phase is `ADAPTER`; comments say atomic collection needs deployed `WRAPPER`.

## What the user signs today

One swap transaction to Smart Router / V2 / KERL wrapper. No Melega protocol-fee take in calldata. No extra fee transfer in the commit path.

## What the frozen UX shows

Preview module: **Protocol fee → “Not collected”**.  
Fee transparency hook: `feeCollectionProven: false`, “Separate protocol fee is not collected”.

## Atomicity

None for Melega protocol fee on the live swap path.

## Conflict

Documentation/architecture contracts describe a “canonical fee engine (D87 protocol fee policy + on-chain LP fee)” and economic attribution as **not proven** in the execution path (`SMART_SWAP_CANONICAL_OWNERSHIP.economicAttribution = NONE`). Runtime matches the “not proven” clause, not a collected D87 take.

Do not hide this. Routes must not be marked V2 `PRODUCTION`-capable until enforcement is real and atomic (or otherwise founder-approved).

## Recipient

Canonical treasury destination is consistent across gas-fee math and fee-schedule.json. Destination is known; collection is not enforced.
