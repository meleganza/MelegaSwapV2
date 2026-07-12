# R785 Founder-Directed Recovery

Captured: 2026-07-12 (before R785 modifications)

## Repository State

| Field | Value |
|-------|-------|
| Branch | `main` |
| HEAD | `42a4219e1b5b1208d1b9ac34e0dfebbf600c7ccd` |
| origin/main | `42a4219e1b5b1208d1b9ac34e0dfebbf600c7ccd` |
| Merge/rebase active | No |

## Prior Mission Commits Present

- `b581714e` — R783: production data truth (trending, pools, farms, activity)
- `239d049a` — R783 hotfix: farms route + MARCO emission
- `c15eee02` — R783: pools crash fix
- `7c10bfb0` — R783: static ticker until six unique assets
- `3a4e1d50` — R783: pool hidden-reason labels
- `5c9b3bca` — R783: MasterChef emission certification
- `8e0c9f47` — R783: Featured Farm poolWeight fallback
- `2779c542` — R783: MASTERCHEF_EMISSION_CERTIFIED
- `f98d06c1` — R784: founder pixel perfection + data truth
- `42a4219e` — R784: highest APR KPI restricted to rewarding pools

## Staged Files

None.

## Unstaged (preserved, not staged)

- `apps/web/docs/runtime/r778-verify.mjs`
- `apps/web/docs/runtime/r780-data-quality-gates.json`
- `apps/web/public/registry/kerl/handoffs/rc1-certified-dry-run-handoff.json`
- `apps/web/public/registry/kerl/index.json`
- `apps/web/tsconfig.tsbuildinfo`

## Untracked (preserved)

Runtime artifacts, screenshots, env audit files, `.cursor/` — not part of R785 commit scope.

## Production Baseline (pre-R785)

- Farms emission: 144.0K MARCO/day via `dexTokenPerBlock()` — certified R783
- Trending: empty when no 24H volume/trades (R784)
- Pools: 0 rewarding on-chain; hero empty state
- Tier-metrics API: 0 rows (indexer limitation)

## R785 Scope

Founder-directed literal corrections per mission brief. No redesign. No new architecture.
