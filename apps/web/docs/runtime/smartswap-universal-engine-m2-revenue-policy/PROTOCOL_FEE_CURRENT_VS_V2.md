# PROTOCOL_FEE_CURRENT_VS_V2

## Current production (unchanged)

- User signs one router/V2 swap tx.
- D87 20/30 bps swap protocol fee is **policy/display**, not collected on the live path.
- Founder 25% of estimated gas is **preview only**; `settleGasProtocolFeeOnChain` is not called from `useSwapCallback`.
- Frozen UX: Protocol fee **Not collected**.
- Verdict remains: `SMARTSWAP_PROTOCOL_FEE_ENFORCEMENT_GAP`.

## Future V2 policy (shadow only in M2)

- Dynamic SmartSwap orchestration fee, max **25 bps**, decreasing as structural venue/bridge cost rises.
- Distinct from LP fees and from gas.
- Earned even if the winning venue is external (once those venues exist and fee is enforceable).
- Production activation requires `FEE_ENFORCEABLE` or `FEE_VERIFIED` **and** a later certification mission.

## Before real collection on external venues

1. Venue adapter with factual structural-cost fields (no invented fees).
2. Atomic (or otherwise founder-approved) enforcement method.
3. Canonical treasury destination on the correct domain.
4. Receipt verification.
5. Frozen UX remaining able to show the factual Protocol Fee without new chrome.
6. Explicit production cutover — **not this mission**.

Do not claim external-venue fee enforcement exists. It does not.
