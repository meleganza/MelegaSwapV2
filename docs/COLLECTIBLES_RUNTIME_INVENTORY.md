# Collectibles Runtime Inventory — R023 Phase A

**Route:** `/collectibles` (`CollectiblesStudioScreen`)  
**Date:** 2026-07-03  
**Mission:** Activate Collectibles Digital Identity runtime. No UI/CSS/layout changes.

---

## Route composition

```
pages/collectibles/index.tsx
  └── CollectiblesStudioScreen
        ├── CollectiblesRuntimeProvider (NEW — R023)
        ├── CollectiblesStudioPageHeader (unchanged)
        ├── CollectiblesKpiRow (runtime — was COLLECTIBLES_KPIS mock)
        ├── FeaturedCollectionPanel (runtime — was FEATURED_COLLECTION mock)
        ├── AICollectionAdvisorPanel (runtime — was AI_ADVISOR_ROWS mock)
        ├── CollectiblesFilterRow (runtime filter — was local-only chips)
        ├── CollectiblesGrid / CollectibleGridCard (runtime — was COLLECTION_CARDS)
        ├── CollectiblesRightSidebar (runtime — was sidebar mock lists)
        └── CollectiblesBottomCta (unchanged)

pages/collectibles/[slug].tsx → registry detail (unchanged)
```

---

## Component inventory

| Component | Prior source | Runtime source (R023) | Replacement strategy | Dependencies | Risk |
|-----------|--------------|----------------------|----------------------|--------------|------|
| `collectiblesStudioData.ts` | Mock arrays (10 cards, KPIs, advisor, sidebar) | **Types + filter chips + badge constants only** | All mock exports removed | — | None |
| `collectiblesRuntime/useWalletCollectibleOwnership.ts` | — | DNFT `walletOfOwner` per indexed slug | Single ownership source | `useDNFTContract`, registry | Low |
| `collectiblesRuntime/useCollectiblesIdentityRuntime.ts` | — | Orchestrator hook | Registry + wallet + projects | registry, projects | Low |
| `collectiblesRuntime/CollectiblesRuntimeContext.tsx` | — | Context provider | New | orchestrator | Low |
| `collectiblesRuntime/formatCollectiblesRuntime.ts` | — | Map registry → `CollectionCard` shape | Card layout preserved | privileges, membership | Low |
| `collectiblesRuntime/buildCollectiblePrivileges.ts` | Hardcoded badges | Category-derived privileges | No hardcoded badges | registry category | Low |
| `collectiblesRuntime/buildMembershipStatus.ts` | Fake tiers | Genesis/Builder/AI Passport from registry | Wallet-specific | ownership | Low |
| `collectiblesRuntime/buildCollectibleHealth.ts` | Fake scores | Green/yellow/red dimensions | Rule-based only | registry + ownership | Low |
| `collectiblesRuntime/buildAiAdvisor.ts` | `AI_ADVISOR_ROWS` | Heuristic suggestions only | No auto-actions | health, membership | Low |
| `collectiblesRuntime/buildMachineProfile.ts` | — | Identity JSON v1 | Collapsed by default | all runtime | Low |
| `collectiblesRuntime/collectiblesRuntimeErrors.ts` | — | Machine + human error codes | Phase L | — | Low |
| `collectiblesRuntime/formatCommandCenterCollectibles.ts` | CC duplicate hook | Shared with Command Center | Remove duplicate ownership | wallet hook | Low |
| `CollectiblesKpiRow` | `COLLECTIBLES_KPIS` | `aggregateCollectiblesKpis()` | Real indexed count + wallet owned | runtime | Low |
| `FeaturedCollectionPanel` | Hardcoded featured | `buildFeaturedCollection()` | Registry metadata only | runtime | Low |
| `AICollectionAdvisorPanel` | Mock advisor rows | `advisorRows` + machine JSON | Suggestions only | runtime | Low |
| `CollectiblesFilterRow` | Local state only | `setFilter` on live list | Chip → category filter | runtime | Low |
| `CollectiblesGrid` | `COLLECTION_CARDS` (10 fake) | `useCollectiblesRuntime().cards` | **3 registry collectibles only** | — | Low |
| `CollectiblesRightSidebar` | Mock trending/activity | `buildSidebarLists()` | Derived from live cards | runtime | Low |
| Command Center `useCollectiblesWalletOwnership.ts` | Duplicate DNFT hook | **Deleted** — uses shared `useWalletCollectibleOwnership` | Single source of truth | collectiblesRuntime | Low |

