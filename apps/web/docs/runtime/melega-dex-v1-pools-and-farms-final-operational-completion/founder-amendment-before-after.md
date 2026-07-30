# Founder Amendment — Before / After

| Defect | Before | After |
|---|---|---|
| Top Movers ticker vs Home | Separate `useDexTrendingRankings` instances; Home paired by index with live assets → MARCO/MM72 drift | Single `TopMoversSnapshotProvider`; Home = exact prefix of ticker snapshot |
| Featured Trade | Stayed on Home `/?focus=swap` | Routes to `/@slug?…&focus=swap&source=featured-home` with Project Page preload |
| Liquidity Builder card | Duplicate blocked/deploy/dev addresses | One blocked line + collapsible Technical details + How it works |
| Active Farmers | Permanent skeleton on cold start | Seed hydrate + in-memory fallback; Indexing… text when incomplete |
| My Farms actions | Buttons clipped by Surface overflow | Overflow visible; Harvest / Stake More / Withdraw / BscScan ↗ |
| Explore Farms | 4→3→2→1 only | 5 @1920, 4 @1440, 3 @1024, 2 tablet, 1 mobile |
| Finished Farms | Standalone section (pre-mission) | Section count 0; finished in My Farms only |
| Create Farm | Missing | Expanded workspace + honest C_ADMIN_ONLY blocker |
| Explore Pools | 3-column desktop | 5 @1920, 4 @1440, compact Stake + BscScan ↗ |
