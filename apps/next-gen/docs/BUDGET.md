# NG001 budget

Measured against the live home page by M001/M002 (production, cache disabled, 12s, no wallet): about 3.7–3.8 MB wire, 238–294 requests, 66 RPC. PR #136's local throttled home was still 111 requests and about 1.3 MB. Those numbers belong to `apps/web`. This app does not load that shell.

## Targets for this shell

| Item | NG001 target | How it is enforced |
| --- | --- | --- |
| Initial JS | At most 180 KB gzip for the home first-load files in `.next/build-manifest.json` | `yarn workspace @melega/next-gen budget` after `next build` |
| Home JS contents | No commercial tool module, no wagmi, ethers, Sentry, Redux, or `@pancakeswap` chunk | Same script |
| RPC | 0 | No RPC client. Runtime flag `rpc: disabled`. Smoke test rejects known RPC host names in HTML. |
| Indexer and other `/api` data calls | 0 | No cron. No browser data client. `canonicalReads: disabled`. |
| Background polling | 0 | Source scan rejects `setInterval`, `setTimeout`, `fetch(`, and `WebSocket` in app source. |
| Fonts | 0 extra requests | System stack. Inter is used only if the device already has it. |
| Schedulers | 0 on the beta project | `apps/next-gen/vercel.json` has no `crons` key. |

Measured after `next build` on this mission: home first-load files in the build manifest gzip to **106,915 bytes** (polyfill 31,170, framework 45,510, main 27,058, webpack 1,598, page 1,579). Next's own table reports **76 kB** first-load JS for `/` because that figure omits the polyfill chunk. Shared CSS is **1.12 kB**. The commercial tool route is a separate page (`/tools/[tool]`, 77.5 kB in Next's table) and its copy is not in the home chunks.

Headless Chrome at 320, 390, 430, and 1440, walking Swap, MARCO Bridge, Earn, Tools, and Create Token, made 74 requests. Every request stayed on the beta host. None were RPC or indexer calls. With no access token, a browser `GET /` returned 307 to `/access`, and a non-HTML `GET /` returned 401.

NG002 remeasured the same script after `next build` and `next start`. Gzip was 106,915 bytes before the quote preview. After the preview loader, home gzip is **108,567** bytes and Next’s table reports **77.7 kB** for `/`. The ceiling stays 184,320 bytes. The quote module and `eth_call` stay out of that first load. A quote runs only after the preview is opened.
