# MELEGADEX-EVO-MARCO-UX-FOUNDER-FIX-002

## Scope

- Trade now shows one canonical MARCO pose on desktop, tablet, and mobile.
- The full Swap surface and primary CTA remain visible before MARCO-led secondary actions.
- Technical detail is collapsed into contextual disclosures.
- No fee, wallet, signature, broadcast, contract, router, or payment logic was changed.

## Canonical asset

`public/brand/marco-trade.webp` is a transparent, optimized crop from the supplied canonical UI pose sheet. It was not regenerated or reinterpreted.

- Dimensions: 277 × 309
- SHA-256: `3b0e49b1d2d3c574b601585a0e7c4ed3f750f1e2448d677a8b9558d302c8631b`

## Verification

- Tests: 60/60 passed
- TypeScript: passed
- Production build: passed
- Home first-load gzip: 112,434 bytes (ceiling: 184,320)
- Viewports: 320, 390, 430, 768, and 1440 px
- Horizontal overflow: none
- Visible MARCO poses: exactly one per tested page and viewport
- Trade CTA: clear and above the fixed mobile navigation at 320/390/430 px
- Idle Home: zero API, foreign-host, or RPC requests during each 3-second observation

## Visual evidence

The `docs/screenshots/founder-fix-002` directory contains Trade, Earn, Portfolio, and Explore captures at every tested viewport, plus the local request log.

## Integration boundary

This change is limited to `apps/next-gen` presentation, copy, tests, and evidence. It does not merge to production or modify the live DEX.