---

## Mock elimination checklist

| Mock artifact | Status |
|---------------|--------|
| `COLLECTION_CARDS` (10 fake collections, fake owners, fake rarity) | ✅ Removed — `getAllCollectibles()` only (3 records) |
| `COLLECTIBLES_KPIS` (fake totals, fake volume) | ✅ Aggregated from registry + wallet |
| `FEATURED_COLLECTION` (placeholder metadata) | ✅ Top live registry collectible |
| `AI_ADVISOR_ROWS` (hardcoded scores) | ✅ `buildAiAdvisorRows()` heuristics |
| Sidebar trending / activity mocks | ✅ Derived from runtime cards |
| Fake floor price / 24h volume / global owners | ✅ Display **Unavailable** |
| Hardcoded privilege badges on cards | ✅ `buildCollectiblePrivileges()` from category |
| Command Center duplicate ownership hook | ✅ Consolidated to `collectiblesRuntime` |

---

## Registry truth (Phase C)

| Slug | Status | Indexed contract | Wallet ownership |
|------|--------|------------------|------------------|
| `babymarco-genesis` | `live_or_legacy_existing` | ✅ BSC DNFT | `walletOfOwner` |
| `masterm-identity` | `planned_or_external` | ❌ | Unavailable / Not owned |
| `achievement-collectibles` | `planned` | ❌ | Unavailable / Not owned |

No placeholder metadata — supply minted count shows **Unavailable** when not indexed.

---

## Privileges & membership (Phases D–F)

| Dimension | Source |
|-----------|--------|
| Privileges (Builder, Validator, AI Agent, etc.) | `CATEGORY_PRIVILEGES` + ownership status |
| Utility status (Active/Inactive/Pending/Revoked) | Registry status + wallet ownership |
| Membership tier (Genesis, Builder, AI Passport, etc.) | `resolveMembershipTier()` from slug/category |
| Upgrade eligibility | `!owned && contract.indexed && live` |

---

## Projects integration (Phase H)

- `getAllProjects()` + `enrichProject` linked via `featuredProject` on collection cards
- No duplicated project registry — reads canonical Projects runtime data

---

## Error codes (Phase L)

| Code | Message |
|------|---------|
| `NO_COLLECTION` | No collectible collection is indexed in the registry. |
| `NO_METADATA` | Collection metadata is unavailable from registry or on-chain sources. |
| `NO_OWNER` | Wallet is not connected — ownership cannot be verified. |
| `NOT_ELIGIBLE` | Wallet is not eligible for this identity collectible. |
| `IDENTITY_LOCKED` | Identity collectible is locked for this wallet. |
| `MEMBERSHIP_EXPIRED` | Membership tier has expired or is not active. |
| `PRIVILEGE_UNAVAILABLE` | Requested privilege is not available for this collectible. |
| `NO_WALLET` | Connect a wallet to verify collectible ownership. |

---

## Known limitations

- Only **1 of 3** collectibles has an indexed on-chain contract (`babymarco-genesis`).
- Global market metrics (floor, volume, owner count) are **Unavailable** — never estimated.
- Validator / delegation / expiration states display **Unavailable** or **Pending** until on-chain indexing exists.
- AI advisor is **heuristic only** — suggestions, no automatic mint or transfer actions.
