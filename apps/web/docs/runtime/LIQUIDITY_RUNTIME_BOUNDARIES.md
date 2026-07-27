# Liquidity — Runtime Boundaries

**Architecture:** `LIQUIDITY_ARCHITECTURE_000`  
**Status:** Locked by this mission (no runtime redesign)

---

## Architectural rules — one of each

- One runtime
- One wallet LP model
- One pair / pool discovery model
- One mint / remove action system
- Two primary journeys only
- No duplicated logic

| Concern | Boundary |
| --- | --- |
| Runtime | One runtime — single liquidity orchestration context (today: `LiquidityRuntimeProvider`) |
| Wallet LP model | One account + one LP portfolio adapter |
| Pair / pool model | One Factory inventory + discovery adapter |
| Action system | One mint / remove / approve host (bridges until Integration 009) |
| AI Builder | Journey under Actions — not a parallel write engine |

---

## Source of truth vs derived

| Field | Class |
| --- | --- |
| LP balances | SOURCE OF TRUTH |
| Pair reserves | SOURCE OF TRUTH |
| Mint / burn events | SOURCE OF TRUTH |
| Factory pair inventory | SOURCE OF TRUTH |
| Wallet allowances | SOURCE OF TRUTH |
| Pool share | DERIVED |
| Estimated APR | DERIVED |
| 24H fees | DERIVED |
| IL preview | DERIVED |
| Market snapshot deltas | DERIVED |
| Analytics aggregates | DERIVED |

Unavailable derived fields show `—` / Unavailable — never invent.  
Mockup numbers are never production data.

---

## Module consume rules

- Modules **read** shared inventory / portfolio / market adapters.
- Modules **request** mint/remove through the single action host.
- Modules **must not** open parallel wallet LP scans, parallel Factory scanners, or parallel mint engines.
- Modules **must not** own Farms MasterChef or Pools SmartChef runtime.
- Modules **must not** modify Router / exchange / contracts ownership.

---

## User actions (no duplicates)

`Add Liquidity` · `Remove Liquidity` · `Select Pool` · `Open AI Liquidity Builder` · `Review Position` · `Manage Position` · `View Pool`

---

## Shell freeze

Global Header, Trending Bar, Footer, and mobile navigation remain AppShell-owned. Liquidity modules do not reimplement them.

---

## Legacy write path

Until Integration 009, write safety continues through existing `liquidityRuntime/*`, `liquidityBuilding/*`, and Add/Remove bridges. Feature work inside legacy UI is forbidden; critical production bugfixes only.

---

## Economics / execution freeze

ARCHITECTURE_000 does **not** authorize:

- Fee / Treasury / KERL changes
- Router or Route Engine changes
- Contract address or ABI ownership changes
- Liquidity execution semantics changes
