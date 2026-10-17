# Code reuse matrix — NG001

Sources: live tree at `add4a54266b969b2e4f741cafcc92eed5a8a18cc`, M001 structural audit, M002 RPC slimming (PR #135), M003 design reference (draft PR #136, head `a05d6eb7`), Earn M001 discovery (no PR, no SHA).

| Area | Decision | What happens in NG001 |
| --- | --- | --- |
| Live app routes (`apps/web/src/pages/**`) | KEEP | Untouched. Production Swap, Bridge, Liquidity, Farms, Pools, withdraw, and legacy URLs stay on `www.melega.finance`. |
| BNB SmartSwap / router / existing LPs | KEEP | Not imported. The beta text points at the live DEX. No new router and no fee claim. |
| Wallet withdrawal | KEEP | Not reimplemented. Copy states that withdrawal stays on the live DEX. |
| MARCO bridge registry (`apps/web/src/lib/marco-bridge/wave1Registry.ts`) | KEEP | Not imported. Bridge screen does not claim route status. |
| Production indexer crons (`/api/indexer/run/`, `/api/indexer/registry/refresh/`) | KEEP | Left on the live Vercel configs. Not copied into `apps/next-gen/vercel.json`. |
| Canonical read APIs (`/api/indexer/global-liquidity`, market snapshot, MARCO price) | KEEP for a later mission | Not called. `canonicalReads` is `disabled`. |
| PR #136 navigation idea: Swap, MARCO Bridge, Earn primary; Portfolio and Tools secondary | REIMPLEMENT | New shell in `apps/next-gen`. The PR's edits to `apps/web` are not applied. |
| PR #136 visual restraint: flat, Inter/system type, no glow, no home ticker | REIMPLEMENT | Pearl-gray sheet, graphite ink, system font stack that prefers Inter when the device has it. No custom font file. No gold fill. |
| Commercial tools: Create Token, Trend Boost, Featured Project, Premium Project Page | REIMPLEMENT | Lazy routes under `/tools/*`, each marked not operational. No checkout. |
| Access gate | REIMPLEMENT | New. The live app has no equivalent beta lock. |
| Home rankings, KPI rails, top farms, top pools, latest listings, follower counters, trending ticker | ARCHIVE | Not mounted. Not deleted from the live app. |
| Idle foreign-chain providers, home farm/pool pollers, block polls | ARCHIVE | Not imported. Beta polling flag is off. |
| Public Create Farm / Create Pool | ARCHIVE | No route. Copy says they are not offered. |
| SuperEarn art, contracts, ABIs, and custody vaults | ARCHIVE | Not copied. Earn shows no external protocol and no APY. |
| Wagmi, ethers, Redux, Sentry, styled-components, charts, wallet connectors | ARCHIVE | Not dependencies of `@melega/next-gen`. |
| Pancake / Uniswap quote shadows and every non-BNB executor | ARCHIVE | Not wired. The shell does not say they are executable. |
| `solana.melega.finance` | KEEP separate | Out of this repo. Not linked as an execution venue. |
