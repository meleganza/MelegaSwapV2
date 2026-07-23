# Liquidity Building V1 — Quote Policy Founder Decision

**Mission:** LB-ACT-005  
**Policy version (proposed):** `melega.lb.quote-policy.v1`  
**Chain:** BNB Smart Chain mainnet (`chainId = 56`)  
**Source calculation:** `deployments/liquidity-building/chain-56/quote-policy-calculation.v1.json`  
**Observation (read-only):** block `111574308` · spot gas `0.05 gwei`  
**Status:** `AWAITING_APPROVAL` — not ratified — not loaded into Factory constructor inputs  
**Does not deploy anything.** Approval may later be versioned.

---

## Founder decision table (read first)

| Field | Value | Status |
|-------|-------|--------|
| Policy version | `melega.lb.quote-policy.v1` | PROPOSED |
| Chain | `56` (BNB Smart Chain) | VERIFIED |
| Initial enabled quote assets | **WBNB only** | PROPOSED |
| Disabled assets | **USDT**, **USDC** (and all others) | PROPOSED |
| Default epoch | `300` seconds (5 minutes) | VERIFIED (product default) |
| Maximum slippage (operating / hard) | `50` / `100` bps | VERIFIED (`protocolParameters`) |
| Maximum price impact (operating / hard) | `40` / `100` bps | VERIFIED (`protocolParameters`) |
| Maximum per-epoch usage | Relative caps below; absolute max **not canonically defined** — see proposed option | PROPOSED |
| Minimum execution amount (WBNB gross floor) | `41052631578947370` wei (~0.04105 WBNB) | PROPOSED (calculated) |
| Emergency pause authority | Program `owner` via `pause()` / `stop()`; policy row `enabled=false` requires new Factory version | VERIFIED (Program) / PROPOSED (policy disable) |
| Approval status | `AWAITING_APPROVAL` | BLOCKED until Founder signs |

### Non-negotiable semantics

- Quote policy is **locally enforceable** by Liquidity Building contracts (and must be mirrored by the relay allowlist).
- **Treasury Runtime HTTP availability is not required** for quote enforcement or fee settlement.
- No quote asset outside the approved policy may be used.
- Policy approval **does not deploy** contracts and **does not** set `founderActivationApproved`.
- Policy may later be versioned (`v1` → `v1.1` / `v2`) with a new Founder decision.

### Explicit decision

- [ ] **APPROVE AS PROPOSED**
- [ ] **APPROVE WITH THE FOLLOWING CHANGES**
- [ ] **REJECT**

**Founder changes:**  
_________________________________________________________________

**Approval name:** _______________________  
**Approval date (UTC):** _______________________  
**Approval reference:** _______________________  

---

## Priority ranking (product intent)

1. **WBNB** — preferred initial enabled asset (NativeEquivalent gas path).  
2. **USDT** — listed for future enablement; **not recommended for v1 launch** until Melega pool liquidity supports gas conversion floors (LB-G09).  
3. **USDC** — **not included** for initial launch (same thin-liquidity blocker; no clear launch benefit over WBNB).

Do not enable an asset merely because it is common.

---

## Asset dossier — WBNB (PROPOSED enabled)

| Field | Value | Status |
|-------|-------|--------|
| symbol | `WBNB` | VERIFIED |
| token name | `Wrapped BNB` | VERIFIED (on-chain `name()`) |
| chainId | `56` | VERIFIED |
| checksum contract address | `0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c` | VERIFIED |
| decimals | `18` | VERIFIED |
| deployed bytecode verification | `code_bytes = 3124` @ block ~111574308 | VERIFIED |
| Melega DEX pool availability | Native / WBNB pairs via Melega Factory `0xb7E5848e…039C` | VERIFIED (Factory code present) |
| current pool liquidity when indexed | N/A for native-equivalent gas path; per-program pair must remain canonical at execution | NOT_APPLICABLE (gas) / VERIFIED (pair checks in Program) |
| oracle or quote source | Melega pair reserves + Program local math (no external oracle dependency) | VERIFIED (architecture) |
| quote freshness limit | `15` confirmations (`LB_FINALITY_DEPTH` / `initialFinalityDepth`) | VERIFIED |
| minimum execution amount | `minimumGrossQuoteFloor = 41052631578947370` wei (~0.04105263157894737 WBNB) | PROPOSED |
| maximum per-epoch amount (absolute) | **Not in calculation artifact** — see proposal below | PROPOSED |
| maximum slippage | operating `50` bps · hard `100` bps | VERIFIED |
| maximum price impact | operating `40` bps · hard `100` bps | VERIFIED |
| minimum liquidity requirement | `minimumQuoteReserve = 10263157894736842500` wei (~10.263 WBNB) | PROPOSED |
| emergency disable behavior | Program owner `pause()` / `stop()`; Factory quote policy immutable — disable requires new Factory with `enabled=false` or omit asset | VERIFIED / PROPOSED |
| fee-transfer compatibility | ERC-20 WBNB; FeeSink `transferFrom` → FeeReceiver; fee `500` bps on gross quote | VERIFIED |
| relay compatibility | Relay must allowlist Program `executeLiquidityBuilding` only; no asset whitelist beyond policy | AWAITING INFRA |
| contract policy compatibility | Factory constructor `QuoteAssetPolicy` with `GasConversionMode.NativeEquivalent` | VERIFIED |
| risk assessment | Lowest operational complexity (no stable→BNB conversion). Floor sized for gas share ≤10% at 3 gwei conservative gas. | PROPOSED |
| approval recommendation | **ENABLE for v1** after Founder ratification | PROPOSED |

