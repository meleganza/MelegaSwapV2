# MISSION REPORT — Public Farm Factory Mainnet READY

**Mission ID:** `MELEGA_DEX_V1_PUBLIC_FARM_FACTORY_VALIDATION_BINDING_AND_READY`  
**Severity:** P0  
**Baseline:** `e416cc15` · `melega-dex-v1-public-farm-factory-mainnet-deployment-execution`  
**Branch:** `melega-dex-v1-public-farm-factory-validation-and-ready`  
**Verdict:** `MELEGA_DEX_V1_PUBLIC_FARM_FACTORY_MAINNET_READY`

---

## Deployed factory (no redeploy)

| Field | Value |
| --- | --- |
| Address | `0x89Ffa439B197FE98f0F5388E00EdF1eBfD80D7E9` |
| Transaction | `0xe610b16eaf2b94a3b69fce7a684b099eaa4e9ffdb9200c1007df4f2544a61603` |
| Block | `113533796` |
| Deployer | `0xB6eEb3ab9695979F5b2Ef6Df4112e63212E33EE0` (MELEGA DEPLOYER) |
| Certified artifact | `apps/web/src/lib/deployment-orchestrator/artifacts/pff-v1-certified.json` |

---

## Part A — Receipt + runtime

- Receipt `status = 0x1` (success)
- Sender = MELEGA DEPLOYER
- Created address matches factory
- Runtime bytecode present (5870 bytes)
- Masked runtime SHA-256 matches certified artifact  
  `0x02aab35245724fc9c8e756a0643c8dbbb1aef28a20d4e3ff111b5a183a36cee9`
- Not a proxy

Evidence: `receipt.json`, `runtime-validation.json`

---

## Part B — Constructor / economics

| Rule | On-chain / SSOT |
| --- | --- |
| MARCO pair fee | FREE (`0`) |
| Non-MARCO fee | `0.25` BNB (`250000000000000000` wei) |
| Fee recipient | `0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b` (MELEGA TREASURY) |
| MARCO token | `0x963556de0eb8138E97A85F0A86eE0acD159D210b` |
| Pair factory | `0xb7E5848e1d0CB457f2026670fCb9BbdB7e9E039C` |
| Eligibility signer | MELEGA DEPLOYER |
| Owner / admin bypass | none |
| Treasury Runtime | none |
| Proxy | none |

Evidence: `constructor-validation.json`, `economics-validation.json`

---

## Part C — Liquidity eligibility

- Minimum LP TVL: `0.25` BNB
- Below threshold → `REQUIRE_LIQUIDITY_INCREASE` (remediation, not hard-block of pair creation)
- No pair → create-pair flow

Evidence: `liquidity-eligibility-proof.json`

---

## Part D — Reward rules

- Public factory rejects MARCO reward tokens
- MasterBuilder / MasterChef.add never exposed
- MasterBuilder MARCO farms remain separate / protocol-only

Evidence: `reward-rules-proof.json`

---

## Part E — Binding

Bound only:

- `publicFarmFactoryAddress` / `PUBLIC_FARM_FACTORY_ADDRESS`

Untouched:

- Liquidity Builder bindings
- Create Token Factory binding
- Smart Swap
- Treasury Runtime
- KERL

Evidence: `binding-proof.json`

---

## Part F — Frontend sync

| Before | After |
| --- | --- |
| `factoryAddress = null` | `0x89Ffa439B197FE98f0F5388E00EdF1eBfD80D7E9` |
| Create Farm blocked | `A_PERMISSIONLESS_FACTORY_AVAILABLE` |
| Founder required for user create | Founder not involved |

Lifecycle: **DEPLOYED → VALIDATED → BOUND → READY**

Evidence: `frontend-sync-proof.json`, `readiness.json`

---

## Part G — User flow

Create Farm → Select LP Pair → Existing or Create Pair → Liquidity check  
→ if TVL &lt; 0.25 BNB: REQUIRE_LIQUIDITY_INCREASE → Configure rewards → Create Farm  

No MasterBuilder dependency. No Founder approval for user creation.

---

## Screenshots

- `01-factory-validated.png`
- `02-factory-bound.png`
- `03-create-farm-ready.png`

---

## Constraints honored

- No redeploy
- No contract / economics changes
- No LB / Create Token / Smart Swap / Treasury Runtime / KERL modifications
- No merge / no PR
