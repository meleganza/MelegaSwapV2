# MELEGADEX-EVO-PREMIUM-UX-MARCO-REFINEMENT

Base: certified R005 branch, `4cfcef6cdb1a607c821c0e99fda4b38550c4c9fe` (two certification commits above PR #137 HEAD `351e4777602b90e10ed89d42b2a2b503996202c7`).
Branch: `ux/marco-premium-refinement-20261015`.
Concurrency checked: active chat “Certifica release beta R005”, working independently on `cert/r005-20261015`. This UX branch does not modify its files or the PR #137 branch.

## Product changes

- Canonical badge/wordmark and graphite/pearl/gold palette retained. One decorative MARCO pose on Earn, Portfolio and Explore; lazy, async WebP with reserved dimensions. No mascot on the mobile Swap surface, preserving its viewport.
- Poses are deterministic, transparent WebP crops from all three exact founder attachments; no image generation or character redesign was used. Transparent margins are trimmed and outputs are scaled to <=300×320. The source files remain untouched:
  - Portfolio: `MARCO_MASCOT_FULL_BODY_CUTOUT_CORRETTO(3).png` — SHA-256 `c67e446c6b0e5444833bffd7b18012a0e6ad89676c2841a0ded7fc514d89ea99`.
  - Earn: `Foglio pose del mascotte MARCO(1).png` — SHA-256 `c84107cddcad1a81e15769fc33d84d08b0f6c7436597de80fb60fdc695cadcd0`.
  - Explore: `Mascotte 3D in pose per app UI(1).png` — SHA-256 `d946f382f8e0e6da3052cb8874c36e57bb1627f0da54ca8686fcb38f7a92fa42`.
- Earn: removed the farm diagnostic from the page. Twelve real Beefy PancakeSwap BNB opportunities; asset/protocol filters; compact APY/TVL cards, explicit external CTA. Missing figures stay unavailable, stale warning remains visible. Fees (Melega handoff zero), source, risks, update/withdrawal limitations remain in details. No execution/fee logic changed.
- Portfolio: assets, listed Beefy receipts, legacy liquidity/farms/pools. No invented total. Public lookup remains the supported capability; no false Connect Wallet action. Scope/valuation disclosure and external management labels remain visible.
- Explore: compact Projects/Trending/Tokens links and factual sponsored Boost feed. Removed repeated departure paragraphs. Direct render removes the existing Explore hydration error.
- Minimal shell/footer. No changes to Trade execution, fee rules, payments, routers, contracts, apps/web, main, DNS, or production.

## Verification

- Build and TypeScript: PASS.
- Home initial gzip: **112,359 bytes**, ceiling 184,320.
- Real catalog endpoint: **12 opportunities**. Figures sourced from Beefy, not mocked for screenshots.
- Responsive: 320, 390, 430, 768, 1440 across Trade/Earn/Portfolio/Explore. Zero horizontal overflow; one loaded mascot on each refined screen. Home idle: zero API/RPC calls at all widths over 3.1 seconds. No JavaScript errors in final screenshot run.
- `screenshots/marco-refinement/before/`: 20 baseline screenshots + measurements. Baseline had five Explore hydration errors.
- `screenshots/marco-refinement/after/`: 20 screenshots + measurements. Final visual pass has zero errors. Subsequent changes only added accessible select names and failure feedback for a failed receipt lookup.
- Tests: **60/60 pass** on the certified R005 base. TypeScript and the production build also pass. No financial adapter or financial test expectation was changed by this UX branch.
- Click verification: PASS on 12 real vault cards, asset filter/reset, fee disclosure, invalid Portfolio and Beefy addresses, three canonical Explore links, and Swap CTA above mobile navigation. Zero page errors. Evidence: `screenshots/marco-refinement/clicks.json`.
- No wallet connection, signature, approval, transaction or funds used in verification.

## Release gate

UX is reviewable; this is not certification of financial execution or permission to merge/cut over. The existing preparer test and preview access remain release gates.
Vercel MCP project inspection returned 403 for `melegazas-projects/melega-dex-next-gen-beta`; Vercel CLI is unavailable locally. Preserve existing host protection. No production deployment was requested or performed.
