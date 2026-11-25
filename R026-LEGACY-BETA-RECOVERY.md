# R026 — Legacy-First Beta Recovery

## Checkpoint

- Baseline: `666d4835b6234fed4fa31c09be5e18a419dd997c`
- Branch: `codex/r026-legacy-beta-recovery`
- Application changed: `apps/web` only
- Production, DNS, Vercel, contracts, Treasury and fee policy: unchanged

## Implemented

- One canonical native-yield capability policy blocks new Farm/Pool create and stake operations outside BNB.
- Polygon, Ethereum and Base expose reads and legacy exits but no new native Melega entry operations.
- Runtime modal dispatch, action hosts, builders and Farm deep links all enforce the policy.
- The legacy Swap route now presents one canonical `SmartSwapForm`; market, router and duplicate diagnostic surfaces were removed from the primary surface.
- Canonical token selectors and `CurrencyLogo` remain in use. Connected-wallet controls expose live balance, copy/import and 25/50/75/100 presets.
- Home prioritizes the canonical Swap, shows two verified featured placements, and adds a discreet Beta badge.
- The static `0.5%` slippage display was removed; no fee, slippage or yield value was invented.

## Native Farms/Pools matrix

| Chain | New create/stake | Reads | Withdraw/unstake/emergency/claim |
| --- | --- | --- | --- |
| BNB Chain | Active | Active | Active |
| Polygon | Terminated | Preserved | Preserved |
| Ethereum | Terminated | Preserved | Preserved |
| Base | Terminated | Preserved | Preserved |

External-provider Earn opportunities are not governed by this native Melega policy and were not changed.

## Verification

- Native-yield policy: 8/8 passed.
- Farm action mapping: 3/3 passed.
- Pool action mapping: 3/3 passed.
- Net-input quote economics: 11/11 passed.
- Modified-file lint subset: passed.
- SmartSwap revenue suite: 19/20 passed; the expected UX-freeze hash check reports the authorized R026 presentation changes plus pre-existing baseline drift.
- Transaction-preparation suite: blocked by missing Forge submodule contents in the checkout.
- Typecheck/build/browser screenshots: blocked by an incomplete workspace dependency graph. Yarn cannot link `tsx` under `@pancakeswap/farms`; the original install also lacked `graphql-request` and compatible `renderHook` types.

## Residual blockers

1. Restore a complete workspace dependency installation and initialized Forge submodules.
2. Re-run typecheck, build and QA at 320/390/430/768/1440.
3. Review and deliberately re-certify the SmartSwap UX freeze manifest only after the full suite passes.
4. Create an isolated preview only after those checks are green.

## Verdict

`R026_BLOCKED`
