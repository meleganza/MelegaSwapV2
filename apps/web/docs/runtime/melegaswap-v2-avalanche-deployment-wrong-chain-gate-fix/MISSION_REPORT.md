# MISSION REPORT — Avalanche Deployment Wrong Chain Gate Fix

## Verdict

`MELEGASWAP_V2_AVALANCHE_DEPLOYMENT_WRONG_CHAIN_FIXED`

## Root cause

`FounderDeploymentShell` always evaluated BNB `assessFounderDeployGates` (`requiredChainId = 56`) for the page operational banner. On `?chain=avalanche` with wallet chain `43114`, wallet detection was correct, but the banner still showed `WRONG_CHAIN` and the hardcoded copy *BNB Smart Chain Founder steps are paused on this network.*

## Fix

- `resolveFounderDeploymentPackage(query.chain)` — package-specific required chain
  - Avalanche V2 Router → `43114`
  - BNB Founder packages → `56`
- Shell operational state + wrong-chain banner use the selected package
- Removed BNB-paused Avalanche banner
- Avalanche Estimate enabled on 43114; Deploy enabled after gas estimate

## Unchanged

Contracts, Router artifact, Treasury, Smart Swap, Liquidity Builder, wallet detection hooks.
