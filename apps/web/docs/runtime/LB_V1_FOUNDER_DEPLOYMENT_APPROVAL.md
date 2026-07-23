# Liquidity Building V1 — Founder Deployment Approval

**Mission:** LB-ACT-005  
**Pack version:** `melega.lb.v1.deployment-approval.v1`  
**Status:** `AWAITING_APPROVAL` — **NO-GO** — **NO BROADCAST AUTHORIZED**  
**Chain:** BNB Smart Chain mainnet (`chainId = 56`)  
**Baseline commit for pack content:** `0925f9f3` (docs may advance on mission branch)

This document is Founder-readable approval preparation only.  
KMS signing is mandatory for any future broadcast.  
Hot private keys / mnemonics are forbidden.  
Do **not** treat approval of this pack as proof that KMS or relay already pass.

---

## Explicit Founder approval

- [ ] **APPROVE AS PROPOSED** (after reading Go/No-Go matrix)
- [ ] **APPROVE WITH THE FOLLOWING CHANGES**
- [ ] **REJECT**

**Founder changes:** _______________________________________________

| Approval field | Value |
|----------------|-------|
| Maximum BNB authorized | `0.05` BNB (**PROPOSED** ceiling; see Gas section) |
| Funding source | `0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b` — **bootstrap/infrastructure funding reference only** (NOT deployer, NOT operational signer; EIP-7702 designator / code_bytes=23) |
| KMS signer address | _________________ (**AWAITING INFRA** — must be non-null before broadcast) |
| Approval name | _________________ |
| Approval date (UTC) | _________________ |
| Approval reference | _________________ |

**Approval state:** `NOT_APPROVED`

---

## Canonical production inputs (VERIFIED)

| Input | Value | Status |
|-------|-------|--------|
| chainId | `56` | VERIFIED |
| Melega Factory | `0xb7E5848e1d0CB457f2026670fCb9BbdB7e9E039C` | VERIFIED (`code_bytes=10852`) |
| Melega Router | `0xc25033218D181b27D4a2944Fbb04FC055da4EAB3` | VERIFIED (`code_bytes=17845`) |
| Melega MasterBuilder / MasterChef | `0x41D5487836452d23f2c467070244E5842B412794` | VERIFIED (`code_bytes=7309`) |
| successFeeBps | `500` | VERIFIED |
| Invalid LB fee receiver (Vault) | `0xb2d57B1A40E61AAb3F88361228E1188E0fB6A21C` | **NOT VALID FOR LIQUIDITY BUILDING FEE RECEIPT** (`code_bytes=9883`; role unproven) |

The Vault address must **never** appear as FeeSink `treasuryReceiver_`.

---

## Minimum deployment scope

Deploy only:

1. `LiquidityBuildingTreasuryFeeReceiverV1`  
2. `LiquidityBuildingExecutionAuthorizerV1`  
3. `LiquidityBuildingTreasuryFeeSinkV1`  
4. `LiquidityBuildingExecutionMathV1` (library required to link Program)  
5. `LiquidityBuildingProgramV1` (implementation / template)  
6. `LiquidityBuildingFactoryV1`  

No additional settlement services. No Vault wrapper. No registry contract beyond Factory’s internal program registry.

---

## Contract pack (per contract)

### 1) LiquidityBuildingTreasuryFeeReceiverV1

| Field | Value | Status |
|-------|-------|--------|
| Purpose | Minimal contract intake for ERC-20 success fees forwarded by FeeSink | VERIFIED |
| Source | `contracts/liquidity-building/LiquidityBuildingTreasuryFeeReceiverV1.sol` | VERIFIED |
| Bytecode hash (local compile SHA-256 of deployed bytecode) | `0x135465251bb03829f19b6677c239f2ab1efb4b3c4e3b8d30f8569bca5519c77d` | VERIFIED (local) |
| Constructor | `(address governor_, address beneficiary_)` | VERIFIED |
| Expected owner/governor | **AWAITING FOUNDER DECISION** | AWAITING FOUNDER DECISION |
| Expected executor | N/A (not an executor) | NOT_APPLICABLE |
| Pause authority | N/A on receiver; Program owner pauses execution | NOT_APPLICABLE |
| Treasury fee receiver | **this contract** (after deploy) | PROPOSED |
| Factory / Router binding | none directly; referenced by FeeSink | NOT_APPLICABLE |
| fee bps | n/a (passive intake) | NOT_APPLICABLE |
| Upgradeability | none (no proxy) | VERIFIED |
| Deployment order | `#1` | APPROVED (sequence) |
| Expected address | not deterministic (no CREATE2 pack) | NOT_APPLICABLE |
| Verification method | BscScan source verify + `code.length > 0` | PROPOSED |
| Estimated gas | `212,878` | PROPOSED (heuristic) |
| Max gas allowance (share of pack) | included in pack max | PROPOSED |
| Deployment risk | Wrong governor/beneficiary is irreversible without recovery path control | PROPOSED |

