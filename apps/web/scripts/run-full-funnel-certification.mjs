#!/usr/bin/env node

import { spawnSync } from 'node:child_process'

const deterministicSuites = [
  // Public navigation/control integrity (#116).
  'src/lib/certification/__tests__/publicClickIntegrity.test.ts',
  // Swap / SmartSwap execution truth, factual impact, and stable confirmation.
  'src/lib/smartswap-universal-engine/__tests__/v2RoutingTruth.test.ts',
  'src/lib/smartswap-universal-engine/__tests__/v2ExecutionBinding.test.ts',
  'src/lib/smartswap-universal-engine/__tests__/v2FactualPriceImpact.test.ts',
  'src/lib/smartswap-universal-engine/__tests__/v2ConfirmModalStability.test.tsx',
  // Liquidity multichain discovery, global ordering, pair identity, approvals, and remove/deadline regressions.
  'src/views/LiquidityStudio/liquidityRuntime/__tests__/multichainLiquidityPositions.test.ts',
  'src/views/LiquidityStudio/__tests__/liquidityPositionDirectory.test.ts',
  'src/views/LiquidityStudio/liquidityRuntime/__tests__/addLiquidityPairLabelTruth.test.tsx',
  'src/views/LiquidityStudio/liquidityRuntime/__tests__/addLiquidityApprovalLifecycle.test.tsx',
  'src/lib/liquidity-runtime/__tests__/bscRemoveLiquidity.regression.test.ts',
  'src/lib/liquidity-runtime/__tests__/ethereumRemoveLiquidity.test.ts',
  'src/views/LiquidityStudio/v3/__tests__/liquidityStudioRuntimeRemoveRepair.test.ts',
  // Farms / Pools action truth and the hidden Create Pool invariant.
  'src/views/FarmsStudio/farmsRuntime/__tests__/farmsViewActions.test.ts',
  'src/views/FarmsStudio/__tests__/farmsFounderAcceptance.test.ts',
  'src/views/FarmsStudio/__tests__/publicFarmEconomics.test.ts',
  'src/views/FarmsStudio/__tests__/publicFarmFactory.eligibility.test.ts',
  'src/views/FarmsStudio/__tests__/publicFarmFactory.feesAndHandoffs.test.ts',
  'src/views/FarmsStudio/__tests__/farmsWalletFirst.test.tsx',
  'src/views/PoolsStudio/poolsRuntime/__tests__/poolsViewActions.test.ts',
  'src/views/PoolsStudio/__tests__/poolsFounderAcceptance.indexing.test.ts',
  'src/views/PoolsStudio/__tests__/poolsWalletFirst.test.tsx',
  'src/views/PoolsStudio/__tests__/publicPoolCreationHidden.test.tsx',
  'src/views/PoolsStudio/__tests__/poolsActionModalRepair.test.ts',
  // Bridge canonical route authority and deterministic remediation checks.
  'src/lib/marco-bridge/__tests__/canonicalAuthority.test.ts',
  'src/lib/marco-bridge/__tests__/baseCanonicalAuthority.test.ts',
  'src/lib/marco-bridge/__tests__/remediation.test.ts',
  // Trending canonical identity and paid Boost continuity.
  'src/lib/trending/__tests__/topMoverDisplayIdentity.test.ts',
  'src/lib/trending/__tests__/paidTrendBoostTickerMerge.test.ts',
  'src/lib/monetization/__tests__/trendBoostActivationGuard.test.ts',
]

const result = spawnSync(process.platform === 'win32' ? 'yarn.cmd' : 'yarn', ['vitest', '--run', ...deterministicSuites], {
  cwd: new URL('..', import.meta.url),
  env: { ...process.env, LC_ALL: 'en_US.UTF-8' },
  stdio: 'inherit',
})

if (result.error) throw result.error
process.exit(result.status ?? 1)
