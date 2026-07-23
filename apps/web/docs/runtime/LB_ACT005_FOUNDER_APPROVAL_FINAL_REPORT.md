# LB-ACT-005 — Founder Approval Final Report

**Mission:** COMPLETE FOUNDER POLICY AND DEPLOYMENT APPROVAL PACKS FOR LIQUIDITY BUILDING V1  
**Assessed (UTC):** 2026-07-23T01:10:00Z

---

## 1. Verdict

**LIQUIDITY_BUILDING_FOUNDER_APPROVAL_PACK_READY**

Both Founder documents are complete and Founder-readable. Verified values are populated; proposed values are explicit; KMS/relay gaps are separated as AWAITING INFRA / BLOCKED; gas and maximum BNB are calculated; go/no-go matrix is complete; no deployment occurred; branch pushed with clean tree.

---

## 2. Branch

`mission-lb-act-005-founder-approval`

---

## 3. Commit

`f76fab5eaf8f5d243d48c747635a4ea48da22de9`

Baseline content derived from `origin/main` `0925f9f3`.

---

## 4. Quote policy summary

| Item | Value |
|------|-------|
| Version | `melega.lb.quote-policy.v1` (PROPOSED) |
| Chain | 56 |
| Enabled (proposed) | WBNB only |
| Disabled (proposed) | USDT, USDC |
| Locally enforceable | Yes |
| Treasury Runtime required | **No** |
| Deploys anything? | **No** |
| Document | `LB_QUOTE_POLICY_FOUNDER_DECISION.md` |
| quotePolicyHash | `0x6905d8975f7335dcaf293a73a8e25ed35065ddaf1ec754c0adf035f94dc451b7` |

---

## 5. Proposed quote assets

| Asset | Address | Enabled | Recommendation |
|-------|---------|---------|----------------|
| WBNB | `0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c` | PROPOSED true | ENABLE for v1 |
| USDT | `0x55d398326f99059fF775485246999027B3197955` | PROPOSED false | KEEP DISABLED (thin Melega reserves / LB-G09) |
| USDC | `0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d` | PROPOSED false | EXCLUDE from v1 enabled set |

---

## 6. Proposed risk limits

| Limit | Value | Status |
|-------|-------|--------|
| Min execution (WBNB gross) | `41052631578947370` wei (~0.04105) | PROPOSED |
| Min quote reserve (WBNB) | `10263157894736842500` wei (~10.263) | PROPOSED |
| Absolute max / epoch (WBNB) | `205263157894736850` wei (~0.205 = 5× floor) | PROPOSED (Founder may choose relative-only) |
| Slippage op/hard | 50 / 100 bps | VERIFIED |
| Impact op/hard | 40 / 100 bps | VERIFIED |
| Finality | 15 confirmations | VERIFIED |
| Default epoch | 300 s | VERIFIED |
| Fee | 500 bps gross quote | VERIFIED |

---

## 7. Founder decision fields

Present at top of quote doc and deployment doc:

- APPROVE AS PROPOSED / APPROVE WITH CHANGES / REJECT  
- Approval name / date / reference  
- Maximum BNB / funding source / KMS signer blanks  

`founderActivationApproved` remains **false** and must not be set by this mission.

---

## 8. Contract deployment pack

Minimum set (6): FeeReceiver → Authorizer → FeeSink → Math → Program impl → Factory.

Frozen bytecode hashes match inputs for Authorizer / FeeSink / Factory / Math.  
Program production linked hash still **MISSING**.  
FeeReceiver local compile hash recorded.  
Vault `0xb2d57B1A…A21C` marked **NOT VALID FOR LIQUIDITY BUILDING FEE RECEIPT**.  
contractPackHash: `0x3192d6d89858e74d0ce6b2fb146a381a10230694af598fb660ed7ab60c2d2c7b`

---

## 9. FeeReceiver design

- Minimal `LiquidityBuildingTreasuryFeeReceiverV1`  
- Accepts ERC-20 via FeeSink forward; retains until governor recovery to beneficiary  
- Settlement events on **FeeSink** (program/execution references)  
- Does not authorize execution, hold LP, hold project budget, or need Treasury Runtime  
- Native BNB not accepted; WBNB preferred  
- Governor + beneficiary = **AWAITING FOUNDER DECISION**

