# Mission 19 — Mainnet Readiness Gate

**Date:** 2026-06-28  
**Branch audited:** `mission18-navigation-surface-map` (consolidation tip)  
**Type:** Audit only — no app behavior changes  
**Verdict:** `CONDITIONAL_GO`  
**Machine manifest:** `/registry/readiness/mainnet-gate.json`

---

## Executive Summary

Missions Organ 01 through Mission 18 form a **linear 23-commit stack** ahead of `main`, culminating in `mission18-navigation-surface-map`. The legacy PancakeSwap DEX core (swap, liquidity, farms, pools) remains **production_safe** and was **not modified** by Missions 09–18. A new **constitutional read-model layer** (registry, activation, presence, launch, workspace, collectibles, identity, surface map) is ready for **direct-URL deployment** but is **not yet merged to main** and lacks global menu wiring.

**Recommendation:** Merge the consolidated tip branch to `main` (Mission 20), resolve `translations.json` append-only, keep read-model surfaces secondary, and do not promote `/execution` or `/new-project` as primary launch paths.

---

## 1. Branch Lineage

| Order | Branch | Head (on tip) | Depends on | Risk |
|-------|--------|---------------|------------|------|
| 1 | `organ01-project-registry-core` | `5bc3dad` | main | low |
| 2 | `organ02-asset-registry-spec` | `57a17e0` | organ01 | low |
| 3 | `organ03-economic-venue-registry` | `25df311` | organ02 | low |
| 4 | `organ04-economic-event-registry` | `f61f787` | organ03 | low |
| 5 | `mission05-registry-integration-layer` | `e47509b` | organ04 | medium |
| 6 | `mission06-economic-query-layer` | `e02ae30` | mission05 | low |
| — | *Mission 07 / 08* | *not delivered* | — | — |
| 7 | `mission09-economic-activation-runtime` | `408e054` | mission06 | medium |
| 8 | `mission10-smart-economic-execution` | `65d3f02` | mission09 | low |
| 9 | `mission11-economic-presence-registry` | `55ac12c` | mission10 | medium |
| 10 | `mission12-user-launch-listing-layer` | `7a424e8` | mission11 | low |
| 11 | `mission13-dex-capability-audit` | `06b2dac` | mission12 | low |
| 12 | `mission14-user-economic-workspace` | `ef27a7e` | mission13 | low |
| 13 | `mission15-legacy-ilo-retirement` | `9830b84` | mission14 | medium |
| 14 | `mission16-civilization-collectibles-layer` | `e6cdb99` | mission15 | low |
| 15 | `mission17-economic-identity-layer` | `5591e9f` | mission16 | low |
| 16 | `mission18-navigation-surface-map` | `df68e4c` | mission17 | low |

### Tip commit chain (oldest → newest)

```
dd67070 WP1: safe Melega DEX brand shell
8b5a611 Organ 01 → … → f61f787 Organ 04
e47509b Mission 05 · e02ae30 Mission 06
67c5d0b Mission 09 · 408e054 Fix 09A
65d3d02 Mission 10 · 55ac12c Mission 11 · 7a424e8 Mission 12
06b2dac Mission 13 · ef27a7e Mission 14 · 9830b84 Mission 15
e6cdb99 Mission 16 · 5591e9f Mission 17 · df68e4c Mission 18
```

### Expected merge order

**Preferred:** Single merge of `mission18-navigation-surface-map` → `main` (includes full linear history).

**Alternative:** Sequential branch merges in table order — only needed if preserving per-branch PR history.

### Likely conflicts

| File / area | Risk | Mitigation |
|-------------|------|------------|
| `apps/web/src/config/localization/translations.json` | **HIGH** | ~488 lines added vs `main`. Merge append-only; never delete existing keys. |
| `apps/web/src/pages/ilo.tsx` | medium | Mission 15 replaces rendered view — ensure main has no conflicting ILO UI changes. |
| Cross-link panels in workspace/launch/collectibles/identity | low | Additive only — accept all incoming links. |
| Registry `public/` JSON | low | Additive new directories — no overwrites expected. |

---

## 2. Production Safety — Surface Classification

