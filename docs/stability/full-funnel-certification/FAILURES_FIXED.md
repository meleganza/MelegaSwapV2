# Full-funnel failures fixed

## P1-TREND-001 — address rendered as the primary ticker

- Reproduced: the production build rendered `0xaa7cd678c8a2809c6dff1250a87f184e779922c9` as `0 0xaa7c…22c9`; other live movers also used truncated addresses as primary labels.
- Root cause: the live DexScreener candidate path discarded its matching `baseToken` metadata and fell back to a truncated address whenever the token was absent from the local canonical index/token list.
- Correction: canonical registry/list identity remains authoritative; matching live base-token metadata fills only missing identity; a mismatched address or address-shaped symbol is rejected; a genuinely unknown token receives the neutral `Unknown token` label.
- Regression: BROWNIE and FTM fixtures, cross-address rejection, address-shaped metadata rejection, and unknown fallback.
- Browser recheck: BROWNIE now renders as `BROWNIE`; no address-shaped primary ticker remained in the first 30 live ticker links.

## C-BRIDGE-TEST-001 — Bridge unit tests contacted a real Polygon RPC

- Reproduced: two otherwise isolated authority tests intermittently timed out at 5 seconds.
- Root cause: `fetchCanonicalRouteAuthority` accepted injected MMN and Solana readers but always called the live Polygon reader.
- Correction: added a defaulted Polygon-reader dependency, preserving production behavior while allowing deterministic unit evidence.
- Regression: complete Bridge directory passes 158/158 without changing route/business logic.

## C-POOL-TEST-001 — stale JSX spelling assertion

- Reproduced: the pool action-modal test required the literal source spelling `aria-hidden="true"`, while the current equivalent JSX shorthand is `aria-hidden`.
- Correction: assertion accepts both equivalent JSX forms. Product code was not changed.
