# Organ 04 — Economic Event Registry MVP

**Status:** Minimal operational spec  
**Version:** 0.1.0  
**Date:** 2026-06-27  
**Organ:** 04 — Economic Event Registry  
**Doctrine:** *Events are registry-derived economic facts. Events are not live transactions.*

## Purpose

Register **economic events** derived from upstream registries (Project, Asset, Venue) — preparing Treasury Runtime and Economic Intelligence without live chain indexing.

## Stack position

```
Project (UPI) → Asset (UAI) → Venue (UVI) → Economic Event (UEI) → Treasury / EIE
```

## Identity

```
uei://melega/event/{event_type}/{slug}@1
```

## Event types (MVP)

| Type | MVP use |
|------|---------|
| `asset_registered` | Asset appeared in Organ 02 registry |
| `venue_registered` | Venue observed in Organ 03 registry |
| `swap` | Reserved — no live tx indexing |
| `liquidity_added` | Reserved |
| `liquidity_removed` | Reserved |
| `farm_created` | Reserved |
| `stake_pool_created` | Reserved |
| `launch_created` | Reserved |
| `fee_observed` | Reserved — no fake fees |
| `future` | Reserved |

## Status model

| Status | Meaning |
|--------|---------|
| `registry_derived` | Synthesized from static registry manifests |
| `observed` | Legacy-config or registry snapshot observation |

No fake tx hashes, volumes, fees, or treasury amounts in MVP.

## Out of scope

Live transaction indexing, backend, wallet writes, contract changes, swap/routing changes.

## Public contract

- `/events`, `/events/[slug]`
- `/registry/events/index.json`
- `/registry/events/{slug}.json`
- `/.well-known/melega-dex-events.json`
