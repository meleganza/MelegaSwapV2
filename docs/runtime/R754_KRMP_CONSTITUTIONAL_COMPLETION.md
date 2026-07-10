# R754 — KRMP-01 Constitutional Completion

**Date:** 2026-07-09  
**Authority:** KRMP-01 · `SMART_ROUTER_TESTNET_FROZEN`  
**Mission:** Close all R753 blockers → `KRMP_TESTNET_OPERATIONAL_READY`  
**Constraints:** No UI redesign, no Mainnet, no Treasury Runtime changes, no Wrapper Solidity changes

---

## Output

| Field | Result |
|---|---|
| **Audit** | **PASS** |
| **Final verdict** | **`KRMP_TESTNET_OPERATIONAL_READY`** |
| **Certificate** | `apps/web/public/registry/smart-router/krmp-testnet-operational-certificate.json` |

---

## Part A — KERL Routing Authority

DEX no longer decides routing on chain 97. `useBestTrade` returns `null` when `isKerlRoutingAuthorityEnforced(97)`.

KERL producer: `produceKerlExecutionRequest()` in `lib/kerl-constitutional/producer.ts`.

DEX consumer: `assertDexConsumesExecutionRequestOnly()` — rejects non-KERL requests.

---

## Part B — Execution Request

| Role | Owner | Artifact |
|---|---|---|
| Producer | KERL | `melega.kerl.execution-request.v1` |
| Consumer | DEX | `resolveWrapperExecutionParams()` |

Replaces routing-plan ownership for chain 97 constitutional path.

---

## Part C — Wrapper Entrypoint

```
ExecutionRequest → executeKerlWrapperSwap() → MelegaSmartRouterWrapper V2
```

Wired via `useKerlConstitutionalSwap` → `SmartSwapCommitButton` on chain 97.

No direct DEX router routing on KRMP testnet.

---

## Part D — Settlement

```
ExecutionReceipt (melega.dex-execution-receipt.v1)
  → KerlSettlementReceipt (melega.kerl.settlement-receipt.v1)
  → submitKerlSettlementHandoff()
  → Treasury Runtime (unchanged intake API)
```

`treasuryHandoffUpdater` rejects constitutional swaps without KERL receipt.

---

## Part E — Authority Matrix

| Authority | Owner (constitutional) | Owner (chain 97 actual) | Compliant |
|---|---|---|---|
| Routing | KERL | KERL | Yes |
| Execution | DEX | DEX | Yes |
| Execution enforcement | Wrapper | Wrapper | Yes |
| Settlement attestation | KERL | KERL | Yes |
| Settlement truth | Treasury Runtime | Treasury Runtime | Yes |

---

## Part F — R753 Re-validation

Audit script: `apps/web/scripts/smart-router/krmp-testnet-operational-audit.mjs`

| R753 Blocker | R754 Resolution |
|---|---|
| `prepareCivilizationRoute` blocks chain 97 | `preparedKerlSwap()` — unblocked |
| DEX owns live routing | `useBestTrade` gated; KERL producer |
| Swap UI bypasses Wrapper | `useKerlConstitutionalSwap` + wrapper executor |
| No ExecutionRequest / KERL Settlement Receipt | Schemas in `kerl-constitutional/types.ts` |
| KERL execution mode off | `ensureKrmpTestnetOperationalActivation()` |
| Genesis handoff not in index | `kerl/index.json` v1.1.0 |
| Settlement bypass | `submitKerlSettlementHandoff()` |

---

## Files Changed

| Path | Change |
|---|---|
| `apps/web/src/lib/kerl-constitutional/*` | New constitutional execution layer |
| `apps/web/src/views/Swap/SmartSwap/hooks/useBestTrade.ts` | KERL routing gate |
| `apps/web/src/views/Swap/SmartSwap/hooks/useDerivedSwapInfoWithStableSwap.ts` | KERL trade facade |
| `apps/web/src/views/Swap/SmartSwap/hooks/useTradeInfo.ts` | Wrapper approval address |
| `apps/web/src/views/Swap/SmartSwap/components/SmartSwapCommitButton.tsx` | Wrapper execution |
| `apps/web/src/lib/melega-smart-router/civilization-router/prepareCivilizationRoute.ts` | Chain 97 unblocked |
| `apps/web/src/state/transactions/treasuryHandoffUpdater.tsx` | KERL settlement path |
| `apps/web/src/lib/treasury-handoff/types.ts` | `kerlConstitutional` metadata |
| `apps/web/src/index.tsx` | KRMP activation on startup |
| `apps/web/public/registry/kerl/index.json` | Genesis handoff + TESTNET mode |
| `apps/web/public/registry/smart-router/krmp-testnet-operational-certificate.json` | READY |

---

## Execution Chain (chain 97)

```
Economic Intent
  → KERL (produceKerlExecutionRequest)
  → ExecutionRequest
  → DEX (consume only)
  → Wrapper V2 (0x9D2451b30102B098570bfCeae0E8b8C9Fd2bb2Db)
  → V2 Router execution
  → ExecutionReceipt
  → KERL Settlement Receipt
  → Treasury Runtime
  → FSC-01 (Treasury-owned)
```

---

## Remaining Blockers

None structural. Live genesis handoff `executionPerformed: false` remains a wallet ceremony — does not block constitutional wiring.

---

## Final Verdict

**`KRMP_TESTNET_OPERATIONAL_READY`**
