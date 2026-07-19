# LB003 — Liquidity Building Economic Math

**Status:** FROZEN (V1 economic model)  
**Mission:** LB003 — analysis, mainnet read-only verification, test-only reference  
**Depends on:** LB001 audit, LB002 UI/domain contract  
**Baseline:** `main` @ `bead367689d8cb073ee29aef4887179d14a16ed6`  
**Reference tests:** `test/liquidity-building/LB003EconomicMathReference.t.sol`  
**Marking:** TEST-ONLY ECONOMIC REFERENCE — NOT A PRODUCTION LIQUIDITY BUILDING CONTRACT

This mission does **not** close LB-G02, LB-G03, LB-G04, or LB-G07.

---

## 1. Verified Melega AMM Parameters

| Property | Actual value/behavior | Source file/lines | On-chain confirmation | LB implication |
| --- | --- | --- | --- | --- |
| Swap fee | **0.25%** → amountIn × **9975/10000** | `packages/swap-sdk-core/src/constants.ts:27-28`; `packages/swap-sdk/src/entities/pair.ts:144-149` | Router `getAmountOut` @ `0xc25033218D181b27D4a2944Fbb04FC055da4EAB3` matched formula exactly (block **110904428**, RPC `bsc-dataseed.binance.org`) | Use 9975/10000 — **not** 997/1000 |
| Fee numerator | `9975` | SDK constants L27 | eth_call match | Hard-code in contracts |
| Fee denominator | `10000` | SDK constants L28 | eth_call match | Hard-code |
| Protocol fee / kLast | UniV2-style optional mint via `kLast` in LP value path | `pair.ts:206-237`; ABI `kLast` | Present on Pair ABI | LB executions must not treat protocol fee mint as buy flow |
| MINIMUM_LIQUIDITY | `1000` | SDK L17; Pair ABI | Standard | First mint burns 1000 to `address(0)` |
| getAmountOut | `floor(amountIn×9975×reserveOut / (reserveIn×10000 + amountIn×9975))` | `pair.ts:137-155` | Router pure `getAmountOut` **match=True** | Canonical exact-in quote |
| getAmountIn | `floor(reserveIn×amountOut×10000 / ((reserveOut−amountOut)×9975)) + 1` | `pair.ts:157-176` | Router pure `getAmountIn` **match=True** | Canonical exact-out input |
| LP mint (first) | `sqrt(a0×a1) − 1000` | `pair.ts:190-194` | — | First-liquidity accounting |
| LP mint (next) | `min(a0×supply/r0, a1×supply/r1)` | `pair.ts:196-198` | — | Subsequent LP |
| Router exact-in | `swapExactTokensForTokens` | `IPancakeRouter02.json:831` | Bytecode present | Candidate A |
| Router exact-out | `swapTokensForExactTokens` | `IPancakeRouter02.json:942` | Bytecode present | Candidate B — **chosen** |
| addLiquidity | Router `addLiquidity` / `addLiquidityETH` | ABI L58 / L112 | — | Optimal amounts on-router |
| Factory / Router | `0xb7E584…039C` / `0xc25033…EAB3` | LB001; `swap-sdk` constants | `allPairsLength=516` | Melega-only V1 |
| Stale Pancake router | `0x10ED43…` | `packages/smart-router/.../exchange.ts:10` | **LB-G07** | **Forbidden** as SoT |

**Swap fee certainty:** DEMONSTRATED (SDK + identical Router eth_call). Not a blocker.

---

## 2. Canonical Units and Reserve Orientation

Independent of `token0`/`token1` ordering:

- **X** = project-token reserve (base units)  
- **Y** = quote-asset reserve (base units)  
- **dx** = project tokens sold  
- **G** = gross quote acquired (or exact-out target)

Helpers (conceptual):

| Case | Mapping |
| --- | --- |
| Project = token0 | X = reserve0, Y = reserve1 |
| Project = token1 | X = reserve1, Y = reserve0 |
| Quote = WBNB | Normalize via `WETH()` / WBNB `0xbb4CdB…095c` |
| Decimals | Always pair with `decimals()`; never JS `number` |

