# Full-funnel remaining blockers

No unresolved P0 or actionable P1 remains in the certified public funnels.

The following repository-wide failures are retained as historical/environment debt and are not classified as active public-product failures:

- Historical source-string, screenshot geometry, byte-hash and removed `docs/runtime` freeze tests refer to superseded Farms, Pools, Projects, Trade and SmartSwap implementations. Current rendered flows and current runtime suites are green; these tests must be retired or re-baselined in a dedicated historical-artifact cleanup, not rewritten to manufacture a green count.
- SmartSwap local Solidity proof suites require initialized `forge-std` and OpenZeppelin git submodules. The isolated worktree intentionally did not initialize or rewrite those dependencies. Browser/runtime execution-binding, factual-routing, fee, gas, confirmation and transaction-preparation unit coverage ran independently; no contract or network registry was changed.
- Live diagnostics and fork rehearsals require opt-in RPC/fork configuration. They are external diagnostics, not browser-runtime blockers, and were not converted to skipped tests by this mission.
- Repository-wide TypeScript reported 1,138 errors before the touched-file correction and 1,137 after it. The mission touched-file count is zero; production build and focused active suites pass. The remaining global debt predates this branch and includes obsolete/generated/test-only surfaces outside the certified active paths.

No remaining item above can change the certified production user flows on this branch. A real wallet signature/transaction remains intentionally outside the certification boundary.
