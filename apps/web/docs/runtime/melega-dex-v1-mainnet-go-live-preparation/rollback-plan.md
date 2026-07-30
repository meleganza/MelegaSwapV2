# Mainnet Go-Live — Deterministic Rollback Plan

Do not rely on git history alone. Use on-chain facts + registry SSOT + explorer.

Canonical Treasury: `0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b`

---

## Principles

1. **Never fabricate** addresses, txs, or verification success.
2. **Never bind** frontend/registry until explorer confirms verification and `eth_getCode` is non-empty.
3. **Prefer leave unbound** over shipping a wrong binding.
4. **Independent tracks:** CT rollback must not reverse a healthy LB bind; LB failure must abort CT start.
5. **No self-destruct / upgrade path** in certified LB/CT models — “rollback” means operational quarantine + honest null/invalid state, not on-chain undo of immutable constructors.

---

## A. Failed deployment (broadcast revert / incomplete CREATE)

1. Stop all further broadcasts immediately.
2. Inventory confirmed txs from deployer address (nonce range used this session) via RPC + BscScan.
3. For each confirmed CREATE: record address, code size, constructor args decoded from tx input.
4. If **no** contracts created: leave registries null; clear `*_MAINNET_DEPLOY_AUTHORIZED` until re-preflight.
5. If **partial** CREATE set (see §H): do not bind; mark `PARTIAL_DEPLOYMENT`; continue §H.
6. Publish incident evidence under go-live evidence folder (tx list, nonces, blockers).

## B. Verification failure

1. Do not mark verified in any JSON.
2. Do not run sync-frontend-binding.
3. Keep registry addresses null **or** write a separate `verification-failed.v1.json` with addresses + failure reason (addresses must not enter frontend SSOT).
4. Fix source/compiler/ctor encoding offline; re-verify only after match.
5. If verification impossible (missing API key / explorer outage): track remains `DEPLOYED_UNVERIFIED_UNBOUND`.

## C. Binding mismatch

Triggers: frontend SSOT ≠ registry; registry ≠ on-chain bytecode; wrong chainId.

1. Immediately revert frontend SSOT / `LIST_CREATE_TOKEN_AVAILABLE` / LB bound flags to **null / false**.
2. Restore registry to null or last known-good verified snapshot file (committed artifact, not “whatever git says”).
3. Re-read `eth_getCode` for candidate addresses.
4. Re-bind only after byte-for-byte agreement across registry, SSOT, and chain.

## D. Wrong constructor

Examples: LB `successFeeBps != 1000`; CT fee ≠ `100000000000000000`; wrong factory/router constants.

1. Classify contracts `DEPLOYMENT_INVALID`.
2. Do not bind. Do not enable UI execution.
3. Document invalid addresses in evidence (quarantine list).
4. Redeploy **new** contracts with correct inputs when authority available; never “patch” immutable ctor via binding lies.

## E. Wrong treasury / fee recipient

1. If CT `feeRecipient !=` canonical Treasury → `DEPLOYMENT_INVALID` (same as §D).
2. If LB FeeReceiver beneficiary ≠ approved destination → quarantine; do not enable LB fee path in UI.
3. Treasury Runtime must never be introduced as a fee hop — if any binding references it, remove and fail closed.

## F. Wrong authority

1. If LB Authorizer constructor authority ≠ approved `LB_PRODUCTION_AUTHORITY` → quarantine authorizer + dependent factory.
2. Disable runtime signing (`DisabledLiquidityBuildingKmsSigner` remains fail-closed until correct authority is live).
3. Do not attempt hot-key substitution.

## G. RPC interruption

1. Freeze operator actions.
2. When RPC returns: reconcile deployer nonce vs expected; fetch receipts for any pending hashes.
3. Classify each CREATE as confirmed / dropped / unknown.
4. Resume only after inventory complete; never re-broadcast same nonce blindly without receipt proof.

## H. Partial deployment

LB expected order: FeeReceiver → Authorizer → FeeSink → Program impl → Factory.

1. List which of the five exist on-chain with code.
2. If Factory missing: **do not bind**; optional: leave orphans documented; redeploy full set with correct inputs when ready (prefer clean set over stitching).
3. If Factory exists but deps wrong: Factory is invalid for production — quarantine all; redeploy complete set.
4. CT is single factory CREATE — partial means receipt missing or code empty → treat as failed deploy (§A).

## I. Post-rollback frontend honesty

- Readiness APIs must report BLOCKED / DEPLOYMENT_BLOCKED.
- Null addresses preserved in SSOT.
- No READY from environment variables alone.