All formulas use **integer base units** only.

---

## 3. Eligible Net Buy Flow

### Classification (canonical pair only)

| Class | Direction | Measured value (quote units) |
| --- | --- | --- |
| Eligible buy | Quote **in**, project **out** | Actual quote amount paid **into** the pair |
| Eligible sell | Project **in**, quote **out** | Actual quote amount removed **from** the pair |
| Eligible net buy | — | `E = max(eligibleBuyQuote − eligibleSellQuote, 0)` |

### Observation layers

1. **Observed Flow** — raw Swap logs in block range  
2. **Excluded Flow** — mandatory exclusions below  
3. **Eligible Flow** — observed − excluded  

### Epoch block range / finality

| Rule | V1 freeze |
| --- | --- |
| Start block | Inclusive first block of epoch window |
| End block | Inclusive last confirmed block ≤ epoch end |
| Finality | Require **≥ 15** confirmations behind head before finalizing observation (BSC; activation-configurable within 12–32) |
| Boundary | Events in end block included only if receipt block ≤ finalized head − confirmations |
| Ordering | Ascending (blockNumber, logIndex) |
| Duplicates | Deduplicate by `(txHash, logIndex)` |
| Reorg | If reorg depth > confirmations after finalize → `SAFETY_PAUSE` + re-observe |
| Pair identity | Exact canonical pair address for the program |
| Orientation | Convert amounts using X/Y mapping above |
| Add liquidity | **Never** classified as buy flow |
| Internal LB sale | **Excluded** from eligible sell |

### Mandatory exclusions

- Swaps originated by the Liquidity Building program / executor path  
- Swaps in the same execution transaction  
- Retries/replacements of the same execution  
- Identifiable internal routing of the same program  
- Reverted txs  
- Duplicate events  
- Non-canonical pair  
- Non-finalized events  

If `E = 0` → ordinary execution **must not** occur (`WAIT`/`SKIP`).

---

## 4. Swap Primitive Decision

| | Candidate A `swapExactTokensForTokens` | Candidate B `swapTokensForExactTokens` |
| --- | --- | --- |
| Gross quote precision | G varies with reserves | **Exact G** (amountOut) |
| Budget predictability | Exact dx; G uncertain | dx ≤ amountInMax |
| Accounting | Fee on actual G | Fee on exact G (preferred) |
| Executor discretion | Choosing dx | Choosing G (protocol-clamped) |
| Router support | Yes | Yes |
| ERC-20 only | Yes (no FoT helpers) | Yes |

**V1 freeze: Candidate B — `swapTokensForExactTokens`.**

Motivation: minimizes target vs acquired quote gap, makes `melegaFee = floor(G × 500 / 10000)` exact on the intended gross acquisition, and bounds spend via `amountInMax`.  
Rejected A as primary because G slippage creates fee/accounting ambiguity.

`amountInMax = getAmountIn(G, X_exec, Y_exec)` recomputed at execution against drift bounds (executor cannot raise G).

---

## 5. Swap Formulas

Exact Melega (verified):

```
amountInWithFee = dx × 9975
grossQuoteOut = floor( amountInWithFee × Y / (X × 10000 + amountInWithFee) )

requiredProjectTokenIn(G) =
  floor( X × G × 10000 / ((Y − G) × 9975) ) + 1
```

V1 execution uses exact-out: choose clamped **G**, then `dx = getAmountIn(G, X, Y)` with `amountInMax` buffer from slippage (§13).

---

## 6. Fee Formula and Rounding

**Frozen:**

```
melegaFee = floor(G_actual × 500 / 10_000)
N = G_actual − melegaFee   // netQuoteAvailable
```

