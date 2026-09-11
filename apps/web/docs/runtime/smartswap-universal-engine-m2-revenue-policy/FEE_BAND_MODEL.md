# FEE_BAND_MODEL

Structural cost for banding = venue/LP/aggregator fees + bridge/cross-chain protocol costs. **Gas excluded.**

| Structural cost (bps) | SmartSwap fee | Reason |
|----------------------|---------------|--------|
| ≤ 10 | 25 | `LOW_COST_ROUTE_MAX_FEE` |
| > 10 and ≤ 25 | 20 | `MID_COST_ROUTE_REDUCED_FEE` |
| > 25 and ≤ 40 | 15 | `MID_COST_ROUTE_REDUCED_FEE` |
| > 40 and ≤ 60 | 10 | `HIGH_COST_ROUTE_MIN_FEE` |
| > 60 | 5 | `HIGH_COST_ROUTE_MIN_FEE` |

Boundaries are inclusive on the upper edge of each band (`10 → 25`, `25 → 20`, `40 → 15`, `60 → 10`).

At 40 bps structural, fee is **15** (total 55), which may exceed the 50 bps target. The target is not used to rewrite venue cost or to move the 40 bps edge into the 10 bps band.

Unknown structural cost → no band (`ROUTE_COST_UNCERTIFIED`). Do not invent a fee.
