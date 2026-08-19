# SHADOW_ECONOMIC_SIMULATION

V2 remains `SHADOW`. Live `SmartSwapForm` / `useSwapCallback` are not imported and are not altered.

## SYNTHETIC_TEST

Explicit synthetic notionals: $10, $50, $100, $500, $1,000, $5,000, $10,000, $100,000.  
Gross output is a declared synthetic integer (`usd * 1e18`). These are **not** live asset prices.

## LIVE_FACTUAL_SHADOW

Melega LP base fee **25 bps** is repository truth (`BASE_FEE` / architecture anchors). Applied as structural cost on an existing normalized Melega quote. No USD price is fabricated. Result: band `BAND_11_25`, SmartSwap fee **20 bps**, still `FEE_PREVIEW_ONLY`.

Shadow observations never mutate the live quote (`liveQuoteMutated: false`).
