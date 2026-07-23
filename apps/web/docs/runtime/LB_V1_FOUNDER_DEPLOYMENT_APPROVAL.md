# Liquidity Building V1 — Founder Deployment Approval

**Mission:** LB-ACT-004  
**Status:** DRAFT — NOT APPROVED — NO BROADCAST AUTHORIZED  
**Chain:** BNB Smart Chain mainnet (`56`)

This document must be completed before any mainnet deployment transaction is broadcast.  
KMS signing is mandatory. No private key may be requested or used.  
Do **not** spend the MELEGA TREASURY WALLET without an explicit funding line below.

---

## Contracts to deploy (minimum set)

| # | Contract | Source |
|---|----------|--------|
| 1 | LiquidityBuildingTreasuryFeeReceiverV1 | `contracts/liquidity-building/LiquidityBuildingTreasuryFeeReceiverV1.sol` |
| 2 | LiquidityBuildingExecutionAuthorizerV1 | `contracts/liquidity-building/LiquidityBuildingExecutionAuthorizerV1.sol` |
| 3 | LiquidityBuildingTreasuryFeeSinkV1 | `contracts/liquidity-building/LiquidityBuildingTreasuryFeeSinkV1.sol` |
| 4 | LiquidityBuildingProgramV1 (implementation) | `contracts/liquidity-building/LiquidityBuildingProgramV1.sol` |
| 5 | LiquidityBuildingFactoryV1 | `contracts/liquidity-building/LiquidityBuildingFactoryV1.sol` |

Math library is linked as required by the Program build — not an independent economic authority.

---

## Exact deployer / signing authority

| Field | Value | Status |
|-------|-------|--------|
| Deployer identity | _______________________________ | MISSING |
| Signing model | AWS KMS secp256k1 non-exportable (or equivalent HSM) | REQUIRED |
| Hot key / mnemonic | FORBIDDEN | BLOCKED if present |
| KMS key id / alias | _______________________________ | MISSING |
| AWS region | _______________________________ | MISSING |
| Derived executor / Authorizer signingAuthority | _______________________________ | MISSING |

---

## Exact chain

- chainId: **56**
- Melega Factory: `0xb7E5848e1d0CB457f2026670fCb9BbdB7e9E039C`
- Melega Router: `0xc25033218D181b27D4a2944Fbb04FC055da4EAB3`
- MasterChef / MasterBuilder: `0x41D5487836452d23f2c467070244E5842B412794`

---

## Predicted / expected addresses

| Contract | Expected address |
|----------|------------------|
| FeeReceiver | _________________ (MISSING — fill after CREATE / CREATE2 prediction) |
| Authorizer | _________________ |
| FeeSink | _________________ |
| Program implementation | _________________ |
| Factory | _________________ |

CREATE2 salts: **NOT_APPLICABLE** until a deterministic pack is approved.

---

## Exact constructor inputs

### FeeReceiver

- `governor_`: _________________  
- `beneficiary_`: _________________  

### Authorizer

- `signingAuthority_`: _________________ (KMS-derived EVM address; immutable)

### FeeSink

- `treasuryReceiver_`: FeeReceiver address above (must have bytecode; **not** Vault `0xb2d57B1A40E61AAb3F88361228E1188E0fB6A21C`)

### Factory

- `factoryVersion_`: `keccak256("LiquidityBuildingFactoryV1")` / string version per source  
- `implementation_`: Program implementation  
- `melegaFactory_`: `0xb7E5848e1d0CB457f2026670fCb9BbdB7e9E039C`  
- `melegaRouter_`: `0xc25033218D181b27D4a2944Fbb04FC055da4EAB3`  
- `executionAuthorizer_`: Authorizer  
- `treasuryFeeSink_`: FeeSink  
- `ProtocolParameters`: from `LiquidityBuildingV1.inputs.json` (`successFeeBps=500`, `initialFinalityDepth=15`, …)  
- `QuoteAssetPolicy[]`: only after Founder ratifies `LB_QUOTE_POLICY_FOUNDER_DECISION.md`

---

## Exact fee receiver

- Purpose-specific `LiquidityBuildingTreasuryFeeReceiverV1`  
- Vault `0xb2d57B1A40E61AAb3F88361228E1188E0fB6A21C` remains **INVALID** unless new code evidence overturns rejection

---

## Exact quote policy

- See `LB_QUOTE_POLICY_FOUNDER_DECISION.md`  
- Gate LB-G08 blocked until ratification evidence exists  
- Initial intent: WBNB only

---

## Gas estimate / maximum authorized BNB spend

| Field | Value |
|-------|-------|
| Estimated total gas | _________________ (MISSING — run forge estimate with final constructors) |
| Max authorized BNB | _________________ |
| Funding source | _________________ (explicit; no automatic treasury spend) |

---

## Exact deployment order

1. FeeReceiver  
2. Authorizer  
3. FeeSink  
4. Program implementation (+ library)  
5. Factory  
6. Artifact publish / verification  

---

## Rollback limits

- No upgrade path on Authorizer `signingAuthority` (immutable) — replacement requires new Authorizer + Factory  
- Pause via Factory/governor only after deploy  
- Do not migrate historical Programs onto a replaced Authorizer  
- If FeeReceiver governor compromised: pause Factory programs; recover ERC-20 via governor → beneficiary only if still safe

---

## Post-deployment checks (read-only first)

1. Bytecode verification on BscScan for all five contracts  
2. FeeSink.treasuryReceiver() == FeeReceiver  
3. Authorizer.signingAuthority() == KMS address  
4. Factory.successFeeBps() == 500  
5. Factory.initialFinalityDepth() == 15  
6. Factory quote policy row matches ratified WBNB floors  
7. Update `LiquidityBuildingV1.inputs.json` addresses + validator PASS  
8. Activation API: execution blockers clear for contract/fee-receiver fields  
9. No canary swap/LP until FounderActivationApproved ∧ all execution-critical gates READY  

---

## Explicit Founder approval field

- [ ] I have reviewed `LB_V1_PRODUCTION_DEPLOYMENT_INPUTS.md` / `.json`  
- [ ] I have ratified or deferred quote policy per `LB_QUOTE_POLICY_FOUNDER_DECISION.md`  
- [ ] I authorize mainnet broadcast of the contracts listed above only  
- [ ] Maximum BNB spend authorized: _____________  
- [ ] I understand this does **not** by itself set `activationAuthorized=true`  

**Founder name:** _______________________  
**Date (UTC):** _______________________  
**Attestation:** _______________________  

**Approval state:** `NOT_APPROVED`