| Route | Classification | Notes |
|-------|----------------|-------|
| `/swap` | **production_safe** | Legacy live swap |
| `/liquidity` | **production_safe** | Legacy LP |
| `/farms` | **production_safe** | Legacy farms (participate) |
| `/pools` | **production_safe** | Legacy staking pools |
| `/projects` | read_model_only | Static project registry |
| `/assets` | read_model_only | Static asset registry |
| `/venues` | read_model_only | Venue registry — no fake TVL |
| `/events` | read_model_only | Event registry |
| `/graph` | read_model_only | Graph explorer |
| `/query` | read_model_only | Query console |
| `/new-project` | **preview_only** | Activation runtime — no chain writes |
| `/execution` | read_model_only | Illustrative execution samples |
| `/presence` | read_model_only | Economic presence — NOT canonical |
| `/launch` | read_model_only | Launch capability index |
| `/workspace` | read_model_only | Workspace aggregator |
| `/ilo` | **retired** | Supersession page — route preserved |
| `/collectibles` | read_model_only | Civilization collectibles |
| `/identity` | read_model_only | Economic identity — not KYC |
| `/map` | read_model_only | Surface map index |
| `/nft` | **legacy_risky** | BabyMarco mint — BSC on-chain |
| `/viewNFTs` | **legacy_risky** | Legacy NFT wallet |
| `/nftmarket` | **legacy_risky** | Legacy NFT market |
| Farm creation | **blocked** | No user deploy |
| Token listing governance | **blocked** | Missing pipeline |

---

## 3. Execution Safety — Forbidden Files

Audited commits Mission 09–18 individually — **none** modified:

- `exchange.ts`
- `contracts.ts`
- `pools.tsx`
- Token lists
- Router / swap logic
- MasterChef / farms business logic
- Wallet integration hooks
- NFT minting pages (`pages/nft/*`)

| File | Status | Notes |
|------|--------|-------|
| `exchange.ts` | unchanged | — |
| `contracts.ts` | unchanged | — |
| `pools.tsx` | unchanged | — |
| `wagmi.ts` | pre_mission_change | WP1 (`dd67070`) 2-line edit before Organ 01 — review at merge |
| Token lists | unchanged | — |
| NFT mint logic | unchanged | Collectibles/ILO missions did not edit mint pages |

---

## 4. Public Routes Added or Modified

| Route | Mission | Modified? |
|-------|---------|-----------|
| `/projects` | Organ 01 | added |
| `/assets` | Organ 02 | added |
| `/venues` | Organ 03 | added |
| `/events` | Organ 04 | added |
| `/graph` | Mission 05 | added |
| `/query` | Mission 06 | added |
| `/new-project` | Mission 09 | added |
| `/execution` | Mission 10 | added |
| `/presence` | Mission 11 | added |
| `/launch` | Mission 12 | added |
| `/workspace` | Mission 14 | added |
| `/ilo` | Mission 15 | **modified** (retirement UI) |
| `/collectibles` | Mission 16 | added |
| `/identity` | Mission 17 | added |
| `/map` | Mission 18 | added |

Legacy routes **preserved:** `/swap`, `/liquidity`, `/farms`, `/pools`, `/nft`, `/viewNFTs`, `/nftmarket`.

---

## 5. Machine Manifests

### Registry JSON (`/registry/`)

| Path | Source mission |
|------|----------------|
| `/registry/projects/index.json` | Organ 01 |
| `/registry/projects/discovery.json` | Organ 01.2 |
| `/registry/projects/melega-dex.json` | Organ 01 |
| `/registry/assets/index.json` | Organ 02 |
| `/registry/venues/index.json` | Organ 03 |
| `/registry/events/index.json` | Organ 04 |
| `/registry/graph/index.json` | Mission 05 |
| `/registry/query/index.json` | Mission 06 |
| `/registry/activation/preview.json` | Mission 09 |
| `/registry/activation/runtime.json` | Mission 09 |
| `/registry/execution/index.json` | Mission 10 |
| `/registry/presence/index.json` | Mission 11 |
| `/registry/launch/index.json` | Mission 12 |
| `/registry/capabilities/dex-capability-audit.json` | Mission 13 |
| `/registry/workspace/index.json` | Mission 14 |
| `/registry/legacy/ilo-retirement.json` | Mission 15 |
| `/registry/collectibles/index.json` | Mission 16 |
| `/registry/identity/index.json` | Mission 17 |
| `/registry/surfaces/index.json` | Mission 18 |
| `/registry/readiness/mainnet-gate.json` | **Mission 19** |

