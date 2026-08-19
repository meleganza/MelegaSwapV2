# TEST_REPORT

Mission: `SMARTSWAP_UNIVERSAL_ENGINE_M1_FOUNDATION`

## M1 focused suite

`apps/web/src/lib/smartswap-universal-engine/__tests__/m1Foundation.test.ts`

**13 passed**

Coverage:

- UX freeze invariant (`ux-freeze.manifest.json` SHA-256)
- Normalized asset identity + symbol collision prevention
- Venue capability registry
- Normalized quote
- Route comparison determinism (no Melega home preference)
- Adapter timeout
- Unavailable / degraded venue isolation
- Fee-state semantics
- Fee cannot be falsely marked collected
- Melega adapter normalization
- Shadow vs legacy comparison (mismatches not hidden)
- EVM / Solana domain distinction
- No production execution through V2
- No external venue enabled
- Widget / engine independence (`SmartSwapForm`, `TradeCockpit`, `useSwapCallback` do not import V2)

## Related green regression (untouched production fee path)

- `melegaDexV1.smartSwapGasProtocolFee.test.ts` — 5 passed (callback still does not call `settleGasProtocolFeeOnChain`)
- `gasProtocolFee.test.ts` — 13 passed
- `smartSwapModule002.routeEngine.test.ts` — 10 passed

## Known pre-existing red tests (not weakened, not caused by M1)

These fail on the current certified tip independently of this mission (missing ARCH_000 docs / older pixel selectors). M1 did not modify them or the UX they assert:

- `smartSwapArchitecture000.test.ts` (missing `SMART_SWAP_*` docs; ancestry pin `94d4979a`)
- `finalPixelPresentation.test.ts` (selectors not present in current frozen UX)
- `smartSwapModule004.feeTransparency.test.ts` (expects `SmartSwapFeeTransparencyPanel` mount string in a module that no longer matches)

Do not “fix” those by changing SmartSwap UX.

## Build

`yarn build` in `apps/web` — **passed** (Next.js compiled successfully).
