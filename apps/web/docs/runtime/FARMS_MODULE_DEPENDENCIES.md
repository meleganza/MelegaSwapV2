# Farms — Module Dependencies

**Architecture:** `FARMS_ARCHITECTURE_000`

Delivery is strictly sequential. A module may depend only on certified predecessors.

```
000 Architecture
  └─ 001 Hero
       └─ 002 Overview KPIs
            └─ 003 My Farms
                 └─ 004 Explore Farms
                      └─ 005 Finished Farms
                           └─ 006 Yield Advisor
                                └─ 007 Analytics
                                     └─ 008 Final Visual Polish
                                          └─ 009 Integration
                                               └─ 010 Certification
```

---

## Dependency table

| Module | Depends on | Must not implement |
| --- | --- | --- |
| 000 | Founder mockup freeze | UI / React / production cutover |
| 001 | 000 | KPIs, farms grids, advisor, analytics |
| 002 | 001 | Wallet position cards, explore registry |
| 003 | 002 | Explore ACTIVE registry, finished archive |
| 004 | 003 | Finished / historical farms |
| 005 | 004 | ACTIVE explore cards, advisor engine |
| 006 | 003–005 data availability | AI / predictions; Modules 007–010 |
| 007 | 004 inventory | Mock charts; estimates |
| 008 | 001–007 composition | Geometry / runtime / queries |
| 009 | 001–008 certified | Parallel action hosts |
| 010 | 009 | New features / redesign |

---

## Cross-product dependencies

| External | Rule |
| --- | --- |
| Pools V1 | Separate product; Farms must not fork Pools modules |
| Liquidity Studio | LP mint/remove remains Liquidity-owned; Farms stakes existing LP |
| App shell | Header / Trending / nav frozen |

---

## Freeze policy

After each module certification, predecessor module sources become byte-identical freeze targets for subsequent missions (same methodology as Pools / Passport).