### 2) LiquidityBuildingExecutionAuthorizerV1

| Field | Value | Status |
|-------|-------|--------|
| Purpose | Validates EIP-712 execution intents signed by immutable KMS `signingAuthority` | VERIFIED |
| Source | `contracts/liquidity-building/LiquidityBuildingExecutionAuthorizerV1.sol` | VERIFIED |
| Bytecode hash | `0x3dad300b23fc1f31365aa3c47f073ec6279ff39ca4dfe2bda49a934c1adc1282` | VERIFIED (frozen inputs + local match) |
| Constructor | `(address signingAuthority_)` nonzero | VERIFIED |
| Expected owner/governor | none (immutable authority) | VERIFIED |
| Expected executor | KMS-derived EVM address = `signingAuthority_` | AWAITING INFRA |
| Pause authority | none on Authorizer | NOT_APPLICABLE |
| Treasury fee receiver | n/a | NOT_APPLICABLE |
| Factory binding | Factory stores Authorizer address immutably | VERIFIED |
| Router binding | n/a | NOT_APPLICABLE |
| fee bps | n/a | NOT_APPLICABLE |
| Upgradeability | none; authority rotation requires new Authorizer + Factory | VERIFIED |
| Deployment order | `#2` | APPROVED |
| Expected address | not deterministic | NOT_APPLICABLE |
| Verification | BscScan + `signingAuthority()` equals published KMS address | PROPOSED |
| Estimated gas | `777,142` | PROPOSED |
| Deployment risk | Wrong KMS address permanently binds authority | BLOCKED until KMS address known |

### 3) LiquidityBuildingTreasuryFeeSinkV1

| Field | Value | Status |
|-------|-------|--------|
| Purpose | Atomic exact-fee forwarder Program → immutable Treasury receiver; emits settlement evidence | VERIFIED |
| Source | `contracts/liquidity-building/LiquidityBuildingTreasuryFeeSinkV1.sol` | VERIFIED |
| Bytecode hash | `0xab5e113378bbc683a864672a2a5d1e08f6b046298adf2aa4c57d5aee60cea1f0` | VERIFIED |
| Constructor | `(address treasuryReceiver_)` nonzero **with bytecode** | VERIFIED |
| Expected owner/governor | none | VERIFIED |
| Expected executor | registered Programs only | VERIFIED |
| Pause authority | none on Sink | NOT_APPLICABLE |
| Treasury fee receiver | FeeReceiver address from step 1 — **not Vault** | AWAITING FOUNDER DECISION (governor/beneficiary) + deploy |
| Factory binding | Factory stores FeeSink immutably; Programs must point at this Sink | VERIFIED |
| Router binding | n/a | NOT_APPLICABLE |
| fee bps | forwards exact amount computed by Program (`500` bps gross) | VERIFIED |
| Upgradeability | none | VERIFIED |
| Deployment order | `#3` | APPROVED |
| Expected address | not deterministic | NOT_APPLICABLE |
| Verification | BscScan + `treasuryReceiver()` == FeeReceiver | PROPOSED |
| Estimated gas | `836,850` | PROPOSED |
| Deployment risk | Pointing at Vault/EOA/EIP-7702 address fails policy or constructor | BLOCKED if invalid receiver used |

### 4) LiquidityBuildingExecutionMathV1 (library)

| Field | Value | Status |
|-------|-------|--------|
| Purpose | Linked math library for Program execution validation | VERIFIED |
| Source | `contracts/liquidity-building/libraries/LiquidityBuildingExecutionMathV1.sol` | VERIFIED |
| Bytecode hash | `0x03b84d6ab2b43a50368ccdbc34eb4e2ae1a1b945b1736e713090cb19a89036d8` | VERIFIED |
| Constructor | none | VERIFIED |
| Deployment order | `#4` (before Program link) | APPROVED |
| Estimated gas | `992,026` | PROPOSED |
| Upgradeability | none | VERIFIED |

### 5) LiquidityBuildingProgramV1 (implementation)