### Well-known (`/.well-known/`)

- `melega-dex-manifest.json`
- `melega-dex-discovery.json`
- `melega-dex-projects.json`
- `melega-dex-assets.json`
- `melega-dex-venues.json`
- `melega-dex-events.json`
- `melega-dex-graph.json`
- `melega-dex-query.json`
- `melega-dex-presence.json`
- `melega-dex-collectibles.json`

### Generator scripts

`apps/web/scripts/write-*.ts` — 12 scripts including `write-mainnet-readiness-gate.ts`.

---

## 6. Known Legacy Risks

| Risk | Severity | Status |
|------|----------|--------|
| Legacy PancakeSwap UI/uikit dependency | medium | Active for registry pages |
| ILO retired at `/ilo` — external links may expect active pad | medium | Mitigated by supersession CTAs |
| NFT minting legacy but preserved | medium | `/nft` BSC on-chain — not primary nav |
| Live swap/router untouched | low | Confirmed by forbidden-file audit |
| Farm/pool **creation** not user-live | high | Mission 12 BLOCKED — by design |
| Token listing governance missing | high | Mission 13 audit — no submission UI |
| Read models lack wallet-verified balances | low | By design — agents must not infer holdings |
| Multiple isolated remote branches | medium | Prefer single tip merge |

---

## 7. Mainnet Release Recommendation

### Verdict: **CONDITIONAL_GO**

Proceed to mainnet **after** consolidation merge and translations resolution. Core DEX is safe; read-model layer is safe at direct URLs.

### Blockers

1. Stack not merged to `main` (23 commits on tip branch).
2. `translations.json` merge conflict risk (~488 lines).
3. Token listing governance pipeline missing.
4. User farm/pool creation blocked (expected — do not fake).
5. No global menu wiring for new surfaces (direct URL / cross-links only).

### Non-blocker warnings

- Mission 07/08 not delivered as branches (graph/query in 05/06).
- WP1 `wagmi.ts` pre-mission edit.
- Legacy NFT routes remain `legacy_risky`.
- `/execution` illustrative only.

### Can go live now (post-merge)

- Legacy DEX: `/swap`, `/liquidity`, `/farms`, `/pools`
- Registry: `/projects`, `/assets`, `/venues`, `/events`, `/graph`, `/query`, `/presence`
- Operational read models: `/launch`, `/workspace`, `/collectibles`, `/identity`, `/map`
- Retired `/ilo` compatibility page
- All `/registry/` JSON manifests

### Must stay hidden / secondary

- `/execution` — illustrative only
- `/new-project` — preview activation, not production launch pad
- `/nft`, `/viewNFTs`, `/nftmarket` — legacy on-chain
- Non-canonical presence targets (Solana planned, etc.)

### Next implementation mission

**Mission 20: Mainnet Consolidation Merge**

1. Merge `mission18-navigation-surface-map` → `main`
2. Resolve `translations.json` append-only
3. Optional: add `/map` link to footer or docs — **no global UI redesign**
4. Wire token listing governance (Mission 13 follow-up) before promoting `/launch` as primary CTA

---

## Files Created (Mission 19)

| Path | Purpose |
|------|---------|
| `docs/MISSION_19_MAINNET_READINESS_GATE.md` | This report |
| `apps/web/public/registry/readiness/mainnet-gate.json` | Machine manifest |
| `apps/web/src/lib/mainnet-readiness/` | Read-only audit helper |
| `apps/web/scripts/write-mainnet-readiness-gate.ts` | Manifest generator |

Regenerate manifest: `npx tsx apps/web/scripts/write-mainnet-readiness-gate.ts`

---

**MISSION_19_MAINNET_READINESS_GATE_READY**
