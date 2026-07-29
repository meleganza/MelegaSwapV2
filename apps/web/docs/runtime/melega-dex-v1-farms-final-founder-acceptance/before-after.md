# Before / After — Farms Final Founder Acceptance

## Before

- Active Farmers displayed **0** or unavailable because MasterChef event topics used Pancake V2 keccak hashes → `eth_getLogs` returned zero Deposit/Withdraw events.
- No durable resumable unique-farmer participant index with deployment-block provenance.
- Hero center graphic was a flat/static illustration.
- Featured Farm stayed empty even when Highest Sustainable APR had a factual winner, because Featured selection compared `rawFarm.liquidity` BigNumber objects with `Number.isFinite`.
- Explore cards lacked always-visible Farm Contract ↗ / LP Contract ↗ links.
- KPI Active Farmers lacked the Founder supporting label and could surface a false zero while indexing.

## After

- Canonical Melega MasterChef topics restored; durable index scanned deploy→head at **100%** coverage.
- Active Farmers KPI = **318** unique wallets (`/api/farms/unique-farmers` status `ready`) with label *Unique wallets that participated in Melega DEX farms*.
- Hero artwork: CSS/SVG LP → Farm → MARCO rewards animation with `prefers-reduced-motion`.
- Featured Farm selects deterministically (active + emission + TVL + sustainable APR + lowest pid); live: **BABYMARCO / MARCO**.
- Compact 6-metric KPI row; My Farms immediately after KPIs; Explore denser (4-up @1440); Finished archive; Yield Advisor factual; Analytics ≤4 cards.
- Farm Contract ↗ + LP Contract ↗ on Explore / My / Finished / Featured cards.
- 3-cycle Farms→Pools→Farms + hard reload: explore identities stable; no overflow across 1920–390.
