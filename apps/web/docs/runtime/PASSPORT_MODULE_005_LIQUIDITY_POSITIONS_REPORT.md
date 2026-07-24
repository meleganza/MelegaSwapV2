# PASSPORT_MODULE_005 — Liquidity Positions

## 1. Verdict

**PASSPORT_MODULE_005_LIQUIDITY_POSITIONS_CERTIFIED**

## 2. Branch

`mission-passport-module-005-liquidity-positions`

## 3. Commit

1187c702996df92618247d2d89fe3d29d3e899db

## 4. Certified base

- `PASSPORT_MODULE_004_MY_PROJECTS_CERTIFIED`
- Tip `4525221b`

## 5. Frozen-module integrity

SHA-256 locks in `passportModule001_002_003_004.freeze.sha256.json` (31 files) — verified unchanged.

Measured frozen heights: hero 360 / portfolio 176 / assets 176 / projects 176; Projects→Liquidity gap 16.

## 6. Files changed

Module 005-owned + mount + tokens + ownership map + freeze/tests/cert/report:

- `PassportLiquidity.tsx`, `PassportLiquidityRow.tsx`
- `usePassportLiquidityPositions.ts`, `buildPassportLiquidityPositionsViewModel.ts`, `passportLiquidityTypes.ts`
- `PassportScreen.tsx` mount
- `passportTokens.ts` (005 keys only)
- Predecessor test allowlists for Module 005
- Evidence under `docs/runtime/passport-module-005-liquidity-positions/`

Liquidity Studio implementation not modified (query params are additive / ignored if unused).

## 7. Desktop geometry

| Target | Result |
| --- | --- |
| Module empty / disconnected | 1376×232 @ left 32 |
| Header | 64 |
| Table | 1336 wide |
| Columns | 300 / 160 / 180 / 180 / 180 / 156 / 180 |
| Thead / row | 48 / 68 |
| 3-row height | 332 |
| Gap after Projects | 16 |

## 8. Mobile geometry

Module width 358; cards 326; stack; no horizontal overflow.

## 9. Manual-position source

`useLiquidityPositions` (certified Liquidity runtime). Valuation / share / fees shown as `—` when indexer fields are unavailable (honest; never $0.00 guess).

## 10. Liquidity Building source

`useProgramReadModel` on-chain snapshot. Skips `NOT_ACTIVE` / `STOPPED`. Status labels from `PROGRAM_STATUS_LABEL` (Safety Paused → “Paused for safety”).

## 11. Double-counting policy

When LB program and wallet LP share the same pair key, Passport keeps a single Liquidity Building summary row. Documented in `duplicate-prevention.json` + unit test.

## 12. Valuation behavior

Factual only. Unavailable → `—` + “Valuation unavailable”. Never pool-wide TVL as user value. Never fabricated APY.

## 13. Fees/progress behavior

Manual: Fees column when factual; else Unavailable. LB: “Liquidity Built” sublabel (not fake rewards).

## 14. Status mapping

Manual: Active (wallet-held). LB: canonical program statuses including Ready / Paused / Paused for safety / Budget Depleted / Error.

## 15. Management deep links

- Manual → `/liquidity-studio?view=positions&position=<id>`
- LB → `/liquidity-studio?view=building&program=<addr>`
- Empty → Add `/liquidity-studio?view=add`, Building `/liquidity-studio?view=building`
- View All → `/liquidity-studio?view=positions`

No Passport management modal.

## 16. Empty state

1376×232; compact copy; Add Liquidity + Start Liquidity Building only.

## 17. Disconnected state

Compact module; Connect Wallet via global connector; no fake zeros.

## 18. Accessibility

`section` + `h2`; desktop `table` with `th scope`; status text; Manage `aria-label` with pair context; gold focus ring.

## 19. Tests

Vitest Module 005 + 001–004 freeze guards; nav/header regression.

## 20. Typecheck

Covered via `next build`.

## 21. Build

`yarn next build` — pass.

## 22. Evidence paths

`apps/web/docs/runtime/passport-module-005-liquidity-positions/`

- desktop-disconnected/empty/manual/liquidity-building/mixed/unavailable.png
- tablet-1024.png, mobile-390-empty/mixed.png
- desktop-overlay.png, desktop-diff.png
- geometry-measurements.json, data-source-map.json
- deep-link-validation.json, duplicate-prevention.json
- frozen-modules-integrity.json

## 23. Deviations

Next trailingSlash may render `/liquidity-studio/?view=…` (equivalent). No Liquidity geometry changes.

## 24. Factual blockers

None for certification. Production USD/fees remain `—` until Liquidity portfolio cutover exposes factual values (same honesty as Liquidity Positions page today).

## 25. Working-tree status

Clean after push.

## 26. Exact next mission

`PASSPORT_MODULE_006_RECENT_ACTIVITY`
