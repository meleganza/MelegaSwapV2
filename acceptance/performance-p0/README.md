# Melega performance recovery — production release remains gated

Based on production main e9b0f185, stacked on Boost PR55 (548585b3) to preserve the recovered funnel and footer. No production deployment or chain write.

## Proven findings

- Production is missing historical commit **9612c5b4cd45fc9a420451ec5c5f13fce52022fa** (`perf: smooth ticker and unblock home data`, 14 August). Later related fixes also exist on `origin/codex/no-ux-performance-audit`. This proves omitted code, not the exact historical production promotion/revert event.
- Live production browser reported React error **421** on first load, indicating abandoned Suspense hydration. Historical recovery includes Home's page-boundary opt-out, nonurgent startup/data transitions, stable pre-fetch snapshot timestamp, and delayed SWR subscription until client commit.
- Production initial HTML references **67 Next scripts**, totalling **995711 gzip bytes / 3464863 decoded bytes** in one HTTP sample. Live DOM later contains additional bridge/liquidity/farms/pools/project-page scripts without navigation. Header viewport prefetch starts unused route work; intent hover/focus prefetch remains enabled after this change.
- HTTP sample: Home 208ms, cached Top Movers 226ms, cached market snapshot 190ms, featured fallback 731ms. These are individual HTTP observations, not LCP/INP/field metrics or statistical benchmarks.
- Ticker pause expression ignored drag whenever hover was false. Rank-index keys remounted token avatars on reordering. Tests verify independent touch pause and retained avatar/track DOM identity.
- RefreshContext did not initialize from document.hidden and listened on window; document-only visibility events left its refresh flag stale. Regression test covers hidden mount, resume and hidden again.
- Featured feeds used independent setInterval loops, including hidden tabs. SWR now shares requests, avoids overlapping periodic fetches, suspends hidden/offline refresh, and retains last-good prices.

## Scope and preserved behaviour

Recover historical ticker compositing/memoization and Home hydration corrections. Add stable ticker keys and constrain the ticker viewport while retaining full-width duplicated track, same 52-second cycle, order, links, typography, dimensions and reduced-motion rule. Recover async logo decoding. Memoize Home producer to prevent publication feedback without blocking real context updates. Load Boost code only on first open and retain it afterward. No redesign, changed rankings/economics, contracts, transaction execution, wallet integration, chain indexer or farm/pool calculations.

The historical removal of all Home farm polling was deliberately not copied: this patch preserves current data-refresh semantics. Heavy route viewport prefetch is disabled in primary/mobile navigation and Home discovery links; Featured Trade links preserve their existing prefetch contract.

## Validation

Focused behavioural tests and Boost regression suites are recorded in evidence when completed. A broader pre-existing source assertion in `founderHomeLiveSurfaces.test.ts` expects `<MarcoConnect size="navbar" />`; production main already uses `activation="desktop"`, so that assertion fails independently of this patch.

Full TypeScript is not globally green in the installed dependency environment (earlier baseline 820+ diagnostics). Vercel configuration already ignores TypeScript build errors; a successful build must not be described as a clean typecheck. Final changed-file diagnostics and remote build/preview results will be reported explicitly.

Chrome DevTools MCP is unavailable. No invented FPS, Lighthouse score, LCP or INP improvement. Browser acceptance, HTTP payload comparisons and focused tests are the available evidence. Compare performance preview with production and with PR55 to separate recovery from incremental savings.
