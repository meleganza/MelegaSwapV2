# Public pool creation and self-service feasibility

MISSION: `MELEGA-POOL-CREATION-HIDE-AND-SELF-SERVICE-FEASIBILITY`

Baseline: `a6e178c2ce6be73c38faf67a5a8fe0665f1ab17e` (`origin/main`, fetched before work).
Branch: `pool-public-truth-feasibility`. Worktree: `/private/tmp/melega-pool-public-truth`.
Observed: 2026-09-28; BSC read snapshots at blocks 124490583 and 124490769.

## 1. Executive verdict

**C — current architecture is protocol/owner-deployed.** Two deployed SmartChef factories were verified against their actual runtime bytecode. Both enforce `onlyOwner` on `deployPool`; an ordinary-address `eth_call` reverts with `Ownable: caller is not the owner`. A configured pool's creation transaction independently confirms the privileged factory lifecycle.

Phase A removes public staking-pool creation from the local product. Phase B made no product or contract implementation. Self-service needs a permissionless, atomically funded factory with a safe pool template, event-based discovery, and wallet execution. Simply enabling the button cannot work.

Farm work was already committed in its separate checkout at `58ef3045bc824bfc6fe7d62f95a002abc14ba73a`. SmartSwap remains at `a861971f1d55569d78167bbd462d65c3f40582d9` in the original checkout. Neither was modified or included in this branch.

## 2. Current public UX truth

The baseline advertised a preview-only flow with a disabled final button. Removed public entry points:

- Pools hero CTA and screen modal/import/event handler.
- My Melega quick action and `MY_MELEGA_ROUTES.createPool`.
- Current V7 project-page Pools CTA (both token and project-hq routes use V7).
- Shared commercial service catalog's Create Pool card.
- Legacy `?create=…` and `#create-pool` activation: shallow replacement removes the creation flag/hash while retaining normal browsing filters. The wizard cannot mount even before canonicalization.

Browsing, cards, staking action host, positions, wallet controls, and deployed pools are unchanged. No replacement Coming Soon or Founder handoff was introduced. Internal `CreatePoolCta`, wizard state/preview, pricing, and historical components remain available.

Search covered exact and semantic creation terms across pages, navigation, components, project versions, empty states, and action catalogs. Old project V2–V6 shells, `FeaturedPoolHero`, `PoolsStudioPageHeader`, Build Studio and User Launch previews are not mounted by current public routes. `/launch` and `/build-studio` already redirect to `/list`. Functional AMM initial-liquidity creation in `LiquidityStudio/onePage/AddLiquidityCard.tsx` is a different product and is preserved.

Validation:

- **40 focused tests pass**: 29 route/drawer/IA/catalog/fee tests plus 11 current project-page tests. Includes an actual connected My Melega component with mocked wallet hooks; no real wallet connection.
- Actual local Pools page at **1440×900** and **390×844**: no creation action, wizard, deployer copy or horizontal overflow; explore/cards remain visible; creation URL canonicalizes. See [browser results](browser-results.json).
- [Desktop Pools](pools-1440.png), [mobile Pools](pools-390.png), [connected drawer desktop](my-melega-connected-1440.png), [connected drawer mobile](my-melega-connected-390.png). Drawer screenshots use the real styled component rendered from a test with a simulated address. Disconnected real-app screenshots are also retained.
- The development app has a pre-existing hydration-error indicator; its overlay was dismissed for inspection. This mission does not claim a clean full-app build.
- Extended legacy suite: 57 passed, 7 failed, plus one initial collection error from running a cwd-sensitive test outside `apps/web`; rerunning that file from `apps/web` passed all 11. Remaining failures concern unchanged Arbitrum eligibility, BOOST label, card height, Farm modal size, internal Safety-step assertion, and missing historical mockup/ownership-map fixtures. These are outside the public-hide change. [Log](evidence/extended-tests.log).
- Typecheck of all six touched production files and imports with ES2020: **0 touched diagnostics, 0 introduced diagnostics**; baseline and current each have 205 dependency diagnostics. Full project typecheck is not green. [Comparison](evidence/typecheck.json).
- `git diff --check`: pass. No build/deployment/push attempted.

## 3. Existing on-chain architecture

**BSC / chain 56.** The repository's discovery constant and the factory stored in sampled live-config pool contracts differ:

