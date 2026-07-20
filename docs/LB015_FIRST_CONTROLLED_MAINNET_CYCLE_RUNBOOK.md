# LB015 — First Controlled Mainnet Cycle Runbook

**Status:** PREPARATION ONLY  
**Execution authorized:** **NO** (`activationAuthorized=false`, `mainnetCycleAuthorized=false`)  
**Mission:** LB015  
**Baseline:** LB014 `2db31b82e926c4439e46e918b9f2889884d0874b`

This document prepares the exact conditions for the first controlled Liquidity Building mainnet cycle.  
**Do not execute transactions from this mission.**

Execute only after:

1. All mandatory gates in `docs/LB015_EXTERNAL_GATE_STATUS.md` are PASS  
2. `validate-lb-v1-inputs.mjs` → `DEPLOYMENT_INPUTS_VALID`  
3. LB contracts deployed + verified on chain 56  
4. Runtime health → `READY`  
5. `activation-gate-final.v1.json` → `mainnetCycleAuthorized=true`

---

## 0. Preconditions checklist

| # | Check | Required value |
| --- | --- | --- |
| 1 | Chain | BNB Chain `56` |
| 2 | Melega Factory | `0xb7E5848e1d0CB457f2026670fCb9BbdB7e9E039C` |
| 3 | Melega Router | `0xc25033218D181b27D4a2944Fbb04FC055da4EAB3` |
| 4 | Production KMS authority | Bound + non-exportable (LB-G03B) |
| 5 | Authorizer | Deployed; accepts production signatures (LB-G11) |
| 6 | Treasury receiver | Verified non-EOA binding (LB-G04B) |
| 7 | Fee Sink | Bound to receiver |
| 8 | Treasury Runtime | OPERATIONAL + ACCOUNTED path (LB-G04C/G12) |
| 9 | Relay | RELAY_READY (LB-G03C) |
| 10 | Quote policy | Ratified WBNB (or chosen quote) floors (LB-G08) |
| 11 | Finality | Evidence pack accepted (LB-G10) |
| 12 | Validator | `DEPLOYMENT_INPUTS_VALID` |
| 13 | Runtime health | `READY` |
| 14 | Gate final | `mainnetCycleAuthorized=true` |

If any row fails → **STOP**. No cycle.

---

## 1. Program selection

### Token

- Project ERC-20 dedicated to Liquidity Building  
- Verified metadata (symbol, decimals, contract)  
- Owner wallet controls deposit budget  
- Not a spoof / fee-on-transfer / rebasing token unless explicitly supported by Program rules  

### Pair

- Must exist on **canonical Melega Factory** (not Pancake / not foreign DEX)  
- Prefer an already liquid pair with observable organic flow  
- Confirm `Factory.getPair(projectToken, quoteAsset) != address(0)`  

### Quote asset

- Prefer **WBNB** for first cycle (stable paths may remain NotActive until LB-G09)  
- Quote must appear in ratified `quotePolicies[]` with floors  

### Liquidity context

- Record pre-cycle pair reserves  
- Record recent organic volume window used by observer  
- Exclude LB-own swaps from eligible flow (runtime rules)  

### Budget

- Use the **smallest economically meaningful** budget that still clears ratified quote floors after fee  
- Cap maximum first-cycle budget explicitly in the activation record  
- Prefer single tranche / single epoch first  

---

## 2. Safety parameters

| Parameter | First-cycle guidance |
| --- | --- |
| Maximum budget | Hard cap ≤ pre-agreed founder limit (record in evidence pack) |
| Epoch | Prefer `300` seconds (5 minutes) for first cycle observability |
| Strategy | Prefer **Full AI** within protocol ceiling; if Dynamic Range, set narrow min/max |
| Impact limits | Respect Program hard slippage / reserve reduction caps; do not loosen for first cycle |
| Rate | Engine-bounded; no manual rate override |
| Fee | 5% success fee on gross quote acquired — settle only via Fee Sink → Treasury receiver |
| LP recipient | Project owner (program-bound); unlocked unless lock explicitly configured |
| Relayer | Permissionless relay only — **no human execution wallet** |
| Signer | Production KMS only — **no private key fallback** |

### Stop procedure

1. Owner **Pause** (halts new executions)  
2. If unsafe: protocol **Safety Pause** path  
3. Owner **Stop** to terminal lifecycle when abandoning  
4. Withdraw unused budget only per Program rules after stop/pause allowances  
5. Capture final accounting snapshot before any further action  

Abort immediately if: signature verify fails, relay tampers economics, Treasury settlement missing, finality insufficient, or any gate flips FAIL mid-cycle.

---

## 3. Evidence required (complete before declaring success)

### Observation

- Pair address  
- Block range observed  
- Raw buy/sell flow  
- Exclusions (incl. LB-own)  
- Eligible net buy flow  

### Decision

- Strategy mode + effective rate  
- Target / impact / budget consumption plan  
- ExecutionIntent digest  
- Production KMS signature (65-byte form)  
- Authorizer authorization reference  

### Execution

- Transaction hash(es)  
- Swap result (tokens sold, quote acquired)  
- Melega success fee amount  
- Add-liquidity receipt  
- Gas / relayer identity (non-economic)  

### LP

- LP amount minted  
- LP recipient  
- Pair address  

### Treasury

- Fee Sink settlement event  
- Receiver credit  
- Runtime reconciliation → **ACCOUNTED**  
- Idempotency key uniqueness proof  

### Accounting

- Remaining budget  
- Tokens sold  
- Tokens matched into LP  
- Gross quote / fee / net quote added / residual  
- Dual liquidity fields (never a single fake USD TVL)

---

## 4. Fork validation checklist (pre-mainnet)

Use only when production dependencies are **real** (no fakes):

| Check | Required |
| --- | --- |
| Fork chain id | `56` |
| Canonical Melega Factory code | Present at bound address |
| Canonical Melega Router code | Present at bound address |
| Deployed LB contracts | Authorizer / Sink / Factory / Program on fork matching production bytecode hashes |
| Production authority | Real address (not test key) |
| Treasury receiver | Real bound address |
| Quote policy | Ratified floors loaded |
| Cycle | Optional dry rehearsal — still not a substitute for authorized mainnet evidence |

**Do not** execute a fork cycle that pretends missing production dependencies are present.

---

## 5. Execution order (future mission only)

1. Confirm gate matrix all PASS  
2. Confirm validator VALID + health READY + `mainnetCycleAuthorized`  
3. Create Program (owner)  
4. Approve + deposit small budget  
5. Activate  
6. Allow one observation window  
7. Generate decision + KMS sign + Authorizer validate  
8. Relay submit bounded cycle  
9. Capture full evidence pack (§3)  
10. Pause/Stop as planned  
11. Publish evidence artifact; update activation-gate-final `mainnetCycleExecuted=true` only with hashes  

---

## 6. Explicit non-goals

- No Civilization / KIRI activation work in MelegaSwapV2  
- No Treasury architecture implementation here  
- No BC003S / Genesis Gas work  
- No placeholder addresses  
- No manual gate override  
- No human signing / fee settlement  

When external gates close, the next mission may execute this runbook directly.