---

## 10. KMS state

| Item | Status |
|------|--------|
| Address | BLOCKED (`null`) |
| productionKmsVerified | BLOCKED (`false`) |
| Hot-key fallback | FORBIDDEN (VERIFIED policy) |
| Owner | External KERL/ops — AWAITING INFRA |
| Prompt | `LB_ACT004_FOLLOWUP_KMS_RELAY_PROMPTS.md` Prompt 1 |

---

## 11. Relay state

| Item | Status |
|------|--------|
| URL / status | BLOCKED (`DISABLED`) |
| Selector `executeLiquidityBuilding` | `0xe8ef6644` VERIFIED |
| Allowlist / health | AWAITING INFRA |
| Prompt | Follow-up Prompt 2 |

---

## 12. Finality state

Depth **15** VERIFIED. Gate LB-G10 still **BLOCKED** (`FINALITY_EVIDENCE_INSUFFICIENT`). Treasury Runtime not required.

---

## 13. Gas estimate

| Metric | Value |
|--------|-------|
| Method | forge compile + CREATE heuristic ×1.15 |
| Total estimated gas | `10,694,739` |
| Spot gas price | `0.05 gwei` @ block `111574308` |
| Conservative price | `3 gwei` |
| Expected spend (conservative) | ~`0.03208` BNB |
| Contingency | 30% |
| Local dry-run gas used (subset simulation) | `7,986,317` (no FeeReceiver; local mocks) |

---

## 14. Maximum BNB approval

**PROPOSED Founder ceiling: `0.05` BNB**  
Funding reference only: `0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b` (not deployer / not KMS).  
Status: `AWAITING_APPROVAL`.

---

## 15. Go/no-go matrix

Documented in `LB_V1_FOUNDER_DEPLOYMENT_APPROVAL.md`.  
**Verdict: NO-GO** while Founder / KMS / relay / finality / Program hash rows remain open.

---

## 16. Machine-readable pack

`apps/web/docs/runtime/lb-v1-founder-approval-pack.json`  
packHash: `0xf65fc748e5af3786601afadd260dbab5489e960b9537e74641e49f92e7f662a1`  
Schema statuses validated (no invalid status labels; nulls carry status + explanation).

---

## 17. Tests

| Check | Result |
|-------|--------|
| JSON schema/status walk | PASS |
| Foundry `LBAct004TreasuryFeeReceiverTest` | PASS (4 tests) |
| Dry-run deploy simulation | PASS — `DRY_RUN_STRUCTURE_OK - PRODUCTION_BROADCAST_BLOCKED` |
| Fee 500 bps | PASS |
| Vault rejection marker | PASS |
| No hot-key config | PASS |
| No sync Treasury dependency for quote/fee | PASS |
| `founderActivationApproved` remains false | PASS |

---

## 18. Build

Application runtime files unchanged → production `next build` not required for this docs/validation mission.  
Contract compilation via `forge` succeeded for dry-run / FeeReceiver tests.

---

## 19. Remaining external blockers

1. Founder quote + deployment signatures  
2. FeeReceiver governor / beneficiary  
3. KMS address + productionKmsVerified  
4. Bounded relay READY  
5. Finality ops evidence (LB-G10)  
6. Program linked bytecode hash freeze  

---

## 20. Exact Founder actions

1. Open `LB_QUOTE_POLICY_FOUNDER_DECISION.md` — choose APPROVE / CHANGES / REJECT; fill name/date/reference.  
2. Open `LB_V1_FOUNDER_DEPLOYMENT_APPROVAL.md` — nominate FeeReceiver governor + beneficiary; accept or amend `0.05` BNB max; sign.  
3. Do **not** broadcast; do **not** set `founderActivationApproved`.  

---

## 21. Exact next mission after approval

Run external KMS bind + bounded relay missions (`LB_ACT004_FOLLOWUP_KMS_RELAY_PROMPTS.md`), revalidate deployment inputs, then a **Founder-authorized deploy mission** that broadcasts only after Go/No-Go is all PASS.

---

## FINAL VERDICT

**LIQUIDITY_BUILDING_FOUNDER_APPROVAL_PACK_READY**
