# Boost Your Project P0 — recovery candidate

Status: NOT RELEASE-CERTIFIED. No production merge or deployment performed. Draft PR / preview validation is authorized by the current P0 request; the older auto-commit protocol is not used to release this candidate.

## Proven lineage facts

Base: `e9b0f18524fc8711b8a73c367479862352527627`, origin/main and latest recorded Production deployment, 2026-09-14.

The production modal is unchanged since `88e839196869d926dc40b9bf57811213607efe71` (2026-08-14, “restore exact approved Vercel preview”). Its launcher includes the duplicate contract selector and its service cards use the old grid. Live browser inspection reproduces the Founder screenshots.

The separate Git lineage contains:

- `1bdbb82ca4522f3ac97b602ba0a497513abbe0ed`: premium payment/review design, 2026-08-15.
- `07c60cf0d04ef1791a6c2207c55ac0a14727ea90`: multichain Boost token logo recovery, 2026-08-15.
- `3b8259ba`: last modal change across fetched refs, 2026-08-19, MARCO Pay processing UI. This is the recovery source, including preceding terminal-success and fulfilment corrections.

Those later commits are not ancestors of current main. PR #24 (`b4ba74df`, deployed 2026-08-25) continued from the old main without bringing that checkout lineage. This establishes the code-lineage omission. It does NOT establish the exact moment an already-live premium version was replaced: the retrieved GitHub Production records do not record that premium version. A manual Vercel promotion could be outside these records. Vercel deployment `D9ym4YcG3tcHmXvac7dE5WQbYkQs` is verified Ready, Preview, built 2026-08-19 from `3b8259baa2de46b2700cf105ae0d73f057181b0c`; its live URL is https://melega-swap-v2-lobgq200n-melegazas-projects.vercel.app/ and its service modal was inspected directly and captured in `evidence/historical-preview-service.png`. The precise regression deployment and explicit latest Founder approval remain unverified; no commit is falsely labelled as a proven revert.

## Recovery scope

- Remove only BLACK, SPACE and MAIORA records. PASSPORT/SMARTDROP, their links and footer styles are unchanged.
- Recover the historical modal and single entry point; no new design. The recovered flow has Project → Service → Package → Chain → Payment → Review; checkout/processing/success are integrated in Review.
- Recover canonical token metadata selection and the existing chain/address avatar resolver. Broken URLs advance to local checksummed assets before a neutral fallback. MM72 local logo is present and rendered.
- Recover the required MARCO Pay server/client dependencies rather than shipping a modal that calls nonexistent endpoints. This is a substantial integration recovery, not merely a CSS patch.
- Keep production activation policy and all catalog amounts unchanged. Sponsored Search, Featured Farm, Featured Pool and M-Credits remain pending. New recovered order endpoints also enforce these gates.
- Scope historical header changes to `BoostCheckoutShell.tsx`; the shared modal is unchanged.
- Add only two payment-isolation checks to the current MarcoConnect component, preserving later wallet fixes and its existing visual styles.

Exact changed paths are in `changed-files.json`. No chain transaction was signed or broadcast. No production order was created during verification.

## Browser evidence

The `evidence/` screenshots show production before, desktop recovered Service/Review, mobile Service/Review, pending-service gate, and footer at both sizes.

The local Vite acceptance app renders actual recovered components with an isolated fake registry, unavailable payment connection and disconnected wallet. It rejects unexpected API calls. This proves UI behaviour with fixtures, not live payment settlement or a complete Next production deployment.

Checked manually: MM72 detection/logo; Trend Boost packages; BNB chain; BNB/USDT/USDC choices; 6h/$29 review; wallet gate; MARCO/M-Credits unavailable gates; Sponsored Search activation pending; Back through Review/Payment/Chain/Package/Service/Project; close, reopen reset and Escape; mobile content scrolling and footer accessibility. Live settlement and wallet-confirmation success are covered only by unit tests, not an actual transfer.

## Validation and gate

Focused test and type/build final results are recorded in `validation.md` when complete. Initial Next build reported an existing ESLint configuration error (`next/babel` config missing). Heavy initial checks were interrupted and retried separately.

Legacy Vitest setup incorrectly assigns `vi.useRealTimers` to `global.setImmediate`; the acceptance config uses its own corrected setup and disables writes to symlinked dependency caches. It does not alter the production/shared test configuration.

The repository's `.cursor/rules/mission-execution-protocol.mdc` requires tests and build to pass before auto-commit/push and forbids automatic merge. The current request authorizes a reviewable commit/PR and preview evidence; a draft branch is prepared for remote build validation. This candidate must remain at the production release gate until validation, canonical approval and production payment configuration are confirmed.

## Reproduce

From `apps/web`, run Vitest with `--config ../../acceptance/boost-p0/vitest.config.ts`. The React behavioural suite is `src/views/shared/monetization/__tests__/boostP0Funnel.test.tsx`; recovered payment suites are under `src/lib/marco-pay/__tests__` and `src/lib/mcredits/__tests__`.

From the repository root, start Vite with `--config acceptance/boost-p0/vite.config.ts`, then open localhost port 4317. The fixture cannot create live orders or send transactions.
