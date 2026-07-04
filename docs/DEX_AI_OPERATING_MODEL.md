# Melega DEX AI Operating Model

**Status:** FROZEN — Constitutional reference  
**Companion:** `DEX_CONSTITUTION.md`, `DEX_USER_FLOW.md`  
**KERL reference:** `docs/kerl_live_certified_dry_run_handshake_v1.md`

---

## 1. Operating model overview

Melega DEX operates as an **AI-native economic civilization** with a strict separation of concerns. AI is not a chatbot layer — it is an **operating substrate** that observes, describes, ranks, builds, executes (when permitted), and aggregates.

```
┌─────────────────────────────────────────────────────────────────┐
│                        LABS (external)                         │
│                   Creates narratives                             │
└────────────────────────────┬────────────────────────────────────┘
                             │ narrative extension only
┌────────────────────────────▼────────────────────────────────────┐
│                         MELEGA DEX                                │
│  ┌─────────┐ ┌──────────┐ ┌─────────┐ ┌─────────────┐           │
│  │ Radar   │ │ Projects │ │Trending │ │Build Studio │           │
│  │ observes│ │ describes│ │ ranks   │ │ builds      │           │
│  └────┬────┘ └────┬─────┘ └────┬────┘ └──────┬──────┘           │
│       │           │            │              │                   │
│       └───────────┴────────────┴──────────────┘                   │
│                         │                                         │
│              ┌──────────▼──────────┐                              │
│              │ Trade executes      │                              │
│              │ Portfolio aggregates│ (future)                     │
│              └──────────┬──────────┘                              │
│                         │                                         │
│              ┌──────────▼──────────┐                              │
│              │ KERL boundary       │ (internal)                   │
│              │ dry-run / certify   │                              │
│              └─────────────────────┘                              │
└───────────────────────────────────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                        SPACE (external)                          │
│              Professional reports & services                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Entity responsibilities (AI lens)

| Entity | AI operating verb | What AI does | What AI must not do |
|--------|-------------------|--------------|---------------------|
| **Radar** | Observes | Classify events, score confidence, stream live signals, contract intelligence | Execute trades, build infrastructure, fundraise |
| **Projects** | Describes | Index project metadata, infrastructure bindings, verification state | Rank (Trending), observe live (Radar), execute (Trade) |
| **Trending** | Ranks | Prioritize discovery order, delta signals, eligibility flags | Full project profiles (Projects), live whale alerts (Radar) |
| **Build Studio** | Builds | Import analysis, validation, manifest generation, advisor workflow | Launchpad flows, ICO/IDO, live execution without gates |
| **Trade** | Executes | Route selection, swap execution (when live path enabled) | Discovery, ranking, infrastructure creation |
| **Portfolio** | Aggregates | Unify positions, builds, identities (future) | Execute, observe, rank |
| **Space** | Reports | Professional audit, security reports (extension) | DEX infrastructure ownership |
| **Labs** | Narrates | Story, activation, civilization narrative (extension) | DEX infrastructure, execution, settlement |
| **Collectibles** | Identifies | Civilization rights, membership, agent compatibility | Generic NFT speculation |

---

## 3. Page-level AI behaviors

### Radar — observes

- **Inputs:** Contract addresses, chain context, filter parameters.
- **Outputs:** Live event stream, heatmap, KPI deltas, discovery cards, timeline events with confidence scores.
- **Machine-readable:** Event types, severity, confidence percentages, indexed counts.
- **Human-readable:** Operational console copy — "AI operational console for live discovery, wallet activity and contract intelligence."

### Projects — describes

- **Inputs:** Project slug, registry records.
- **Outputs:** Project profiles, infrastructure metadata, constitutional tags.
- **Machine-readable:** Structured project records for agent consumption.
- **Human-readable:** Directory presentation with mission and infrastructure summary.

### Trending — ranks

- **Inputs:** Constitutional trending signals, eligibility state.
- **Outputs:** Ranked lists, delta indicators, boost eligibility.
- **Machine-readable:** Rank order, signal weights, 24h deltas.
- **Human-readable:** Discovery ranking UI without duplicating full project pages.

### Build Studio — builds

- **Inputs:** Contract paste, template selection, extension activation requests.
- **Outputs:** AI Manifest JSON, validation checklist, advisor workflow, simulation summaries.
- **Machine-readable:** `manifestVersion`, `capabilities`, `permissions`, `configuration`, `riskSummary`.
- **Human-readable:** Import-first UI, Trusted Infrastructure panel, operational descriptions.

### Trade — executes

- **Inputs:** Currency pair, amount, slippage tolerance, wallet signature (live path).
- **Outputs:** Execution evidence, transaction receipts (live), dry-run reports (KERL path).
- **Machine-readable:** ExecutionInstruction, ExecutionReport (KERL contract).
- **Human-readable:** Swap panel, route display, confirmation flow.

### Portfolio — aggregates (future)

- **Inputs:** Wallet address, chain scope.
- **Outputs:** Unified dashboard of positions, farms, pools, builds, collectibles.
- **Machine-readable:** Aggregated state document for agents.
- **Human-readable:** Personal ecosystem dashboard.

### Space — professional reports

- **Inputs:** Audit requests, project references (via Build Studio extension).
- **Outputs:** Professional security and compliance reports.
- **Boundary:** Space commercializes services; DEX does not own audit execution.

### Labs — narratives

- **Inputs:** Narrative activation requests (via Build Studio extension).
- **Outputs:** Civilization narratives, story activation.
- **Boundary:** Labs creates economies narratively; DEX executes economically.

---

## 4. KERL interaction boundaries

**KERL decides. Melega DEX executes.** Execution never decides.

### Established DEX capabilities (internal)

| Layer | Module | Mode |
|-------|--------|------|
| Execution Gateway | `lib/execution-gateway` | `DRY_RUN_ONLY` |
| Handoff Consumer | `lib/execution-handoff-consumer` | Internal |
| Certified Handshake | `performCertifiedDryRunHandshake` | Phase 6 |
| RC1 Offline Fixture | Test-only validation | No network |

### Certified pipeline

```
Certified DryRunHandoffPackage
        ↓
