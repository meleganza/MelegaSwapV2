# LB Quote Policy — Founder Decision Pack

**Mission:** LB-ACT-004  
**Chain:** BNB Smart Chain (`chainId = 56`)  
**Source calculation:** `deployments/liquidity-building/chain-56/quote-policy-calculation.v1.json`  
**Status:** PROPOSED — not ratified — not loaded into Factory constructor inputs

---

## Intent

Liquidity Building requires an explicit approved quote-asset policy that is locally enforceable by contracts/relay during execution. Treasury Runtime live availability is **not** required for quote enforcement.

Initial Melega DEX priority:

1. **WBNB** — candidate for first activation  
2. **USDT** — not active until Melega liquidity supports gas conversion  
3. **USDC** — same as USDT; enable only after production support + verified Melega liquidity

Addresses below are resolved from canonical chain-56 token config and verified on-chain (bytecode present). No invented addresses.

---

## Canonical token evidence (read-only, block ~111569161)

| Symbol | Address | Decimals (on-chain) | Bytecode bytes | Status |
|--------|---------|----------------------|----------------|--------|
| WBNB | `0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c` | 18 | 3124 | PROPOSED |
| USDT | `0x55d398326f99059fF775485246999027B3197955` | 18 | 4413 | NOT_ACTIVE (LB-G09) |
| USDC | `0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d` | 18 | 1596 | NOT_ACTIVE (LB-G09) |

---

## Proposed WBNB policy controls

| Control | Proposed value | Provenance |
|---------|----------------|------------|
| chainId | `56` | Canonical |
| token address | `0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c` | `packages/tokens` + on-chain code |
| symbol | `WBNB` | Canonical |
| decimals | `18` | On-chain verified |
| enabled | `true` (after Founder ratification) | Pending |
| minimum execution amount (`minimumGrossQuoteFloor`) | `41052631578947370` wei (~0.04105263157894737 WBNB) | quote-policy-calculation.v1.json |
| maximum per-epoch amount | **MISSING — not in calculation artifact** | Requires Founder / protocol decision before bind |
| slippage cap (operating) | `50` bps | `protocolParameters.swapSlippageOperatingBps` |
| slippage hard cap | `100` bps | `protocolParameters.hardSlippageBps` |
| price-impact operating cap | `40` bps | `protocolParameters.operatingCurveImpactBps` |
| price-impact hard cap | `100` bps | `protocolParameters.hardCurveImpactBps` |
| quote freshness / finality | `15` confirmations | `LB_FINALITY_DEPTH` / `initialFinalityDepth` |
| pool eligibility | Melega Factory pair must remain canonical | Program binding checks |
| emergency disable | Factory/governor pause + `enabled=false` policy row | Existing Factory pause authority |
| policy version | `melega.liquidity-building.quote-policy.v1` (proposed) | Pending |
| approval provenance | Founder signature on this document + `ratificationStatus=RATIFIED` in inputs | Pending |
| gasConversionMode | `NativeEquivalent` | Calculation artifact |
| minimumQuoteReserve | `10263157894736842500` wei (~10.263 WBNB) | Calculation artifact |
| successFeeBps (context) | `500` (immutable economics; not a quote control) | Factory hard requirement |

### USDT / USDC (not proposed for first canary)

| Field | USDT | USDC |
|-------|------|------|
| enabled | `false` | `false` |
| ratificationStatus | CALCULATED / NOT_ACTIVE | CALCULATED / NOT_ACTIVE |
| blocker | LB-G09 insufficient Melega WBNB/stable reserves for pinned gas conversion | same |
| floors | null | null |

Do **not** invent USDT/USDC floors. Do **not** silently mark CALCULATED as RATIFIED.

---

## Limits that already exist vs missing

**Reuse (already certified in protocol parameters / calculation):**

- WBNB gross floor and reserve floor  
- slippage / impact / finality depths  
- fee = 500 bps on gross quote acquired  

**Explicitly MISSING (must not invent):**

- Maximum per-epoch quote amount (absolute) beyond existing `remainingBudgetEpochCapBps` / `totalBudgetEpochCapBps` relative caps  
- Signed immutable approval evidence / policy version hash for production bind  
- Production Factory `quotePolicies[]` row (currently empty in `LiquidityBuildingV1.inputs.json`)

Relative epoch caps already in protocol parameters (not quote-asset absolute max):

- `remainingBudgetEpochCapBps = 500`  
- `totalBudgetEpochCapBps = 200`  
- `rolling24hTotalBudgetCapBps = 2000`  
- `maxSuccessfulExecutionsPerEpoch = 1`

---

## Founder decision section

> Complete exactly one option. Do not set `ratificationStatus=RATIFIED` in deployment inputs until this section is signed.

### Option A — Ratify WBNB-only canary policy

- [ ] I approve WBNB floors: gross `41052631578947370`, reserve `10263157894736842500`
- [ ] I approve enabling WBNB only; USDT/USDC remain `enabled=false`
- [ ] I accept relative epoch caps above as the per-epoch economic bound (no separate absolute max for v1)
- [ ] OR I specify absolute max per epoch: _________________ WBNB wei

**Founder name:** _______________________  
**Date (UTC):** _______________________  
**Signature / attestation:** _______________________  

### Option B — Reject / revise

- [ ] Reject proposed floors — require recalculation at gas price: ________ gwei  
- [ ] Require absolute max per epoch before any ratification  
- [ ] Other: _______________________________________________

**Decision status:** `PENDING_FOUNDER`  
**Gate LB-G08 remains BLOCKED until Option A evidence is recorded.**
