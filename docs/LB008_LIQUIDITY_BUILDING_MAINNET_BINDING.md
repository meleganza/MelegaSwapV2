# LB008 — Liquidity Building Production Mainnet Binding

**Verdict:** `LB008_IMPLEMENTED_WITH_EXTERNAL_BINDING_BLOCKERS`  
**Baseline start SHA:** `cc796f5aee87ba5e0d65f9a996fda0a81e20a9a2` (`main`)  
**Autonomous runtime / first live cycle:** NOT activated (deferred to LB009)  
**Canonical mainnet Factory/Program deploy:** NOT broadcast

Separation of claims:

| Claim | Status |
| --- | --- |
| Deployment inputs, validator, quote calculation, dry-run scripts, router fix, handoffs | **YES** |
| Production non-exportable authority provisioned | **NO** |
| Canonical Treasury receiver + Runtime LB ingestion | **NO** |
| Founder-ratified quote floors | **NO** |
| Mainnet contracts deployed | **NO** |

---

## 1. Executive Verdict

LB008 closes what can be closed inside `meleganza/MelegaSwapV2` without inventing production authority or Treasury custody:

- Stale Pancake BSC router constant in `packages/smart-router` corrected to Melega Router (`LB-G07` closable for this path).
- Machine-readable chain-56 deployment inputs + validator that returns `DEPLOYMENT_INPUTS_BLOCKED`.
- WBNB gross/reserve floors **calculated** and marked `PROPOSED_FOR_FOUNDER_RATIFICATION` (not ratified → `LB-G08` open).
- USDT/USDC remain `NotActive` (`LB-G09` open — thin Melega WBNB/stable reserves).
- Explicit KERL KMS + Treasury Runtime handoffs (external repos not modified in this mission).
- Dry-run Foundry script with hard broadcast reject.
- Finality depth **15** retained; evidence insufficient to certify (`LB-G10` open).

**Not ready for LB009 activation.** Production bindings remain external blockers.

---

## 2. Repository and Infrastructure Boundaries

| Item | Finding |
| --- | --- |
| Primary repo | `meleganza/MelegaSwapV2` @ `main` / `cc796f5aee87ba5e0d65f9a996fda0a81e20a9a2` |
| Sibling under `Projects/` | None other than MelegaSwapV2 |
| Treasury Runtime (external) | Desktop path `/Users/marcomelega/Desktop/melega-kiri-treasury-runtime` → `meleganza/melega-kiri-treasury-runtime` — **not modified** |
| KERL KMS adapter source | Not available as a verified writable sibling for LB008; in-repo audit shows `KMS_HSM` MISSING |
| Treasury HTTP | `https://treasury.melega.ai` — no LB settlement schema implemented |

No external repository was invented. No runtime code was copied into MelegaSwapV2 to fake integration.

---

## 3. Production Authority Discovery

| Candidate | Provider/type | Public address | Key usage | Exportability | Human access | EIP-712 | Production status | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| KERL HOT_SIGNER | Env hot EOA | Config-driven | General signing | Exportable/hot | Operator env | Possible | Rejected for LB | Reject |
| KERL KMS_HSM | Policy enum only | N/A | Missing adapter | N/A | N/A | N/A | Not provisioned | Reject |
| EIP-1271 LB authority | Contract | Not found | N/A | N/A | N/A | Compatible if deployed | Not found | Reject |
| Foundry `vm.sign` | Test | Test-only | Tests | N/A | Dev | Yes | Local only | Reject |

**Verdict:** `AUTONOMOUS_AUTHORITY_NOT_FOUND`

Evidence: `docs/LB006_LIQUIDITY_BUILDING_AUTHORITY_TREASURY.md` §2.1; `apps/web/src/lib/kerl-signing-gate/signer-audit.ts` (KMS_HSM MISSING); handoff `docs/handoffs/LB008_KERL_KMS_SIGNATURE_NORMALIZATION.md`.

---

## 4. KMS/HSM Provisioning

**Not provisioned.** Environment lacks verified non-exportable secp256k1 key + service identity policy for Liquidity Building.