Certified Handshake (compatibility certification required)
        ↓
Dry-Run Handoff Consumer
        ↓
Execution Gateway (dryRunExecutionInstruction)
        ↓
DryRun ExecutionReport
```

### KERL boundaries (permanent)

| Rule | Enforcement |
|------|-------------|
| No Swarm runtime imports in DEX | `ownership.ts` forbidden import lists |
| No adapter dispatch in dry-run path | Gateway + tests |
| No wallet submission in dry-run path | Manifest + tracker tests |
| No transaction hash in dry-run manifest | Validation rejects |
| No settlement / treasury mutation | Forbidden field scan |
| Certification required for handshake | `outcome === compatible` |
| Reject unknown/incompatible certification | Handshake error codes |
| No public API exposure | UI/API isolation tests |
| No UI commit button wiring to handoff consumer | Surface isolation tests |

### KERL verdicts (reference)

| Verdict | Meaning |
|---------|---------|
| `KERL_REMOTE_CONTRACT_COMPATIBILITY_CERTIFIED` | Remote contract compatibility certified |
| `KERL_CERTIFIED_DRY_RUN_HANDSHAKE_ESTABLISHED` | Phase 6 handshake operational |
| `KERL_DEX_DRY_RUN_HANDOFF_CONSUMER_ESTABLISHED` | Phase 3 consumer operational |

### What KERL does not do (in current constitutional state)

- Live swap execution via KERL handoff (not enabled)
- Bridge settlement via handoff consumer
- Treasury submission
- Receipt polling in dry-run path
- Public REST/WebSocket APIs for handoff

---

## 5. AI output contracts

Where appropriate, pages must emit or support these structured outputs:

| Output type | Producer | Format |
|-------------|----------|--------|
| AI Manifest | Build Studio | JSON |
| Validation checklist | Build Studio | Structured status array |
| Advisor workflow | Build Studio | Ordered steps + confidence |
| Radar event | Radar | Event record with severity + confidence |
| Trending rank row | Trending | Rank + delta + eligibility |
| Project profile | Projects | Registry record |
| ExecutionInstruction | KERL / routing | Schema version 1.0 |
| ExecutionReport | Gateway | Dry-run or live status |
| DryRunSuppressionManifest | Gateway | Suppression guarantees |

---

## 6. AI safety principles

1. **Truth over continuity** — reject invalid packages even if UX would prefer success.
2. **Dry-run default** — execution paths require explicit constitutional activation.
3. **No hype generation** — AI copy is operational, not promotional.
4. **Certification gates** — handshake rejects missing/unknown/incompatible certification.
5. **Surface isolation** — internal modules never wired to commit buttons without amendment.

---

## 7. Future AI modules

| Module | AI role |
|--------|---------|
| Digital Identities | Machine-readable wallet/agent identity |
| Agent Workspace | Multi-agent orchestration on constitutional outputs |
| Execution Monitor | Lifecycle observability for dry-run and live |
| Portfolio | Cross-page state aggregation for agents |

---

**Reference:** `DEX_CONSTITUTION.md` Section V  
**Verdict:** `DEX_CONSTITUTION_FROZEN`
