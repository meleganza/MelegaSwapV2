# PRE_MERGE — Release Lineage Integration

## Confirmed state

| Item | Value |
|------|--------|
| Current branch at audit | `mission-pools-final-product-consistency` |
| HEAD | `b93f9762` (Pools Final Product Consistency) |
| Base for integration | `b93f9762` |
| Incoming | `934df141` (`mission-liquidity-studio-final-product-polish`) |
| Merge-base | `4a5d55ab` (Project Page V6 Founder Pixel Perfect) |
| Working tree product files | clean (only unrelated untracked local worktrees/artifacts) |

## Why this direction

`b93f9762` already contains:

- Project Page V7 (`0c94102c`)
- Pools Final Product Consistency (`b93f9762`)

Liquidity Final Polish (`934df141`) diverged after V6 and is **not** an ancestor of the Pools tip.

## Unique commits — base (Pools/V7)

```
b93f9762 Mission XX: Pools Final Product Consistency
0c94102c Mission XX: Canonical Project Page V7 Rebuild
```

## Unique commits — incoming (Liquidity line)

```
934df141 Mission XX: Liquidity Studio Final Product Polish
cdcacbfe Mission XX: Liquidity Studio Premium UX Consolidation
ff392b65 Mission XX: Liquidity Studio Runtime Remove Repair — deep-link + acceptance
9baf16ea Mission XX: Liquidity Studio Runtime Remove Repair
c7e906b8 Mission XX: Liquidity Studio Final Product Restore
47708649 Mission XX: Token Creation Post-Creation Funnel Rebuild
049f7471 Mission XX: Founder Review V6 live browser acceptance evidence
cf41fc2c Mission XX: Founder Review V6 Product Consistency Repair
bf4ecb04 Mission XX: Yield Surfaces Product Consistency Repair
4727fa39 Mission XX: Founder Product Acceptance V5
e544873f Mission XX: My Melega Positions Drawer
```

## Overlapping files (changed on both sides since merge-base)

Conflict candidates. Policy: **prefer Pools final** for Pools files.

```
apps/web/src/views/PoolsStudio/__tests__/poolsFounderAmendmentP09.test.ts
apps/web/src/views/PoolsStudio/__tests__/productIaPoolsRefinement.test.ts
apps/web/src/views/PoolsStudio/modules/PoolsExplorePoolCard.tsx
apps/web/src/views/PoolsStudio/modules/PoolsExplorePoolsModule.tsx
apps/web/src/views/PoolsStudio/modules/PoolsMyPositionsModule.tsx
apps/web/src/views/PoolsStudio/modules/poolsAnalyticsTokens.ts
apps/web/src/views/PoolsStudio/modules/poolsExplorePoolsTokens.ts
apps/web/src/views/PoolsStudio/modules/poolsFinishedPoolsTokens.ts
apps/web/src/views/PoolsStudio/modules/poolsMyPositionsTokens.ts
apps/web/src/views/PoolsStudio/modules/poolsRewardAdvisorTokens.ts
apps/web/src/views/PoolsStudio/modules/poolsVisualPolishTokens.ts
```

File counts since merge-base: pools/V7 ≈ 67 files; liquidity line ≈ 210 files.

## Integration branch

`mission-release-lineage-integration` from `b93f9762`, then merge `934df141` with an explicit merge commit (no squash, no rebase).