- Fee on **actual** gross quote received (event/balance), never on unmet candidate target when they differ.  
- Never exceeds 5%. Dust stays with the project. Solidity-compatible.  
- Not applied to deposits, unused budget, skipped epochs, or project token.  
- Separate from AMM fee, gas, slippage, residual.  
- Settlement path: Treasury Runtime / D99 (integration still **LB-G04**).

---

## 7. Post-Swap Reserve Math

After selling `dx` and transferring out `G`:

```
X1 = X + dx
Y1 = Y − G
```

Constraints: `X1 > 0`, `Y1 > 0`, `G < Y`.  
AMM fee remains in-pool (input fully credited; only `G` leaves) → `X1×Y1 > X×Y` typically.  
Verified model matches SDK Pair post-trade construction (`pair.ts:154`).

---

## 8. Project-Token Matching

```
desiredMatchedProjectToken = floor(N × X1 / Y1)
```

Must be checked against Router `addLiquidity` optimal amounts. Accounting uses:

| Desired | Actual (authoritative) |
| --- | --- |
| `desiredMatchedProjectToken` | `actualMatchedProjectToken` |
| `netQuoteAvailable` N | `actualNetQuoteAdded` |

Never book LP for unused desired amounts, residuals, reverts, or unconfirmed mints.

---

## 9. Budget Requirement Function

Exact-out path:

```
budgetRequired(G) = getAmountIn(G,X,Y) + desiredMatchedProjectToken(G)
```

where matching uses post-swap `(X1,Y1)` and `N = G_act − fee` with `G_act = getAmountOut(getAmountIn(G),…) ≥ G`.

**Do not** use `2 × tokensSold`.

Require `budgetRequired(G) ≤ availableTokenBudget` excluding consumed, withdrawn, reserved-pending, and unconfirmed amounts.

Consumption: `tokensSold + tokensMatchedIntoLP` only. Acquired quote is **not** budget.

---

## 10. Deterministic Target Clamping

```
candidateGrossQuoteTarget = floor(E × r / RATE_SCALE)
RATE_SCALE = 10_000   // r in bps of eligible net buy
```

Final `G*` = max feasible in `[0, candidate]` satisfying all of:

eligible/strategy target ≤ candidate; `G < Y`; curve impact; available budget; epoch cap; rolling-day cap; min reserve floor; slippage feasibility; decision TTL; gas economics; protocol hard limits.

**Algorithm:** monotone binary search on integer G, ≤ 256 iterations, terminate when `lo > hi`.  
`budgetRequired(G)` is monotone non-decreasing (fuzz-proven).  
Upper bound: `min(candidate, Y−1, impactBoundG, …)`.

---

## 11. Price-Impact Definitions

| Name | Formula |
| --- | --- |
| Spot linear quote | `spotQuoteOut = floor(dx × Y / X)` |
| No-fee curve | `curveQuoteOut = floor(dx × Y / (X + dx))` |
| Actual swap | `actualQuoteOut = getAmountOut(dx,X,Y)` (9975/10000) |
| **Curve Price Impact** | `ceil((spot − curve) × 10000 / spot)` |
| **Effective Execution Deviation** | `ceil((spot − actual) × 10000 / spot)` |

**40 bps meaning:** If used as **curve** impact, it is **not** “including swap fee”. On live Melega pools, curve 40 bps ≈ **effective ~65 bps** (≈40 curve + ≈25 fee).  
Do **not** treat “40 bps” as effective deviation without stating which definition.

---

## 12. Reserve Anchor and Drift

Decision anchor must record: `pair`, `blockNumber`, `X`, `Y`, optional cumulative price if available, `timestamp`, `epochId`.

```
driftBps = ceil( |X'×Y − X×Y'| × 10000 / (X×Y) )
```

**Frozen:** `maxDecisionToExecutionDriftBps = 100` (hard).

| Drift | Outcome |
| --- | --- |
| ≤ 100 bps | Continue if other checks pass |
| > 100 bps mild market | `SKIP` |
| Extreme / inconsistent reserves / sandwich evidence | `SAFETY_PAUSE` |

