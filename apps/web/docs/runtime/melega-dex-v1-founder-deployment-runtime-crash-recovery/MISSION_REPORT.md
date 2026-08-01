# MISSION REPORT — Founder Deployment Runtime Crash Recovery

## Verdict

**MELEGA_DEX_V1_FOUNDER_DEPLOYMENT_RUNTIME_CRASH_WEB_RELEASE_PENDING**

## Root cause (measured)

`TypeError: Cannot convert a BigInt value to a number` at `Math.pow`.

`weiToBnb` used bigint exponentiation that Next/SWC compiled to `Math.pow(10n, 18n)`.

## Fix

`WEI_PER_BNB = 1000000000000000000n` + render guards.

## Verification

Local fixed. Production awaits release of this branch.
