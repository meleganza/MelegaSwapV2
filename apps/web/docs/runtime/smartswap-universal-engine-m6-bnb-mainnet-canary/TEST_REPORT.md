# TEST_REPORT

| suite | result |
|-------|--------|
| M1 | 13 passed |
| M2 | 16 passed |
| M3 | 22 passed |
| M4 | 15 passed |
| M5 | 11 passed |
| M6 `m6BnbMainnetCanary.test.ts` | 4 passed |
| `smartSwapModule002.routeEngine.test.ts` | 10 passed |
| `melegaDexV1.smartSwapGasProtocolFee.test.ts` | 5 passed |
| Total | 96 passed |
| `yarn build` (`next build`) | passed |
| UX_DIFF | ZERO |

M6 tests assert broadcast remains false when bytecode ≠ M5 or signer missing.

