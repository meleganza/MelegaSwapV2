# NET_EXECUTION_MODEL

Principal comparison: **net user output**, not highest raw output.

```
Net User Output =
  Gross Executable Output
  - venue costs (only if NOT already embedded in the quote)
  - cross-chain costs (only if NOT already embedded)
  - network gas (only when expressed in the same raw units as output)
  - SmartSwap Protocol Fee (unless an adapter proves it is already embedded; never true in M2)
```

AMM quotes typically already deduct LP fees. `venueFeesEmbeddedInGross = true` means **do not subtract venueFeeRaw again**.

Gas:

- excluded from fee-band / `STRUCTURAL_ROUTE_COST`
- included in `TOTAL_EXECUTION_COST`
- included in net only when comparable in output units; otherwise `netExcludesGas = true`

Melega DEX receives **no artificial routing preference**. Example used in tests: Melega net 1755 vs external net 1766 → external wins; SmartSwap still earns its protocol fee on the winning route (once enforcement exists).