Executor **must not** freely recompute a new economic decision; only revalidate bound checks.

---

## 13. Slippage and Deadlines

Distinct parameters (not one knob):

| Parameter | Initial | Role |
| --- | --- | --- |
| `swapSlippageBps` | **50** soft / **100** hard max | `amountInMax = ceil(getAmountIn(G)×(10000+slip)/10000)` |
| `addLiquiditySlippageBps` | **50** soft / **100** hard | `amountProjectMin`, `amountQuoteMin` |
| `maxDecisionToExecutionDriftBps` | **100** hard | Reserve ratio drift |
| `maxCurvePriceImpactBps` | see §24 | Curve impact |
| `decisionTtlSeconds` | **max(epochDuration, 120)** hard cap **3600** | Deadline |

Executor cannot freely loosen these.

---

## 14. Minimum Viable Execution

```
estimatedGasCostNative = estimatedGasUsed × gasPrice
```

Observed gasPrice @ block 110904428: **50_000_000 wei (0.05 gwei)** on public dataseed (volatile — re-read at activation).

| Quote | Conversion |
| --- | --- |
| WBNB | Direct compare in native |
| USDT/USDC | Only via verified on-chain path (e.g. Melega WBNB/stable pair reserves) — else mark conversion unavailable → conservative SKIP |

```
gasCostQuote ≤ maximumGasCostShareBps × netLiquidityQuoteEquivalent / 10_000
```

Studied shares: 5%, 10%, 15%.  
**Recommend initial `maximumGasCostShareBps = 1000` (10%).**  
Below floor or uneconomic → `SKIP` (not ERROR).

**Absolute quote floors:** asset-specific activation config required (base units); not inventable universally here → gap **LB-G08**.

---

## 15. Epoch Cap

```
epochBudgetConsumed = tokensSold + tokensMatched ≤ maxEpochBudget
```

Models considered: % remaining; % total deposited; min of both; hard amount + %.

**V1 freeze:**

```
maxEpochBudget = min(
  remainingBudget × 500 / 10_000,          // 5% of remaining
  totalDepositedBudget × 200 / 10_000      // 2% of total deposited
)
```

Prevents single-epoch blowdown even with large E.

---

## 16. Rolling-Day Cap

Simulation (geometric remaining × epoch cap 5%/epoch):

| Epoch | Epochs/day | Approx. day consumption @ 5%/remaining |
| --- | --- | --- |
| 5 min | 288 | ~100% |
| 15 min | 96 | ~99% |
| 30 min | 48 | ~91% |
| 1 h | 24 | ~71% |

**Verdict: rolling-day cap is REQUIRED.**

**Freeze:**

```
maxRolling24hBudgetConsumptionBps = 2000  // 20% of totalDeposited
window = rolling 24 hours from execution timestamp (not calendar day)
SoT = deterministic on-chain / program accounting of confirmed consumptions
```

Protection only — not a duration promise.

---

## 17. Tranche Policy

Same-block multi-swap **does not** reduce cumulative curve impact.

**V1 freeze:**

| Rule | Value |
| --- | --- |
| Max successful executions per epoch | **1** |
| `EXECUTE_IN_TRANCHES` | Allowed only as **cross-block** continuation toward residual of same epoch decision, **max 2** total, `minBlockSpacing ≥ 1` |
| Recommended operating mode | Prefer single `EXECUTE` |
| Cumulative | `sum(trancheGrossQuote) ≤ epochGrossQuoteTarget` and `sum(trancheBudget) ≤ epochBudgetCap` and cumulative curve impact ≤ hard bound |
| Partial | If next tranche unsafe → **skip remainder** (never force) |
| IDs | `(epochId, trancheIndex)` unique; one success per id |

---

## 18. Residual Policy

| Residual | Rule |
| --- | --- |
| Token residual | Return to `remainingTokenBudget`; not `tokensMatched` |
| Quote residual | Track as `quoteResidual`; **no second success fee** |

