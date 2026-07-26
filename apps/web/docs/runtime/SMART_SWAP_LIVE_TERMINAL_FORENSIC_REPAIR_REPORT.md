# Smart Swap — Live Terminal Forensic Repair

## Final verdict

**SMART_SWAP_LIVE_TERMINAL_FORENSIC_REPAIR_CERTIFIED**

## Certified base

| Item | Value |
| --- | --- |
| Prior | `SMART_SWAP_TERMINAL_UX_REPAIR_CERTIFIED` tip `f0008a9d` |
| Branch | `smart-swap-live-terminal-forensic-repair` |

## Runtime path (actual)

```
/swap
→ pages/swap/index.tsx
→ TradeTerminalScreen
→ TradeCockpit
→ TradeModeSelector (Instant | Smart)
→ SmartSwapForm
→ [Smart only] Preview / Fee / AI / Handoff
→ Confirm Swap
→ useSmartSwapExecution
→ submitSwapViaIngress
→ dispatchExecutionInstruction
→ wallet signature
```

## Root causes found

1. **Instant overwritten by Smart handoff publish**  
   `SmartSwapExecutionPreviewModule` called `useSmartSwapExecutionHandoff` before `if (!showSmartTransparency) return null`. React hooks still ran in Instant mode and published `experience: 'smart'`, forcing `certifiedHandoff=false` on Confirm.

2. **Mode selector not reliably visible**  
   Cockpit `overflow: hidden` + flex shrink could clip Instant|Smart tabs.

3. **Default experience was Smart**  
   `/swap` without query defaulted to Smart, amplifying (1).

4. **Gate race**  
   Undefined `chainId` under KRMP arming could still select live gates; non-testnet must use DEX canonical ingress.

## Fixes (no architecture redesign)

- Mount Smart transparency stack only when Smart is selected (child component).
- Handoff publish no longer forces `experience: 'smart'`.
- Mode selector slot: `flex-shrink: 0` + CSS visibility guards.
- Default experience: Instant; Smart via tabs / `?experience=smart`.
- Dispatch: DEX canonical when `!isTestnetChainId(chainId)` (56 + undefined); chain 97 keeps live gates.
- KRMP activation remains scoped to chain 97.

## Safety

No SmartSwapForm / Router / economics changes. No validation bypass — incorrect condition fixed.

## Tests / build

18 related tests passed. `yarn build` passed.

## Evidence

`apps/web/docs/runtime/smart-swap-live-terminal-forensic-repair/`

---

**SMART_SWAP_LIVE_TERMINAL_FORENSIC_REPAIR_CERTIFIED**