| Field | Value | Status |
|-------|-------|--------|
| Purpose | Cloneable program implementation performing atomic swap → fee → add liquidity | VERIFIED |
| Source | `contracts/liquidity-building/LiquidityBuildingProgramV1.sol` | VERIFIED |
| Bytecode hash | Linked-library hash deferred until CREATE with fixed library address; local template SHA-256 (placeholders zeroed for size only): `0x3ec8b102…` **not production freeze** | MISSING (production linked hash) |
| Constructor | empty (initializer pattern / clone) | VERIFIED |
| Expected owner | Program creator (`msg.sender` at Factory.create) | VERIFIED |
| Expected executor | Relay-submitted calls validated by Authorizer signature | AWAITING INFRA |
| Pause authority | Program `owner` (`pause` / `resume` / `stop`) | VERIFIED |
| LP ownership | default `lpRecipient = owner` at create; owner may update when paused/ready | VERIFIED |
| Factory / Router | bound via Factory immutables → Melega Factory/Router | VERIFIED |
| fee bps | uses Factory `successFeeBps` (=500) | VERIFIED |
| Upgradeability | implementation replaceable only by deploying new Factory+impl; existing Programs stay on their impl | VERIFIED |
| Deployment order | `#5` | APPROVED |
| Estimated gas | `5,754,038` | PROPOSED |
| Deployment risk | Library link mismatch breaks CREATE | PROPOSED |

### 6) LiquidityBuildingFactoryV1

| Field | Value | Status |
|-------|-------|--------|
| Purpose | Creates Programs; freezes Melega Factory/Router, Authorizer, FeeSink, protocol params, quote policies | VERIFIED |
| Source | `contracts/liquidity-building/LiquidityBuildingFactoryV1.sol` | VERIFIED |
| Bytecode hash | `0xd7574a777496df07e1c878c7baf23a2243e8785bba3ac6355dfa1a9ec258c2ff` | VERIFIED |
| Constructor | `(factoryVersion_, implementation_, melegaFactory_, melegaRouter_, executionAuthorizer_, treasuryFeeSink_, ProtocolParameters, QuoteAssetPolicy[])` with **`successFeeBps == 500` required** | VERIFIED |
| Expected owner/governor | **none** — “No owner, no setters” | VERIFIED |
| Pause authority | not on Factory; per-Program owner pause | VERIFIED |
| Treasury fee receiver | via immutable FeeSink → FeeReceiver | PROPOSED |
| Factory binding | Melega Factory `0xb7E5848e…039C` | VERIFIED |
| Router binding | Melega Router `0xc2503321…EAB3` | VERIFIED |
| fee bps | `500` | VERIFIED |
| Upgradeability | none; new economics/policies require new Factory | VERIFIED |
| Deployment order | `#6` | APPROVED |
| Quote policies | only after Founder quote approval (`LB_QUOTE_POLICY_FOUNDER_DECISION.md`) | AWAITING FOUNDER DECISION |
| Estimated gas | `2,121,805` | PROPOSED |

---

## FeeReceiver architecture (minimal)

| Topic | Spec | Status |
|-------|------|--------|
| Accept approved ERC-20 quote assets | Yes — standard ERC-20 balances (FeeSink uses `transferFrom` Program → receiver) | VERIFIED |
| Receive atomic 5% fee | Yes — amount computed by Program; Sink forwards exact fee | VERIFIED |
| Emit events | **Settlement evidence is on FeeSink** (`LiquidityBuildingFeeSettled`: programId, executionId, program, quoteAsset, amount, treasuryReceiver, authorizationReference, settlementReceipt, block via `settledBlock`) | VERIFIED |
| FeeReceiver events | Emits only `LiquidityBuildingFeeAssetRecovered` on governor recovery — **not** per-fee receive hooks (ERC-20 transfer has no callback) | VERIFIED |
| Retain vs forward | Funds **stay in FeeReceiver** until governor `recoverERC20` to beneficiary | VERIFIED |
| Authorize execution | **Must not** — and does not | VERIFIED |
| Hold LP / project budget | **Must not** — and does not | VERIFIED |
| Arbitrary execution | **Must not** — only `recoverERC20` | VERIFIED |
| Treasury Runtime HTTP | **Not required** | VERIFIED |
| Owner / governor | constructor `governor_` — **Founder decision** | AWAITING FOUNDER DECISION |
| Beneficiary | constructor `beneficiary_` — **Founder decision** | AWAITING FOUNDER DECISION |
| Withdrawal authority | governor only → beneficiary | VERIFIED |
| Emergency recovery | same `recoverERC20`; pause Programs first if compromised | PROPOSED |
| Upgradeability | none | VERIFIED |
| Native BNB accepted | **No** payable path; WBNB ERC-20 preferred fee asset for v1 | VERIFIED / PROPOSED |
| Supported token recovery | any ERC-20 held by receiver via `recoverERC20` | VERIFIED |
| Vault | `0xb2d57B1A…A21C` = **NOT VALID FOR LIQUIDITY BUILDING FEE RECEIPT** | VERIFIED |

