# LB016 — Liquidity Building UX Freeze

**Verdict:** `LB016_UX_FROZEN`  
**Mission:** LB016  
**Baseline:** LB015 `14627179`  
**Assessed:** `2026-07-20T01:30:00Z`  
**Product path:** Melega DEX → Liquidity Studio → Liquidity Building  

Architecture remains frozen. This mission freezes the **production UX**.

---

## 1. Final UX flow

```
Liquidity Studio
  → Liquidity Building card (entry)
  → Setup (token, budget, Full AI / Dynamic Range, Decision Frequency)
  → Review (program summary + safety)
  → Deposit Budget & Activate   [gated]
  → Active dashboard + Activity
  → Manage (state-gated actions)
```

Optional: Technical Details (collapsed).

---

## 2. Components

| Component | Path |
| --- | --- |
| Panel shell | `components/LiquidityBuildingPanel.tsx` |
| Active dashboard view | `LbActiveDashboardView` (same file) |
| Card hook | `liquidityBuilding/useLiquidityBuildingCard.ts` |
| Status machine | `liquidityBuilding/programStatus.ts` |
| Frozen copy | `liquidityBuilding/uxCopy.ts` |
| Blueprint | `docs/LB016_LIQUIDITY_BUILDING_UX_BLUEPRINT.md` |

No new route.

---

## 3. States

| Phase | Meaning |
| --- | --- |
| entry | Hero + Start / Activation Pending |
| setup | Essential configuration |
| review | Confirm program |
| active | Real metrics dashboard |
| manage | Owner actions only |

ProgramStatus labels retained for lifecycle fidelity.

---

## 4. Copy

Frozen in `uxCopy.ts` / blueprint §5:

- Entry lead + Start Building Liquidity  
- Activation Required / Activation Pending readiness pills  
- Decision Frequency (not “epoch”)  
- Full AI Recommended / Dynamic Range Advanced  
- Deposit Budget & Activate  
- Safety disclaimers  
- Active hero + metric labels  

---

## 5. Blocked state

Honest, non-error:

- Liquidity Building Ready  
- Activation Pending  
- Contracts Ready · Runtime Ready · Activation Pending  
- No KMS / Treasury / BC003S exposure  
- Deposit CTA disabled → shows Activation Required  

---

## 6. Active dashboard

Metrics render **Unavailable** / **None yet** when no real execution evidence.  
No fake APY, liquidity, or activity. Activity list empty until real events.

---

## 7. Acceptance criteria

| # | Criterion | Status |
| --- | --- | --- |
| 1 | UX fully defined | PASS |
| 2 | Studio integration clean | PASS |
| 3 | Setup simple | PASS |
| 4 | Full AI default | PASS |
| 5 | Dynamic Range advanced | PASS |
| 6 | Blocked honest | PASS |
| 7 | Active uses real data only | PASS |
| 8 | No fake metrics | PASS |
| 9 | Manage actions match states | PASS |
| 10 | Ready for future activation | PASS |
| 11 | No Civilization scope | PASS |
| 12 | UI frozen | PASS |

---

## 8. Screenshots / evidence

Local visual capture optional post-deploy. Source + tests are primary freeze evidence:

- `liquidityBuildingUxFreeze.test.tsx`  
- `liquidityBuildingUi.test.ts`  

---

## 9. Remaining issues

- On-chain program read model wiring after mainnet deploy (future)  
- Pair detection enrichment when Factory discovery is live  
- Live activity feed from execution receipts (future)  

None block UX freeze. Activation remains externally gated (`activationAuthorized=false`).