No local private-key fallback created. No funded execution wallet created.

---

## 5. Signature Normalization

**Status:** `NOT_IMPLEMENTED` in available repositories.

Required pipeline documented in `docs/handoffs/LB008_KERL_KMS_SIGNATURE_NORMALIZATION.md`.

Authorizer contract already expects canonical 65-byte ECDSA / EIP-1271 (`LiquidityBuildingExecutionAuthorizerV1.sol`). DER→low-s→v belongs in KERL/execution-runtime, not MelegaSwapV2.

**Blocker:** LB-G11 open.

---

## 6. Authorizer Production Binding

| Field | Value |
| --- | --- |
| Contract | `LiquidityBuildingExecutionAuthorizerV1` |
| Deployed address | `null` (not mainnet-deployed) |
| Schema | `LIQUIDITY_BUILDING_EXECUTION_INTENT_V1` |
| Authority | unset / not provisioned |
| Bytecode (local inspect) | sha256 `0x3dad300b…1282`, 2869 bytes |
| Immutable | Yes — no `setSigner` / rotation |

**Status:** contract ready; production binding blocked by LB-G03B/G11.

---

## 7. Treasury Receiver Discovery

| Candidate | Address | Code type | Treasury role | Runtime binding | Asset handling | Human authority | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Vault | `0xb2d57B…A21C` | Contract (~9883 B) | Named Vault only | None for LB | Unproven | Unknown | Reject |
| Treasury label | `0xb6436E…abF65b` | EIP-7702 designator (23 B) | Not durable intake | Unproven | N/A | N/A | Reject |
| Fee collector | `0xb5a870…139a` | EOA | Label only | Unproven | N/A | EOA | Reject |

**Verdict:** `PRODUCTION_BINDING_NOT_FOUND`

---

## 8. Treasury Receiver Architecture

Conceptual `TreasuryLiquidityBuildingReceiverV1` specified in handoff — **must live in Treasury Runtime / D99 boundary**, not as a MelegaSwapV2 local fee authority.

Not implemented in MelegaSwapV2 (boundary rule). Deployment of Sink blocked until receiver exists.

---

## 9. Fee Sink Production Binding

| Field | Value |
| --- | --- |
| Contract | `LiquidityBuildingTreasuryFeeSinkV1` |
| Address | `null` |
| Receiver | unset |
| Bytecode | sha256 `0xab5e1133…a1f0`, 3105 bytes |
| Mutable receiver | **No** — constructor-only |

Sink rejects EOA receivers (`TreasuryReceiverWithoutCode`) — verified in `LB008MainnetBinding.t.sol`.

---

## 10. Treasury Runtime Ingestion

**Status:** `NOT_IMPLEMENTED`

Handoff: `docs/handoffs/LB008_TREASURY_RUNTIME_LB_INGESTION.md`  
Schema: `melega.treasury.liquidity-building-settlement.v1`  
URL: `https://treasury.melega.ai`

**Blockers:** LB-G04C, LB-G12.

---

## 11. Receipt Reconciliation

Documented chain (not operational end-to-end):

```
Program ExecutionCompleted
→ Fee Sink LiquidityBuildingFeeSettled
→ Treasury receiver intake
→ tx receipt + finality
→ Runtime ingestion
→ Runtime reconciliation
→ Treasury accounting acknowledgement
```

Identities kept distinct: execution ID ≠ settlement receipt ≠ Runtime acknowledgement ID.

---

## 12. Quote-Asset Policies

Artifact: `deployments/liquidity-building/chain-56/quote-policy-calculation.v1.json`  
Observation block: `110937361`

| Asset | Address | Decimals | Gross floor | Reserve floor | Gas mode | Ratification | Activation |
| --- | --- | --- | --- | --- | --- | --- | --- |
| WBNB | `0xbb4C…095c` | 18 (on-chain) | `41052631578947370` | `10263157894736842500` | NativeEquivalent | PROPOSED_FOR_FOUNDER_RATIFICATION | candidate only |
| USDT | `0x55d3…7955` | 18 | null | null | NotActive | CALCULATED | blocked |
| USDC | `0x8AC7…580d` | 18 | null | null | NotActive | CALCULATED | blocked |

