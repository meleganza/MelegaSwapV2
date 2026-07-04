# Melega DEX User Flow

**Status:** FROZEN — Constitutional reference  
**Companion:** `DEX_CONSTITUTION.md`  
**Scope:** Human, AI, builder, project owner, and infrastructure journeys

---

## Overview

Melega DEX serves five distinct journey types. Each journey respects the **single-responsibility page constitution** — users move between pages; pages do not duplicate each other's missions.

```
                    ┌─────────────┐
                    │  Overview   │  Orient
                    └──────┬──────┘
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
      ┌────────┐    ┌──────────┐    ┌───────────┐
      │ Trade  │    │ Discover │    │   Build   │
      │ Operate│    │  Rank    │    │ Infra     │
      └────────┘    └──────────┘    └───────────┘
           │               │               │
           ▼               ▼               ▼
      ┌────────┐    ┌──────────┐    ┌───────────┐
      │  Earn  │    │ Observe  │    │  Own      │
      │ Farms  │    │  Radar   │    │ Collect.  │
      │ Pools  │    │          │    │           │
      └────────┘    └──────────┘    └───────────┘
```

---

## 1. Human journey

The default path for a wallet-connected user exploring the Melega civilization.

### Entry

1. **Overview** (`/`) — Understand ecosystem state, MARCO economy, entry points to Trade and Earn.
2. **Connect wallet** — Required for execution surfaces; read-only discovery works without wallet.

### Operate

3. **Trade** (`/trade`) — Swap tokens via smart routing. Human selects pair, amount, reviews route, confirms.
4. **Liquidity Studio** (`/liquidity-studio`) — Add or manage LP positions as infrastructure participation.

### Earn

5. **Farms** (`/farms`) — Select farm, stake LP or single asset, harvest rewards.
6. **Pools** (`/pools`) — Stake in structured pools with lock terms and reward tokens.

### Discover

7. **Trending** (`/trending`) — See ranked projects and assets by constitutional signals.
8. **Projects** (`/projects`) — Read project profiles, infrastructure metadata, verification state.
9. **Radar** (`/radar`) — Observe live signals, whale activity, contract intelligence.

### Own

10. **Collectibles** (`/collectibles`) — Browse civilization identities, memberships, governance rights.

### Future

11. **Portfolio** — Aggregate positions, history, and identity state (planned).
12. **Settings** — Preferences and chain defaults (planned).

### Human journey principles

- One page, one responsibility per step.
- No fundraising or launchpad flows in the human journey.
- Execution requires explicit user confirmation on Trade, Farms, Pools, Liquidity.

---

## 2. AI journey

The path for AI agents and machine consumers operating on structured DEX outputs.

### Observe

1. **Radar** — Consume live event stream, heatmap, KPI signals, contract intelligence JSON-shaped outputs.
2. **Trending** — Read ranking tables and delta signals for prioritization.
3. **Projects** — Parse project directory records and infrastructure metadata.

### Advise

4. **Build Studio AI Advisor** — Receive recommended workflow, confidence score, reasoning (machine-parseable).
5. **Build Studio AI Validation** — Read validation checklist statuses (green/yellow/red).

### Build (dry-run / certified)

6. **Build Studio Import Pipeline** — Paste contract → AI recognition → infrastructure analysis → manifest.
7. **AI Manifest** — Copy or download JSON specification (`manifestVersion`, `capabilities`, `configuration`).
8. **KERL certified handshake** — Certified `DryRunHandoffPackage` → handshake validation → dry-run gateway (internal, no UI exposure).

### AI journey outputs

| Output | Producer |
|--------|----------|
| AI Manifest JSON | Build Studio |
| Validation report | Build Studio |
| Radar signal records | Radar |
| Trending rank data | Trending |
| Dry-run ExecutionReport | KERL gateway (internal) |

### AI journey boundaries

- AI **observes and advises** on Radar, Trending, Projects, Build Studio.
- AI **does not** bypass certification or dry-run gates.
- No Swarm runtime imports in DEX UI; certification is validated locally.

---

## 3. Builder journey

For developers and operators creating economic infrastructure.

### Primary path (constitutional)

1. **Build Studio** (`/build-studio`) — **Import Existing Token** (primary entry).
2. Paste contract → AI pipeline → infrastructure analysis.
3. Select **Infrastructure Templates** — staking pool type (e.g. Reward MARCO Holders).
4. Configure farm with **AI simulation summary** (read-only preview).
5. Review **AI Manifest** — machine-readable specification.
6. Activate **Infrastructure Extensions** (optional) — Radar Visibility, Projects Verification, Trending Boost, Space Audit, SmartDrop, Labs Narrative.
7. **Trusted Infrastructure** panel confirms constitutional compliance before deployment mindset.

### Secondary path (reduced emphasis)

- **Create Token** — New token with manifest; not the primary workflow.
- **Builder Templates** — Governance, reward, enterprise token shapes.

### Builder journey rules

- Import-first, not deploy-first.
- Extensions activate **after** core infrastructure validation.
- No fundraising, ICO, or IDO flows.

---

## 4. Project owner journey

For teams with existing tokens entering the Melega ecosystem.

1. **Import Existing Token** (Build Studio) — Primary entry.
2. **Projects Verification** (extension) — Profile against constitutional standards.
3. **Radar Indexing** (extension) — Operational discovery.
4. **Trending Eligibility** (extension) — Ranking after validation.
5. **Projects** (`/projects`) — Published directory presence.
6. **Professional Audit** (Space extension) — Optional security infrastructure.
7. **Labs Narrative Activation** (extension) — Narrative separate from DEX infrastructure.

### Project owner principles

- Infrastructure before narrative.
- Verification before trending boost.
- Space for professional services; DEX for infrastructure.

---

## 5. Infrastructure journey

The end-to-end lifecycle of economic infrastructure from idea to DEX-ready state.

```
Idea / Existing Token
        ↓
Import or Create (Build Studio)
        ↓
AI Validation + Manifest
        ↓
Staking Pool / Farm (Infrastructure Templates)
        ↓
Radar Indexing
        ↓
Projects Profile
        ↓
Trending Eligibility
        ↓
Trade / Liquidity / Earn surfaces
        ↓
Portfolio aggregation (future)
```

### Infrastructure journey stages

| Stage | Page / module | Output |
|-------|---------------|--------|
| Detection | Build Studio Import | Contract analysis, detections list |
| Validation | Build Studio AI Validation | Checklist, infrastructure score |
| Manifest | Build Studio AI Manifest | JSON specification |
| Pool/Farm | Build Studio second row | Operational parameters |
| Index | Radar (extension) | Discovery signals |
| Describe | Projects | Directory entry |
| Rank | Trending (extension) | Eligibility flags |
| Execute | Trade, Liquidity, Farms, Pools | Live economic action |
| Certify | KERL handshake (internal) | Dry-run ExecutionReport |

### Infrastructure journey guarantees

- Machine-readable before deployment mindset.
- Dry-run suppression until constitutional live activation (future mission).
- No settlement or treasury mutation in dry-run path.

---

## Cross-journey rules

1. **No responsibility duplication** — each step uses exactly one constitutional page.
2. **Truth over hype** — journeys surface operational data, not marketing narratives.
3. **Labs ≠ DEX** — narrative activation is an extension; infrastructure is DEX core.
4. **Human and AI parity** — same pages, different consumption mode (UI vs structured output).

---

**Reference:** `DEX_CONSTITUTION.md`  
**Verdict:** `DEX_CONSTITUTION_FROZEN`
