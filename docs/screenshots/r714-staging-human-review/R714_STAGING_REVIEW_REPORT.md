# R714 Staging Human Review

**Result:** FAILED

| Field | Value |
|-------|-------|
| Target SHA | `65d146a` |
| Deployment URL | https://v2.melega.finance |
| Deployed at | 2026-07-07T08:28:05Z |
| Fixture on staging | NO |

## Route smoke

```json
{
  "pools": {
    "path": "/pools",
    "httpStatus": 200,
    "errorBoundary": false,
    "url": "https://v2.melega.finance/pools/",
    "emptyVisible": true,
    "fixtureEnabled": false,
    "liveCardCount": 0,
    "poolsTitle": "POOLS",
    "createPoolVisible": true,
    "tickerText": "TRENDING ON MELEGA DEXTop FarmMARCO / ASTER LP37.76% APRTop PoolMARCO / MXMXAPR —Top FarmMARCO / ASTER LP37.76% APRTop PoolMARCO / MXMXAPR —",
    "topPoolSegment": "Top PoolMARCO / MXMXAPR —",
    "poolAprValid": false,
    "poolAprHonestEmpty": false,
    "poolAprDash": true,
    "tickerPoolAprOk": false,
    "docOverflowX": false,
    "ok": true
  },
  "farms": {
    "path": "/farms",
    "httpStatus": 200,
    "errorBoundary": false,
    "url": "https://v2.melega.finance/farms/",
    "ok": true
  },
  "trade": {
    "path": "/trade",
    "httpStatus": 200,
    "errorBoundary": false,
    "url": "https://v2.melega.finance/trade/",
    "ok": true
  },
  "liquidity-studio": {
    "path": "/liquidity-studio",
    "httpStatus": 200,
    "errorBoundary": false,
    "url": "https://v2.melega.finance/liquidity-studio/",
    "ok": true
  },
  "build-studio": {
    "path": "/build-studio",
    "httpStatus": 200,
    "errorBoundary": false,
    "url": "https://v2.melega.finance/build-studio/",
    "ok": true
  }
}
```

## Pools checks

```json
{
  "pools": {
    "path": "/pools",
    "httpStatus": 200,
    "errorBoundary": false,
    "url": "https://v2.melega.finance/pools/",
    "emptyVisible": true,
    "fixtureEnabled": false,
    "liveCardCount": 0,
    "poolsTitle": "POOLS",
    "createPoolVisible": true,
    "tickerText": "TRENDING ON MELEGA DEXTop FarmMARCO / ASTER LP37.76% APRTop PoolMARCO / MXMXAPR —Top FarmMARCO / ASTER LP37.76% APRTop PoolMARCO / MXMXAPR —",
    "topPoolSegment": "Top PoolMARCO / MXMXAPR —",
    "poolAprValid": false,
    "poolAprHonestEmpty": false,
    "poolAprDash": true,
    "tickerPoolAprOk": false,
    "docOverflowX": false
  },
  "poolsMobile": {
    "emptyVisible": true,
    "fixtureEnabled": false,
    "liveCardCount": 0,
    "poolsTitle": "POOLS",
    "createPoolVisible": true,
    "tickerText": "TRENDING ON MELEGA DEXTop FarmMARCO / ASTER LP37.76% APRTop PoolMARCO / MXMXAPR —Top FarmMARCO / ASTER LP37.76% APRTop PoolMARCO / MXMXAPR —",
    "topPoolSegment": "Top PoolMARCO / MXMXAPR —",
    "poolAprValid": false,
    "poolAprHonestEmpty": false,
    "poolAprDash": true,
    "tickerPoolAprOk": false,
    "docOverflowX": false
  }
}
```

## Errors

- ticker Top Pool shows "APR —" — expected valid % APR or "No sustainable pool"
