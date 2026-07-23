# Liquidity Building V1 — Production Deployment Inputs Pack

**Mission:** LB-ACT-004  
**Machine-readable twin:** `lb-v1-production-deployment-inputs.json`  
**Assessed (UTC):** 2026-07-23T00:20:00Z  
**Rule:** null / unverified values are never treated as valid. Status ∈ {VERIFIED, APPROVED, MISSING, BLOCKED, NOT_APPLICABLE}.

---

## Summary

| Field | Value | Status |
|-------|-------|--------|
| chainId | `56` | VERIFIED |
| Melega Factory | `0xb7E5848e1d0CB457f2026670fCb9BbdB7e9E039C` | VERIFIED |
| Melega Router | `0xc25033218D181b27D4a2944Fbb04FC055da4EAB3` | VERIFIED |
| MasterBuilder / MasterChef | `0x41D5487836452d23f2c467070244E5842B412794` | VERIFIED |
| feeBps | `500` | VERIFIED |
| Treasury fee receiver | `null` | MISSING |
| KMS executor address | `null` | MISSING |
| relay URL | `null` | MISSING |
| relay authority identity | `null` | MISSING |
| quote policy version | `null` | MISSING |
| quote assets | WBNB proposed; USDT/USDC NOT_ACTIVE | BLOCKED |
| finality policy | depth `15`, verdict INSUFFICIENT | BLOCKED |
| governor | `null` | MISSING |
| pause authority | `null` | MISSING |
| LP ownership policy | Program-configured LP owner | VERIFIED |
| Authorizer constructor | signingAuthority missing | BLOCKED |
| FeeSink constructor | treasuryReceiver missing | BLOCKED |
| Factory constructor | authorizer/sink/impl/policies incomplete | BLOCKED |
| bytecode hashes (core pack) | Authorizer/FeeSink/Factory/Math frozen | VERIFIED |
| Program linked bytecode hash | deferred | MISSING |
| FeeReceiver bytecode hash | source added; hash pending compile freeze | MISSING |
| predicted addresses | no CREATE2 pack | NOT_APPLICABLE |
| deployment order | documented below | APPROVED |
| required gas | not estimated for production identities | MISSING |
| deployment funding source | not authorized | BLOCKED |
| approval status | PENDING_FOUNDER | BLOCKED |

---

## Invalid fee receiver (locked)

| Candidate | Address | Status | Reason |
|-----------|---------|--------|--------|
| MELEGA_VAULT_BSC | `0xb2d57B1A40E61AAb3F88361228E1188E0fB6A21C` | BLOCKED | Named Vault only; LB fee-sink role unproven (code_bytes=9883) |

Preferred purpose-specific receiver (not deployed):

- Source: `contracts/liquidity-building/LiquidityBuildingTreasuryFeeReceiverV1.sol`
- Constructor: `(governor, beneficiary)`
- Role: hold ERC-20 success fees pushed by FeeSink; governor recovery to beneficiary
- Must **not** authorize epochs / issue tickets / own user LP

---

## Deployment order (APPROVED sequence; broadcast still forbidden)

1. `LiquidityBuildingTreasuryFeeReceiverV1(governor, beneficiary)`
2. `LiquidityBuildingExecutionAuthorizerV1(signingAuthority)` — KMS-derived address only
3. `LiquidityBuildingTreasuryFeeSinkV1(treasuryReceiver)` — receiver must have code
4. `LiquidityBuildingProgramV1` implementation (+ library link)
5. `LiquidityBuildingFactoryV1(factoryVersion, implementation, melegaFactory, melegaRouter, authorizer, feeSink, protocolParameters, quotePolicies)` with `successFeeBps == 500`
6. Publish addresses into `LiquidityBuildingV1.inputs.json` + activation gate evidence rows

---

## Canonical on-chain flow (do not rewrite)

`executeLiquidityBuilding`:

1. consume eligible bounded project-token budget  
2. swap into quote asset  
3. `fee = grossQuote * 500 / 10000`  
4. transfer fee through FeeSink to immutable Treasury receiver  
5. add liquidity with net quote + matched project tokens  
6. send LP ownership to configured owner  
7. emit execution evidence  
8. revert atomically if fee transfer or liquidity creation fails  

---

## Blocker list (execution / deployment)

LB-G03B, LB-G11, LB-G03C, LB-G04B, LB-G08, LB-G10, TREASURY_FEE_RECEIVER_MISSING, DEPLOYMENT_INPUTS_BLOCKED, CONTRACTS_NOT_DEPLOYED, FOUNDER_ACTIVATION_NOT_APPROVED

**Accounting async (must not block activation):** LB-G04C, LB-G12
