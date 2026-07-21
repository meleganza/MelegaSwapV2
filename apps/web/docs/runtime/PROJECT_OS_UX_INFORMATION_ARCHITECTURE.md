# Project Operating System — UX Information Architecture

**Status:** Canonical (PP-CERT)  
**Surface:** Project Page (`/@{slug}` → `/project-hq/{slug}`)

## 1. Canonical section order

Human reading order (DOM / mobileOrder):

1. **Identity** (`#identity`) — brand, purpose, readiness chips, primary CTA
2. Primary verified facts (supplement; not in nav)
3. **Wallet Relationship** (`#wallet-relationship`) — contextual participation
4. **Overview** (`#overview`)
5. **Participate** (`#participate`) — Markets + Participation + Liquidity Building entry
6. **Trust** (`#trust`) — Readiness + Evidence
7. **Updates** (`#updates`)
8. **Ecosystem** (`#ecosystem`)
9. **Developer** (`#developer`)
10. **Governance** (`#governance`)
11. **Growth** (`#growth`)
12. **Machine** (`#machine`) — compact discovery for agents/developers
13. Official resources (supplement)
14. Assets and contracts (supplement)

Nav mirrors the numbered mission sections (Identity → Machine), omitting empty gated sections (Updates/Developer/Governance/Growth/Machine when no entities).

## 2. Design rules

- One job per section; link hubs instead of duplicating payloads.
- No fake metrics (growth/governance explicitly omit campaign/treasury balances).
- Empty states are honest sentences, not placeholder cards with invented numbers.
- Execution CTAs deep-link to Trade, Liquidity Studio, Farms, Pools, LB view — never simulate execution on the Project Page.
- Control Center manage entry is client-only and does not SSR private state.

## 3. Accessibility

- Semantic `h1` (identity) → section `h2` → group headings.
- Sections use `aria-labelledby` where applicable.
- Interactive targets prefer `min-height: 44px` and visible focus.
- Keyboard-reachable nav fragment links (`#section`).

## 4. Responsive

- Max-width identity shell (~720px); vertical stacks.
- `$mobileOrder` aligns with canonical IA (no reordering that contradicts CERT order).

## 5. Anti-patterns (forbidden)

- Dashboard of unrelated widgets in the hero.
- Duplicate Trust / Markets / Developer content inside Machine or Growth.
- Autonomous transaction UI on the Project Page.
- Placeholder “coming soon” cards that imply live metrics.
