# Projects Directory V3 — Premium Discovery

**Mission:** `MELEGASWAP_V2_PROJECTS_DIRECTORY_V3_PREMIUM_DISCOVERY`
**Recovery:** `MELEGASWAP_V2_PROJECTS_DIRECTORY_V3_PREMIUM_DISCOVERY_RECOVERY`
**Verdict:** MELEGASWAP_V2_PROJECTS_DIRECTORY_V3_PREMIUM_DISCOVERY_COMPLETE
**Date:** 2026-08-07
**Pipeline:** `GLOBAL_DATA_TRUTH_PIPELINE=melega-global-data-truth-v1`

## Summary

`/projects` is the canonical multichain discovery marketplace routing to Project Page V5:

- Compact hero (140–170px): Discover Projects · List Your Project · Claim Project
- Featured rail reuses Home `FeaturedProjectsRail` (max 4)
- Independent Status / Chain / Category / Sort dropdown toolbar (+ mobile Filters drawer)
- ProjectCard V3 dense grid (4/3/2/1) with factual metrics (`—` when uncertified)
- Logo resolution chain-scoped (`chainId + address`); no broken images
- Trending = Sort ranking mode only (avoids duplicate Trending controls); `/trending` → `/projects?sort=trending`
- Trade → `/swap` with token + chain; View Project uses Next Link + V5 nav mark
- Bounded render: 28 cards + Load More (274+ inventory)

## Recovery

Crashed session had already committed + pushed `c943414c`. Recovery verified integrity, added `recovery-ledger.md` + `Projects-Featured.png`, re-ran tests/build/browser. No product code discarded.

## Acceptance

| Gate | Result |
|------|--------|
| Mission + Projects / Featured / V5 / routing / Data Truth tests | PASS (68) |
| `next build` | PASS (reconfirmed) |
| Browser acceptance (local :3317) | PASS |
| Screenshots | 1440, 1280, Trending, Featured, ChainFilter, Search-MARCO, 390 |
| Nav `/@marco/` | V5 shell, Projects DOM cleared, &lt;1s |

## Forbidden surfaces

Untouched: Project Page V5 structure, Smart Swap engine, AMM, contracts, Treasury, fees, wallet execution, Payment Router economics, Global Data Truth formulas.
