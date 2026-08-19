# TEST_REPORT

## Engine

| suite | result |
|-------|--------|
| M1 `m1Foundation.test.ts` | 13 passed |
| M2 `m2RevenuePolicy.test.ts` | 16 passed |
| M3 `m3EvmMultivenueShadow.test.ts` | 22 passed |

## Production non-regression

| suite | result |
|-------|--------|
| `smartSwapModule002.routeEngine.test.ts` | 10 passed |
| `melegaDexV1.smartSwapGasProtocolFee.test.ts` | 5 passed |

## Build

`yarn build` in `apps/web` (`next build`): **passed**.

## UX freeze

SHA-256 of `SMARTSWAP_UX_FREEZE_FILES` matches `apps/web/docs/runtime/smartswap-universal-engine-m1/ux-freeze.manifest.json`.

**UX_DIFF = ZERO**

No consumer-facing SmartSwap files were modified.

## Coverage mapped to M3 requirements

| requirement | coverage |
|-------------|----------|
| Pancake adapter normalization | M3 |
| Uniswap adapter normalization | M3 |
| Melega adapter regression | M1 + M3 |
| parallel orchestration / timeout / failure isolation | M3 |
| health / circuit breaker | M3 |
| canonical asset identity / wrong-chain | M3 |
| venue fee normalization / no double-count | M3 |
| M2 revenue policy | M2 + M3 |
| net-output comparator / external wins / Melega wins / no preference | M3 |
| same-chain / no split | M3 |
| fee enforcement state | M3 |
| shadow winner isolation | M3 |
| widget isolation | M3 |
| Solana abstraction | M1 + M3 |
| UX freeze | M1 + M2 + M3 |
| production non-regression | route-engine + gas-fee wiring |
| external cannot execute / cannot request wallet | M3 |
| shadow timeout cannot block production | M3 |
| M2 fee cannot alter production fee | M3 |
| V2 cannot collect fee in M3 | M3 |
| FEE_PREVIEW_ONLY not production executable | M3 |

## Known pre-existing red suites (untouched)

Not part of this mission: `smartSwapArchitecture000.test.ts`, `finalPixelPresentation.test.ts`, parts of `smartSwapModule004.feeTransparency.test.ts`.
