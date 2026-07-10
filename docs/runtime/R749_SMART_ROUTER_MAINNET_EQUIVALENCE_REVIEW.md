# R749 — Smart Router Mainnet Constitutional Equivalence Review

**Date:** 2026-07-09  
**Authority:** `SMART_ROUTER_TESTNET_FROZEN` (R748)  
**Reference:** Chain 97 constitutional reference implementation  
**Mission:** Verification only — no deploy, no contract changes, no registry updates

---

## Output

| Field | Result |
|---|---|
| **Review status** | **BLOCKED** |
| **Final verdict** | **`SMART_ROUTER_MAINNET_BLOCKED`** |

Design-level wrapper equivalence is **proven** (same source, ABI, fee math, policies). Mainnet **activation equivalence is not proven** — operational artifacts missing and registry underlying router incompatible with frozen wrapper bytecode.

---

## Part A — Chain field comparison (97 vs 56)

| Field | Chain 97 (frozen reference) | Chain 56 (mainnet target) | Classification |
|---|---|---|---|
| **Chain ID** | `97` | `56` | CHAIN_SPECIFIC_ONLY |
| **Chain name** | BNB Testnet | BNB Chain | CHAIN_SPECIFIC_ONLY |
| **Wrapper address** | `0x9D2451b30102B098570bfCeae0E8b8C9Fd2bb2Db` (V2 deployed) | `null` (not deployed) | BLOCKED |
| **Wrapper version** | `2` | N/A | BLOCKED |
| **Wrapper bytecode hash** | `0x38b51c47d376400b04c3af1c7425d4af830dc71aec9a7faee23e80e51213d610` | Not deployed | BLOCKED |
| **Underlying router** | `0xD99D1c33F9fC3444f8101754aBC46c52416550D1` (Pancake V2) | `0xC6665d98Efd81f47B03801187eB46cbC63F328B0` (Pancake Smart Router) | CHAIN_SPECIFIC_ONLY |
| **Underlying router interface** | V2 — `swapExactETHForTokens` + `swapExactTokensForTokens` present | Smart Router — `swap(IERC20,…)` surface; V2 selectors absent per R745B | BLOCKED |
| **Treasury Intake** | `0xe674b1d925d79f5A0053e40cC7cdED7841AD4164` | `null` (registry) | BLOCKED |
| **MARCO** | `0x963556de0eb8138E97A85F0A86eE0acD159D210b` | `0x963556de0eb8138E97A85F0A86eE0acD159D210b` | IDENTICAL |
| **WBNB** | `0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd` | `0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c` | CHAIN_SPECIFIC_ONLY |
| **Policy ref (pricing)** | `D87_DEX_PRICING_RATIFIED` | `D87_DEX_PRICING_RATIFIED` | IDENTICAL |
| **Policy ref (treasury)** | `FSC-01` | `FSC-01` | IDENTICAL |
| **Pricing ref hash** | `0x86ec759a7d636e2c23c8e666673400056cc5ef99061381c1dac5abbd90530294` | Same at deploy (required) | IDENTICAL |
| **Treasury policy ref hash** | `0x2c4da16e00f42da5ec690db4a2db138a94f7c423d1ad10de9274c4d404b7d6b8` | Same at deploy (required) | IDENTICAL |
| **RPC** | `data-seed-prebsc-*.binance.org:8545` | `bsc-dataseed*.binance.org` | CHAIN_SPECIFIC_ONLY |
| **Explorer** | `https://testnet.bscscan.com` | `https://bscscan.com` | CHAIN_SPECIFIC_ONLY |
| **Civilization status** | `ACTIVE_TESTNET` + `SMART_ROUTER_TESTNET_FROZEN` | `partial` / wrapper planned | BLOCKED |
| **Validation certificate** | Issued (R747) | Not issued | BLOCKED |
| **Freeze manifest** | Issued (R748) | Not applicable until post-mainnet | BLOCKED |
| **Executable routes** | 3/3 validated on-chain | 0/3 validated on-chain | BLOCKED |

**Sources:** `index.json`, `treasury/index.json`, `testnet-freeze-manifest.json`, `bscTestnet.ts`, `underlyingRouterRegistry.ts`, R745B router verification.

---

## Part B — Wrapper comparison

