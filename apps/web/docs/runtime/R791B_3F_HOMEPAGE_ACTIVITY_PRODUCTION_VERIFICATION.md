# R791B.3F — Homepage Activity Production Verification

**Verification timestamp:** 2026-07-15T12:20:00Z  
**Verdict:** `R791B_3F_HOMEPAGE_ACTIVITY_BLOCKED`

## Deployment authority

| Field | Value |
|-------|-------|
| Production SHA | `77fe70da7078575ef3dc2f3f2e6595d20cc8f5db` |
| Build ID | `50zNoDWycgiFAUZjpAHP7` |
| Deployment URL | `https://melega-swap-v2-mrerv0azw-melegazas-projects.vercel.app` |
| Deployment status | success (GitHub Production deployment `5456687716`) |
| Alias status | `https://www.melega.finance` and `https://melega.finance` reachable |
| Authority commit | `77fe70da` (R791B_3E_HOMEPAGE_ACTIVITY_WIRING) |

Production alias reported `activeDeploymentSha=77fe70da` after propagation (initial poll returned `0403bec0`).

## Canonical API snapshot

Source: `GET https://www.melega.finance/api/protocol/activity?limit=40`

| Metric | Value |
|--------|-------|
| Status | `ready` |
| Total API rows | 3 |
| AMM | 3 |
| MasterChef | 0 |
| SmartChef | 0 |
| Newest timestamp | `1783853420` |
| Oldest timestamp | `1773393280` |
| Events within 24h | 0 |
| Duplicate keys | 0 |
| Newest-first ordering | yes |

API validation: no duplicate `chainId + txHash + logIndex`, finite timestamps, valid hashes, no synthetic registry events.

Full redacted snapshot: `apps/web/docs/runtime/r791b3f-activity-api-snapshot.json`

## Title expectation vs render

| | Value |
|--|-------|
| Expected title (from API timestamps) | `Recent Protocol Activity` |
| Rendered title | **Not rendered** — activity panel absent |

All 3 API events are older than 24 hours (`eventsWithin24h: 0`).

## UI verification — blocked

### Root defect

Homepage client runtime error before `LiveActivityFeed` mounts:

```
TypeError: Cannot read properties of undefined (reading 'length')
  at HomeTradeScreenContent machine useMemo
  activityRows: data.activityRows.length
```

`useHomeTradeData` (77fe70da) removed `activityRows` in favor of `homeActivityRows`, but `HomeTradeScreen.tsx` still reads `data.activityRows.length` for `buildHomeMachine`. The homepage `DataSurface:Homepage` error boundary catches this; the Protocol Activity panel never mounts (`[data-live-activity-feed]` count = 0 at all viewports).

**Component:** `apps/web/src/views/HomeTrade/HomeTradeScreen.tsx` (line ~109)  
**Not fixable in this verification mission.**

### Visible rows by viewport

| Viewport | Visible activity rows | Max allowed |
|----------|----------------------|-------------|
| 1440×900 | 0 (panel missing) | 6 |
| 768×1024 | 0 (panel missing) | 5 |
| 390×844 | 0 (panel missing) | 4 |

### Newest / oldest visible event

Not applicable — zero visible rows.

## Empty / loading / error

| Check | Result |
|-------|--------|
| Empty state copy | Not reached |
| Loading skeleton | Not reached |
| Compact unavailable message | Not reached |
| Global “Oops” screen | No |
| Homepage partial error surface | Yes — `[DataSurface:Homepage]` console error |

## View All

Not testable — `[data-live-activity-feed]` not present; no View All control rendered.

## Visual checks

| Viewport | Horizontal overflow (page) | Activity panel borders | Panel overflow |
|----------|---------------------------|------------------------|----------------|
| 1440 | No | N/A — panel missing | N/A |
| 768 | No | N/A | N/A |
| 390 | No | N/A | N/A |

Screenshots capture homepage state without the activity panel (full-page fallback).

## PASS criteria evaluation

| Criterion | Pass |
|-----------|------|
| Production ≥ 77fe70da | Yes |
| Title matches timestamps | **No** — not rendered |
| Rows reconcile with API | **No** — panel missing |
| Deduplication correct in UI | **No** — not testable |
| Row limits correct | **No** — not testable |
| Empty state not duplicated | **No** — not testable |
| View All works | **No** — not testable |
| No panel overflow at 3 viewports | **No** — panel absent |

## Screenshots

- `apps/web/docs/runtime/r791b3f-screenshots/homepage-activity-1440.png`
- `apps/web/docs/runtime/r791b3f-screenshots/homepage-activity-768.png`
- `apps/web/docs/runtime/r791b3f-screenshots/homepage-activity-390.png`

## Artifacts

- `apps/web/docs/runtime/r791b3f-activity-api-snapshot.json`
- `apps/web/docs/runtime/R791B_3F_HOMEPAGE_ACTIVITY_PRODUCTION_VERIFICATION.md`
- `apps/web/docs/runtime/r791b3f-screenshots/`

## Next action (out of scope)

Repair `HomeTradeScreen.tsx` machine wiring to use `homeActivityRows` (or restore compatible `activityRows` alias) before re-running R791B.3F.
