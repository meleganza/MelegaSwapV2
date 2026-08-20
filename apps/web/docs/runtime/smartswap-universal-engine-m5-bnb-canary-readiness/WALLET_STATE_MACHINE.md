# WALLET_STATE_MACHINE

Internal engine states for a future activation. **M5 does not change visible SmartSwap UX.**

| engine state | frozen UX mapping (internal only) |
|--------------|-----------------------------------|
| `QUOTE_READY` | quote displayed |
| `APPROVAL_REQUIRED` | Enable token |
| `WAITING_APPROVAL_SIGNATURE` | wallet approve prompt |
| `APPROVAL_SUBMITTED` | approve tx pending |
| `APPROVAL_CONFIRMED` | approve mined |
| `EXECUTION_READY` | swap enabled |
| `WAITING_EXECUTION_SIGNATURE` | wallet swap prompt |
| `EXECUTION_SUBMITTED` | swap tx pending |
| `EXECUTION_CONFIRMED` | swap mined |
| `FEE_VERIFIED` | fee receipt proven on **mainnet** (forbidden in M5) |
| `FAILED` | any revert |

No new labels, buttons, or panels. `m5MustNotExposeEngineStatesInUx() === true`.
