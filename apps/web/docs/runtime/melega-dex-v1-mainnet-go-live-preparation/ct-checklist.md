# Create Token Factory — Operator Deployment Checklist

Canonical order position: **2 of 2** (after Liquidity Builder sequence completes when both are authorized).

Fee recipient: `0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b`  
Creation fee (immutable constructor): **0.10 BNB** = `CT_CREATION_FEE_WEI=100000000000000000`  
Do not invent fee. Do not invent factory address. Do not bind until verified.

---

## 1. Preflight

- [ ] Liquidity Builder track either LIVE/BOUND or independently documented as not sharing the unavailable signer (order still LB → CT when both go live)
- [ ] `BNB_MAINNET_RPC_URL` set; chainId 56
- [ ] `MAINNET_DEPLOYER` set; deployer funded; nonce recorded
- [ ] `CT_FEE_FOUNDER_APPROVED=1`
- [ ] `CT_CREATION_FEE_WEI=100000000000000000`
- [ ] `CT_FEE_RECIPIENT=0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b` (exact match required by script)
- [ ] `BSCSCAN_API_KEY` set
- [ ] Fork validate: deploy factory + create ≥3 tokens on fork (no `--broadcast`)
- [ ] Confirm factory retains 0 BNB after fee forward; Treasury receives exact fee each create
- [ ] Set `CT_MAINNET_DEPLOY_AUTHORIZED=1` only after fork PASS

## 2. Broadcast

- [ ] `forge script script/create-token/DeployMelegaTokenFactoryMainnet.s.sol:DeployMelegaTokenFactoryMainnet --rpc-url $BNB_MAINNET_RPC_URL --broadcast --verify`
- [ ] Record: factory address, tx hash, block, deployer, nonce, gas, constructor args
- [ ] On-chain `creationFee()` == `100000000000000000`
- [ ] On-chain `feeRecipient()` == Treasury
- [ ] Factory BNB balance == 0

## 3. Verification

- [ ] Factory verified on BscScan
- [ ] Constructor args match evidence
- [ ] Prepare token-template verification method for child `MelegaFixedSupplyToken` (do not claim automatic child verification unless proven)
- [ ] `eth_getCode(factory)` non-empty

## 4. Binding

- [ ] Update `deployments/create-token/chain-56/deployed-addresses.v1.json` with factual factory + tx + block
- [ ] Update `apps/web/src/config/constants/createTokenFactoryDeployment.ts` factoryAddress (fee already APPROVED)
- [ ] Flip `LIST_CREATE_TOKEN_AVAILABLE` only after certification criteria met
- [ ] No scattered factory literals outside SSOT

## 5. Factory verification (post-bind)

- [ ] `/api/create-token/readiness` → READY with bytecode proof
- [ ] UI shows factory address, 0.10 BNB fee, Treasury recipient, fixed supply, no mint/tax/blacklist/pause

## 6. Frontend verification

- [ ] Create Token CTA execution enabled only when bound + wallet + chain 56 + fee balance
- [ ] User-facing copy does not show Founder-fee-pending (fee already APPROVED)
- [ ] No READY claim from env alone

## 7. Local / child canary policy

- [ ] Do **not** broadcast a production child token without explicit approved name/symbol/owner/supply
- [ ] If identity not approved: simulate against deployed factory → `FACTORY_DEPLOYED_AND_BOUND_CHILD_CANARY_PENDING_APPROVAL`
- [ ] Never fabricate TokenCreated success