### Proposed absolute max per-epoch (WBNB) — Founder may approve or amend

| Item | Value |
|------|-------|
| Proposed absolute max gross quote / epoch | `205263157894736850` wei (~0.2053 WBNB) = **5 ×** minimumGrossQuoteFloor |
| Status | PROPOSED (not previously frozen) |
| Rationale | Gives a hard canary ceiling while `maxSuccessfulExecutionsPerEpoch = 1` already limits frequency; 5× floor keeps single-epoch size modest vs ~10.26 WBNB reserve floor |
| Risk if too low | Legitimate epochs may fail floor/economics checks and stall programs |
| Risk if too high / omitted | Oversized single ticks if relative budget caps are misconfigured at Program create |
| Effect on execution | Enforced only if bound into Factory policy / runtime; relative caps already exist on-chain |
| Founder options | (A) accept 5× floor absolute max · (B) accept **relative caps only** (no absolute) · (C) write custom wei amount |

**Already verified relative epoch caps** (`protocolParameters` — apply regardless):

| Cap | Value |
|-----|-------|
| `remainingBudgetEpochCapBps` | `500` (5% of remaining budget) |
| `totalBudgetEpochCapBps` | `200` (2% of total budget) |
| `rolling24hTotalBudgetCapBps` | `2000` |
| `maxSuccessfulExecutionsPerEpoch` | `1` |
| `maximumGasCostShareBps` | `1000` |

---

## Asset dossier — USDT (PROPOSED disabled for v1)

| Field | Value | Status |
|-------|-------|--------|
| symbol | `USDT` | VERIFIED |
| token name | `Tether USD` | VERIFIED |
| chainId | `56` | VERIFIED |
| checksum contract address | `0x55d398326f99059fF775485246999027B3197955` | VERIFIED |
| decimals | `18` | VERIFIED |
| deployed bytecode verification | `code_bytes = 4413` | VERIFIED |
| Melega DEX pool availability | Pair `0x94fadf053bad0c9d0a3874f82b1a09001926a548` exists | VERIFIED |
| current pool liquidity when indexed | reserves ≈ `0.858 USDT` / `0.00152 WBNB` (r0=`858037982913909658`, r1=`1522729740580272`) @ recent probe | VERIFIED (thin) |
| oracle or quote source | Would require pinned Melega conversion for gas — **NotActive** | BLOCKED (LB-G09) |
| quote freshness limit | would reuse `15` confirmations if enabled | VERIFIED (policy) |
| minimum execution amount | **null** — not calculated for production bind | BLOCKED |
| maximum per-epoch amount | **null** | BLOCKED |
| maximum slippage / price impact | same protocol hard caps if enabled later | VERIFIED |
| minimum liquidity requirement | **null** | BLOCKED |
| emergency disable | keep `enabled=false` | PROPOSED |
| fee-transfer compatibility | ERC-20 compatible in principle | VERIFIED |
| relay / contract compatibility | would require Factory policy row + floors | BLOCKED |
| risk assessment | Insufficient Melega WBNB/USDT depth for gas conversion; enabling now invents unsafe floors | BLOCKED |
| approval recommendation | **KEEP DISABLED** for v1; revisit after liquidity + recalculated floors | PROPOSED |

---

## Asset dossier — USDC (NOT for initial launch)

| Field | Value | Status |
|-------|-------|--------|
| symbol | `USDC` | VERIFIED |
| token name | `USD Coin` | VERIFIED |
| chainId | `56` | VERIFIED |
| checksum contract address | `0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d` | VERIFIED |
| decimals | `18` | VERIFIED |
| deployed bytecode verification | `code_bytes = 1596` | VERIFIED |
| Melega DEX pool | Pair `0x7165b14cf9d03061b67e3237078e5f5a03fe01a9` · reserves ≈ `2.31 USDC` / `0.00403 WBNB` | VERIFIED (thin) |
| floors / enablement | NOT_ACTIVE (LB-G09); no clear launch benefit vs WBNB | BLOCKED |
| approval recommendation | **EXCLUDE from v1 enabled set** | PROPOSED |

---

## Success fee context (not a quote control)

- Fee remains **`500` bps (5%)** of **gross quote acquired** on successful execution.  
- No fee on deposit. No fee on unused budget.  
- Atomic with LP creation via FeeSink.  
- Status: **VERIFIED** (Factory hard-requires `successFeeBps == 500`).

---

## Checklist before recording ratification in inputs

1. Founder completes decision section above.  
2. Set `quotePolicies[]` in deployment inputs only after approval (never mark CALCULATED as RATIFIED).  
3. Leave USDT/USDC `enabled=false` unless a later versioned policy recalculates floors.  
4. Do **not** flip `founderActivationApproved` here.
