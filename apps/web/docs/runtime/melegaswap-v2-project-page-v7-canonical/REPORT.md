# MELEGASWAP_V2_CANONICAL_PROJECT_PAGE_V7

## Baseline

- Branch tip: `mission-project-page-v6-founder-pixel-perfect` (`4a5d55ab`)
- Mission branch: `mission-project-page-v7-canonical`

## What shipped

Public Project Page is now the **only discovery destination** for tokens:

| State | Route | Shell |
|-------|-------|-------|
| Claimed registry project | `/@{slug}` → `/project-hq/{slug}` | `ProjectPageV7Shell` mode=`claimed` |
| Unclaimed token | `/token/{chain}/{address}` | `ProjectPageV7Shell` mode=`unclaimed` |
| Execution only | `/swap?outputCurrency=` | Trade / Smart Swap (unchanged engine) |

SSOT helper: `lib/projects/canonicalProjectHref.ts` → `resolveCanonicalProjectHref`.

### UX deltas from V6

- Hero **40% / 60%**
- Primary **Smart Swap** CTA (scrolls to embed); Claim CTA only when unclaimed
- Small Official trust chip (no Buy Token / giant Official button)
- Related projects use **ProjectCard V3**
- Unclaimed surface: no fake description/socials/ownership
- Progressive paint preserved; no full-page spinner
- Technical Transparency / Machine Interface remain off the public page

### Entry points remapped

Home Featured, Projects Directory, Trending, Global Search → canonical Project Page.  
Trade CTAs remain `/swap?…`.

### Project OS supersession (public UX only)

PP005 certified deep-link-only swap on the Project Page is superseded for the **public consumer surface**. Manage / machine / API hubs remain for operators and agents.

## Forbidden files

Untouched: Smart Swap engine, AMM, router, contracts, treasury/fee logic, wallet execution, Global Data Truth formulas, token lists.

## Verdict

`MELEGASWAP_V2_CANONICAL_PROJECT_PAGE_V7_COMPLETE`
