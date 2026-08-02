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

## Canary orientation (product-aligned)

Aligned by `MELEGA_DEX_V1_LIQUIDITY_BUILDER_CANARY_CONFIGURATION_ALIGNMENT`:

| Field | Value |
| --- | --- |
| Factory | `0xB9f3e3020141157C215902acC1fDF65e49bE4e82` |
| Token to Grow | **MARCO** (`projectToken` / Token Reserve asset) |
| Quote Asset | **WBNB** (Factory-enabled quote) |
| Token Reserve | **1 MARCO** (`depositBudget` pulls projectToken) |
| Pair | MARCO/WBNB `0x7286c16c3c05d4c17B689bE7948Ec4Fa4e861d1E` |
| Fee | 1000 bps / 10% (unchanged) |
| Signer | MELEGA DEPLOYER `0xB6eEb3…3EE0` |

Legacy “WBNB Budget” orientation is **rejected**. Terminology: **Token Reserve** (not Liquidity Budget / WBNB Budget).

## Founder steps

1. Open `/liquidity`
2. Connect MELEGA DEPLOYER on BSC
3. Token to Grow **MARCO**, Quote Asset **WBNB**, Token Reserve **1**, Full AI
4. Confirm pair **MARCO/WBNB**
5. Click **Activate Liquidity Program**
6. Sign create → approve → deposit → activate in wallet

## Verification

- `eth_call` createProgram → program `0xA15aDa28…802EB` (no revert)
- Vitest: **55 passed**
- `next build`: see `build.json`
- Untouched: LB contracts · Smart Swap · Treasury Runtime · KERL · fee schedule

## Live broadcast

Still **AWAITING_FOUNDER** signature for deposit/activate proofs (mission forbids auto-sign).
