#!/usr/bin/env bash
# KAP-006C/E — stage only DEX Gravity files (excludes R702 Pools, KERL T3B, unrelated churn).
# Usage: ./apps/web/scripts/stage-kap-006ce.sh
# Does not commit.

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
cd "$ROOT"

git add \
  apps/web/package.json \
  apps/web/public/registry/exchange/ \
  apps/web/src/lib/dex-gravity/ \
  apps/web/src/lib/routing-layer/facade.ts \
  apps/web/src/lib/routing-layer/index.ts \
  apps/web/src/lib/routing-layer/__tests__/ \
  apps/web/src/lib/execution-ingress/activation.ts \
  apps/web/src/lib/execution-ingress/canonicalSubmit.ts \
  apps/web/src/lib/execution-ingress/dexCanonicalGates.ts \
  apps/web/src/lib/execution-ingress/dispatch.ts \
  apps/web/src/lib/execution-ingress/index.ts \
  apps/web/src/lib/execution-ingress/__tests__/execution-ingress.test.ts \
  apps/web/src/lib/execution-ingress/__tests__/kap-006c-canonical-ingress.test.ts \
  apps/web/src/lib/execution-layer/useSwapExecution.ts \
  apps/web/src/lib/liquidity-runtime/ \
  apps/web/src/hooks/useCakeEnable.tsx \
  apps/web/src/pages/add/ \
  apps/web/src/pages/remove/ \
  apps/web/src/views/LiquidityStudio/liquidityRuntime/useLiquidityMintRuntime.tsx \
  apps/web/src/views/Swap/components/SwapCommitButton.tsx \
  apps/web/src/views/Swap/SmartSwap/components/SmartSwapCommitButton.tsx \
  apps/web/src/views/Swap/StableSwap/components/StableSwapCommitButton.tsx \
  apps/web/src/views/Trade/tradeRuntime/useTradeSwapRuntime.ts \
  apps/web/scripts/stage-kap-006ce.sh \
  docs/DEX_RUNTIME_ARCHITECTURE.md \
  docs/KAP_006C_DEX_GRAVITY_IMPLEMENTATION_REPORT.md \
  docs/KAP_006E_DEX_GRAVITY_COMPLIANCE_CLOSURE.md

echo "Staged KAP-006C/E files only. Excluded: PoolsStudio (R702), KERL scripts, yarn.lock, screenshots."
echo "Review: git diff --cached --stat"
