# Melega DEX Constitution — V1

**Status:** Draft architecture constitution  
**Version:** 1.0  
**Date:** 2026-06-26  
**Scope:** Architectural doctrine for Melega DEX as an AI-native economic execution surface  
**Binding on:** All future implementation work after Phase 1 (WP1 brand shell complete)

**Aligned systems:** MELEGA AI · KIRI CIVILIZATION · D87 · Treasury Runtime · SmartDrop · Radar · Space · Labs · $MARCO fee economy

---

## Preamble

Melega DEX is **not** a PancakeSwap fork in purpose. It is the **decentralized economic execution layer** for MELEGA AI and KIRI CIVILIZATION: a surface where humans and autonomous agents discover, route, launch, lock, farm, pool, and settle value — with every action observable, explainable, treasury-accounted, and machine-readable by default.

The existing MelegaSwapV2 deployment (multi-chain swap, liquidity, farms, pools, ILO, NFT on BSC) is **legacy substrate**, not the final form. This constitution governs how that substrate is preserved, extended, and eventually superseded without breaking trust, liquidity, or economic truth.

---

## 1. Mission

### 1.1 What Melega DEX is

Melega DEX is an **AI-native liquidity, launch, routing, registry, lock, and economic coordination layer** that:

- Executes swaps and liquidity operations across supported chains using **verified on-chain contracts** and **audited routing logic**.
- Registers **tokens** and **projects** as first-class economic entities with machine manifests, not only UI list entries.
- Coordinates **farms**, **pools**, **locks**, and **launches** as governed economic primitives — each with fee schedules, treasury attribution, and risk labels.
- Exposes **Agent API** and **well-known manifests** so MELEGA AI agents, KIRI operators, Radar monitors, and external integrators can quote, verify, and act without scraping HTML.
- Routes platform fees in **$MARCO** through **Treasury Runtime** for transparent accounting inside the Melega/Kiri economic loop.

### 1.2 What Melega DEX is not

- Not a cosmetic rebrand of a third-party DEX template.
- Not a marketing site with inflated metrics.
- Not an endorsement engine for unverified tokens or projects.
- Not a forced migration platform that relocates user liquidity without explicit governance approval.

### 1.3 Relationship to MELEGA AI and KIRI CIVILIZATION

| System | Role relative to Melega DEX |
|--------|----------------------------|
| **MELEGA AI** | Reasoning, launch assistance, project intelligence, agent orchestration |
| **KIRI CIVILIZATION** | Cultural, governance, and coordination context for economic participation |
| **D87** | Doctrine for explainability, observability, bounded autonomy, treasury truth |
| **Treasury Runtime** | Canonical ledger for fee ingestion, allocation, and audit trails |
| **SmartDrop** | Distribution and incentive events tied to verified economic actions |
| **Radar** | Monitoring, anomaly detection, reputation signals, stale-state alerts |
| **Space** | Project presence, community surface, campaign hosting |
| **Labs** | Experimentation sandbox; no production fee or routing authority without promotion |
| **$MARCO** | Native fee and coordination token across Melega economic surfaces |

---

## 2. Phase model

### Phase 1 — Safe legacy compatibility (current)

**Objective:** Operate Melega DEX as the human-facing identity over existing MelegaSwapV2 contracts and configs.

| Preserve | Allow |
|----------|-------|
| Router, factory, MasterChef, multicall addresses per chain | UI/SEO/branding (WP1 complete) |
| Farm/pool/LP configs and live liquidity | Navigation and copy improvements (WP2+) |
| Wallet connectors and tracked swap routes | Documentation and constitution (this document) |
| ILO (`ifov3`) and BSC NFT modules until isolated | Machine manifest design (no breaking deploys) |

**Exit criteria for Phase 1:** Stable multi-chain swap/farm/pool operations under Melega DEX brand; audit docs frozen; no regressions on BSC primary chain.

### Phase 2 — AI-native DEX platform

**Objective:** Add machine-readable registries, manifests, Agent API, smart routing spec, lock center design, fee/treasury accounting, and project intelligence — **without** deprecating legacy routers or migrating liquidity.

| Deliver | Constraint |
|---------|------------|
| Public manifests and quote/route APIs | Legacy routers remain canonical until governance migration |
| Token & project registry MVP | No fabricated listings or APY |
| Risk and lock verification surfaces | Read-only or additive contracts first |
| MARCO fee framework (testnet or opt-in mainnet) | Treasury Runtime integration required before production fees |

