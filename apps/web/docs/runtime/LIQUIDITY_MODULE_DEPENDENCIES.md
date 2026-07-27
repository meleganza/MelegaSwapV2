# Liquidity — Module Dependencies

**Architecture:** `LIQUIDITY_ARCHITECTURE_000`

Delivery is strictly sequential. A module may depend only on certified predecessors.

```
000 Architecture
  └─ 001 Hero
       └─ 002 Liquidity Actions
            ├─ 003 Pool Discovery
            │    └─ 004 Add Liquidity
            │         └─ 005 Market Snapshot
            ├─ 006 Your Positions
            └─ 007 Analytics (needs 004–006 data availability)
                 └─ 008 Visual Polish
                      └─ 009 Integration
                           └─ 010 Certification
```

---

## Dependency table

| Module | Depends on | Must not implement |
| --- | --- | --- |
| 000 | Founder mockup freeze | UI / React / production cutover |
| 001 | 000 | Actions, discovery, mint form, analytics |
| 002 | 001 | Pool registry ownership, mint math, analytics charts |
| 003 | 002 | Manual mint form, AI Builder write engine |
| 004 | 003 | AI Builder ownership; positions archive; polish |
| 005 | 004 | Invented market metrics; Modules 006–010 |
| 006 | 002 | Explore registry ownership; mint form |
| 007 | 004–006 data availability | Empty dashboard shells; estimates as truth |
| 008 | 001–007 composition | Geometry / runtime / queries |
| 009 | 001–008 certified | Parallel action hosts |
| 010 | 009 | New features / redesign |

---

## Cross-product dependencies

| External | Rule |
| --- | --- |
| Farms | Separate product; Liquidity mints/removes LP — Farms stakes existing LP |
| Pools | Separate product; Liquidity must not fork Pools modules |
| Smart Swap | Separate product; no Router / Route Engine ownership from Liquidity modules |
| App shell | Header / Trending / nav frozen |

---

## Freeze policy

After each module certification, predecessor module sources become byte-identical freeze targets for subsequent missions (same methodology as Farms / Pools / Passport).

Prior one-page module IDs (`LIQUIDITY_MODULE_001`–`007`) remain historical artifacts and are not delivery predecessors for this architecture sequence.