- Configured discovery factory: `0x4c33eb3d40c78461dd1a079150fcac6da3c701cf`; owner `0xB6eEb3ab9695979F5b2Ef6Df4112e63212E33EE0`; deployed at block 29241107. [Verified source/ABI](https://sourcify.dev/server/v2/contract/56/0x4c33eb3d40c78461dd1a079150fcac6da3c701cf?fields=all), [saved RPC](evidence/rpc-audit.json).
- Factory returned by three configured SmartChef contracts: `0x31d9C0866E6aDD002d1921e610dEDdE269D2f668`; owner `0x248b004A750031372F636937622075b2d9EA8366`; deployed at block 19971968. [Verified source/ABI](https://sourcify.dev/server/v2/contract/56/0x31d9C0866E6aDD002d1921e610dEDdE269D2f668?fields=all), [saved RPC](evidence/current-factory-rpc-audit.json).

Both have bytecode, exact Sourcify-runtime/RPC matches, Solidity 0.6.12, Ownable, no proxy upgrade interface, and deploy complete `SmartChefInitializable` contracts using CREATE2. There is no shared proxy implementation address. The three sampled child runtimes match bytes embedded in the second factory's runtime. Source extraction is saved as text; no Solidity source in the repository was changed.

Configured pool samples (from `config/constants/pools.tsx`, verified through calls):

- sousId 14, MARCO/MXMX: `0x99a44d26defb3f0a5b4e306ce45538c66c05b69e`.
- sousId 4, MARCO/ZLT: `0x7b072c20d2f03393145c6829175e9ac975fa2cfe`.
- sousId 6, MARCO/M01: `0x2bd7d2a773b525133c9a87910ae6baf8159d9484`.

All three currently return factory `0x31d9…f668`, owner `0xB6eE…3EE0`, and MARCO stake address `0x963556de0eb8138E97A85F0A86eE0acD159D210b`. Snapshot contains reward tokens, emission and start/end blocks. “Live config” does not guarantee an unexpired schedule: ZLT's end block is below the observed chain head. This is a sampled production verification, not a census of every historical pool.

Separate components: sousId 0 uses MasterChef `0x41D5487836452d23f2c467070244E5842B412794`; vault config uses `0xb2d57B1A40E61AAb3F88361228E1188E0fB6A21C`. AMM factory `0xb7E5848e1d0CB457f2026670fCb9BbdB7e9E039C` and its `allPairs` discovery are not SmartChef staking-pool creation.

## 4. Current pool creation lifecycle

Exact factory function on both factories:

```text
deployPool(address stakedToken, address rewardToken, uint256 rewardPerBlock,
           uint256 startBlock, uint256 bonusEndBlock,
           uint256 poolLimitPerUser, address admin)
external nonpayable onlyOwner
```

Selector `0xcc8402f5`. Factory checks token `totalSupply()` calls and token inequality, derives a salt from stake/reward/start, deploys the child, calls `initialize`, and emits `NewSmartChefContract(address indexed smartChef)`. It returns no pool address; the event identifies the child. No on-chain enumeration is provided.

Child constructor records its creating factory. Initialization is single-use and requires that factory, assigns tokens/schedule/precision and transfers ownership to `admin`. Stake tokens are held by the child after deposit. Reward tokens must be separately transferred into the child: deployment has no budget argument or funding transfer. Rewards accrue per block; deposit/withdraw/claim require adequate reward custody. Pool owner can alter emissions/schedule and withdraw reward tokens.

Concrete proof: [transaction 0x641a…d31f](https://bscscan.com/tx/0x641a091ed247386b172659673d76a10e5440c8e65f5d85be46d6fa28f431d31f), block **21847929**, sender `0x248b…8366`, recipient factory `0x31d9…f668`, value **0 BNB**, successful receipt. Logs contain two ownership transfers and `NewSmartChefContract(0x99a44…b69e)`, with no reward-token transfer. Original schedule differs from today's calls, consistent with mutable admin configuration. [Transaction, receipt and bytecode evidence](evidence/sample-pool-creation.json).

## 5. Authority/deployer analysis

- **Contract authority — first blocker:** `onlyOwner` at [verified source line 1152](evidence/current-factory-source.txt). Ordinary-address simulation fails on both deployed factories. The required signer is the current factory-owner account, not an assumed human Founder identity. The B6eE owner address has an EIP-7702 delegation marker; no inference about who controls its keys is needed.
- **Deployment tooling:** no currently executable SmartChef deployment script or permissionless binding was found in repository production paths; source/ABI and historical on-chain execution establish the actual mechanism. Ethereum permits an ordinary wallet to deploy its own code, but that would be a separate manual deployment and would not enter this factory/registry lifecycle.
- **Indexing:** static config/inventory remains another independent blocker.
- **Frontend:** existing wizard only previews and disables execution. The deployer sentence is broadly correct for these deployed factories, but incomplete: changing only tooling or copy cannot remove contract authority, funding, safety, or discovery gaps.

Transferring ownership to a wrapper would require protocol action and still create legacy children with dangerous mutable admin powers. It is not the recommended public solution.

## 6. Current fee enforcement

Canonical policy: **FREE when staking MARCO; otherwise 0.25 BNB** (`250000000000000000` wei), Treasury **`0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b`**. Sources: `config/constants/fee-schedule.json:46`, `feeSchedule.ts`, `createPoolWizardState.ts`.

Today this is **UI/quote policy only for this creation flow**. `lib/monetization/paymentRouter.ts` computes quotes; its on-chain product label is not evidence of executable settlement. Both verified factories are nonpayable and contain no Treasury payment, fee exemption or reward-budget transfer. The public wizard has no execution. No canonical atomic creation-fee enforcement was found; the historical MARCO example itself does not prove non-MARCO payment behavior, but factory source proves absence of fee enforcement.

Future enforcement should be atomic in the factory: compare the stake-token **address** to canonical MARCO, require exact applicable `msg.value`, and settle directly to the existing Treasury together with successful creation/funding. Preserve this policy; no new amount or asset is proposed.

## 7. Pool discovery/indexing

Runtime path: `PoolsStudio/poolsRuntime/usePoolsStakingRuntime.ts` → `usePoolsPageFetch` / `usePoolsWithVault` → `state/pools/index.ts` → `getPoolsConfigForChain` in `config/constants/pools.tsx:3660`. `utils/contractHelpers.ts:159` also resolves `sousId` through static pool configuration for staking execution.

`/api/pools/classification` calls `lib/bsc-indexer/registry/discoverSmartChefOnChain.ts`. Despite its name, it seeds candidates from `docs/pools-canonical-inventory.json` / public inventory / `public/registry/onchain/bsc-mainnet.json`, then verifies those addresses using calls. It does not scan factory creation events. Existing factory metadata points to the other deployed factory noted above. AMM pair indexing is unrelated.

**Static config is currently required for a new pool to participate in the normal stakeable runtime.** Minimum change: index the approved new factory's creation events with chain/address identity, a persisted block cursor and reorg handling; validate emitted pool metadata, serve it via the existing API layer, and let runtime/contract helpers consume dynamic descriptors. Keep static legacy entries. An event list alone is insufficient while helpers still require a manually assigned `sousId`.

## 8. Security gaps

**MUST HAVE BEFORE PUBLIC**

- Validate nonzero contract token addresses, supported decimals, distinct stake/reward tokens, future start/end ordering, positive bounded duration/emission, and exact funded budget sufficient for the full schedule; checked arithmetic and tested rounding/precision.
- Atomic reward transfer with before/after balance checks; reject fee-on-transfer and rebasing behavior in the supported model. Deposit accounting must track actual received stake or reject mismatches. Legacy `deposit` credits requested amounts.
- Reentrancy protection and checks-effects-interactions around creation, funding, staking, rewards and native-fee settlement; safe ERC20 calls. Malicious callbacks/return values must not corrupt accounting. Arbitrary tokens cannot be proven benign; disclose transfer restrictions/blacklisting risk and avoid presenting unverified tokens as official.
- Fixed public reward commitments; creator must not inherit legacy `emergencyRewardWithdraw`, arbitrary emission changes or retroactive schedule resets. Token recovery must exclude stake and committed rewards; any leftover recovery only after obligations are satisfied.
- Principal withdrawal must remain available when rewards fail or emergency controls activate. Specify emergency pause scope; no emergency seizure or unbounded reward drain.
- Clear creator/admin/protocol roles; creation should not need any per-pool signature or attestation. Define global administration explicitly.
- Factory-origin verification and separate “community” versus “official” labeling; address-based identity prevents symbol impersonation. Deterministic uniqueness or creator nonce, pagination/rate limits and bounded indexing prevent duplicate collisions and free-MARCO pool spam from overwhelming discovery. Do not invent an extra creation fee.
- Adversarial token tests, funding/fee atomicity tests, accounting invariants and independent contract review before deployment/public exposure.

**OPTIONAL LATER**

- Support for transfer-tax/rebasing tokens (a separate accounting design), advanced schedules, extra chains, enriched moderation/ranking, optional ERC20 permit, and additional analytics. None is needed for the minimum ordinary-user flow.

Existing SmartChef uses SafeMath, SafeBEP20 and reentrancy guards, but these do not solve mutable reward administration or transfer-tax accounting. `contracts/public-farm-factory` offers useful budget/factory patterns, but its LP pair requirement and signed eligibility attestation fail this mission's single-token/no-per-pool-signer definition. Its template also needs security review before any reuse; it is not a ready staking-pool replacement.

## 9. Self-service feasibility classification A/B/C

**C.** No production permissionless staking-pool factory was found in the actual configured paths or sampled contracts. Existing deployed factories cannot be made permissionless through a UI binding. They have no upgrade interface. A new deployment is required; no modification/migration of existing pool balances is needed.

## 10. Minimum implementation architecture

After separate authorization only:

1. User selects stake/reward tokens and valid fixed-budget parameters in the retained wizard.
2. Wallet approves exactly the reward budget to a new audited factory when allowance is insufficient.
3. User calls payable `createPool` from their own wallet with the canonical fee.
4. Factory validates parameters, deploys/initializes a safe pool, pulls and verifies exact reward funding, settles the fee atomically, and emits `PoolCreated` with pool/creator/token/schedule/budget metadata. Any failure reverts the entire creation.
5. Event discovery adds the pool to the existing API/runtime as a community pool; stake/withdraw works without config edits or per-pool approval.

Reuse the current fee policy, wizard, cards, token utilities and API surfaces. Preserve a compatible staking ABI where practical. Do not simply remove `onlyOwner` from the legacy factory: unsafe child administration and non-atomic funding remain.

## 11. Exact files/contracts likely required

Proposed next implementation scope, not changes made here:

- New `contracts/public-pool-factory/PublicPoolFactoryV1.sol` and `PublicPoolTemplateV1.sol`, interfaces, adversarial tests and deployment/verification script. Reuse reviewed patterns from `contracts/public-farm-factory`, without LP/attestation coupling.
- Factory address/ABI registry and chain-56 deployment record; retain old pools/factories.
- `apps/web/src/lib/bsc-indexer/registry/discoverSmartChefOnChain.ts` or an adjacent factory-event reader; `/pages/api/pools/classification.ts` plus a dynamic descriptor endpoint if the current response cannot carry descriptors.
- `apps/web/src/state/pools/index.ts`, `utils/contractHelpers.ts`, `views/PoolsStudio/poolsRuntime/usePoolsStakingRuntime.ts`: dynamic chain/address pool descriptors alongside existing config.
- Retained `CreatePoolCta.tsx`, `createPoolWizardState.ts`, `CreatePoolWizardPreview.tsx`, a focused wallet-execution hook, and receipt/event parsing. Restore public entry points only after end-to-end validation.
- `feeSchedule.ts` / fee JSON are read-only policy inputs unless an explicit later policy decision is made.

## 12. Deployment/migration implications

New factory and safe child bytecode deployment required. No upgrade of the two existing factories, ownership transfer, migration of user principal, or modification of existing deployed pools is required. Backfill the new factory from its deployment block and preserve legacy registry/config. Before production, verify source/bytecode, addresses, Treasury/MARCO configuration, fee and funding invariants, emergency scope and indexer recovery. Public UI remains hidden until this passes.

## 13. Recommended next mission

`MELEGA-POOL-SELF-SERVICE-FACTORY-SPEC-AND-SECURITY-GATES`: review and approve the exact factory/template interface, fixed-reward and emergency guarantees, canonical-fee enforcement, token compatibility policy, dynamic discovery contract and test matrix. Only then authorize a bounded contract/UI implementation mission. No backend signer, Founder per-pool signature, KMS, hot wallet, manual registry edit or governance approval belongs in the ordinary flow.

## 14. Explicit non-actions performed

No Solidity changes, self-service implementation, permissions/ownership changes, blockchain writes, real approvals/payments/transactions, contract deployment, push, merge, or production UI deployment. All RPC actions were reads or `eth_call` simulations. No private keys were requested. Internal wizard/history and SmartSwap/Farm work were preserved.

Historical bulk log endpoints were restricted, so a known pool's creation transaction and receipt were read directly instead. This does not block classification or the minimum plan; exhaustive historical census is outside this audit. Legacy test/dependency failures and the dev hydration indicator remain release-validation limitations, not evidence of self-service readiness.

### Reproduction

Run focused tests from `apps/web` with the mission Vitest config; this avoids cwd-sensitive legacy tests. Run `node docs/pools/self-service-feasibility/check-types.cjs` (it compares changed production files to the recorded baseline). `rpc-audit.cjs` is read-only; set `FACTORY_ADDRESS`, `FACTORY_PREFIX`, and optionally `AUDIT_RPC` to repeat either snapshot. Saved JSON records exact endpoints/blocks and restricted archive responses. Browser test accepts `PLAYWRIGHT_MODULE` for an existing local Playwright installation; no dependency installation is required by this change.