**Exit criteria for Phase 2:** Agents can quote, inspect risk, verify locks, and read fee schedules from documented endpoints; humans retain full legacy UI parity.

### Phase 3 — Agent-first economic operating system

**Objective:** Melega DEX becomes the default execution surface for MELEGA AI agents and KIRI economic actors — humans use UI as one client among many.

| Capability | Requirement |
|------------|-------------|
| Best-route execution via Smart Routing Engine | Includes legacy Melega liquidity in route graph |
| Autonomous launch, lock, and campaign flows | Bounded by D87 policy envelopes |
| Economic Brain coordination | All actions treasury-accounted |
| Governance-gated migrations | Explicit audit + approval for any router/factory change |

**Exit criteria for Phase 3:** Agent API traffic and human UI traffic share the same economic truth layer; no divergent state between machines and humans.

---

## 3. Non-negotiable invariants

These invariants apply across all phases. Violation is a **constitutional breach** and blocks merge/deploy.

| # | Invariant | Enforcement |
|---|-----------|-------------|
| I1 | **Preserve existing liquidity** — LP positions, farm stakes, and pool deposits remain accessible on their original contracts until a governed migration | No silent pool/farm removal; no address changes without migration policy |
| I2 | **Preserve router/factory/MasterChef** unless deliberate, audited, governance-approved migration | `CONTRACT_PRESERVATION_MAP` is baseline truth |
| I3 | **No fake TVL, APR, routes, users, or claims** — all displayed metrics must be sourced from on-chain data, indexed subgraphs, or labeled estimates | UI and API must expose `data_source` and `as_of` fields |
| I4 | **Machine-readable by default** — every economic primitive publishes or plans a schema-backed manifest | JSON Schema / OpenAPI for public endpoints |
| I5 | **Treasury-accounted by default** — every fee event maps to Treasury Runtime with traceable $MARCO attribution | No off-ledger platform fees |
| I6 | **Human UI is secondary to agent compatibility** — if UI and API disagree, API + on-chain truth wins | Agents are first-class citizens |
| I7 | **Safety before expansion** — risk engine and lock verification precede new launch types | No new paid launch SKUs without risk review |

---

## 4. Core organs

Each organ is a logical subsystem. Implementation may span contracts, indexers, APIs, and UI — but each must have a named owner, manifest, and D87 alignment (see §9).

### 4.1 Smart Routing Engine

Aggregates liquidity across legacy Melega V2 pairs, stable pools, and future pools. Produces **quotes** and **route plans** with explicit path, price impact, fee breakdown, and contract addresses. Never returns a route that does not exist on-chain.

### 4.2 Token Registry

Canonical record of tokens: `chainId`, `address`, `decimals`, `symbol`, `name`, `logoURI`, `listing_status`, `risk_tier`, `fee_paid`, `verified_at`. Distinct from static JSON token lists — supports lifecycle (pending → listed → warned → delisted).

### 4.3 Project Registry

Higher-level entity: team, links, manifest, Space profile, campaign history, reputation score. Links one or more tokens and liquidity programs. Machine ID: `project_id` (stable, non-address-derived).

### 4.4 Farm Factory

Creates and registers farm programs (MasterChef pid mappings, reward schedules). Phase 1: read legacy configs. Phase 2+: governed creation with MARCO fees and audit trail.

### 4.5 Pool Factory

Creates sousChef / staking pools and vault configurations. Same phased approach as Farm Factory.

### 4.6 Liquidity Lock Center

Indexes and verifies LP locks (time, amount, locker contract, beneficiary). Surfaces lock status to humans and agents. No “locked” label without on-chain proof.

### 4.7 Token Lock / Vesting Center

Non-LP token locks and vesting schedules. Supports launch compliance and founder commitments.

### 4.8 Token Generator

Guided token deployment (standard templates only in early phases). Outputs contract address + registry entry + fee receipt. No unaudited custom bytecode in MVP.

### 4.9 AI Launch Assistant

MELEGA AI–powered workflow: checklist, risk disclosure, fee estimation, manifest generation, campaign draft. **Advisory only** — on-chain actions require wallet/agent signature.

### 4.10 Project AI Pages

Human-readable + machine-readable project surface: narrative, metrics (sourced), locks, farms, pools, risk tier, Radar alerts. Hosted under Space/Labs integration.

### 4.11 Agent API

Authenticated and public tiers for machine clients: quote, route, registry, risk, locks, fees. Rate-limited, versioned, OpenAPI-documented.

### 4.12 Economic Brain

Coordination layer connecting Radar signals, fee schedules, routing preferences, and treasury allocation rules. Bounded execution per D87 — no unbounded autonomous spending.

