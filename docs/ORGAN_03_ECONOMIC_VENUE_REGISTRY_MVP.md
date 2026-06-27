# Organ 03 — Economic Venue Registry MVP

**Status:** Minimal operational spec  
**Version:** 0.1.0  
**Date:** 2026-06-27  
**Organ:** 03 — Economic Venue Registry  
**Doctrine:** *Venues are where assets meet economic action. Venues are not assets.*

## Purpose

Register **economic venues** — LPs, farms, staking pools, launch surfaces — bound to Project (UPI) and Asset (UAI) refs.

## Identity

```
uvi://melega/venue/{venue_type}/{chain_id}/{ref}@{version}
```

## Venue types (MVP)

| Type | Example |
|------|---------|
| `spot_lp` | MARCO-BNB LP pair |
| `farm` | MasterChef pid |
| `stake_pool` | SousChef sousId |
| `launch` | ILO / launch contract surface |
| `future` | Reserved |

## Lifecycle & trust

Same honesty model as Organ 02: `observed` in MVP; no fake `verified`. Metrics: `not_indexed` — no TVL/APR/volume.

## Out of scope

Swap execution, routing, treasury, wallet writes, contract changes.

## Public contract

- `/venues`, `/venues/[slug]`
- `/registry/venues/index.json`
- `/registry/venues/{slug}.json`
- `/.well-known/melega-dex-venues.json`
