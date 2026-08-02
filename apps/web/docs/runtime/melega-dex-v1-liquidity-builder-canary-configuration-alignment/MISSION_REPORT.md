# MISSION REPORT — Liquidity Builder Canary Configuration Alignment

**Mission ID:** `MELEGA_DEX_V1_LIQUIDITY_BUILDER_CANARY_CONFIGURATION_ALIGNMENT`  
**Branch:** `melega-dex-v1-liquidity-builder-canary-configuration-alignment`  
**Verdict:** `MELEGA_DEX_V1_LIQUIDITY_BUILDER_CANARY_CONFIGURATION_ALIGNED`

## Objective

Align canary configuration and evidence with the Liquidity Builder product model.  
No contract changes. No economic / fee-schedule changes. No live transaction.

## Product model (canonical)

| UX term | On-chain role | Notes |
| --- | --- | --- |
| **Token to Grow** | `projectToken` | Asset the program grows liquidity for |
| **Quote Asset** | `quoteAsset` | Pair quote (Factory enables **WBNB**) |
| **Token Reserve** | amount to `depositBudget` | Always **projectToken** units |

### Why Token Reserve is the project token

`Program.depositBudget` pulls **projectToken**. The reserve is the inventory the builder uses to grow the project’s market. Naming it “WBNB Budget” inverted the deposit asset.

### Why Quote Asset is separate

Quote Asset selects the Melega pair’s quote side. The program acquires quote from market activity against the reserve; founders do **not** deposit WBNB as the Token Reserve under the current Factory quote policy.

## Terminology

Use: **Token Reserve**  
Do not use (primary canary docs): Liquidity Budget · WBNB Budget

## Canonical canary (preferred)

| Field | Value |
| --- | --- |
| Signer | MELEGA DEPLOYER `0xB6eEb3ab9695979F5b2Ef6Df4112e63212E33EE0` |
| Token to Grow | **MARCO** `0x963556de0eb8138E97A85F0A86eE0acD159D210b` |
| Quote Asset | **WBNB** `0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c` |
| Token Reserve | **1 MARCO** (small executable) |
| Pair | MARCO/WBNB `0x7286c16c3c05d4c17B689bE7948Ec4Fa4e861d1E` |
| Fee | **10% / 1000 bps** (unchanged) |
| Factory | `0xB9f3e3020141157C215902acC1fDF65e49bE4e82` |

## Superseded mismatch

Prior docs said **Budget: 0.01 WBNB** on WBNB/USDT. That wording is **superseded**. Alternate USDT-as-project / WBNB-quote remains mechanically valid for that pair, but the **preferred product canary** is MARCO / WBNB / Token Reserve.

## Execution status

**No transaction broadcast.** `eth_call` createProgram smoke only → predicted program `0xb603EA556fd414c411170Bc83BF5189f2360EC9D`.

## Artifacts

- `canary-config.json` — SSOT aligned config  
- `ux-evidence.json` — UX labels + founder steps  
- `tests.json` / `build.json` — gate results  

## Untouched

LB contracts · fee schedule · Treasury · Smart Swap · KERL · deployment bindings
