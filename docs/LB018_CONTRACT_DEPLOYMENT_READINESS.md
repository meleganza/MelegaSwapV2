# LB018 — Contract Deployment Readiness

**Mission:** LB018  
**Assessed:** `2026-07-20T01:40:00Z`  
**Baseline:** LB017 `35fa35df321f5090f000b0c70c1faccf38a3b34f`  
**Validator:** `DEPLOYMENT_INPUTS_BLOCKED`  
**Activation authorized:** **false**  
**Mainnet deploy:** **NOT PERFORMED**

Scope: Melega DEX → Liquidity Studio → Liquidity Building only.  
No Civilization / BC003S / Genesis Gas / Treasury architecture / external authority implementation.

---

## Contract matrix

| Contract | Status | Address | Blocker |
| --- | --- | --- | --- |
| LiquidityBuildingFactoryV1 | SOURCE READY / NOT_DEPLOYED | `null` | Inputs BLOCKED — no production CREATE |
| LiquidityBuildingProgramV1 (implementation) | SOURCE READY / NOT_DEPLOYED | `null` (template via Factory) | Same — Factory not deployed |
| LiquidityBuildingExecutionAuthorizerV1 | SOURCE READY / NOT_DEPLOYED | `null` | LB-G03B / LB-G11 — no production authority |
| LiquidityBuildingTreasuryFeeSinkV1 | SOURCE READY / NOT_DEPLOYED | `null` | LB-G04B — no Treasury receiver |
| Canonical Melega Factory | BOUND | `0xb7E5848e1d0CB457f2026670fCb9BbdB7e9E039C` | None |
| Canonical Melega Router | BOUND | `0xc25033218D181b27D4a2944Fbb04FC055da4EAB3` | None |

Bytecode hashes recorded in `LiquidityBuildingV1.inputs.json#bytecode` for Authorizer / Sink / Factory. Program linked-library hash deferred until production CREATE.

---

## Gate checks (pre-deploy — must not bypass)

| Check | Result |
| --- | --- |
| productionAuthority | FAIL — address null, `AUTONOMOUS_AUTHORITY_NOT_READY` |
| Treasury receiver | FAIL — `receiverAddress` null |
| Fee Sink | FAIL — `feeSinkAddress` null |
| quotePolicies | FAIL — `[]` (LB-G08) |
| deployment validator | `DEPLOYMENT_INPUTS_BLOCKED` |
| chain configuration | PASS — chainId `56` |
| activation-gate-final | `activationAuthorized=false`, `mainnetCycleAuthorized=false` |
| BscScan helper | `BLOCKED_NO_ADDRESS` |

**Decision:** Do **not** deploy. Do **not** insert temporary addresses, test addresses, Founder wallets, or mock Treasury.

---

## Tooling present (simulation only)

| Asset | Role |
| --- | --- |
| `script/liquidity-building/DryRunDeployLiquidityBuildingV1.s.sol` | Local dry-run; `runBroadcastBlocked()` rejects broadcast |
| `deployments/liquidity-building/validate-lb-v1-inputs.mjs` | Fail-closed validator |
| `deployments/liquidity-building/bscscan-verification-helper.mjs` | Verify template after addresses exist |

---

## Frontend binding today

`LB_DEPLOYED_ADDRESSES` = all `null`  
`resolveProductionBinding(...)` rejects candidates while inputs are BLOCKED.

---

## Exact blockers preventing deploy

1. **LB-G03B** — KMS/HSM production authority  
2. **LB-G11** — production signature verification  
3. **LB-G04B** — Treasury LB receiver  
4. **LB-G04C / LB-G12** — Treasury Runtime ingestion / ACCOUNTED  
5. **LB-G08** — Founder quote policy ratification  
6. **LB-G03C** — permissionless relay (runtime post-deploy)  
7. **LB-G10** — finality evidence  

Machine artifact: `deployments/liquidity-building/chain-56/lb018-deployment-binding.v1.json`
