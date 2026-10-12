# ADR NG001 — Isolated protected beta shell

Status: accepted for the Next Gen bootstrap. This is not a production cutover.

## Context

`www.melega.finance` is the live Melega DEX. It is the Next.js app in `apps/web`, deployed with indexer crons. Founder mandate for this mission: do not change that UX, its routes, or its economics.

Draft PR #136 (`a05d6eb7`, branch `cursor/melega-dex-next-gen-m003-radical-ux-d22a`) is a design reference for a phone-first Swap / MARCO Bridge / Earn shell. It edits the live app. It is not a merge candidate for this mission.

The Earn discovery agent (`MELEGA-EARN-M001`) stopped without a PR. It found no verified external yield adapter and no license to copy SuperEarn. BNB farms and pools already exist on the live app. Create Farm and Create Pool are not public actions.

M001 and M002 measured the live home page at multiple megabytes and dozens of RPC calls, including idle foreign-chain reads that M002 later stopped in the live app (PR #135, `5a91fade`). A second indexer or a second cron would repeat that cost.

## Decision

Build the smallest second app, `apps/next-gen` (`@melega/next-gen`), on the same Next.js 13 and React 18 versions already used by `apps/web`. It does not import `apps/web`, wagmi, ethers, the swap SDK, farms, pools, or the wallet stack.

The beta host is a separate Vercel project whose root directory is `apps/next-gen`. Production DNS and the production Vercel project stay pointed at the live app. This mission does not deploy.

Access fails closed:

- `BETA_ACCESS_TOKEN` is a server-only secret of at least 16 characters. A missing or short value closes every product route. Browsers land on `/access` with the closed message. Other clients receive an empty `401`, because Next.js 13.0.7 middleware cannot return a body.
- The middleware names `process.env.BETA_ACCESS_TOKEN` directly so Next.js 13 records it for the edge sandbox. The value is read at runtime and is not a browser-exposed variable.
- Browsers without a session are redirected to `/access`. The access page has no product navigation.
- A matching token sets an HttpOnly, SameSite=Strict cookie containing the SHA-256 of the token, not the token.
- `/robots.txt` disallows the whole host. Responses send `X-Robots-Tag: noindex, nofollow, noarchive, nosnippet` and `Cache-Control: private, no-store`.
- Vercel Deployment Protection on the new project is an additional required gate. The app gate is what this repo can enforce.

Runtime switches in `lib/betaRuntime.ts` keep schedulers, background polling, canonical reads, RPC, wallet, quotes, transactions, and fee collection disabled. The beta `vercel.json` defines no crons. Live indexer crons in the root and `apps/web` Vercel configs are unchanged.

The shell has three primary actions: Swap, MARCO Bridge, and Earn. Portfolio and Tools are secondary. Commercial tools (Create Token, Trend Boost, Featured Project, Premium Project Page) are separate lazy chunks and are marked not operational. Create Farm and Create Pool have no route. No screen shows rankings, KPIs, top farms, top pools, latest listings, follower counts, or a yield number.

Swap does not render an amount field, a quote, or a submit action. Multichain execution and Melega fee collection are not claimed.

## Consequences

- Reviewers need the beta token and, on Vercel, Deployment Protection. There is no public preview of the shell.
- The live `yarn build` filter remains `web`. Production builds do not compile this app.
- Yarn still installs the workspace. The added dependencies are the Next, React, and TypeScript versions already locked by `apps/web`.
- NG002 can add a read only by changing `betaRuntime.ts` and its test, and only as a user-initiated call. This ADR does not authorize that call.

## Non-goals

- No merge of PR #136.
- No edit to live routes, router, wallet, swap, farms, pools, MasterChef, NFT, or token lists.
- No new contract, transaction, signature, payment, or fund movement.
- No new indexer, cron, or RPC client.
- No production domain or DNS change.
- No claim that a chain can execute a swap from this shell.
