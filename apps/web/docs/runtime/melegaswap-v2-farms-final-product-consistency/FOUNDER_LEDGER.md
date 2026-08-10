# FOUNDER_LEDGER — Farms Final Product Consistency

Baseline: `mission-release-lineage-integration` @ `37996bbc`

| ID | Issue | BEFORE | ROOT CAUSE | FIX | TEST | AFTER |
|----|-------|--------|------------|-----|------|-------|
| FARM-01 | My Farms preview max 4 | `maxVisibleDesktop: 3` while UI asked for 4 | Token/builder mismatch | `maxVisibleDesktop: 4`; preview uses token | `farmsFinalProductConsistency` | PASS — preview ≤4 |
| FARM-02 | My Farms never overlaps KPIs | Risk of unused column / stacking | Two-column leftovers + disconnected empty space | Hide empty/disconnected; KPI `z-index:1`; My Farms `z-index:0`; no negative margins | consistency + KPI source | PASS |
| FARM-03 | Full available width | Tokens still declared `leftW`/`rightSlotW` | Legacy advisor column geometry | Full-width module; clipped 1×1 advisor host | `data-pixel-farms-my-farms="full-width"` | PASS |
| FARM-04 | View all my farms inline | Label existed; preview capped at 3 | Preview limit | Expand/collapse same module; exact copy | consistency | PASS |
| FARM-05 | Cards \| List | Present when expanded | OK | Kept; Explore also toggles | consistency | PASS |
| FARM-06 | List token logos | Present but chain mixed into pair cell | Layout | Dedicated logos + Farm/Chain columns | consistency | PASS |
| FARM-07 | List column headers | Missing desktop header | Incomplete list | `farms-my-farms-list-header` full set | consistency | PASS |
| FARM-08 | List Multiplier | Present without header slot | Incomplete | Multiplier column + testid | consistency | PASS |
| FARM-09 | Harvest real flow | Already `requestModal(..., claim)` → ActionHost | Verify only | Kept; ActionHost `useHarvestFarm` | consistency | PASS |
| FARM-10 | Stake More real flow | Already stake modal | Verify only | Kept | consistency | PASS |
| FARM-11 | Withdraw real flow | Already unstake modal | Verify only | Kept | consistency | PASS |
| FARM-12 | Explore actions inside cards | Manage duplicated Stake; overflow risk | Extra Manage CTA | Manage removed; Stake / View Farm / View LP; flex-wrap actions | consistency | PASS |
| FARM-13 | Duration factual | Always `—` | No resolver | Live+multiplier → `Ongoing`; finished → `Ended`; else `—` | consistency | PASS |
| FARM-14 | Remaining unambiguous | Hardcoded `—` mixed concepts | Same field used loosely | `rewardsRemaining` always separate; uncertified → `—` | consistency | PASS |
| FARM-15 | Participants honesty | Sanitizer still accepted integer strings | Could show non-census | Always `—` (no wallet census on farm cards) | consistency | PASS |
| FARM-16 | 24H Volume | Always `—` | No certified pair volume on FarmPreviewCard | Remain `—` until pair market certified (no TVL invention) | consistency | PASS |
| FARM-17 | 24H Fees | Always `—` | Same | Remain `—` (no new fee formula) | consistency | PASS |
| FARM-18 | Sparkline reserved | Already on cards | OK | Kept `YieldActivitySparkline` | consistency | PASS |
| FARM-19 | Create Farm first click | Router+state double fire / remount | Query sync race | Ref-guarded open; mount after first open; shallow replace only if needed | consistency | PASS |
| FARM-20 | Pair indexing | Search limited | Incomplete matchers | Symbol/name/contract/LP; chain filter | consistency + pair search | PASS |
| FARM-21 | Selector not clipped | Inline list inside accordion/modal | Overflow ancestors | `createPortal` + `melegaZIndex.overlayStacked` | consistency | PASS |
| FARM-22 | Multiplier geometry | Badge could crowd header | Header crowding | Dedicated metrics slot; removed header MultiBadge overlay | consistency | PASS |
| FARM-23 | Project Page V7 farm detection | Must not regress | Untouched Project Page / matchers | No Project Page files changed | V7 suite regression | PASS (untouched) |
| FARM-24 | Home Top Farms | Must not regress | Untouched Home hooks | No Home Top Farms files changed | Home suite regression | PASS (untouched) |

All ledger items classified at mission completion.