### 4.13 Treasury Fee Router

On-chain or runtime module that collects $MARCO fees, emits events for Treasury Runtime, and supports SmartDrop attribution.

### 4.14 Risk Engine

Token and project scoring: honeypot checks, liquidity depth, lock presence, holder concentration, metadata integrity, stale farm detection. Outputs **tiers**, not binary “safe.”

### 4.15 Reputation Engine

Long-horizon project and address reputation from on-chain behavior, lock history, fee payment, Radar incidents, and community reports. Never overrides risk tiers silently.

---

## 5. Human workflows

### 5.1 Founder workflow

| Step | Action | Fee (MARCO) | Output |
|------|--------|-------------|--------|
| F1 | Create token (generator or import) | Token generator fee | Contract + registry draft |
| F2 | List project | Listing fee | `project_id` + manifest |
| F3 | Upload logo | Logo verification fee | `logoURI` + verification status |
| F4 | Create liquidity | Swap/LP gas + optional listing | LP pair on legacy or new factory |
| F5 | Create farm | Farm creation fee | Farm config + MasterChef pid (governed) |
| F6 | Create pool | Pool creation fee | sousChef / vault entry |
| F7 | Lock liquidity | LP lock fee | Verified lock record |
| F8 | Launch campaign | AI launch assistant + premium profile fees | Space campaign + Radar watch |
| F9 | Pay ongoing fees | Per fee schedule | Treasury receipt |

Founders never receive implicit platform endorsement. All paid listings display **“Listed, not audited”** unless a separate audit badge is verified.

### 5.2 Trader workflow

| Step | Action | Data sources |
|------|--------|--------------|
| T1 | Swap | Smart Routing Engine → legacy router execution |
| T2 | Inspect token risk | Risk Engine tier + warnings |
| T3 | Inspect liquidity depth | On-chain reserves + pair index |
| T4 | Inspect locks | Lock Center verification |
| T5 | Inspect farms/pools | Farm/Pool Factory registry + live multicall |
| T6 | Inspect project intelligence | Project AI Page + Radar feed |

Traders must always see **price impact, route path, and fee breakdown** before confirmation.

---

## 6. Agent workflows

AI agents (MELEGA AI, KIRI operators, third-party integrators) **must** be able to perform the following without browser automation:

| Workflow | Method | Required fields in response |
|----------|--------|----------------------------|
| Quote routes | `GET /api/public/dex/quote` | `routes[]`, `inputAmount`, `outputAmount`, `priceImpact`, `contracts[]` |
| Compare liquidity | `GET /api/public/dex/routes` + token pair params | `depth`, `sources`, `as_of` |
| Inspect token risk | `GET /api/public/dex/risk?token=` | `tier`, `signals[]`, `as_of`, `disclaimer` |
| Inspect project identity | `GET /api/public/dex/projects/:id` | `manifest`, `tokens[]`, `reputation` |
| Verify locks | `GET /api/public/dex/locks` | `locker`, `amount`, `unlock_at`, `tx_hash`, `verified` |
| Detect stale farms | `GET /api/public/dex/farms` | `is_active`, `last_reward_block`, `stale_reason` |
| Query fee schedules | `GET /api/public/dex/fees` | `sku`, `marco_amount`, `treasury_destination` |
| Read machine manifests | `GET /.well-known/melega-dex.json` | `version`, `chains[]`, `endpoints[]`, `schemas` |
| Execute best-route suggestions | Agent API write tier (Phase 3) | Signed tx payload or calldata + simulation receipt |

Agents use the same economic truth as humans. **No agent-only shortcuts** that bypass risk disclosure or fee accounting.

---

## 7. Machine endpoints

Future endpoint families. All responses: JSON, versioned (`api_version`), timestamped (`as_of`), and schema-linked.

### 7.1 Well-known discovery

| Endpoint | Purpose |
|----------|---------|
| `/.well-known/melega-dex.json` | Primary discovery document: chains, routers (read-only refs), API base, schema URLs, treasury addresses |
| `/.well-known/kiri-dex-surface.json` | KIRI CIVILIZATION overlay: governance hooks, Space links, D87 policy version |