**Founder decisions still required:** governor address, beneficiary address.

---

## KMS dependencies (external — do not imply PASS)

| Item | Value | Status |
|------|-------|--------|
| Authoritative runtime/repository | KERL / execution-runtime per `docs/handoffs/LB008_KERL_KMS_SIGNATURE_NORMALIZATION.md`; prompt in `LB_ACT004_FOLLOWUP_KMS_RELAY_PROMPTS.md` | AWAITING INFRA |
| Existing key reuse vs new key | Prefer reuse of existing AWS KMS secp256k1 production key if compatible; do not create duplicate without proven need | AWAITING INFRA |
| Derived EVM address | `null` in `LiquidityBuildingV1.inputs.json` | BLOCKED |
| chain-56 authorization | Required; production verify only on 56 | AWAITING INFRA |
| `productionKmsVerified` | `false` | BLOCKED |
| Hot-key fallback | Forbidden (`HOT_SIGNER`, local private key, `vm.sign` rejected) | VERIFIED (policy) |
| Responsible owner | External KERL/ops (outside MelegaSwapV2 app authority) | AWAITING INFRA |
| Completion evidence required | Publish address, provider class, nonExportable=true, fingerprint, region/alias; Authorizer bind; gate rows LB-G03B / LB-G11 PASS | AWAITING INFRA |

Treasury testnet signer (`melega-kiri-treasury-runtime` hot-key / chain 97) is **not** valid.

---

## Relay dependencies (external — do not imply PASS)

| Item | Value | Status |
|------|-------|--------|
| Authoritative runtime/repository | Bounded worker repo TBD (`NOT_IDENTIFIED_AS_GIT_REPO`); reuse certified autonomous tx worker pattern — see follow-up Prompt 2 | AWAITING INFRA |
| Production URL | `null` / `relay.status=DISABLED` | BLOCKED |
| KMS binding | Must use production KMS — no hot key, no unrestricted `/sign` | AWAITING INFRA |
| Allowed contracts | Deployed LB Program instances (+ Factory create path if ever relayed — default: execute only) | AWAITING INFRA |
| Allowed function selectors | `executeLiquidityBuilding` selector `0xe8ef6644` (local ABI) | VERIFIED (selector) / AWAITING INFRA (allowlist bind) |
| Idempotency / nonce / gas bounds | Required properties; not production-wired | AWAITING INFRA |
| Health/readiness evidence | Required for LB-G03C PASS | AWAITING INFRA |
| Responsible owner | External relay/ops | AWAITING INFRA |
| Completion evidence | `LB_RELAY_URL`, `relay.status=READY`, authority identity, gate LB-G03C PASS | AWAITING INFRA |

---

## Finality

| Item | Value | Status |
|------|-------|--------|
| Depth | `15` confirmations | VERIFIED (runtime + protocol params) |
| Indexer note | `REORG_SAFETY_BLOCKS=12` — do not reduce LB depth below 15 | VERIFIED |
| Gate LB-G10 | `FINALITY_EVIDENCE_INSUFFICIENT` | BLOCKED (ops evidence) |
| Treasury Runtime required? | **No** | VERIFIED |

---

## Gas and funding approval

**Method:** local `forge` compile of liquidity-building pack + CREATE gas heuristic  
`21000 + 32000 + 200×deployedBytes + 16×creationBytes`, ×1.15 constructor overhead.  
**Not broadcast.** Read-only BSC `eth_gasPrice` observed `50,000,000` wei (`0.05 gwei`) at block `111574308`.  
Costing uses **conservative 3 gwei** (same basis as quote-policy calculation).

| Contract | Estimated gas |
|----------|---------------|
| FeeReceiver | 212,878 |
| Authorizer | 777,142 |
| FeeSink | 836,850 |
| Math library | 992,026 |
| Program implementation | 5,754,038 |
| Factory | 2,121,805 |
| **Total** | **10,694,739** |

| Cost view | BNB |
|-----------|-----|
| Expected spend @ spot 0.05 gwei | ~`0.000535` BNB |
| Expected spend @ conservative 3 gwei | ~`0.03208` BNB |
| Contingency | **30%** |
| Raw max (conservative × 1.3) | ~`0.04171` BNB |
| **Maximum authorized BNB (PROPOSED Founder ceiling)** | **`0.05` BNB** |