**V1 quote residual policy: (1) carry-forward exclusively for future add-liquidity by the program; on STOP / permanent safety / final withdrawal → settle residual quote to program owner.**

Cannot vanish, cannot be executor-withdrawn freely, cannot count as liquidity built.

---

## 19. LP Mint and Liquidity Accounting

Use Melega formulas (§1). Authoritative amounts:

`actualProjectTokenAdded`, `actualQuoteAdded`, `actualLpMinted`, recipient balance delta, `Mint` event, Router returns if reliable, receipt.

**Public Net Liquidity Built:** always dual:

- `projectTokenAdded`  
- `quoteAssetAdded`  

Optional quote-equivalent = derived from successful add-liquidity ratio only, marked derived.  
Forbidden: `2 × netQuoteAvailable` when Router did not use full N.

---

## 20. No-Pool Price and Seed Decision

Path: No Melega pool → Create Pool & Continue (implicit create via first `addLiquidity`, per LB001).

Order of price sources:

1. Verified Melega pair for same project token  
2. Other **already supported** on-chain market (not general multi-DEX aggregator)  
3. **Owner-supplied initial ratio** in no-pool subflow only  
4. Else block creation  

**Verdict: `NO_POOL_OWNER_INITIAL_RATIO_REQUIRED`**

Limited LB002 amendment (future mission): add optional **Initial Price Ratio** fields **only** inside no-pool subflow — **do not** alter the four base config fields (Token, Budget, Strategy, Epoch).

`minimumViableSeed` / `recommendedSeed`: formulas exist (Router first-mint + dust + gas), numeric floors = activation config (**LB-G08** related).

---

## 21. Execution Outcomes

| Condition | EXECUTE | WAIT | SKIP | SAFETY_PAUSE | ERROR |
| --- | --- | --- | --- | --- | --- |
| E = 0 | | ✓ | ✓ | | |
| E conceptual negative | | | ✓ | | |
| Below min execution / gas uneconomic | | | ✓ | | |
| Insufficient budget | | | ✓ | | |
| Price impact over hard | | | ✓ | | |
| Reserve drift > limit | | | ✓ | ✓ (severe) | |
| Reserves too low / G ≥ Y | | | ✓ | | |
| Decision stale / TTL | | | ✓ | | |
| Epoch already executed | | | ✓ | | |
| Tranche already done | | | ✓ | | |
| Runtime unavailable | | ✓ | | | |
| Treasury auth unavailable | | ✓ | | ✓ if mid-settlement | |
| Treasury settlement not guaranteeable post-acquire | | | | ✓ | ✓ if funds at risk |
| Token incompatible | | | | | ✓ (setup) |
| Pool inconsistency | | | | ✓ | |
| Add-liq quote mismatch | | | ✓ | ✓ | |
| LP recipient mismatch | | | | | ✓ |
| Tx revert | | | retry/SKIP | | ✓ if blocking |
| Receipt not finalized | | ✓ | | | |

Economic skip ≠ ERROR.

---

## 22. Economic Invariants

| Invariant | Statement |
| --- | --- |
| Budget conservation | `remaining+reserved+sold+matched+withdrawnUnused = totalDeposited` (± identified dust) |
| No overspend | `sold+matched ≤ executableAvailableBudget` |
| Fee correctness | `feePaid = floor(G×500/10000)` |
| Quote conservation | `G = fee + actualQuoteAdded + quoteResidual` |
| Token execution conservation | `reserved = sold + actualMatched + returnedTokenResidual` |
| LP evidence | `lpReceived > 0` for liquidity-added success |
| No double epoch | Cumulative G ≤ epoch target |
| No double tranche | One success per tranche id |
| Internal-flow exclusion | LB txs ∉ Eligible Net Buy |
| Historical immutability | Config updates don’t rewrite receipts |
| Recipient immutability | Execution recipient = authorized |
| Treasury basis immutability | Fee bps not executor-mutable |
| Impact bound | Successful swap respects hard curve impact |
| Deadline | Expired decision not executable |