| Dimension | Chain 97 (deployed) | Chain 56 (planned) | Classification |
|---|---|---|---|
| **Solidity source** | `contracts/MelegaSmartRouterWrapper.sol` | Same source (required) | IDENTICAL |
| **Solidity version** | `0.8.20` | `0.8.20` (required) | IDENTICAL |
| **ABI** | `MelegaSmartRouterWrapper.abi.json` | Same ABI at deploy | IDENTICAL |
| **Events** | `ProtocolFeeCollected`, `SmartRouterSwapRouted`, `TreasuryHandoffPrepared` | Same event signatures required | IDENTICAL |
| **Fee constants** | `BUY_MARCO_PROTOCOL_FEE_BPS = 20`, `STANDARD = 30` | Same immutables in bytecode | IDENTICAL |
| **Constructor arity** | 6 args (router, intake, marco, pricingHash, treasuryHash, owner) | Same | IDENTICAL |
| **Immutables (semantic)** | router, intake, marco, pricingRefHash, treasuryPolicyRefHash | Same slots; addresses chain-specific | CHAIN_SPECIFIC_ONLY |
| **Fee math** | `(gross * bps) / 10_000`; BUY when `output == marcoToken` | Same logic | IDENTICAL |
| **Native path** | WBNB `deposit` + ERC20 fee to intake; net via `swapExactETHForTokens` | Same code path required | IDENTICAL |
| **ERC20 path** | `safeTransfer` fee to intake; `swapExactTokensForTokens` with net | Same code path required | IDENTICAL |
| **Exact output** | Hard revert `ExactOutputUnsupported` | Same | IDENTICAL |
| **Fee-on-transfer** | Hard revert `FeeOnTransferUnsupported` | Same | IDENTICAL |
| **Execution manifest** | `TreasuryHandoffPrepared` emitted; no local FSC-01 split | Same required | IDENTICAL |
| **Deployed bytecode** | Hash verified on testnet | Not deployed | BLOCKED |
| **Underlying call target** | V2 router (compatible interface) | Registry Smart Router (incompatible interface) | BLOCKED |

**Note:** Frozen wrapper delegates via `IUnderlyingSwapRouter`. Testnet validated against V2. Mainnet registry lists Smart Router which lacks selectors `0x7ff36ab5` and `0x38ed1739` (R745B). Deploying frozen bytecode against registry Smart Router address will revert on router calls unless a V2-compatible router is chosen and registry updated in a future publication ticket.

---

## Part C — Economic behavior comparison

| Behavior | Chain 97 evidence | Chain 56 evidence | Classification |
|---|---|---|---|
| **BUY_MARCO fee** | 20 bps — tx `0x8a19f2eb…` | Not executed on mainnet | BLOCKED |
| **SELL_MARCO fee** | 30 bps — tx `0x5602377a…` | Not executed on mainnet | BLOCKED |
| **STANDARD_SWAP fee** | 30 bps — tx `0x80969383…` | Not executed on mainnet | BLOCKED |
| **Fee schedule (design)** | 20 / 30 / 30 bps | Adapter + contract constants match | IDENTICAL |
| **Treasury handoff** | Fee ERC20 to intake verified | Intake address null | BLOCKED |
| **ProtocolFeeCollected** | Verified 3/3 routes | No mainnet txs | BLOCKED |
| **SmartRouterSwapRouted** | Verified 3/3 routes | No mainnet txs | BLOCKED |
| **TreasuryHandoffPrepared** | Verified 3/3 routes | No mainnet txs | BLOCKED |
| **Execution manifest (off-chain)** | Schema `melega.execution-manifest.v1` | Same builder available | IDENTICAL |
| **LP fee separation** | Protocol fee ≠ LP fee | Same architecture | IDENTICAL |
| **No local FSC-01 split** | Verified — wrapper forwards only | Same contract semantics | IDENTICAL |

**Off-chain adapter (`smartRouterAdapter.ts`, `protocolFee.ts`):** D87 fee resolution is chain-agnostic — IDENTICAL for both chains when invoked.

---

## Part D — Treasury comparison

| Dimension | Chain 97 | Chain 56 | Classification |
|---|---|---|---|
| **Treasury Intake address** | `0xe674b1d925d79f5A0053e40cC7cdED7841AD4164` | `null` | BLOCKED |
| **Treasury registry status** | `active_testnet` | `planned` | BLOCKED |
| **policyRef** | `FSC-01` | `FSC-01` | IDENTICAL |
| **pricingRef (DEX)** | `D87_DEX_PRICING_RATIFIED` | `D87_DEX_PRICING_RATIFIED` | IDENTICAL |
| **Native fee to intake** | WBNB ERC20 (validated) | Not tested on mainnet intake | BLOCKED |
| **ERC20 fee to intake** | MARCO + WBNB paths validated | Not tested | BLOCKED |
| **Local waterfall split in wrapper** | None | None (by design) | IDENTICAL |
| **Treasury Runtime ownership** | Post-confirmation settlement | Same model | IDENTICAL |
| **Forbidden handoff fields** | No settlement_id / waterfall in DEX | Same policy | IDENTICAL |

