# MelegaSwap V2 — Multichain Reactivation Plan

## Verdict

**MELEGASWAP_V2_MULTICHAIN_ARCHITECTURE_BLOCKED**

BNB (56) is production-ready. ETH / Polygon / Base have **partial** static config but cannot be safely reactivated until architecture blockers are cleared. Avalanche (43114) is **missing** (greenfield, not reactivation).

Liquidity Builder stays **BNB-only**. Product requirement (not implemented in this audit): **BETA** + **BNB ONLY** badges.

---

## Phase 0 — Guardrails (before any switcher unlock)

1. Keep `MELEGA_VISIBLE_SWITCHER_CHAIN_IDS = [BSC]` until Phase 2 exit criteria pass.
2. Do **not** change Liquidity Builder contracts/economics; keep `LB_CHAIN_ID = 56`.
3. Add product tickets (separate mission): LB **BETA** badge + **BNB ONLY** badge.
4. Freeze Avalanche as out-of-scope for “reactivation” — treat as new-chain launch.

---

## Phase 1 — Single source of truth (contracts & routers)

| Task | Chains | Exit criteria |
|------|--------|---------------|
| Reconcile `ROUTER_ADDRESS` web vs `@pancakeswap/smart-router` | 137, 8453 | One SSOT; Polygon conflict resolved; Base package non-empty |
| Verify Factory/Router/MasterChef bytecode & ownership on explorers | 1, 137, 8453 | Live call proof JSON per chain |
| Fix `polygonTokens.syrup` `ChainId.BASE` bug | 137 | Token constructs with `ChainId.POLYGON` |
| Audit `getAddress` BSC fallback | all | Fail closed for unsupported chains |

---

## Phase 2 — Wallet & UI unlock (gated)

| Task | Exit criteria |
|------|---------------|
| Expand Melega execution / civilization adapters beyond BSC **or** clearly disable advanced routes off-BSC | No silent wrong-router execution |
| Enable switcher for **one** pilot chain first (recommend Polygon or Base after Phase 1) | `MELEGA_VISIBLE_SWITCHER_CHAIN_IDS` includes pilot + BSC |
| Smoke: swap + add liquidity + farm stake on pilot | Manual + automated proof |
| Chain badges visible in switcher | Badge assets already under `public/images/chains/` |

Do **not** unlock ETH + Polygon + Base simultaneously.

---

## Phase 3 — Farms & pools hydration

| Task | Chains |
|------|--------|
| Confirm MasterChef ABI parity & APR sources | 1, 137, 8453 |
| Validate live sous pool contracts (many non-BSC lack `sousChef` map entries) | 1, 137, 8453 |
| Progressive farm pagination already present — verify non-BSC lists render | all enabled |

---

## Phase 4 — Tokens & lists

| Task |
|------|
| Expand logos / token coverage for pilot chain |
| Optionally restore curated token list URLs (currently empty) |
| Ensure MARCO + stables + wrapped native present |

---

## Phase 5 — Avalanche (greenfield — not reactivation)

Required before AVAX can be “ready”:

- Deploy or bind Factory + Router
- MasterChef (if farms desired)
- Add to wagmi `CHAINS` + `SUPPORT_MULTI_CHAINS`
- `packages/farms/constants/43114.ts`, pools config, MARCO token, logos
- Router entries in web + smart-router SSOT

---

## Liquidity Builder (unchanged)

| Item | Status |
|------|--------|
| Scope | BNB 56 only |
| Deployments | `deployments/liquidity-building/chain-56/` |
| Runtime gate | `correctChain === ChainId.BSC` |
| Product requirement | Add **BETA** + **BNB ONLY** badges (future UX mission) |

---

## Recommended order

1. Phase 1 SSOT + Polygon syrup fix  
2. Pilot unlock Base **or** Polygon (not both)  
3. ETH after pilot stability  
4. Avalanche only as new deployment program  
5. LB badge UX without expanding LB chains  

---

## Why blocked now

1. Visible network switcher is deliberately BSC-only.  
2. Router SSOT conflicts (Polygon / Base).  
3. Avalanche missing core AMM + wallet surface.  
4. Melega execution adapters BSC-only.  
5. Data-quality bugs (syrup chainId) and BSC address fallbacks make half-enablement unsafe.