Production `quotePolicies` array in deployment inputs remains **empty** until Founder ratification + authority/treasury gates.

---

## 13. Minimum Gross Quote Floors

Method (WBNB / NativeEquivalent):

1. `estimatedGas = 650000`
2. `conservativeGasPrice = 3 gwei` (observed ~0.05 gwei; operational floor)
3. `gasCost = 1.95e15 wei`
4. `minNet = ceil(gasCost × 10000/1000)` → `1.95e16`
5. `minGross = ceil(minNet × 10000/9500)` → `2.0526…e16`
6. `selected = minGross × 2` safety → **`41052631578947370`**

Human: ~0.04105 WBNB.

---

## 14. Minimum Reserve Floors

Operating target ≤ 40 bps impact ⇒ `G/Y ≤ 0.004` ⇒ `Y ≥ G/0.004 = 250G`.

Selected: **`10263157894736842500`** (~10.26 WBNB) = `250 × gross floor`.

Hard 100 bps bound would allow `100G`; production selection uses operating headroom.

---

## 15. WBNB Gas Path

- Canonical WBNB verified on chain-56.
- Mode: `NativeEquivalent` — no external conversion.
- Activation still blocked by authority, Treasury, ratification, deployment gates — not by gas path math.

---

## 16. USDT Gas Path

Melega WBNB/USDT pair `0x94fadf…a548` observed reserves too thin → `NotActive`. **LB-G09 open for USDT.**

---

## 17. USDC Gas Path

Melega WBNB/USDC pair `0x7165b1…1a9` observed reserves too thin → `NotActive`. **LB-G09 open for USDC.**

---

## 18. Finality Evidence

| Source | Value |
| --- | --- |
| LB007 Program / Factory param | `initialFinalityDepth = 15` |
| Indexer reorg safety (ops) | 12 (incomplete certification) |
| Verdict | `FINALITY_EVIDENCE_INSUFFICIENT` |

**LB-G10 remains open.** Value 15 retained; not reduced.

---

## 19. Stale Router Closure

| Reference | Runtime reachable | Current DEX | Fix | Verification |
| --- | --- | --- | --- | --- |
| `packages/smart-router/evm/constants/exchange.ts` BSC `ROUTER_ADDRESS` | Package constant (exported); app primary path uses `apps/web/.../config/constants/exchange.ts` Melega | Was Pancake `0x10ED…`; now Melega `0xc250…EAB3` | Corrected | Address match + no LB path imports Pancake |
| `apps/web/src/config/constants/exchange.ts` | Yes (swap/liquidity) | Already Melega | None | Confirmed |
| LB Program `melegaRouter` | On-chain Factory immutable | Melega | N/A | Canonical constant in deployment inputs |

**LB-G07:** closable for Liquidity Building / BSC router constant after this fix. Legacy Pancake *naming* in unrelated UI strings remains non-binding.

---

## 20. Immutable Deployment Inputs

Path: `deployments/liquidity-building/chain-56/LiquidityBuildingV1.inputs.json`  
Schema: `melega.liquidity-building.v1.deployment-inputs`  
State: `BLOCKED`  
Contains **no** secrets, private keys, or placeholder production addresses (nulls for unbound fields).

---

## 21. Deployment Validator

Path: `deployments/liquidity-building/validate-lb-v1-inputs.mjs`  
Result on current artifact: **`DEPLOYMENT_INPUTS_BLOCKED`**

Rejects missing authority, Treasury, empty quote policies, unresolved blockers, non-OPERATIONAL runtime, non-VERIFIED signature normalization.

---

## 22. Deployment and Verification Scripts

| Script | Role |
| --- | --- |
| `script/liquidity-building/DryRunDeployLiquidityBuildingV1.s.sol` | Local structure dry-run; `runBroadcastBlocked()` hard-fails |
| `deployments/liquidity-building/bscscan-verification-helper.mjs` | Verification template; exits non-zero while BLOCKED |