| Field | Value | Status |
|-------|-------|--------|
| Expected spend | ~0.032 BNB @ 3 gwei | PROPOSED |
| Maximum approved spend | 0.05 BNB | AWAITING_APPROVAL |
| Funding source reference | `0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b` | VERIFIED as reference only |
| Actual deployment authority | Approved KMS signer (not funding reference) | AWAITING INFRA |
| MELEGA TREASURY WALLET auto-sign | **Forbidden** | VERIFIED (policy) |

---

## Deployment order (broadcast sequence when authorized)

1. FeeReceiver(governor, beneficiary)  
2. Authorizer(kmsSigningAuthority)  
3. FeeSink(feeReceiver) — reject if receiver is Vault/zero/EOA  
4. Math library  
5. Program implementation (link Math)  
6. Factory(…, Authorizer, FeeSink, params fee=500, ratified quote policies)  
7. Publish addresses + BscScan verify + re-run activation consumer  

Dry-run simulation (`DryRunDeployLiquidityBuildingV1`) remains **local only** / broadcast blocked.

---

## FounderActivationApproved semantics (do not set true in this mission)

Required sequence:

1. Founder approves quote policy.  
2. Founder approves this deployment pack and maximum gas.  
3. KMS and relay complete external readiness.  
4. All deployment inputs are revalidated.  
5. Mainnet contracts are broadcast through KMS.  
6. Contract bytecode and ownership are verified.  
7. Registry bindings are published (Factory addresses in inputs).  
8. Production activation status is re-evaluated.  
9. `FounderActivationApproved` may then be recorded for the **deployed pack** only.  
10. `activationAuthorized` is computed from factual gates.

`FounderActivationApproved` must reference:

- quote-policy version (`melega.lb.quote-policy.v1` or amended)  
- deployment-pack hash (hash of `lb-v1-founder-approval-pack.json`)  
- contract-address set  
- KMS signer  
- approval timestamp  

It must **not** be a generic permanent boolean and must **not** be flipped by this mission.

---

## Go / No-Go matrix

| Row | Current status | Evidence | Owner | Blocking |
|-----|----------------|----------|-------|----------|
| Quote policy approved | AWAITING FOUNDER DECISION | `LB_QUOTE_POLICY_FOUNDER_DECISION.md` | Founder | YES |
| FeeReceiver inputs verified | AWAITING FOUNDER DECISION | governor/beneficiary blank | Founder | YES |
| KMS configured | AWAITING INFRA | `productionAuthority.address=null` | KERL/ops | YES |
| KMS production verified | BLOCKED | `productionKmsVerified=false` | KERL/ops | YES |
| Relay configured | AWAITING INFRA | `relay.status=DISABLED` | Relay ops | YES |
| Relay ready | BLOCKED | no `LB_RELAY_URL` | Relay ops | YES |
| Finality policy PASS | BLOCKED | LB-G10 `FINALITY_EVIDENCE_INSUFFICIENT` | Ops | YES |
| Authorizer inputs verified | BLOCKED | signingAuthority unknown | KERL + Founder | YES |
| Factory inputs verified | BLOCKED | depends on Authorizer/FeeSink/quotePolicies | Mission + Founder | YES |
| Router/Factory bytecode verified | VERIFIED / PASS | on-chain code bytes | Melega DEX | NO (already PASS) |
| Fee fixed at 500 bps | VERIFIED | Factory constructor require | Contracts | NO |
| LP ownership policy verified | VERIFIED | default owner; updateable when paused/ready | Contracts | NO |
| Pause authority verified | VERIFIED | Program `onlyOwner` pause/stop | Contracts | NO |
| Bytecode hashes frozen | PARTIAL | Authorizer/FeeSink/Factory/Math frozen; Program linked hash MISSING; FeeReceiver local hash only | Engineering | YES (Program link + FeeReceiver freeze) |
| Gas estimate accepted | AWAITING FOUNDER DECISION | this section | Founder | YES |
| Maximum BNB approved | AWAITING FOUNDER DECISION | proposed `0.05` BNB | Founder | YES |
| Founder deployment approval signed | AWAITING FOUNDER DECISION | this document | Founder | YES |

**Deployment verdict: NO-GO** until every Blocking=YES row is PASS.

---

## Post-deployment checks (after a future authorized broadcast)

1. BscScan verify all six artifacts  
2. `FeeSink.treasuryReceiver() == FeeReceiver`  
3. `Authorizer.signingAuthority() == KMS address`  
4. `Factory.successFeeBps() == 500`  
5. `Factory.initialFinalityDepth() == 15`  
6. Quote policy row matches ratified WBNB policy  
7. Update `LiquidityBuildingV1.inputs.json`  
8. Re-evaluate production activation API  
9. Only then consider recording pack-scoped `FounderActivationApproved`
