# SMART_SWAP_FINAL_DOM_AND_TRENDING_REPAIR

## Verdict

`SMART_SWAP_FINAL_DOM_AND_TRENDING_REPAIR_CERTIFIED`

## Part A — DOM hierarchy

- Home/Trade: `[data-smart-transparency-stack]` forced to CSS `order: 5` after Swap button (`order: 3/4`).
- Instant: Details accordion only after button.
- Smart: Route → Metrics → Fee → AI → Details after button.
- Form Advanced details hidden; label is `Details` (zero `Show details` UI strings).

## Part B — Responsive

- Desktop `max-width: 560px`
- Tablet `width: 100%`
- Mobile `width: calc(100vw - 32px)`
- Removed fixed overflow clipping on cockpit shells.

## Part C — Route spacing

- 16px separation via transparency-stack margin.
- Route centered, overflow hidden (no scrollbar), logos/arrows vertically centered.

## Part D — Trending pipeline

- Factory `0xb7E5848e1d0CB457f2026670fCb9BbdB7e9E039C`
- Router `0xc25033218D181b27D4a2944Fbb04FC055da4EAB3`
- Live audit: 3 Swap events indexed on featured MARCO/WBNB pair; aggregation ranks MARCO.
- Ranking window extended to 90d for sparse indexer; home ticker wired to `useDexTrendingRankings`.

## Evidence

See JSON artifacts in this folder + `screenshots/`.