### 7.2 Public API (`/api/public/dex/*`)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/public/dex/manifest` | GET | Full platform manifest (superset of well-known) |
| `/api/public/dex/routes` | GET | Enumerate possible routes for token pair |
| `/api/public/dex/quote` | GET | Best quote with path and fees |
| `/api/public/dex/tokens` | GET | Token registry (paginated, filterable) |
| `/api/public/dex/projects` | GET | Project registry |
| `/api/public/dex/farms` | GET | Farm registry + live status |
| `/api/public/dex/pools` | GET | Pool registry + live status |
| `/api/public/dex/locks` | GET | LP and token locks |
| `/api/public/dex/risk` | GET | Risk tiers and signals |
| `/api/public/dex/treasury` | GET | Public treasury aggregates (no secrets) |
| `/api/public/dex/fees` | GET | Active fee schedule in MARCO |

### 7.3 Response contract (all endpoints)

```json
{
  "api_version": "1.0.0",
  "as_of": "2026-06-26T00:00:00Z",
  "data_source": "on-chain|indexer|computed",
  "payload": {},
  "disclaimer": "Not financial advice. Listed ≠ audited."
}
```

---

## 8. Fee economy

All platform fees are denominated in **$MARCO** unless governance approves additional settlement tokens. Every fee payment emits a **Treasury Runtime** event.

### 8.1 Initial fee framework (proposal)

| SKU | Description | Suggested MARCO range | Treasury tag |
|-----|-------------|----------------------|--------------|
| Swap platform fee | Optional protocol fee on swaps (basis points) | 0.05%–0.25% equivalent in MARCO or native fee switch | `treasury.swap` |
| Listing fee | Token/project registry listing | Fixed MARCO per chain | `treasury.listing` |
| Logo verification fee | Manual or AI-assisted logo attestation | Fixed MARCO | `treasury.logo` |
| Farm creation fee | New farm program registration | Fixed MARCO + per-pid surcharge | `treasury.farm` |
| Pool creation fee | New sousChef / vault pool | Fixed MARCO | `treasury.pool` |
| LP lock fee | Lock Center registration | Fixed MARCO per lock | `treasury.lock.lp` |
| Token lock fee | Vesting lock registration | Fixed MARCO per schedule | `treasury.lock.token` |
| Token generator fee | Standard token deploy | Fixed MARCO per deploy | `treasury.generator` |
| AI launch assistant fee | Launch workflow + manifest | Fixed MARCO per campaign | `treasury.launch.ai` |
| Premium project profile fee | Enhanced Project AI Page | Recurring MARCO (monthly) | `treasury.profile.premium` |

**Rules:**

- Fee amounts are governance parameters — published at `/api/public/dex/fees`, never hardcoded only in UI.
- SmartDrop may **rebate** fees for verified ecosystem actions; rebates are treasury-accounted, not hidden discounts.
- No fee bypass for internal teams without public disclosure in treasury reports.

---

## 9. D87 alignment

Every core organ (§4) must satisfy D87 principles:

| D87 principle | Melega DEX application |
|---------------|------------------------|
| **Explainability** | Every quote, risk tier, and fee shows human- and machine-readable rationale |
| **Observability** | Radar + public logs + `as_of` on all API responses |
| **Machine ingestion** | Well-known manifests, JSON Schema, OpenAPI, stable IDs |
| **Economic loop** | Fees → Treasury Runtime → SmartDrop / Labs / Space reinvestment (governed) |
| **Treasury accounting** | No off-ledger platform revenue; MARCO receipts traceable |
| **No fake state** | Invariant I3; stale farms flagged, not hidden |
| **Governance readiness** | Migration and fee changes require proposal + audit reference |
| **Autonomous but bounded execution** | Agents act within policy envelopes; Economic Brain cannot exceed bounds |

### Organ → D87 mapping (summary)

| Organ | Explainability | Observability | Machine | Treasury | Bounded autonomy |
|-------|----------------|---------------|---------|----------|------------------|
| Smart Routing Engine | Path + impact | Quote logs | ✓ | Swap fees | Route whitelist |
| Token Registry | Listing criteria | Status changes | ✓ | Listing fees | Delist governance |
| Project Registry | Manifest | Radar link | ✓ | Profile fees | No auto-endorse |
| Farm/Pool Factory | Creation rules | pid/pool events | ✓ | Creation fees | Governance create |
| Lock Centers | Proof links | Lock events | ✓ | Lock fees | Read-only verify |
| Token Generator | Template spec | Deploy tx | ✓ | Generator fees | Template-only MVP |
| AI Launch Assistant | Checklist output | Session log | ✓ | Launch fees | Advisory only |
| Agent API | OpenAPI | Rate + audit log | ✓ | — | Scoped keys |
| Economic Brain | Policy doc | Decision log | ✓ | Allocation rules | D87 envelope |
| Treasury Fee Router | Fee schedule | On-chain events | ✓ | Core | Immutable routing |
| Risk Engine | Signal list | Tier history | ✓ | — | No trade blocking without UI |
| Reputation Engine | Score factors | History | ✓ | — | Non-blocking signals |

