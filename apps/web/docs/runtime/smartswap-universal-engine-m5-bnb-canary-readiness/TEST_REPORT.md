# TEST_REPORT

## Engine (vitest)

| suite | result |
|-------|--------|
| M1 `m1Foundation.test.ts` | 13 passed |
| M2 `m2RevenuePolicy.test.ts` | 16 passed |
| M3 `m3EvmMultivenueShadow.test.ts` | 22 passed |
| M4 `m4FeeEnforcement.test.ts` | 15 passed |
| M5 `m5BnbCanaryReadiness.test.ts` | 11 passed |

## Production non-regression

| suite | result |
|-------|--------|
| `smartSwapModule002.routeEngine.test.ts` | 10 passed |
| `melegaDexV1.smartSwapGasProtocolFee.test.ts` | 5 passed |

## Foundry

| suite | result |
|-------|--------|
| `SmartSwapExecutorV1Test` (local mock) | 4 passed |
| `SmartSwapExecutorV1BnbForkTest` (BNB mainnet fork) | 8 passed, 0 skipped |
| `DryRunDeploySmartSwapExecutorV1` | `DRY_RUN_OK`, `broadcast 0` |

Fork did **not** skip. RPC: `https://bsc.publicnode.com` / `BNB_MAINNET_RPC_URL`.

## Build

`yarn build` (`next build`) in `apps/web`: **passed**.

## UX freeze

SHA-256 of frozen SmartSwap files = M1 manifest. **UX_DIFF = ZERO**
