# Liquidity Building — Founder Mainnet Test Checklist

**Status:** DO NOT SIGN yet.  
**Reason:** Production activation APIs report `activationAuthorized: false` and `contractsDeployed: false`.  
**Production commit:** `68613b8c25a8c9ff102846b7499facd09273fc7b`  
**Canonical URL:** https://www.melega.finance/liquidity-studio?view=building

This checklist is prepared for the first Founder-signed mainnet canary **after** all read-only gates flip to ready. Until then, treat every signing step as blocked.

---

## Gate that must be green before any signature

Confirm live:

```text
GET https://www.melega.finance/api/liquidity-building/activation-status/
→ activationAuthorized === true
→ contractsDeployed === true
→ mainnetCycleAuthorized === true

GET https://www.melega.finance/api/liquidity-building/readiness/
→ ready === true
→ status !== "BLOCKED"
```

Also confirm UI badges no longer show only **NOT CONFIGURED** / Local Fork-style blocked labels for deployment.

If any of the above fail: **stop**. Do not approve. Do not deposit. Do not activate.

---

## Exact environment

| Item | Value |
|------|--------|
| Production URL | https://www.melega.finance/liquidity-studio?view=building |
| Chain | BNB Smart Chain Mainnet |
| Chain ID | `56` |
| Wallet required | Founder’s production wallet that will own the program / LP recipient (external wallet; Passport is not the signing wallet) |
| Token | TBD by Founder at canary time — must be standard ERC-20 already listed/indexed on Melega; no fee-on-transfer / rebasing / max-wallet traps |
| Token contract | TBD — paste verified contract after token selection in Setup |
| Melega DEX pool | Must already exist for token/WBNB (or token/approved quote). If UI reports no pool: stop (pool creation is out of scope for this canary) |
| Minimal recommended budget | Smallest amount that clears UI min-viable checks after Setup validation (prefer dust-level relative to wallet; Founder chooses exact amount) |
| Native gas | Keep ≥ 0.01 BNB available for approve + deposit + activate txs (estimate; actual gas depends on network) |
| Approval amount | Bounded to the configured token budget only — never unlimited unless the UI forces a documented exception (current certified model: bounded) |

---

## Buttons and expected states (when gates are green)

1. Open URL above (desktop preferred for first canary).
2. Connect Wallet → expected: connected address visible; still not ACTIVE.
3. Click **Set Up Liquidity Building** → Setup step.
4. Select token → eligibility must pass (standard ERC-20).
5. Confirm pool detected → if “no pool”, stop.
6. Set:
   - Strategy: **Full AI**
   - Epoch: **5 minutes**
   - Budget: minimal validated amount
7. Continue to Review → verify fee disclosure (5% of quote acquired, not on deposit).
8. Approve (wallet tx) → expected status toward **AWAITING_DEPOSIT** / approval satisfied.
9. Deposit budget (wallet tx) → expected **READY** (or product-equivalent ready-to-activate).
10. Activate → expected **ACTIVE**.
11. Observe one epoch:
    - If eligible net buy flow > 0: one execution max; record tx hashes.
    - If eligible net buy flow ≤ 0: **ACTIVE with zero execution** is a valid success (not a broken executor).
12. Pause → **PAUSED**.
13. Resume (if supported) → **ACTIVE**.
14. Stop safely → **STOPPED**; remaining budget disclosed.

---

## Expected wallet / contract interactions

| Action | Expected |
|--------|----------|
| Approve | ERC-20 `approve` to LB Program/spender for bounded budget |
| Deposit | Program `depositBudget` (or certified equivalent) |
| Activate | Program activate / status transition to ACTIVE |
| Execution | Autonomous/bounded executor only — Founder does **not** run epoch swaps manually |
| Fee | 5% of gross quote acquired via Treasury fee sink — not charged on unused budget or deposit |

Copy every transaction hash from the wallet and from the Liquidity Building dashboard “recent transactions” panel.

---

## Stop conditions / safety

- Stop if UI shows **ERROR** or **SAFETY_PAUSED** unexpectedly.
- Stop if approval requests unlimited allowance without explanation.
- Stop if LP owner/recipient is not the Founder-configured address.
- Stop if a second execution appears in the same epoch.
- Stop if fee is charged on deposit or unused budget.
- Use **Pause** for temporary halt; **Stop** for terminal shutdown.

---

## Evidence to send back for certification

1. Production URL + UTC timestamp  
2. Wallet address (public)  
3. Token symbol + contract  
4. Pool address (if shown)  
5. Budget amount  
6. Screenshots: Setup, Review, READY, ACTIVE, Pause/Stop  
7. All tx hashes (approve, deposit, activate, executions)  
8. Final remaining budget and program status  
9. Confirmation whether any epoch executed or zero-flow skip  

---

## Current blockers (as of validation)

Live production APIs still report:

- `CONTRACTS_NOT_DEPLOYED`
- KMS / Authorizer gates (`LB-G03B`, `LB-G11`)
- Relay (`LB-G03C`)
- Treasury binding/ingestion (`LB-G04B`, `LB-G04C`, `LB-G12`)
- Quote policy ratification (`LB-G08`, `LB-G09`)
- Finality evidence (`LB-G10`)
- `DEPLOYMENT_INPUTS_BLOCKED`

Until these clear, this checklist is documentary only.
