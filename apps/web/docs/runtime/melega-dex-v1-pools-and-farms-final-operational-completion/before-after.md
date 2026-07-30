# Before / After — Pools & Farms Final Operational Completion

| Area | Before | After |
|---|---|---|
| Pool Stake/Claim/Stake More | Purple orphan overlay, no dialog | Visible operational modals; `updateOnPropsChange=false` |
| Farm Harvest | Auto-executes with no confirmation surface | `FarmHarvestConfirmModal` visible confirm |
| Overlay tint | `theme.colors.text99` (pink/purple) | Neutral `rgba(0,0,0,0.55)` |
| Pools contract CTA | `View Contract ↗` | `BscScan ↗` |
| Create Pool | Compact teaser, click-to-expand | Permanently expanded ~65/35 workspace + fee SSOT |
| Total Rewards — 24H | Always Unavailable | Emission × active blocks in rolling 24H; partial pricing |
| Finished Farms | Standalone section | Removed; Finished badge in My Farms (red) |
| My Farms actions | Manage overflow / generic Manage | Harvest / Stake More / Withdraw / BscScan ↗ contained |
| Active Farmers | Permanent Indexing… on cold start | Certified seed hydration + factual count |
| Farms hero | Misaligned anchors; Why Farm panel | Horizontal centerline; TrustPanel unmounted |
| Create Farm | Missing | Expanded workspace; execution honestly blocked (`C_ADMIN_ONLY_MASTERBUILDER`) |
