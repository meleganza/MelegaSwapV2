# TEST_REPORT

- `m2RevenuePolicy.test.ts`: **16 passed**
- `m1Foundation.test.ts`: **13 passed** (no weakening)
- `melegaDexV1.smartSwapGasProtocolFee.test.ts`: **5 passed** (production callback still does not collect)

Covered: policy version, 25/20/15/10/5 bands, all listed boundaries, gas excluded from band / included in total, target semantics, minimum revenue disabled, quote immutability, net output, no double count, no Melega preference, preview-only cannot be production, venue independence, EVM/Solana domain independence, host cannot override, shadow vs synthetic, UX freeze hashes, unknown/zero input.

Build: `yarn build` in `apps/web` — **passed**.
