# Ethereum Farms P0 evidence

Base: main `5122133d2ca6760d97a1735e959ccefe9577c2b5` (after merged #86).

## Root causes and changes

- The shared Ethereum wagmi RPC used unauthenticated Ankr and returned Unauthorized. Unlike the Remove-only fix in #86, Farms still used that shared provider: public data and wallet multicalls could not complete. Use publicnode for Ethereum; other chain providers unchanged.
- Emissions and participant counts were BSC-only. Read Ethereum emissions and allocations at one block from its configured MasterChef; reject wrong-chain responses. Ethereum uses 12-second blocks for estimates, preserving BSC math and cache keys.
- Ethereum reward metadata was missing from wallet-position models; resolve canonical Ethereum MARCO decimals. Keep tiny positive LP/reward amounts visible.
- Index Ethereum depositors, verify active userInfo at a pinned block, and reconcile every LP pool's sum of stakes against its actual MasterChef LP balance. Never show BSC's 318 wallets on Ethereum. The indexed release snapshot contains 2/2/0/2 active participants for pids 1/2/3/4 and 4 distinct active LP farmers.
- Six fixed-width KPI tracks overflowed their container. Fluid tracks preserve the existing responsive layout.
- A verified zero-liquidity pool shows $0.00; missing data remains unavailable. LOCO APR remains unavailable because no LP is staked.

## Read-only chain evidence

Ethereum chain 1. Wallet: `0xB6eEb3ab9695979F5b2Ef6Df4112e63212E33EE0`.
MasterChef: `0x585364c747CaF6cF6441656F803796230fb1d61c`.
MARCO/WETH LP: `0x7f0183D7C1B0365A3580ecBdB2f0D8DB2D693c5E`, pid 1.
Wallet staked raw LP: `14850049499999999998`; browser displays 14.85 LP and ~1.91 MARCO pending.
Global emission: 1000000000000 wei MARCO/block = 0.0072 MARCO/day at 7200 estimated blocks/day.
See participant-proof.json for pinned block, addresses and conservation checks.

## Validation

The same 52 focused tests with the new regressions copied to unchanged main: **40 passed / 12 failed**. Fixed branch: **47 passed / 5 failed**. Seven regressions fail before and pass after; BSC emission, APR and count checks pass.

The remaining five failures also occur on main: three missing Founder/mockup source-freeze fixture checks, a missing ownership-map test path, and an existing Arbitrum stakeability expectation. These are not a green full suite.

Typecheck: 1114 pre-existing diagnostics on both baselines and final code, with no new normalized diagnostics. Production build completed (114 pages).

Production browser: actual app and public RPC/API reads with an injected read-only wallet address. Sign/send methods explicitly throw. Verified position 14.85 LP, pending 1.91 MARCO, populated farm metrics and participant counts. At 1440/1280/1024/390px, document width equals viewport and every Explore card is within bounds. Screenshots are packaged separately. A React hydration warning #421 remains observable; the page recovers and data/layout assertions pass. No wallet interaction or transaction was submitted.

## Reproduction and limitations

From apps/web run the focused Vitest files: useMasterChefEmission.chainGuard, ethereumFarmApr, ethereumFarmersCount, farmsModule002.overviewKpis, farmsModule003.myFarms, farmsModule004.exploreFarms, enrichYieldParticipantCards.

Run `node apps/web/scripts/ethereum-farm-participants.cjs` from repository root to refresh the release snapshot and proof. It fails closed if the LP census cannot be reconciled. Participant counts are a timestamped release snapshot, not a continuously running Ethereum indexer; refresh before release. Existing BSC snapshot data is preserved.

For browser proof, start the production app on port 3180, install Playwright/Chrome, create outputs/, then run `node acceptance/ethereum-farms/browser-readonly.cjs` from repository root. The RPC endpoint is public infrastructure and may rate-limit; reads surface unavailable rather than fabricated values.

No redesign or changes to SmartSwap, Boost, list or bridge implementation. The shared Ethereum provider repair benefits other Ethereum reads. Exact branch deployments disabled in both Vercel configuration files. Draft only: architect review and Founder gate required before merge/deployment.