---

## 10. Migration policy

| Rule | Detail |
|------|--------|
| **Legacy compatibility first** | Phase 1–2 default execution uses existing MelegaSwapV2 routers and factories per `CONTRACT_PRESERVATION_MAP` |
| **No forced liquidity migration** | Users never required to move LP to a new factory to continue trading |
| **Inclusive smart routing** | Phase 2+ Smart Routing Engine **includes** legacy Melega pairs in its graph |
| **Migration gate** | Any router/factory/MasterChef change requires: (1) security audit, (2) published migration plan, (3) governance vote, (4) opt-in user flow, (5) rollback plan |
| **ILO / NFT** | Module removal or contract change only after isolation proof and governance — same gate |
| **Indexer migration** | Subgraph or indexer URL changes must not break API manifests without version bump |

---

## 11. Safety and risk

| Control | Implementation |
|---------|----------------|
| **Scam prevention** | Risk Engine tiers; warning modals; blocklist for known malicious addresses (OFAC + community reports) |
| **Token metadata validation** | Symbol/name/decimal mismatch checks; logo URI integrity; phishing similarity detection |
| **Malicious project reporting** | Radar intake → human review → registry status change |
| **Lock verification** | Lock Center reads locker contract; UI cannot claim lock without `verified: true` |
| **Warning labels** | `unverified`, `high_risk`, `stale_farm`, `low_liquidity` — always visible, never styled as neutral |
| **No hidden endorsements** | Payment for listing ≠ audit; badges are explicit and sourced |
| **No unverified APY claims** | APR must show `calculation_method`, `reward_token`, `as_of`; stale farms show last block not current APR |

---

## 12. Implementation roadmap

Work packages are sequential unless noted. **WP1 is complete** (brand shell on `phase1-brand-shell`).

| WP | Name | Phase | Deliverables | Constraints |
|----|------|-------|--------------|-------------|
| **WP1** | Brand shell | 1 | Melega DEX SEO, copy, footer, wallet label | ✅ Complete — no contract changes |
| **WP2** | UX shell | 1 | Nav chrome, theme polish, locale sweep | SAFE_FRONTEND_ONLY |
| **WP3** | Machine manifest | 2 | `/.well-known/melega-dex.json`, `/api/public/dex/manifest` | Read-only; no routing changes |
| **WP4** | Token Registry MVP | 2 | Schema + API + admin listing flow + MARCO listing fee | No change to default token list addresses |
| **WP5** | Project Pages | 2 | Project registry + Project AI Page template | Linked to Space |
| **WP6** | Lock Center design | 2 | Lock indexer spec + UI + `/api/public/dex/locks` | Verification required for badges |
| **WP7** | Smart Routing spec | 2 | Route graph including legacy liquidity; quote API | Spec before contract changes |
| **WP8** | Fee / Treasury accounting | 2 | Fee router + Treasury Runtime events + `/fees` endpoint | Testnet first |
| **WP9** | Agent API | 2–3 | OpenAPI, auth, quote/route/risk endpoints | Parity with human truth |
| **WP10** | D87 audit | 2–3 | Full organ compliance review against §9 | Blocks Phase 3 launch |

**Dependency graph:**

```
WP1 → WP2 → WP3 → WP4 → WP5
                  ↘ WP6 → WP7 → WP8 → WP9 → WP10
```

---

## 13. Final doctrine

**Melega DEX is not only a swap interface.**

It is the **decentralized economic execution layer** for Melega AI and Kiri Civilization: where liquidity meets intelligence, where launches are registered and accounted, where agents and humans share the same verifiable economic truth, and where every fee in $MARCO closes the loop through Treasury Runtime.

We build in phases — legacy compatibility first, machine readability second, agent-first execution third — but we build **one constitution**: no fake state, no silent migration, no hidden endorsement, no economic action without observability.

*This document is the law of the surface. Code that contradicts it does not ship.*

---

## Document control

| Field | Value |
|-------|-------|
| Document ID | `MELEGA-DEX-CONSTITUTION-V1` |
| Supersedes | — |
| Related | `AUDIT_REPORT.md`, `CONTRACT_PRESERVATION_MAP.md`, `PHASE_1_SAFE_RESTYLE_PLAN.md` |
| Next review | Upon WP3 kickoff or governance proposal |
