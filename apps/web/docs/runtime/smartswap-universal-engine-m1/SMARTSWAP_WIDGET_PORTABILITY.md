# SMARTSWAP_WIDGET_PORTABILITY

Goal: one engine, one frozen widget, many hosts (Melega DEX, later Melega Space, authorized embeds).

## Layers

| Layer | Today | Must provide | Must not provide |
|-------|-------|--------------|------------------|
| Host | DEX `/swap`, Home, Project island | Wallet connected?, address, EVM network, requested assets, runtime name | Quote ranking, venue policy |
| Widget | `SmartSwapForm` + Studio modules | Frozen UX | New routing controls |
| Engine | M1 library (shadow) | Normalized quotes, health, fee states | Signing, UX restyle |

## Minimum future host context

```ts
SmartSwapHostContext {
  walletConnected: boolean
  walletAddress: string | null
  network: ExecutionNetwork | null
  requestedInput: CanonicalAssetId | null
  requestedOutput: CanonicalAssetId | null
  runtimeEnvironment?: 'melega-dex' | 'melega-space' | 'authorized-embed'
}
```

Host does not own routing logic. Engine does not own UX.

## Current coupling (audit)

- `SmartSwapForm` already mounts on Home and Project island — good.
- Trade terminal shell (`TradeCockpit`, hero, router panel, recent swaps) is DEX-page chrome, not the engine.
- Studio modules are presentation around the same form.
- V2 engine is **not** imported by those surfaces in M1 (independence test).

## Melega Space

Not implemented. Do not duplicate routing later; embed the same widget + engine port.

## Solana wallet UX

If Space or DEX later needs Solana signing, that is a **Founder-approved UX extension**, not an M1 deliverable. Engine already represents `SOLANA` as a domain only.
