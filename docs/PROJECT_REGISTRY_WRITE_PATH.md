# Project Registry Write Path — D87-06

**Mission:** D87-06 Project Registry Write Path  
**Status:** ACTIVE  
**Verdict:** `D87_PROJECT_REGISTRY_WRITE_PATH_READY`  
**Authority:** [`DEX_CONSTITUTION.md`](./DEX_CONSTITUTION.md) · [`DEX_TREASURY_HANDOFF_REPORT.md`](./DEX_TREASURY_HANDOFF_REPORT.md)

---

## Problem

Import Existing Token hit a dead end: unknown contracts returned `PROJECT_NOT_FOUND` because the registry contained only static canonical project(s).

---

## Solution

Dual-tier project registry with a **safe pending write path**:

| Tier | Store | Visibility | Write path |
|------|-------|------------|------------|
| **Canonical** | `STATIC_PROJECTS` + `public/registry/projects/*.json` | Public listing | Manual operator merge only |
| **Pending** | Runtime store + `public/registry/projects/pending/index.json` (seed) | Not canonical | `/api/registry/projects/onboard` |

---

## Storage model

### Canonical Project Registry (unchanged)

- Source: `apps/web/src/registry/projects/projects.data.ts`
- Machine manifests: `public/registry/projects/{slug}.json`
- Index: `public/registry/projects/index.json`
- `isCanonical: true` — only after human promotion

### Pending Project Registry (new)

- Module: `apps/web/src/registry/projects/pending/`
- Client persistence: `localStorage` key `melega.project-registry.pending.v1`
- Server persistence: in-memory Map (warm instance; stateless API validation layer)
- Seed manifest: `public/registry/projects/pending/index.json` (empty — not auto-synced)

**Pending records are never merged into `getAllProjects()` until manually promoted.**

---

## Status lifecycle

```
discovered → pending_review → approved → [manual STATIC_PROJECTS merge] → canonical
                ↓
             rejected / archived
```

| Status | Meaning |
|--------|---------|
| `discovered` | Contract submitted; AI/on-chain discovery ran |
| `pending_review` | Awaiting human/owner review |
| `approved` | Review passed — eligible for manual canonical merge |
| `rejected` | Not suitable for listing |
| `canonical` | **Not set via API** — only after manual `STATIC_PROJECTS` merge |
| `archived` | Retired pending record |

---

## Provenance model

Every field uses `ProvenanceField`:

```json
{
  "value": "MARCO",
  "available": true,
  "source": "onchain",
  "observed_at": "2026-07-04T08:00:00.000Z",
  "confidence": 0.95
}
```

Sources: `onchain` | `ai_discovery` | `owner_submission` | `manual_review` | `registry_import`

**Rules:**
- Missing metadata → `available: false`, `value: null` — displayed as **Unavailable**
- No fabricated website, social, or logo URLs
- AI may suggest; owner confirms before canonical promotion

---

## Routes / runtime path

| Method | Route | Purpose |
|--------|-------|---------|
| `POST` | `/api/registry/projects/onboard` | Canonical lookup or create pending profile |
| `GET` | `/api/registry/projects/onboard` | List pending index (runtime store) |
| `GET` | `/api/registry/projects/pending/[pendingId]` | Machine + human pending profile |
| `PATCH` | `/api/registry/projects/pending/[pendingId]` | Review status update (not canonical) |

**Client runtime (Build Studio / Import):**

```
discoverProjectFromContract()
  → resolveProjectRegistryLookup()
  → canonical match OR pending upsert
runImportAnalysis()
  → pending path with readiness score (no PROJECT_NOT_FOUND dead end)
```

---

## Import Existing Token flow

```
Unknown contract
  → AI / on-chain discovery (name/symbol if available)
  → pending project profile (provenance per field)
  → readiness score + review state
  → pending_review (human/owner confirms)
  → approved
  → manual operator merge into STATIC_PROJECTS
  → canonical registry entry
```

---

## Canonical promotion rule

**No auto-canonicalization.**

1. Reviewer sets pending status to `approved` via PATCH API.
2. Operator validates provenance and owner-confirmed fields.
3. Operator manually adds `StaticProjectRecord` to `STATIC_PROJECTS` and updates `public/registry/projects/` manifests.
4. Pending record archived for audit — not deleted silently.

API rejects `status: canonical` with `AUTO_CANONICAL_FORBIDDEN`.

---

## Pending project example

```json
{
  "schema": "melega.project-profile.pending.v1",
  "id": "pending:56:0x0000000000000000000000000000000000000001",
  "contract": "0x0000000000000000000000000000000000000001",
  "chain": 56,
  "status": "discovered",
  "is_canonical": false,
  "name": {
    "value": "Demo Token",
    "available": true,
    "source": "onchain",
    "observed_at": "2026-07-04T08:00:00.000Z",
    "confidence": 0.95
  },
  "symbol": {
    "value": "DEMO",
    "available": true,
    "source": "onchain",
    "observed_at": "2026-07-04T08:00:00.000Z"
  },
  "website": {
    "value": null,
    "available": false,
    "source": "ai_discovery",
    "notes": "Not discovered — marked Unavailable."
  },
  "health": {
    "readiness_score": 60,
    "identity_completeness": 40,
    "review_ready": true,
    "missing_fields": ["website", "socials", "logo"]
  },
  "review": { "state": "discovered" }
}
```

---

## Validation summary

| Check | Result |
|-------|--------|
| Unknown contract → pending (not dead end) | ✅ |
| Known contract → canonical | ✅ |
| Missing metadata → Unavailable | ✅ |
| No fabricated website/social/logo | ✅ |
| Pending not in canonical listing | ✅ |
| Machine JSON for pending + canonical | ✅ |
| No auto-canonicalization | ✅ |
| `yarn test src/registry/projects/pending` | PASS |
| `yarn test buildRuntime` | PASS |

---

## Related docs

- [`DEX_IMPLEMENTATION_MATRIX.md`](./DEX_IMPLEMENTATION_MATRIX.md)
- [`D87_IMPLEMENTATION_MATRIX.md`](./D87_IMPLEMENTATION_MATRIX.md)
- [`PROJECTS_RUNTIME_INVENTORY.md`](./PROJECTS_RUNTIME_INVENTORY.md)