---

## Part E — Machine contract comparison

Read-only snapshot — **no registry modifications in R749**.

| Artifact | Chain 97 | Chain 56 | Classification |
|---|---|---|---|
| **index.json status** | `active_testnet` + frozen | `partial` | BLOCKED |
| **index.json wrapperAddress** | Set | `null` | BLOCKED |
| **index.json treasuryCollector** | Set | `null` | BLOCKED |
| **index.json validationCertificate** | Present | Absent | BLOCKED |
| **index.json freezeManifest** | Present | Absent | BLOCKED |
| **civilization-router-contract wrapperAddress (top-level)** | `null` (mainnet scope) | `null` | IDENTICAL |
| **civilization-router supportedChains.97** | Full publication | N/A | CHAIN_SPECIFIC_ONLY |
| **civilization-router supportedChains.56** | Wrapper null | Wrapper null | IDENTICAL |
| **civilization-router testnetPublication** | Present + frozen | N/A | CHAIN_SPECIFIC_ONLY |
| **testnet-validation-certificate.json** | `PASSED` | No mainnet equivalent | BLOCKED |
| **testnet-freeze-manifest.json** | `SMART_ROUTER_TESTNET_FROZEN` | No mainnet freeze | BLOCKED |
| **labs-integration chain 97** | `active_testnet`, wrapper set | N/A | CHAIN_SPECIFIC_ONLY |
| **labs-integration chain 56** | Wrapper null, blockers present | Same | IDENTICAL |
| **Schema alignment (when 56 published)** | `melega.smart-router.validation.v1` testnet | `melega.smart-router.mainnet-validation.v1` (R749 schema) | IDENTICAL |

---

## Part F — Mainnet activation checklist

Generated: [`docs/runtime/MAINNET_ACTIVATION_CHECKLIST.md`](MAINNET_ACTIVATION_CHECKLIST.md)

20 operational steps with Owner, Prerequisite, Evidence, and Rollback per step. Critical path blockers: underlying router certification, Treasury Intake publication, audit, deploy, 3/3 validation, certificate, registry publication (separate ticket).

---

## Part G — Mainnet deployment certificate schema

Generated: [`docs/runtime/MAINNET_DEPLOYMENT_CERTIFICATE_SCHEMA.json`](MAINNET_DEPLOYMENT_CERTIFICATE_SCHEMA.json)

Schema: `melega.smart-router.mainnet-validation.v1` — structurally equivalent to testnet `melega.smart-router.validation.v1` with:

- `civilizationStatus: ACTIVE_MAINNET`
- `chainId: 56` const
- `constitutionalEquivalence` block linking testnet certificate + freeze manifest + R749
- Required bytecode hash match to frozen testnet hash unless explicit supersession

---

## Part H — Equivalence matrix

Every row is exactly one of: **IDENTICAL** | **CHAIN_SPECIFIC_ONLY** | **BLOCKED**