---

## 23. Mainnet Pool Analysis

**Read-only snapshot**

| Field | Value |
| --- | --- |
| chainId | 56 |
| RPC | `bsc-dataseed.binance.org` (no secret) |
| Block | **110904428** |
| Timestamp (approx) | 2026-07-19T13:07Z UTC (observation window) |
| Factory | `0xb7E5848e1d0CB457f2026670fCb9BbdB7e9E039C` |
| Router | `0xc25033218D181b27D4a2944Fbb04FC055da4EAB3` |
| Swap fee source | Router `getAmountOut` ≡ 9975/10000 |
| Gas price | 50_000_000 wei |
| allPairsLength | 516 |

These pools are **examples**, not the entire DEX.

| Pair | Reserves (base) | Quote | Scenario (curve≤40bps) | Safety verdict |
| --- | --- | --- | --- | --- |
| MARCO/WBNB `0x7286…1e` | X≈5.02e24 MARCO, Y≈3.28e18 WBNB | WBNB | Max G≈1.31e16 (~39 bps of Y); eff≈65 bps; fee 5% of G; matching ≈ floor(N×X1/Y1) | **Viable** with 40 curve / 100 hard |
| MARCO/USDT `0xb185…a4` | X≈6.34e24, Y≈2.35e21 USDT (18 dec on BSC) | USDT | Max G≈9.38e18; same impact pattern | **Viable** |
| MARCO/USDC `0x6804…1c` | X≈8.41e23, Y≈3.13e20 | USDC | Max G≈1.25e18 | **Viable** (smaller) |
| AIV/WBNB `0x5108…f7` | Y≈2.99e13 WBNB (dust-scale) | WBNB | Math works; gas share often uneconomic | **SKIP-prone** — illustrates min viable + floors |

Strategy rates 25–50% of E are routinely **clamped by impact**, not by rate — supports ceiling 50% with impact supremacy.

---

## 24. Initial V1 Safety Parameters

| Parameter | Recommended initial value | Hard/soft | Evidence | Change authority | Mainnet activation requirement |
| --- | --- | --- | --- | --- | --- |
| protocolStrategyCeiling | **5000** (50% of E) | Hard | Impact dominates; higher rates clamp | Founder Ratification + Smart Contracts | Confirm vs live impact |
| maxCurvePriceImpactBps | **100** hard; **40** default operational | Hard/soft | Live pools: 40≈39 bps of Y; 100≈99 bps | Smart Contracts | OK |
| maxEffectiveExecutionDeviationBps | **150** hard | Hard | 40 curve → ~65 eff on Melega 25bps fee | Smart Contracts | OK |
| maxDecisionToExecutionDriftBps | **100** | Hard | Cross-mul drift | Smart Contracts | OK |
| swapSlippageBps | **50** default / **100** max | Soft/hard | Exact-out amountInMax | Smart Contracts | OK |
| addLiquiditySlippageBps | **50** / **100** max | Soft/hard | Router mins | Smart Contracts | OK |
| decisionTtlSeconds | `max(epochSeconds,120)` ≤ **3600** | Hard | Stale decision | Smart Contracts | OK |
| maxEpochBudgetConsumption | min(5% remaining, 2% total) | Hard | Depletion sims | Smart Contracts | OK |
| maxRolling24hBudgetConsumptionBps | **2000** of totalDeposited | Hard | 5m epochs deplete without it | Smart Contracts | OK |
| maximumGasCostShareBps | **1000** (10%) | Soft default | Gas vs net liquidity | Execution Runtime | Re-quote gas |
| minimum reserve rule | `Y > G` and post `Y1 ≥ Y×9800/10000` after planned swap | Hard | Prevent drain | Smart Contracts | OK |
| minimum execution rule | gas share + non-zero G + fee policy | Soft | §14 | Execution Runtime | Asset floors LB-G08 |
| max tranche count | **1**/epoch; cross-block ≤**2** | Hard | Impact non-reduction | Smart Contracts | OK |
| tranche spacing | ≥ **1** block | Hard | — | Smart Contracts | OK |
| confirmation/finality | **15** blocks | Soft range 12–32 | BSC reorg practice | Infrastructure | Tunable |
| fee bps | **500** | Hard | LB002 | Founder Ratification (immutable intent) | OK |
| fee rounding | **floor** | Hard | §6 + tests | Smart Contracts | OK |
| quote residual policy | carry-forward → owner on stop | Hard | §18 | Smart Contracts | OK |
| RATE_SCALE | **10000** | Hard | §10 | Smart Contracts | OK |

