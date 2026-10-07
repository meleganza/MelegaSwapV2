# Lint control-flow tranche 04

## Mission and baseline

- Mission: `MELEGA-DEX-LINT-CONTROL-FLOW-04`
- Base main: `d775418974e98527965d7691607f2a9a0278bcfd`
- Branch: `cursor/melega-dex-lint-control-flow-04-4075`
- Baseline lint: **1,640 errors / 1,389 warnings**
- Baseline target rules: `no-continue` **339**, `no-await-in-loop` **163**, `no-void` **140**
- Baseline typecheck: **0 diagnostics**
- Baseline certification: **29 files / 271 tests**
- Baseline global TVL: **5/5**
- Baseline Boost authority: **4 files / 24 tests**
- Baseline production build: **passed**

The 642-row inventory is in [CONTROL_FLOW_BEFORE.md](./CONTROL_FLOW_BEFORE.md). Only C1 and C2 were changed. No `Promise.all` conversion and no continue rewrite was made.

## Classification

| Class | Before | Fixed | Remaining |
| --- | ---: | ---: | ---: |
| C1 confirmed semantic/runtime defect | 1 | 1 | 0 |
| C2 genuine safety risk | 8 | 8 | 0 |
| N1 intentional sequential await | 105 | — | 105 |
| N2 intentional continue / guard | 316 | — | 316 |
| N3 safe detached promise | 64 | — | 66 |
| N4 test / tooling only | 83 | — | 83 |
| N5 contextual / style only | 65 | — | 65 |

N3 rises by 2 because the three Global Search calls moved from C2 to N3 and one already-safe `void readProviderChainId` call was folded into the new subscriber.

## C1

`useSwitchNetwork` returned `new Promise(() => { switchNetworkLocal(chainId) })` whenever the wallet was disconnected or had no programmatic switch. The executor never settled. Liquidity Add confirm chained `.finally` onto that promise, so the switch dialog could stay open after the session chain had already updated. Awaiters in Farms, Pools, Liquidity positions, wrong-network UI, and Boost checkout could also hang.

The same helper swallowed a rejected wallet switch after showing a toast, so awaiters treated failure as success and could continue into stake, remove, or payment.

The helper now always settles. A completed wallet switch or a disconnected session switch returns `true`. A rejected switch, an in-flight switch, or a connected wallet that cannot switch returns `false` after the existing toast. Awaiters that would otherwise continue stop on `false`.

## C2

- Global Search: a rejected `import('lib/global-search')` left `Preparing search…` up and cached the rejection. The cache is cleared, loading ends, and the dropdown shows `Search is unavailable`.
- Connect Wallet: preload rejection was detached on click, hover, and focus, so the modal never opened and the rejection was unhandled. `settleConnectWalletPreload` opens the modal only after success and logs a failed preload without caching it as success.
- Wallet chain: `connector.getProvider` rejection skipped `chainChanged` and was unhandled. `subscribeWalletChain` resolves with no subscription and keeps the wagmi fallback.
- Indexer lease: the interval heartbeat could reject on a blob write and escape the request `try`. `settleIndexerLeaseHeartbeat` records the failure and fulfills. The lease TTL remains the safety valve.

## Intentional findings kept

- **105 sequential awaits (N1).** SmartSwap approval-then-swap, V2 hop diagnostics, factory census batches, RPC fallback chains, bridge submission, trending pagination, and indexer checkpoints stay sequential. They are nonce-ordered, fallback-ordered, or rate-limit bounded. No parallel conversion was proven safe.
- **316 continues (N2).** Every production `continue` is a guard inside a `for` loop whose update is in the header. None sit in a `while` loop that could skip its increment. They were not rewritten.
- **66 safe detached promises (N3).** These already use `try/catch`, `.catch`, the switch toast, or a callee that does not reject. Global Search is in this set after the C2 fix.
- **65 contextual voids (N5).** These discard non-promise values, Next.js navigation, clipboard success that is committed only in `then`, or synchronous unused lookups.

## Verification

- Focused control-flow tests: switch settlement, wallet-chain subscription, connect-wallet preload, indexer heartbeat, and search load failure.
- Typecheck: PASS, 0 diagnostics.
- Certification: PASS, 29 files / 271 tests.
- Global TVL deterministic regression: PASS, 5/5.
- Boost authority regression: PASS, 4 files / 24 tests.
- Boost service modal geometry: layout files were not edited. The Boost authority suite still locks the compact service grid. The browser geometry harness was not re-run because this tranche does not change modal geometry.
- Production build: recorded in the mission return after the final build.
- `git diff --check`: PASS.
- New ESLint suppressions: **0**.
- `consistent-return` fell by 1 because the switch helper now returns on every branch. No other rule was edited.

## Browser

Desktop 1440×900 and mobile 390×844 were observed for more than 10 seconds after typing `marco` into global search on the production server. Results appeared and stayed stable. Search did not remain on `Preparing search…`, did not show `Search is unavailable`, and did not flicker, thrash a modal, or enter a render loop. The rejected-import state is covered by the component test. Wallet rejection still requires a wallet provider, so that path is covered by the hook test rather than the browser. Pre-existing image 404s and an external RPC CORS message were visible and are outside this tranche.

## Certified behavior freeze

No contracts, fees, Treasury behavior, economics, SmartSwap routing, global TVL semantics, Boost authority policy, or Boost service-modal layout were changed. A rejected network switch no longer continues into stake, remove, or Boost payment.

Recommended next tranche after architect review: `MELEGA-DEX-LINT-STYLE-AND-POLICY-05`. It was not started.

## Final lint

- Full repository lint: **1,632 errors / 1,389 warnings**.
- `no-continue`: **339**.
- `no-await-in-loop`: **163**.
- `no-void`: **133**.
- C1 remaining: **0**.
- C2 remaining: **0**.
