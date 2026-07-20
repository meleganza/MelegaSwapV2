# LB016 — Liquidity Building UX Blueprint

**Status:** BLUEPRINT (pre-implementation)  
**Mission:** LB016  
**Baseline:** LB015 `1462717925a11bd428063ada957dd56b747859b6`  
**Product path:** Melega DEX → Liquidity Studio → Liquidity Building  
**Activation:** `activationAuthorized=false` — UI must remain honest and fail-closed  

Architecture (contracts, runtime, gates) is **frozen**. This document defines UX only.

---

## 1. Current UX

| Surface | Today |
| --- | --- |
| Placement | `LiquidityStudioScreen` → `AreaRight` after AI Advisor |
| Shell | `LiquidityBuildingPanel` in `LsPanel` |
| States | ProgramStatus machine from LB002/LB014 |
| Entry | Short bullets + Start CTA |
| Setup | Token / budget / strategy chips / epoch chips |
| Review | Compact key/value list |
| Blocked | Notice + disabled “Unavailable until activation” CTA |
| Active | Not fully designed as a dashboard |
| Activity | Absent |
| Management | Absent (Reset only) |

### Problems

1. Epoch jargon (“Epoch”) instead of Decision Frequency  
2. Strategy options lack Recommended / Advanced framing and plain-language descriptions  
3. Review lacks LP ownership, fee, safety disclaimers, pair  
4. No Active dashboard for real post-activation metrics  
5. No activity timeline with human reasons  
6. No management panel with state-gated actions  
7. Blocked copy still slightly technical (“blockers: DEPLOYMENT…”)  
8. Mutating CTAs historically implied execution when gates closed (partially fixed in LB015)

---

## 2. Proposed final flow

```
Liquidity Studio
  → Liquidity Building card (entry)
  → Program setup (token → budget → strategy → decision frequency)
  → Review
  → Deposit Budget & Activate   [only when activationAuthorized]
  → Active program dashboard
  → Management / Activity / Technical Details
```

When gates closed: users may explore setup/review for preparedness; activation CTA stays disabled; entry emphasizes **Activation Pending**.

---

## 3. Components

| Component | Role |
| --- | --- |
| `LiquidityBuildingPanel` | Shell / view router |
| `LbEntryView` | Hero + CTA / Activation Pending |
| `LbSetupView` | Essential fields only |
| `LbReviewView` | Program summary + safety |
| `LbActiveDashboard` | Real metrics only (or honest empty) |
| `LbActivityTimeline` | Human-readable events |
| `LbManagePanel` | State-gated actions |
| `LbTechnicalDetails` | Collapsed advanced |
| `LbBlockedBanner` | Non-error readiness strip |
| `useLiquidityBuildingCard` | Wallet, gates, draft, phase |
| `programStatus` / `uxCopy` | Status + frozen copy |

Reuse: `ConnectWalletButton`, `CurrencySearchModal`, `LsPanel` / `LsPrimaryBtn`, Studio tokens.

No new route.

---

## 4. States (UX phases)

| UX phase | ProgramStatus (typical) | Primary user message |
| --- | --- | --- |
| entry | NOT_ACTIVE | Start Building / Activation Pending |
| setup | SETUP_REQUIRED | Configure program |
| review | SETUP_REQUIRED + review | Confirm & activate when allowed |
| active | ACTIVE / PAUSED / BUDGET_DEPLETED | Dashboard |
| manage | ACTIVE+ | Owner actions |
| stopped | STOPPED | Read-only activity |

Wallet disconnected → Connect Wallet. Wrong chain → Switch Network.

---

## 5. Copy (frozen intent)

### Entry

- Title: Liquidity Building  
- Badge: AI Powered  
- Lead: Transform your available token supply into real liquidity on Melega DEX.  
- CTA: Start Building Liquidity  
- Blocked badge: Activation Required  
- Blocked body: Liquidity Building is prepared but unavailable until production activation requirements are completed.  
- Readiness: Contracts Ready · Runtime Ready · Activation Pending  

### Setup

- Budget prompt: How many tokens do you want to dedicate?  
- Support: Only deposited tokens can be used. Unused tokens remain yours.  
- Full AI — Recommended: The system automatically determines when and how much liquidity to build based on real market demand and safety limits.  
- Dynamic Range — Advanced: Define minimum and maximum execution intensity. The system chooses within your range.  
- Decision Frequency explain: The system evaluates market conditions periodically and executes only when conditions are safe.  
- Options: Every 5 minutes · Every 15 minutes · Every 30 minutes · Every hour  

### Review

- Heading: Liquidity Building Program  
- Fields: Token, Budget, Strategy, Decision Frequency, Liquidity Pair, LP Ownership, Melega Success Fee, Safety  
- Safety: No price guarantees. No market manipulation. No guaranteed outcomes.  
- CTA: Deposit Budget & Activate  

### Active

- Hero: Building liquidity from real market demand.  
- Metrics: Liquidity Built · Budget Remaining · Executions · LP Position — **real data only**; otherwise Unavailable / None yet  

### Activity

- Execution completed / Execution skipped / Waiting — with translated reasons only  

### Management

- Add Budget · Pause · Resume · Stop · Change Strategy · Change Decision Frequency · Manage LP — **only when state allows**  

---

## 6. Interactions

| Action | Gate |
| --- | --- |
| Start / Setup / Review | Always (local draft) |
| Deposit Budget & Activate | `canSubmitMutatingAction` + activationAuthorized |
| Pause / Resume / Stop / Add Budget | Owner + authorized + matching ProgramStatus |
| Fake metrics / simulated activity | **Forbidden** |

---

## 7. Design principles

- Minimal cards, clear hierarchy  
- Apple-style calm / Melega Studio gold accents  
- AI-first default (Full AI)  
- No DeFi trader overload  
- No formulas / AMM math in primary UX  
- Understandable in < 5 minutes  

User mental model:

> I dedicate part of my token supply and Melega automatically transforms it into real liquidity when conditions are safe.

---

## 8. Out of scope

Civilization, BC003S, KMS UI, Treasury internals, Genesis Gas, new apps/routes, architecture changes.
