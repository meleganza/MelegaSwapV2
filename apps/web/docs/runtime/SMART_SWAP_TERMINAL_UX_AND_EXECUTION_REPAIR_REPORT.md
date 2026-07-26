# Smart Swap — Terminal UX and Execution Repair

## Final verdict

**SMART_SWAP_TERMINAL_UX_REPAIR_CERTIFIED**

## 1. Certified base

| Item | Value |
| --- | --- |
| Prior | `SMART_SWAP_MAINNET_EXECUTION_HANDOFF_CERTIFIED` tip `5951b1c8` |
| Branch | `smart-swap-terminal-ux-repair` |
| Architecture | `47892a9d` |

## 2. Root cause

Confirm Swap was wrapped by `submitSwapViaIngress` → `dispatchExecutionInstruction`.

`Updaters` called `ensureKrmpTestnetOperationalActivation()` on every app boot, forcing execution mode to `TESTNET_EXECUTION_ONLY`. Live KERL gates then required `certifiedHandoff === true`, which was never passed from the DEX wallet path — surfacing:

`Certified handoff is required before live execution`

Instant and Smart were also presented as separate product CTAs, obscuring the single-engine architecture.

## 3. Execution repair

1. Scope KRMP activation to chain `97` only (`src/index.tsx`).
2. Mainnet chain IDs use DEX canonical ingress gates (not KERL live gates).
3. `canonicalSubmit` passes `certifiedHandoff` from the Smart Swap ingress bridge:
   - Instant → certified on explicit user confirm
   - Smart → requires published handoff certificate
4. Remap technical gate strings to actionable user copy.

Safety gates preserved. No auto-sign. No auto-broadcast.

## 4. Mode selector UX

- Removed Home hero **Instant Swap / Smart Swap** CTAs.
- Replaced with **Start Trading** + **Trade Terminal**.
- **Instant | Smart** tabs on Trade terminal and Home swap stack (same `SmartSwapForm`).
- Home mode selector sits outside the fixed-height shell so tabs are not clipped.

## 5. Mode behavior

| Mode | Shows |
| --- | --- |
| Instant | Tokens, amount, quote, basic confirm |
| Smart | Route + preview + fees + AI + readiness handoff |

## 6. Wallet / transaction lifecycle

Confirm Swap → ingress (certified) → wallet signature request → broadcast → receipt → existing history/fee refresh paths.

## 7. Failure UX

Default UI shows actionable messages (wallet, network, stale quote, refresh). Technical certification detail is under developer diagnostics only.

## 8. Security boundaries

SmartSwapForm core untouched · Router untouched · Route Engine / Fee / D87 / FSC-01 / Treasury / KERL attribution / token registry untouched.

## 9. Tests

14 related tests passed (UX repair + handoff + home markers).

## 10. Build

`yarn build` passed.

## 11. Evidence

`apps/web/docs/runtime/smart-swap-terminal-ux-repair/`

## 12. Limitations

- Live mainnet wallet broadcast not exercised in CI (requires user wallet).
- Testnet (97) still uses live gates; Smart must publish handoff certificate before confirm.

## Delivery

Push only. No merge. No deploy.

---

**SMART_SWAP_TERMINAL_UX_REPAIR_CERTIFIED**
