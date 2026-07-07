# R704B Pools Page — Validation Report

Result: **PASSED**

## Checks
```json
{
  "checks": {
    "hits": [],
    "kpi": 5,
    "poolCards": 0,
    "placeholderCards": 3,
    "featured": false,
    "emptyFeatured": true,
    "emptyFeaturedHeight": 360,
    "createPoolAfterGrid": true,
    "hasTotalRewardBudgetKpi": true,
    "hasForbiddenFundingCopy": false,
    "hasR703d": true,
    "hasR704b": true,
    "belowFold": true,
    "firstViewport": true
  },
  "validation": {
    "mobileOverflow": false
  }
}
```

## Screenshots
- docs/screenshots/r703d-pools-experience/pools-r703d-desktop-1440.png
- docs/screenshots/r703d-pools-experience/pools-r703d-desktop-1728.png
- docs/screenshots/r703d-pools-experience/pools-r703d-empty-state.png
- docs/screenshots/r703d-pools-experience/pools-r703d-mobile-390.png

## APR Rules (R703D)
- Official / auto-stake: 8–12%
- Flexible / partner: 20–30%
- Fixed 30–90d: 30–40%
- Fixed 90–180d: 35–45%
- Fixed 180–365d: 40–50%
- 365+: 45–50%
- Live pools hidden if APR forbidden, budget < $1 (when priced), or ended