---

## 25. Known Mainnet Blockers

| ID | Gap | Severity | Evidence | Required fix | Owner | Verification |
| --- | --- | --- | --- | --- | --- | --- |
| LB-G02 | LP deferred from execution ingress | HIGH | `lpSubmitDeferral.ts` | Bounded LB execution path | Execution Runtime | Ingress accepts LB or dedicated path |
| LB-G03 | No broadcast-capable LB executor | HIGH | KERL non-broadcast | Bounded executor | Execution Runtime | Live dry-run then broadcast gate |
| LB-G04 | Treasury fee/quote not machine-wired | HIGH | LB001/LB002 | Treasury client for fee settle | Treasury Runtime | Settlement receipt tests |
| LB-G07 | Stale Pancake router in smart-router package | MEDIUM | `exchange.ts:10` | Align package to Melega router | MelegaSwapV2 | Import audit |
| LB-G08 | Absolute min quote floors not frozen | MEDIUM | Asset-specific; gas volatile | Activation config table per quote asset | Founder Ratification (config values) + Smart Contracts (enforcement) | Documented base-unit floors |
| LB-G09 | Gas→USDT conversion source not pinned | MEDIUM | Needs verified on-chain route | Pin Melega WBNB/stable pair oracle path | Infrastructure + Smart Contracts | eth_call path test |
| LB-G10 | Observation finality depth activation-tunable | LOW | 15 chosen initially | Confirm ops range | Infrastructure | Reorg metrics |

AMM fee **verified** — not a gap.

---

## 26. Reference Test Coverage

File: `test/liquidity-building/LB003EconomicMathReference.t.sol`

| Area | Coverage |
| --- | --- |
| getAmountOut/In | Deterministic + fuzz |
| Fee floor / ≤5% | Yes |
| Orientation independence | Yes |
| 6/9/18 decimal vectors | Yes (synthetic labeled) |
| Matching + residuals | Yes |
| Clamping + monotonic budget | Yes + fuzz |
| Impact at/above limit | Yes |
| Drift | Yes + fuzz |
| Epoch/day/tranche caps | Yes |
| LP mint first/next | Yes |
| Gas uneconomic skip | Yes |
| Deadline | Yes |

Fuzz runs: **256** per property (`forge test --fuzz-runs 256`).

---

## 27. Recommended Contract Requirements

Subsequent architecture (LB004) must enforce on-chain:

1. Exact-out swap primitive with protocol-clamped G  
2. Floor fee 500 bps on actual gross quote  
3. Budget vault conservation + reservation  
4. Post-swap matching bounds + residual accounting  
5. Hard curve impact + drift + deadline checks  
6. Epoch + rolling-24h consumption counters  
7. Single success per `(epochId,trancheId)`  
8. Immutable fee basis / recipient per execution  
9. No executor economic discretion beyond submitting a protocol-validated ticket  
10. Events sufficient to reconstruct Eligible Flow exclusions  

---

## Document control

| Item | Value |
| --- | --- |
| Artifact | `docs/LB003_LIQUIDITY_BUILDING_ECONOMIC_MATH.md` |
| Tests | `test/liquidity-building/LB003EconomicMathReference.t.sol` |
| Next | LB004 — Smart-Contract Architecture, Threat Model & Interface Freeze |
