# Before / After — Public Farm Factory

## Before (ad32627a)

- Create Farm was a permanently expanded config form with default MARCO reward.
- Execution blocked as `C_ADMIN_ONLY_MASTERBUILDER`.
- No pair search / create-pair return flow.
- No TVL eligibility engine.
- No low-liquidity remediation (Builder / manual handoffs).
- Public 1 BNB MARCO-reward fee path still surfaced via SSOT helpers.

## After (this branch)

- Create Farm mounts `PublicFarmFactoryWorkspace` (via `CreateFarmWorkspace` alias).
- Pair selection: Search Existing Pair **or** Create New Pair with draft-preserving return.
- Eligibility engine: indexed / active / TVL ≥ 0.25 BNB with machine-readable result.
- Low TVL: non-terminal remediation with AI Builder (honest undeployed blocker) + Add Liquidity Manually.
- MARCO rewards rejected with canonical message — no bypass.
- Fees: FREE (non-MARCO reward + MARCO pair) or 0.25 BNB otherwise → Treasury; no public 1 BNB MARCO path.
- MasterBuilder never exposed.
- `PublicFarmFactoryV1` package shipped undeployed (`B_FACTORY_DEPLOYMENT_REQUIRED`).
- Indexer FarmCreated topic + dedupe helpers; MasterChef discovery retained.
