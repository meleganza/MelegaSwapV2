# LB017 — Live Data Architecture

**Mission:** LB017  
**Baseline:** LB016 `7bf44b31ae6f2c3838171558482d1adc8f257275`  
**Product path:** Melega DEX → Liquidity Studio → Liquidity Building  
**UX:** Frozen (LB016) — wiring only  

`activationAuthorized=false` — no execution, no mocks, no fake metrics.

---

## Data matrix

| Data | Source | Current status | Integration point |
| --- | --- | --- | --- |
| Wallet address / chain | wagmi `useAccount` / `useNetwork` | LIVE | `useLiquidityBuildingCard` |
| Token balance | multicall `useCurrencyBalance` | LIVE | setup token meta |
| Token symbol / decimals | selected `Currency` | LIVE | setup |
| Melega pair presence | SDK CREATE2 + `getReserves` via `usePair` | LIVE | `useMelegaPairDetection` |
| Pair reserves / liquidity | Pair reserves from multicall | LIVE when pair EXISTS | pair detection |
| Quote asset (WBNB default probe) | `bscTokens.wbnb` | LIVE probe | pair detection |
| Activation gates | `GET /api/liquidity-building/health` | LIVE (BLOCKED) | readiness pills |
| Contracts readiness | health `programDiscovery` + deployment inputs | LIVE → Pending until deploy | blocked banner |
| Runtime readiness | health `status` / components | LIVE → Pending while BLOCKED | blocked banner |
| Activation readiness | `activationAuthorized` | LIVE → Pending | blocked banner |
| LB Factory address | deployment inputs | NULL / NOT_DEPLOYED | `addresses.ts` |
| Program address | factory `activeProgram` / bound address | UNAVAILABLE | `useProgramReadModel` |
| ProgramView metrics | `getProgramView()` on-chain | UNAVAILABLE until deploy | `mapProgramView` |
| Latest execution | `latestExecution()` | UNAVAILABLE until deploy | activity mapper |
| Program events | contract logs | UNAVAILABLE until deploy | `mapActivityEvents` |
| Local draft (budget/strategy/freq) | React state | Draft only — **not** SoT for economics | setup/review |

---

## Patterns reused (no parallel backend)

- ethers `useContract` + multicall (DEX standard)
- `usePair` / `Pair.getAddress` for Melega Factory CREATE2
- Existing `/api/liquidity-building/health` for gates only
- No new chain-read API routes

---

## Fail-closed rules

1. Missing program address → metrics Unavailable / empty activity  
2. Zero executions → “No liquidity executions yet.” (not fake zeros)  
3. `canSubmitMutatingAction` false → Activation Required CTA  
4. Never invent pools, hashes, or APY  
5. Local FSM is UX navigation only — economics require contract/API/receipt  

---

## Files added

| File | Role |
| --- | --- |
| `liquidityBuilding/addresses.ts` | Melega + LB deploy bindings |
| `liquidityBuilding/abi/fragments.ts` | Minimal Program/Factory ABIs |
| `liquidityBuilding/mapProgramView.ts` | ProgramView → UX metrics |
| `liquidityBuilding/mapActivityEvents.ts` | Events → user language |
| `liquidityBuilding/useMelegaPairDetection.ts` | Live pair detect |
| `liquidityBuilding/useProgramReadModel.ts` | On-chain ProgramView reader |
| `liquidityBuilding/useActivationReadiness.ts` | Contracts/Runtime/Activation pills |
