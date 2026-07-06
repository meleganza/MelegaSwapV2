/**
 * KAP-006E — isolated commit scope for DEX Gravity (excludes R702, KERL T3B, unrelated lockfile).
 * Used by validator and commit guidance only — not runtime logic.
 */
export const KAP_GRAVITY_COMMIT_PATHS = [
  'apps/web/src/lib/dex-gravity/',
  'apps/web/src/lib/routing-layer/facade.ts',
  'apps/web/src/lib/routing-layer/index.ts',
  'apps/web/src/lib/routing-layer/__tests__/routing-facade.test.ts',
  'apps/web/src/lib/execution-ingress/activation.ts',
  'apps/web/src/lib/execution-ingress/dispatch.ts',
  'apps/web/src/lib/execution-ingress/dexCanonicalGates.ts',
  'apps/web/src/lib/execution-ingress/canonicalSubmit.ts',
  'apps/web/src/lib/execution-ingress/index.ts',
  'apps/web/src/lib/execution-ingress/__tests__/execution-ingress.test.ts',
  'apps/web/src/lib/execution-ingress/__tests__/kap-006c-canonical-ingress.test.ts',
  'apps/web/src/lib/execution-layer/useSwapExecution.ts',
  'apps/web/src/lib/liquidity-runtime/',
  'apps/web/src/views/Swap/components/SwapCommitButton.tsx',
  'apps/web/src/views/Swap/SmartSwap/components/SmartSwapCommitButton.tsx',
  'apps/web/src/views/Swap/StableSwap/components/StableSwapCommitButton.tsx',
  'apps/web/src/hooks/useCakeEnable.tsx',
  'apps/web/src/views/Trade/tradeRuntime/useTradeSwapRuntime.ts',
  'apps/web/src/views/LiquidityStudio/liquidityRuntime/useLiquidityMintRuntime.tsx',
  'apps/web/src/pages/add/[[...currency]].tsx',
  'apps/web/src/pages/remove/[[...currency]].tsx',
  'apps/web/public/registry/exchange/melega-dex.json',
  'apps/web/package.json',
  'docs/DEX_RUNTIME_ARCHITECTURE.md',
  'docs/KAP_006C_DEX_GRAVITY_IMPLEMENTATION_REPORT.md',
  'docs/KAP_006E_DEX_GRAVITY_COMPLIANCE_CLOSURE.md',
] as const

/** Paths that must NOT be included in a KAP-006C/E-only commit. */
export const KAP_GRAVITY_EXCLUDED_PATH_PREFIXES = [
  'apps/web/src/views/PoolsStudio/',
  'apps/web/scripts/kerl-first-testnet-execution.ts',
  'apps/web/src/lib/execution-modes/first-testnet-execution/verifyOperatorEnv.ts',
  'apps/web/public/registry/kerl/handoffs/rc1-certified-dry-run-handoff.json',
  'docs/screenshots/r702-pools-pixel/',
] as const