No raw private key path. No testnet default. No zero-address fallback for production.

---

## 23. Mainnet-Fork Simulation

**Status:** Production fork binding **not claimed complete**.

Local dry-run (`forge script ... run()`) validates Authorizer/Sink/Factory wiring with **local stubs** only — explicitly **NOT** production authority/Treasury.

Full chain-56 fork atomic execution + Runtime ingestion requires external Runtime + provisioned authority — blocked.

Mark: `CHAIN-LOCAL DRY-RUN` / `NO MAINNET BROADCAST`.

---

## 24. Mainnet Deployment Status

**`NOT_BROADCAST_BLOCKED`**

---

## 25. Security and Authority Scan

| Control | Result |
| --- | --- |
| NO HUMAN OPERATIONAL AUTHORITY INTRODUCED | PASS (none provisioned) |
| NO RAW PRIVATE KEY INTRODUCED | PASS |
| NO MANUALLY FUNDED EXECUTION WALLET INTRODUCED | PASS |
| NO EOA TREASURY RECEIVER INTRODUCED | PASS (Sink rejects EOA) |
| NO LOCAL DEX FEE AUTHORITY INTRODUCED | PASS |
| NO MUTABLE SIGNER INTRODUCED | PASS |
| NO MUTABLE TREASURY RECEIVER INTRODUCED | PASS |
| NO TEST-ONLY QUOTE POLICY USED FOR PRODUCTION | PASS (production policies empty; proposed values not ratified) |
| NO UNVERIFIED STABLE PRICE SOURCE INTRODUCED | PASS (stables NotActive) |
| NO STALE PANCAKE ROUTER IN PRODUCTION PATH | PASS after BSC constant fix |

---

## 26. Test Evidence

| Suite | Result |
| --- | --- |
| LB003 / LB005 / LB006 / LB007 regressions | Required before commit |
| `LB008MainnetBinding` | Unit binding + floor math |
| `validate-lb-v1-inputs.mjs` | Expect BLOCKED |
| Dry-run script | Structure OK / broadcast blocked |

---

## 27. Blocker Disposition

| ID | Before LB008 | Work completed | After LB008 | Remaining fix | Verification |
| --- | --- | --- | --- | --- | --- |
| LB-G02A | CLOSED IN CODE | Preserved | CLOSED IN CODE | — | LB007 |
| LB-G02B | OPEN | Deferred | OPEN | LB009 observer/decision | Mission scope |
| LB-G03A | CLOSED IN CODE | Preserved | CLOSED IN CODE | — | LB006 |
| LB-G03B | OPEN | Discovery + handoff | OPEN | Provision non-exportable KMS authority | Address + policy evidence |
| LB-G03C | OPEN | Deferred | OPEN | LB009 relay | Mission scope |
| LB-G04A | CLOSED IN CODE | Preserved | CLOSED IN CODE | — | LB006 |
| LB-G04B | OPEN | Discovery + handoff | OPEN | Canonical Treasury receiver contract | Bytecode + role |
| LB-G04C | OPEN | Schema/handoff | OPEN | Runtime LB ingestion | Finalized receipt test |
| LB-G07 | OPEN | Melega BSC router fix | **CLOSED** | — | Address audit |
| LB-G08 | OPEN | Floors calculated | OPEN | Founder ratification | RATIFIED status |
| LB-G09 | OPEN | Reserves probed | OPEN | Safe stable gas path | Per-asset |
| LB-G10 | OPEN | Evidence collected | OPEN | Ops finality certification | FINALITY_15_CONFIRMED |
| LB-G11 | OPEN | Handoff | OPEN | DER/low-s/v in KERL | Authorizer accept |
| LB-G12 | OPEN | Handoff | OPEN | Runtime ACCOUNTED path | End-to-end |

---

## 28. Recommended Next Mission

**LB009 — Liquidity Building Autonomous Runtime, Eligible Flow and First Mainnet Cycle**

Only after LB008 production blockers required for deployment/signing/Treasury are closed.

Do not activate observer, AI strategy engine, epoch scheduler, or broadcast relay until then.
