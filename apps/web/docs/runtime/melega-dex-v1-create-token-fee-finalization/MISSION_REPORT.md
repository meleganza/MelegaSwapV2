# MISSION REPORT — Create Token Factory Fee Finalization

**Mission ID:** `MELEGA_DEX_V1_CREATE_TOKEN_FACTORY_FEE_FINALIZATION`  
**Baseline:** `melega-dex-v1-lb-and-create-token-mainnet-activation` @ `7a134b4c`  
**Branch:** `melega-dex-v1-create-token-fee-finalization`  
**Assessed:** 2026-07-30T13:00:00.000Z

## Verdict

`MELEGA_DEX_V1_CREATE_TOKEN_FACTORY_FEE_FINALIZATION_CERTIFIED`

## Governance decision

| Field | Value |
|---|---|
| Creation fee (BNB) | **0.05** |
| Creation fee (wei) / `CT_CREATION_FEE_WEI` | **50000000000000000** |
| Decimals | 18 |
| Decision | **APPROVED** (replaces `CT_CREATION_FEE_FOUNDER_DECISION_REQUIRED`) |
| Immutable | yes — constructor input |
| Fee recipient | `0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b` |

## Explicit non-actions

- No mainnet deploy
- No fabricated transaction
- No fabricated factory address
- No frontend factory binding (`factoryAddress` remains `null`)
- `LIST_CREATE_TOKEN_AVAILABLE` remains `false`

## Remaining deployment blockers

Only **production deployment authority**:

- `MAINNET_DEPLOYER`
- `CT_MAINNET_DEPLOY_AUTHORIZED=1`
- `BNB_MAINNET_RPC_URL`
- `BSCSCAN_API_KEY` (verification)

Operational env when broadcasting must also set:

- `CT_FEE_FOUNDER_APPROVED=1`
- `CT_CREATION_FEE_WEI=50000000000000000`
- `CT_FEE_RECIPIENT=0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b`

## Validation

| Suite | Result |
|---|---|
| Forge Create Token | **PASS** 16/16 |
| Frontend readiness (`createTokenFactoryLaunch`) | **PASS** 11/11 |
| `yarn next build` | **PASS** |

## Packages updated

- `deployments/create-token/chain-56/deployed-addresses.v1.json`
- `deployments/create-token/ENV.md`
- `apps/web/src/config/constants/createTokenFactoryDeployment.ts`
- `apps/web/src/views/ListStudio/createTokenReadiness.ts`
- Create Token factory evidence pack under `melega-dex-v1-create-token-factory-and-launch-system/`
- Prior activation CT evidence under `melega-dex-v1-lb-and-create-token-mainnet-activation/`