| # | Dimension | Classification |
|---|---|---|
| 1 | Wrapper Solidity source | IDENTICAL |
| 2 | Wrapper ABI | IDENTICAL |
| 3 | Wrapper bytecode (deployed) | BLOCKED |
| 4 | Wrapper events (3 canonical) | IDENTICAL |
| 5 | Constructor shape | IDENTICAL |
| 6 | Immutable slots (semantic) | IDENTICAL |
| 7 | Immutable values (addresses) | CHAIN_SPECIFIC_ONLY |
| 8 | BUY_MARCO 20 bps (design) | IDENTICAL |
| 9 | SELL_MARCO 30 bps (design) | IDENTICAL |
| 10 | STANDARD_SWAP 30 bps (design) | IDENTICAL |
| 11 | BUY_MARCO on-chain proof | BLOCKED |
| 12 | SELL_MARCO on-chain proof | BLOCKED |
| 13 | STANDARD_SWAP on-chain proof | BLOCKED |
| 14 | Native fee path (WBNB wrap) | IDENTICAL |
| 15 | ERC20 fee path | IDENTICAL |
| 16 | Exact-output rejection | IDENTICAL |
| 17 | Fee-on-transfer rejection | IDENTICAL |
| 18 | ProtocolFeeCollected (mainnet) | BLOCKED |
| 19 | SmartRouterSwapRouted (mainnet) | BLOCKED |
| 20 | TreasuryHandoffPrepared (mainnet) | BLOCKED |
| 21 | Execution manifest schema | IDENTICAL |
| 22 | No local FSC-01 split | IDENTICAL |
| 23 | pricingRef D87 | IDENTICAL |
| 24 | treasuryRef FSC-01 | IDENTICAL |
| 25 | pricingRefHash | IDENTICAL |
| 26 | treasuryPolicyRefHash | IDENTICAL |
| 27 | MARCO token address | IDENTICAL |
| 28 | WBNB address | CHAIN_SPECIFIC_ONLY |
| 29 | Chain ID | CHAIN_SPECIFIC_ONLY |
| 30 | RPC endpoints | CHAIN_SPECIFIC_ONLY |
| 31 | Block explorer | CHAIN_SPECIFIC_ONLY |
| 32 | Underlying router address | CHAIN_SPECIFIC_ONLY |
| 33 | Underlying router interface vs frozen wrapper | BLOCKED |
| 34 | Treasury Intake address | BLOCKED |
| 35 | Treasury Intake ERC20 acceptance (mainnet) | BLOCKED |
| 36 | Wrapper deploy tx | BLOCKED |
| 37 | Mainnet validation certificate | BLOCKED |
| 38 | Mainnet freeze manifest | BLOCKED |
| 39 | Registry wrapper publication (56) | BLOCKED |
| 40 | External security audit | BLOCKED |
| 41 | Off-chain adapter fee math | IDENTICAL |
| 42 | Labs narrative trade integration | BLOCKED |
| 43 | Product UI wrapper wiring (56) | BLOCKED |

**Matrix summary:**

| Classification | Count |
|---|---|
| IDENTICAL | 18 |
| CHAIN_SPECIFIC_ONLY | 7 |
| BLOCKED | 18 |

---

## Remaining blockers (P0)

1. **Underlying router interface** — Registry Smart Router `0xC6665d…` incompatible with frozen `IUnderlyingSwapRouter`; must certify V2-compatible router or resolve via constitutional ticket (contract change not allowed under R748).
2. **Treasury Intake null on chain 56** — Treasury Runtime publication pending.
3. **Wrapper not deployed on chain 56** — No on-chain proof.
4. **No mainnet validation ceremony** — 0/3 constitutional txs.
5. **No mainnet validation certificate** — Schema defined (R749); artifact not issued.
6. **External audit** — Not completed.
7. **Registry publication** — Chain 56 wrapper fields remain null (intentionally untouched in R749).

---

## Mainnet readiness

| Gate | Ready |
|---|---|
| Design / source equivalence | Yes |
| Policy hash equivalence | Yes |
| Bytecode deployable (same artifact) | Yes — if router + intake resolved |
| Treasury Intake published | No |
| Underlying router certified for wrapper | No (registry mismatch) |
| On-chain validation | No |
| Registry canonical publication | No |
| Product wiring | No |

**Overall mainnet readiness:** **Not ready**

---

## Files changed (R749)

| File | Action |
|---|---|
| `docs/runtime/R749_SMART_ROUTER_MAINNET_EQUIVALENCE_REVIEW.md` | **Created** — this document |
| `docs/runtime/MAINNET_ACTIVATION_CHECKLIST.md` | **Created** |
| `docs/runtime/MAINNET_DEPLOYMENT_CERTIFICATE_SCHEMA.json` | **Created** |

**Not changed:** contracts, registries, Treasury Runtime, KERL, TypeScript runtime behavior.

---

## Final verdict

**`SMART_ROUTER_MAINNET_BLOCKED`**

Chain 56 **will be** constitutionally equivalent to frozen chain 97 **if and only if**:

- The same `MelegaSmartRouterWrapper` bytecode is deployed with mainnet immutables,
- A **wrapper-compatible** underlying router is used (not yet certified for registry Smart Router),
- Treasury Intake is published and accepts ERC20 fees identically,
- A 3/3 mainnet validation ceremony produces a certificate matching the R749 schema.

Design equivalence is proven. Activation equivalence is **blocked** until operational gates clear.

Truth over continuity.
