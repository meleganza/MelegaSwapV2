# Liquidity Builder — Operator Deployment Checklist

Canonical order position: **1 of 2** (must complete before Create Token when both tracks are authorized).

Treasury destination (FeeReceiver beneficiary / fee path): `0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b`  
Protocol fee: **1000 bps (10%)** — already aligned in contracts.  
Do not invent addresses. Do not bind until BscScan verifies bytecode.

---

## 1. Preflight

- [ ] Working tree clean on `melega-dex-v1-mainnet-go-live-preparation` (or successor deploy branch)
- [ ] `BNB_MAINNET_RPC_URL` set; `eth_chainId` returns `0x38` (56)
- [ ] `eth_blockNumber` and `eth_estimateGas` succeed
- [ ] `MAINNET_DEPLOYER` set (Foundry broadcast key — never commit)
- [ ] Deployer address derived; BNB balance funded; nonce recorded
- [ ] `LB_PRODUCTION_AUTHORITY` = KMS-derived production authority address (non-zero)
- [ ] `LB_FEE_RECEIVER_GOVERNOR` set
- [ ] `LB_FEE_RECEIVER_BENEFICIARY` = canonical Treasury (or Founder-approved beneficiary matching governance)
- [ ] `AWS_KMS_KEY_ID` present for post-deploy runtime signing path
- [ ] `BSCSCAN_API_KEY` set
- [ ] `LiquidityBuildingV1.inputs.json` updated toward `PRODUCTION_READY` (authority + fee sink bindings)
- [ ] `node deployments/liquidity-building/validate-lb-v1-inputs.mjs` → `DEPLOYMENT_INPUTS_VALID`
- [ ] Fork dry-run: `forge script script/liquidity-building/DeployLiquidityBuildingV1Mainnet.s.sol:DeployLiquidityBuildingV1Mainnet --rpc-url $BNB_MAINNET_RPC_URL` (**no** `--broadcast`)
- [ ] Confirm constructor: `successFeeBps == 1000`, Melega factory/router constants, WBNB floors
- [ ] Set `LB_MAINNET_DEPLOY_AUTHORIZED=1` only after fork PASS

## 2. Broadcast

- [ ] `node deployments/liquidity-building/attempt-mainnet-activation.mjs` (gates green)
- [ ] `forge script script/liquidity-building/DeployLiquidityBuildingV1Mainnet.s.sol:DeployLiquidityBuildingV1Mainnet --rpc-url $BNB_MAINNET_RPC_URL --broadcast --verify`
- [ ] Record: deployer, nonces, tx hashes, gas used, contract addresses (FeeReceiver → Authorizer → FeeSink → Program impl → Factory)
- [ ] Confirm no unrelated txs in the same session

## 3. Verification

- [ ] Every LB contract verified on BscScan (source match, optimizer, constructor args)
- [ ] Store explorer links + verification results (never mark verified until explorer confirms)
- [ ] Runtime bytecode at each address non-empty (`eth_getCode`)

## 4. Binding

- [ ] Write factual addresses into `deployments/liquidity-building/chain-56/deployed-addresses.v1.json`
- [ ] `node deployments/liquidity-building/sync-frontend-binding.mjs`
- [ ] Confirm `apps/web/src/config/constants/liquidityBuildingDeployment.ts` matches registry
- [ ] Grep: no scattered fabricated LB address literals outside SSOT

## 5. Runtime verification

- [ ] `/api/liquidity-building/readiness` → READY only with bytecode present
- [ ] `/api/liquidity-building/health` healthy
- [ ] `/api/liquidity-building/activation-status` reflects bound addresses
- [ ] Authority / FeeSink roles match approved model on-chain

## 6. Frontend verification

- [ ] Liquidity Builder activation CTA enabled only with wallet + valid configuration
- [ ] Obsolete null-deployment warning removed after factual binding
- [ ] Liquidity Studio surfaces do not claim LIVE without bound addresses

## 7. Canary

- [ ] Only if separately authorized: minimal-value mainnet canary via certified path
- [ ] Else: `eth_call` / `estimateGas` against deployed bytecode → classify `DEPLOYED_AND_BOUND_CANARY_PENDING`
- [ ] Never fabricate a successful canary
