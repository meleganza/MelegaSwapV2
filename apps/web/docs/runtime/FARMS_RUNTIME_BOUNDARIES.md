# Farms — Runtime Boundaries

**Architecture:** `FARMS_ARCHITECTURE_000`  
**Status:** Locked by this mission (no runtime redesign)

---

## Architectural rules — one of each

- One runtime
- One wallet model
- One LP model
- One reward model
- One action system
- No duplicated logic

| Concern | Boundary |
| --- | --- |
| Runtime | One runtime — single farms orchestration context (today: `FarmsRuntimeProvider`) |
| Wallet model | One account + one LP portfolio adapter |
| LP model | One MasterChef / farm-pid inventory model |
| Reward model | One pending-reward + emission presentation path |
| Action system | One `FarmsActionHost` for Stake / Harvest / Withdraw / Emergency Withdraw |

---

## Source of truth vs derived

| Field | Class |
| --- | --- |
| LP balances | SOURCE OF TRUTH |
| Reward emissions | SOURCE OF TRUTH |
| Pending rewards | SOURCE OF TRUTH |
| Farm status | SOURCE OF TRUTH |
| APR | DERIVED |
| TVL | DERIVED |
| Advisor priorities | DERIVED (factual rules only) |
| Analytics aggregates | DERIVED |

Unavailable derived fields show `—` / Unavailable — never invent.

---

## Module consume rules

- Modules **read** shared inventory / portfolio / status / APR rules.
- Modules **request** actions through the single ActionHost.
- Modules **must not** open parallel wallet scans, parallel reward engines, or parallel status resolvers.
- Modules **must not** own Pools SmartChef runtime.

---

## Canonical status

`ACTIVE` · `ENDED` · `WITHDRAW_ONLY` · `EMERGENCY` · `PARTIAL` · `UNAVAILABLE` · `LOADING`

---

## User actions (no duplicates)

`Stake` · `Harvest` · `Withdraw` · `Emergency Withdraw` · `Manage` · `View Farm`

---

## Shell freeze

Global Header, Trending Bar, Footer, and mobile navigation remain AppShell-owned. Farms modules do not reimplement them.

---

## Legacy write path

Until Integration 009, write safety continues through existing `views/Farms/hooks` bridged by `FarmsActionHost`. Feature work inside that legacy UI is forbidden; critical production bugfixes only.
