# TEST_REPORT

## Engine (vitest)

| suite | result |
|-------|--------|
| M1 | 13 passed |
| M2 | 16 passed |
| M3 | 22 passed |
| M4 `m4FeeEnforcement.test.ts` | 15 passed |

## Production non-regression

| suite | result |
|-------|--------|
| `smartSwapModule002.routeEngine.test.ts` | 10 passed |
| `melegaDexV1.smartSwapGasProtocolFee.test.ts` | 5 passed |

## Foundry (local, no fork)

`forge test --match-contract SmartSwapExecutorV1Test`: **4 passed**

## Build

`yarn build` (`next build`) in `apps/web`: **passed**.

## UX freeze

SHA-256 of frozen SmartSwap files = M1 manifest. **UX_DIFF = ZERO**
