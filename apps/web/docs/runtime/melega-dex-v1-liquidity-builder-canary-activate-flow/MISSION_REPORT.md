# MISSION REPORT — Liquidity Builder Canary Activate Flow Wiring

**Mission ID:** `MELEGA_DEX_V1_LIQUIDITY_BUILDER_CANARY_ACTIVATE_FLOW_WIRING`  
**Severity:** P0  
**Baseline:** `217096a3` · `melega-dex-v1-liquidity-builder-live-fee-canary`  
**Branch:** `melega-dex-v1-liquidity-builder-canary-activate-flow`  
**Verdict:** `MELEGA_DEX_V1_LIQUIDITY_BUILDER_CANARY_ACTIVATE_READY`

## Problem

`/liquidity` **Activate Liquidity Builder** CTA existed but was fail-closed stub — no `createProgram` / `depositBudget` / `activate` wallet txs.

## Solution

Wired browser-wallet sequence:

1. `Factory.createProgram(projectToken, quoteAsset, pair, strategy, epoch)`
2. Wait receipt → parse `ProgramCreated`
3. ERC-20 `approve(program, amount)` when needed
4. `Program.depositBudget(amount)`
5. `Program.activate()`
6. UI → `ACTIVE` (no fabricated success; wallet rejection surfaced)

Also fixed `activeProgram` ABI to **4 args** and treat `NO_ACTIVE_PROGRAM` as create-entry state when Factory is bound.

## Canary orientation (on-chain truth)

| Field | Value |
| --- | --- |
| Factory | `0xB9f3e3020141157C215902acC1fDF65e49bE4e82` |
| Pair | WBNB/USDT `0x94FADf053BaD0c9d0a3874F82b1a09001926A548` |
| **projectToken** | **USDT** (budget asset — `depositBudget` pulls projectToken) |
| **quoteAsset** | **WBNB** (only enabled Factory quote) |
| Budget | 0.01 USDT |
| Fee | 1000 bps / 10% |
| Signer | MELEGA DEPLOYER `0xB6eEb3…3EE0` |

Naive WBNB-as-project + USDT-as-quote is **rejected** (`UnsupportedQuoteAsset`).

## Founder steps

1. Open `/liquidity`
2. Connect MELEGA DEPLOYER on BSC
3. Select **USDT**, budget **0.01**, Full AI
4. Confirm pair **USDT/WBNB**
5. Click **Activate Liquidity Builder**
6. Sign create → approve → deposit → activate in wallet

## Verification

- `eth_call` createProgram → program `0xA15aDa28…802EB` (no revert)
- Vitest: **55 passed**
- `next build`: see `build.json`
- Untouched: LB contracts · Smart Swap · Treasury Runtime · KERL · fee schedule

## Live broadcast

Still **AWAITING_FOUNDER** signature for deposit/activate proofs (mission forbids auto-sign).
