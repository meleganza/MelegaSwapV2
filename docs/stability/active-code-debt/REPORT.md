# Residual active-code debt burn-down

Mission: `MELEGA-DEX-RESIDUAL-ACTIVE-CODE-DEBT-BURNDOWN`

Base: `a339f6a85d5e9b31b8d74a239efa914c76011c50`

## Result

| Measure | Before | After |
| --- | ---: | ---: |
| Repository TypeScript diagnostics | 1,138 | 438 |
| Active production files | 2,250 | 2,250 |
| Active production diagnostics (A+B) | 272 | 0 |
| Category C: tests/historical expectations | 519 | 212 |
| Category D: scripts/generated/dead or unreachable modules | 347 | 226 |

The repository is not claimed to be globally type-clean. The mandatory active production set is clean; 438 diagnostics remain outside the dependency closure of the certified public routes.

## Reproducible classifier

From `apps/web`, capture the existing repo-wide typecheck without hiding its expected non-zero status:

```sh
yarn tsc --noEmit --pretty false > /tmp/melega-active-debt-tsc.txt 2>&1
```

Then, from the repository root:

```sh
node scripts/stability/classify-active-production.mjs /tmp/melega-active-debt-tsc.txt
```

The classifier starts at the Next.js framework entrypoints and the 13 certified public surfaces, follows TypeScript-resolved static imports, re-exports, dynamic imports, `require` calls, workspace packages, and referenced `/api/*` handlers. A file is active only when that traversal proves reachability. Test/spec/fixture diagnostics outside that closure are C; every other unreachable diagnostic is D.

Evidence:

- `ACTIVE_PRODUCTION_FILES.txt`: exact 2,250-file production closure.
- `ACTIVE_DIAGNOSTICS_BEFORE.txt`: all 272 initial A+B diagnostics, one row per diagnostic.
- `ACTIVE_DIAGNOSTICS_AFTER.txt`: empty, proving A+B = 0.
- `CLASSIFICATION.json`: final counts, entrypoints, and remaining-debt directory summary.

## Fixed diagnostics

Every fixed diagnostic, including its source file and error code, is recorded row-by-row in `ACTIVE_DIAGNOSTICS_BEFORE.txt`. The batches below assign the root cause and fix category for all 272 rows.

| Batch | Diagnostics fixed | Root cause | Fix category |
| --- | ---: | --- | --- |
| Shared compiler/runtime | 74 | Active bigint code was compiled with an ES5 target | Set the existing application target to ES2020; no strictness or exclusions changed |
| Shared numeric infrastructure | 71 | Two workspace resolutions produced incompatible nominal `bignumber.js` identities | Resolve the application import to the workspace singleton |
| Shared application contracts | 73 | Runtime shapes were narrower/wider than their real consumers, including readonly data and optional indexed fields | Correct interfaces, discriminated narrowing, typed actions, and constructor conversions |
| Swap/SmartSwap and execution | 28 | Execution unions, receipt contracts, route capabilities, and handoff data were imprecise | Narrow unions and align factual runtime contracts without changing routing or economics |
| Farms/Pools | 18 | Serialized user data, pool/farm metadata, and reducer payloads did not match runtime representations | Correct serializable types and add typed reducer actions |
| Public/project surfaces | 8 | Page layout and component props did not express existing rendered behavior | Correct page/component prop types only |
| **Total** | **272** |  |  |

No `@ts-ignore`, broad `any`, test skip, deleted assertion, generated-code edit, dependency upgrade, tsconfig exclusion, or strictness relaxation was used.

## Remaining debt

Final category C is exactly 212. Its leading directories are `apps/web/src/lib` (171), `apps/web/src/views` (24), `apps/web/src/hooks` (8), `apps/web/src/design-system` (7), and `apps/web/src/components` (2).

Final category D is exactly 226. Its leading directories are `apps/web/src/views` (177), `apps/web/src/lib` (41), `apps/web/src/pages` (6), `apps/web/src/app-shell` (1), and `apps/web/src/state` (1).

These counts are informational and do not block production certification because none of these files is reachable from a certified public entrypoint under the classifier. They should be handled later as bounded test modernization and dead/historical-module cleanup, not mixed into product work.

## Permanent deterministic regression gate

Run locally from the repository root:

```sh
yarn test:certification
```

The gate composes 29 existing deterministic suites (271 tests) covering public click integrity, Swap/SmartSwap truth, Liquidity multichain/TVL/deadline regressions, Farms/Pools truth and hidden Create Pool, Bridge route authority, and Trending identity/paid Boost continuity. It runs in about 20 seconds after dependencies are installed.

The pull-request workflow runs only when active application/package paths or the gate itself change. It is read-only, has a 15-minute timeout, and does not deploy. Public RPC/fork validation, live wallets, signatures, approvals, transactions, payments, Vercel/browser availability, and live/read-only network checks are intentionally excluded.

## Verification

- Active production diagnostics: **0**
- Deterministic certification: **PASS — 29 files / 271 tests**
- Production build: **PASS — 8/8 tasks**
- Certified behavior changed: **no**
- Real wallet, signature, approval, or transaction: **no**
