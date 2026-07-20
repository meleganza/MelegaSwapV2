# LB017 — Live Data Wiring

**Verdict:** `LB017_IMPLEMENTED_WITH_BLOCKERS`  
**Mission:** LB017  
**Baseline:** LB016 `7bf44b31`  
**Activation:** `activationAuthorized=false` (untouched)

UX architecture frozen. This mission wires real sources into the frozen surfaces.

---

## Data Sources

| Surface | Source |
| --- | --- |
| Wallet / chain | wagmi |
| Token balance | multicall `useCurrencyBalance` |
| Pair detection | `usePair` → Melega Factory CREATE2 + reserves |
| Readiness pills | `GET /api/liquidity-building/health` |
| ProgramView / metrics / activity | On-chain `getProgramView` / `latestExecution` when LB program address exists |
| Draft setup fields | Local UX only (not economic SoT) |

---

## Read Model

- `useProgramReadModel` — Factory `activeProgram` + Program `getProgramView`  
- `mapProgramView` — lifecycle + metrics (null when no real matched liquidity)  
- `mapActivityEvents` — machine events → user language; deduped by id  
- `LB_DEPLOYED_ADDRESSES` — all null until verified deploy (no placeholders)

---

## UI Mapping

| UX field | Live mapping |
| --- | --- |
| Liquidity Built | `tokensMatched` + `totalQuoteAdded` when non-zero |
| Budget Remaining | `remainingBudget` |
| Executions | `executionCount` (0 is real; empty activity when 0) |
| LP Position | `totalLpMinted` when non-zero |
| Activity empty | “No liquidity executions yet.” |
| Pair on setup/review | live detection vs WBNB |
| Contracts/Runtime/Activation pills | Ready / Pending from health |

---

## Events

`ProgramCreated` · `BudgetDeposited` · `ProgramActivated` · `ExecutionCompleted` → “Liquidity built from market demand” · `ExecutionSkipped` · `Paused` · `Resumed` · `Stopped` · `Waiting`

---

## Empty / Error States

| Condition | UX |
| --- | --- |
| No program deployed | Metrics Unavailable; activity empty; technical reason `LB_PROGRAM_NOT_DEPLOYED` |
| Pair missing | “No Melega pool detected…” |
| Wallet disconnected | Connect Wallet |
| Wrong chain | Switch Network |
| Gates closed | Activation Pending / Activation Required CTA — not “tx failed” |

---

## Tests

`liquidityBuilding/__tests__/liveDataWiring.test.ts` — metrics, lifecycle, activity dedupe, zero executions, no address placeholders, no activation bypass.

---

## Remaining External Gates

Unchanged from LB015: G03B, G11, G03C, G04B, G04C/G12, G10, G08.  
No Civilization / KMS / Treasury / BC003S work in this mission.

---

## Security confirmation

NO MOCK DATA · NO SIMULATED LIQUIDITY · NO FAKE EXECUTIONS · NO LOCAL ECONOMIC SoT · NO ACTIVATION BYPASS · NO FAKE TX HASHES
