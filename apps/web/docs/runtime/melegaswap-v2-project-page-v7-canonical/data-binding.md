# Data binding — Project Page V7

## Identity

| Field | Claimed source | Unclaimed source |
|-------|----------------|------------------|
| Name / symbol / logo | Canonical project document | dex-asset-index |
| Contract | Selected chain deployment | Route address |
| Socials / description | Registry resources (omit if unavailable) | Never fabricated |

## Market strip

`useProjectLiveMarket(slug|syntheticSlug, …, contract, chainId)` — Featured / Global Data Truth snapshot. Missing → `—`.

## Economy

`useProjectEconomyByToken` + `matchFarmsByToken` / `matchPoolsByToken`:

- Match key: **`chainId + token address`**
- Never symbol matching (MARCO BNB ≠ MARCO Base ≠ MARCO ETH)

## Activity / Holders / Score

- Activity: protocol feed filtered by token address
- Holders: deferred holder-count enrichment; no invented distribution
- Melega Score: readiness score when claimed docs exist; otherwise empty

## Trading

`ProjectTradingEmbed` → existing `SmartSwapForm` (engine untouched). Hero variant hides nested title chrome.

## Related

`resolveFounderFeaturedProjects` → `buildRelatedPreviewCard` → **ProjectCard V3** (max 4). No second Featured pipeline.
