# Permissionless BSC staking pools — V1 factory specification

MISSION: `MELEGA-POOL-SELF-SERVICE-FACTORY-SPEC-AND-SECURITY-GATES`

Status: **proposed specification for Architect/Founder review; not an implementation or deployment authorization**.
Date: 2026-09-28. Chain: BSC mainnet, 56 only.
BASE_MAIN_SHA: `a6e178c2ce6be73c38faf67a5a8fe0665f1ab17e`.
BRANCH: `pool-self-service-factory-spec-security`.

Task 1 was published first as [draft PR #105](https://github.com/meleganza/MelegaSwapV2/pull/105), head `080014c394002a7838aa190c5c4a6c08950127f9`. At the sequencing gate GitHub reported MERGEABLE, Vercel PENDING and Vercel Preview Comments SUCCESS. Forty focused tests passed again. That PR remains at the Architect/Founder merge gate. This branch starts independently at fetched main, not on the hide branch. Consequently main's existing UI is inherited unchanged here: this docs-only diff neither introduces nor restores any creation entry point. Merge Phase A before any later product release.

## 1. Decision and non-negotiable boundaries

Deploy a **new non-upgradeable factory which creates a new full pool contract per call using CREATE**, constructor-bound to immutable parameters. The caller is the creator and reward funder. No per-pool Founder/Team signature, eligibility attestation, backend signer, KMS, hot wallet or manual registry handoff exists. Contracts, API and UI must all support ordinary user creation.

The minimum flow is wallet → exact ERC20 reward approval → payable `createPool` → child reward custody + native fee settlement in one reverting transaction → authenticated `PoolCreated` → event index → dynamic pool descriptor → staking UI.

Only ERC20/BEP20 stake and reward assets are supported; native BNB is exclusively the creation fee. Stake and reward addresses must differ. WBNB may be an ERC20 asset if it meets the same rules. Fixed block-based emissions preserve familiar pool concepts without inheriting legacy administration. There is no mutable rate, extension, top-up schedule, per-user staking cap, proxy, ownership transfer, cancellation, arbitrary execution, selfdestruct or reward-drain function.

**Legacy compatibility/migration:** do not upgrade, call administrative methods on, or change ownership of `0x31d9C0866E6aDD002d1921e610dEDdE269D2f668` or `0x4c33eb3d40c78461dd1a079150fcac6da3c701cf`. Do not change existing pool balances, allowances, owners or schedules. Preserve legacy configuration and adapters. Users can voluntarily withdraw and later stake elsewhere; no migration is required or automated. V1 assets and addresses are separate.

## 2. Evidence and model selection

Evidence is pinned to the already published audit commit, so this independent branch does not duplicate or depend on unmerged audit files:

- [Feasibility report](https://github.com/meleganza/MelegaSwapV2/blob/080014c394002a7838aa190c5c4a6c08950127f9/docs/pools/self-service-feasibility/REPORT.md).
- [Current factory source](https://github.com/meleganza/MelegaSwapV2/blob/080014c394002a7838aa190c5c4a6c08950127f9/docs/pools/self-service-feasibility/evidence/current-factory-source.txt): `SmartChefInitializable` at line 806, constructor records `SMART_CHEF_FACTORY`; initialize requires that factory and gives `admin` ownership. `deployPool` is `onlyOwner`, embeds `type(SmartChefInitializable).creationCode`, uses CREATE2 and initializes the child. Owner reward withdrawal and mutable emissions/schedules are explicit in source.
- [Historical factory source](https://github.com/meleganza/MelegaSwapV2/blob/080014c394002a7838aa190c5c4a6c08950127f9/docs/pools/self-service-feasibility/evidence/historical-factory-source.txt), corresponding to the configured discovery factory.
- [Saved RPC](https://github.com/meleganza/MelegaSwapV2/blob/080014c394002a7838aa190c5c4a6c08950127f9/docs/pools/self-service-feasibility/evidence/current-factory-rpc-audit.json), [other factory RPC](https://github.com/meleganza/MelegaSwapV2/blob/080014c394002a7838aa190c5c4a6c08950127f9/docs/pools/self-service-feasibility/evidence/rpc-audit.json), and [child bytecode/creation receipt](https://github.com/meleganza/MelegaSwapV2/blob/080014c394002a7838aa190c5c4a6c08950127f9/docs/pools/self-service-feasibility/evidence/sample-pool-creation.json). These are historical read snapshots at blocks 124490769 / 124490583, not a claim of current chain state.

Independently inspected source and compared the saved RPC bytecode with Sourcify on-chain/recompiled bytecode in this mission. RPC bytes exactly equal the saved on-chain bytes. Raw recompiled bytes differ only at the two recorded CBOR metadata regions in each factory; applying Sourcify's recorded cborAuxdata replacements reproduces RPC bytes exactly (a metadata-adjusted source match, not a raw full match). Factory runtimes are 13,683 and 8,495 bytes respectively, not 45-byte ERC-1167 clones. Runtime SHA-256 values: `f04f151f510325bda765ec77a5b704144ed91578673559191adbdb8ac3ee86d3` and `68fef70236e4d22ad96a0fecbe87745d73711e347788ebdb946be92bd3f2e5a2`. The saved audit verifies all three sampled child runtimes are embedded in the first factory; no reusable shared implementation address was identified. This mission does not repeat a live-chain census.

Alternatives considered:

- **Clone a legacy child: rejected.** Constructor state would not initialize clone storage and the factory-only initializer would not work as-is; inherited mutable admin powers and non-atomic reward lifecycle are also unacceptable.
- **New ERC-1167 immutable clone/template: technically possible, deferred.** It reduces per-pool deployment gas, but requires a new initialization/implementation lifecycle and corresponding tests anyway. [ERC-1167](https://eips.ethereum.org/EIPS/eip-1167) forwards to a fixed implementation. Gas optimization is not evidence that legacy code is safe to reuse.
- **Upgradeable proxy/beacon: rejected for V1.** Adds upgrade authority and shared compromise risk without a product requirement.
- **New full deployment: selected.** Immutable constructor parameters, no initializer takeover or delegatecall boundary, no template registry. Higher deployment gas is accepted provisionally; actual factory size, child initcode/runtime size and BSC creation gas must pass the implementation gate. If size/gas fails, return a bounded clone-design amendment for review instead of silently changing architecture.

`contracts/public-farm-factory/PublicFarmFactoryV1.sol` and `PublicFarmTemplateV1.sol` were inspected as local patterns only: LP eligibility signatures, lack of required exact transfer accounting and incomplete security boundaries prevent drop-in reuse. This mission does not certify or modify Farm work.

## 3. Canonical policy and parameter domain

Proposed factory constants, with no setters:

```solidity
uint256 public constant CHAIN_ID = 56;
uint32 public constant VERSION = 1;
address public constant MARCO = 0x963556de0eb8138E97A85F0A86eE0acD159D210b;
address payable public constant TREASURY = payable(0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b);
uint256 public constant CREATION_FEE = 250000000000000000; // wei, 0.25 BNB
uint64 public constant MAX_DURATION_BLOCKS = 100_000_000;
uint64 public constant MAX_START_DELAY_BLOCKS = 10_000_000;
uint256 public constant MAX_REWARD_BUDGET = type(uint128).max;
uint256 public constant MAX_TOTAL_STAKED = type(uint128).max;
uint256 public constant ACC_PRECISION = 1e27;
```

The block ceilings are explicit conservative V1 proposals to bound arithmetic/schedules, **not promises about wall-clock duration**. Architect accepts them with this spec or revises them before implementation. The UI uses live chain estimates for dates and always submits block numbers. No recurring policy oracle is required.

Fee math: `fee = (stakeToken == MARCO) ? 0 : 250000000000000000`. Compare the address, never symbol, creator's MARCO balance or a staking proof. “Stake MARCO = FREE” means the pool's stake asset is canonical MARCO, not that its creator has staked MARCO elsewhere. Enforce `msg.value == fee`; both underpayment and excess revert, including nonzero value for a free pool. No ERC20 fee alternative, refund branch, waiver signature or fee-on-fee. Treasury receives exactly this call's fee, not the factory's total BNB balance. Forced BNB donations never affect price or reserves.

Creation rejects: wrong chain; paused factory; non-contract/zero token addresses; equal stake/reward; malformed/failed metadata probes; decimals outside 0–18; zero totalSupply; invalid nonce; start <= inclusion block; start further than MAX_START_DELAY_BLOCKS; end <= start; duration above MAX_DURATION_BLOCKS; zero rate; budget zero/above MAX_REWARD_BUDGET; overflow or `rewardBudget != rewardPerBlock * (endBlock - startBlock)`.

Amount units are integer token base units, never decimals-normalized inside reward accounting. Decimal probes are for compatibility/display only. Multiplication uses checked uint256 before any narrowing. Given positive duration and bounded budget, rate is bounded too. There is no claim of monetary minimum funding: token units and token value differ.

Supported token behavior: stable supply/account balances except explicit transfers, exact debits/credits, standard balanceOf, safe optional-return transfers, no transfer tax or rebase. Safe wrappers handle true/no-return success and reject false/revert. [OpenZeppelin SafeERC20](https://docs.openzeppelin.com/contracts/5.x/api/token/erc20#SafeERC20) is a reference, not permission to change dependencies blindly. Pin compatible audited dependencies/compiler in implementation; local submodule contents are absent in this checkout, so compilation/version compatibility remains a gate.

No generic contract probe can prove a token is non-rebasing, immutable or honest. Exact balance deltas reject observable unsupported transfers, but malicious balanceOf, future blacklist/tax changes, proxies or negative rebases remain token risks. Permissionlessness does not imply token endorsement. Display this limitation and address-based identity; never assert that an accepted community token is audited. Principal guarantees below are conditional on the stake token honoring its transfer/balance contract.

## 4. Exact proposed factory ABI and storage

The following is an ABI/storage specification, not compilable production Solidity.

```solidity
struct CreatePoolParams {
    address stakeToken;
    address rewardToken;
    uint256 rewardPerBlock;
    uint64 startBlock;
    uint64 endBlock;
    uint256 rewardBudget;
    uint256 expectedNonce;
}
constructor(address guardian_); // nonzero; requires block.chainid == 56
function createPool(CreatePoolParams calldata p) external payable returns (address pool);
function quoteFee(address stakeToken) external pure returns (uint256);
function setCreationPaused(bool paused) external; // guardian only
function guardian() external view returns (address);
function creationPaused() external view returns (bool);
function creatorNonce(address creator) external view returns (uint256);
function isPool(address pool) external view returns (bool);
// Public getters for constants in section 3.

event PoolCreated(
    address indexed pool,
    address indexed creator,
    address indexed stakeToken,
    address rewardToken,
    uint256 rewardBudget,
    uint256 rewardPerBlock,
    uint64 startBlock,
    uint64 endBlock,
    uint256 creatorNonce,
    uint256 feePaid,
    uint32 version
);
event CreationPaused(address indexed guardian, bool paused);
```

Factory storage: immutable `address guardian`; `bool creationPaused` initially false; `mapping(address => uint256) creatorNonce` initially zero; `mapping(address => bool) isPool`; standard persistent reentrancy-guard state. No owner, implementation slot, iterable allPools array, reward escrow or arbitrary token approvals. The guardian is a separately approved operational address fixed at deployment; it need not sign creations. It cannot change economics or seize funds. Lost guardian keys cannot be rotated in V1; deploy a new factory after approval if necessary. Compromised guardian can cause creation/deposit denial of service but cannot block exits or claims. This deliberate limited model avoids governance infrastructure.

`createPool` order under nonReentrant:

1. Validate chain, pause, input/fee/nonce and all token/parameter probes. Bind creator/funder/refund beneficiary to `msg.sender` (EOA or smart account); no supplied arbitrary funder/recipient. Consume that caller's expected nonce with checked increment; any subsequent revert restores it.
2. CREATE a full pool with the constructor below, inactive. The child records `factory = msg.sender` in its constructor and cannot accept deposits yet.
3. Snapshot reward balances of caller and child; SafeERC20 `transferFrom(caller, child, rewardBudget)`; require child's increase and caller's decrease each exactly rewardBudget. Donations already at the child are not funding. If either delta fails, revert. Factory takes no intermediate reward custody and never approves a spender.
4. If fee > 0, call immutable Treasury with exactly fee and empty data. Require success. Factory reentrancy guard covers token callbacks and Treasury callback; no permissioned mutator may be entered during creation. Treasury failure reverts deployment, funding and nonce.
5. Call child `activate()`; it is factory-only, single-use, requires reward balance >= budget. It finalizes no mutable business parameters. Then set isPool true and emit PoolCreated last. No observable successful registered pool exists without funding and fee settlement.

An inactive pool rejects deposit/withdraw/claim/refund calls during token or Treasury callbacks. Every callback attempt to create again fails the factory guard. Guardian pause mutators use the same guard. Read-only callbacks never establish authenticity; the successful factory event and isPool mapping do.

Native receive/fallback rejects normal BNB transfers. Forced BNB may remain locked; there is no general rescue path. Failed transactions charge network gas only and must not retain the creation fee or reward budget. Existing ERC20 approval, being a separate prior transaction, remains after failure.

## 5. Exact proposed pool ABI, construction and custody

```solidity
constructor(
    address creator_, address guardian_, address stakeToken_, address rewardToken_,
    uint256 rewardBudget_, uint256 rewardPerBlock_, uint64 startBlock_, uint64 endBlock_
);
function activate() external; // only deploying factory, exactly once
function deposit(uint256 amount) external;
function withdraw(uint256 amount) external; // stake only, rewards checkpointed
function claim() external;
function pendingReward(address user) external view returns (uint256);
function refundableUnallocated() external view returns (uint256);
function refundUnallocated() external; // creator only, after end
function setDepositsPaused(bool paused) external; // immutable guardian only
function userInfo(address user) external view returns (
    uint256 amount, uint256 paidAccumulator, uint256 accrued, uint256 remainder
);
// Public getters for all immutable/global fields below.

event PoolActivated(uint256 rewardBudget);
event Deposit(address indexed user, uint256 amount);
event Withdraw(address indexed user, uint256 amount);
event RewardPaid(address indexed user, uint256 amount);
event UnallocatedRefunded(address indexed creator, uint256 amount);
event DepositsPaused(address indexed guardian, bool paused);
```

No external initializer. Constructor validates nonzero authority/creator and the same internal asset/schedule/budget relations where independently checkable; factory = constructor caller, never an input override. Only the approved factory's children are discoverable. A third-party deployment of identical code is not an authenticated Melega pool.

Immutables: `address factory, creator, guardian, stakedToken, rewardToken`; `uint256 rewardBudget, rewardPerBlock`; `uint64 startBlock, bonusEndBlock` (constructor endBlock stored under this familiar getter). No owner/admin inherits legacy powers.

Mutable state: `bool activated, depositsPaused`; `uint256 totalStaked, accRewardPerShare, allocatedRewards, rewardsPaid, refundedUnallocated`; `uint64 lastRewardBlock` initialized to startBlock; mapping user → `UserInfo { uint256 amount; uint256 paidAccumulator; uint256 accrued; uint256 remainder; }`; persistent reentrancy-guard state. Constants ACC_PRECISION and MAX_TOTAL_STAKED match section 3. Public getters expose all global fields. No pool array, loop across users, native rewards, arbitrary recovery or delegatecall.

ERC20 rewards live in the child from creation. ERC20 principal lives in the child only after user deposits; separate token addresses and separate ledgers prevent principal/reward confusion. The creator is a fixed beneficiary solely of proven unallocated rewards after end. There is no arbitrary reward or principal recovery, including donations; accidentally transferred unrelated assets remain locked in V1. No rescue scope will be added without new review.

All state-mutating pool functions are nonReentrant. Deposit requires activated, unpaused, startBlock <= block.number < bonusEndBlock, amount > 0 and totalStaked + amount <= MAX_TOTAL_STAKED. Checkpoint before modifying balances, then pull stake with exact sender-decrease/child-increase checks and apply credit atomically. Withdraw requires activated, 0 < amount <= user.amount; checkpoint and reduce ledgers before transferring stake. Check exact pool debit and recipient credit. **Withdraw never calls rewardToken or the factory**, never attempts automatic claims, and is never paused. Users can withdraw their entire stake through the same function; a redundant emergency withdraw that forfeits rewards is unnecessary.

Claim checkpoints, clears whole accrued amount and increments rewardsPaid before transferring rewards with exact sender/recipient delta checks. A failed reward transfer reverts only that transaction, preserving the entitlement. Claim is available after end and during any pause, without expiry. Zero accrued returns successfully without a token call. No withdraw-and-claim aggregation in V1: UI exposes separate actions so a claim failure cannot roll back a principal exit.

## 6. Reward arithmetic and reserve invariants

Let Q = 1e27, S = internal totalStaked (never token balance), D = end-start, B = rate*D.

At a checkpoint, `t = min(max(block.number, start), end)`; dt = t-lastRewardBlock (nonnegative). Let emitted = dt*rate. If S > 0, increase allocatedRewards by emitted and accumulator by floor(emitted*Q/S) using audited full-precision `mulDiv`. If S == 0, do not allocate or increase accumulator. Always advance lastRewardBlock to t. Direct stake donations cannot dilute rewards; direct reward donations do not change B or rate. Reward blocks skipped with S==0 are not assigned to future depositors.

For each user before any amount change: delta = accumulator-paidAccumulator. Compute `whole = mulDiv(amount, delta, Q)` and `fraction = mulmod(amount, delta, Q)`. Add old remainder to fraction, credit whole + floor(sum/Q) to accrued and store sum%Q as remainder; then paidAccumulator = accumulator. Remainder persists across withdrawals/claims and cannot be transferred to another account. This avoids repeatedly rounding a user's checkpoint entitlement down to zero. Global division dust stays in the reserved reward balance; do not redistribute it across a changing stake population.

Use uint256 arithmetic with explicit caps. B <= uint128.max, cumulative accumulator <= B*Q, remainder < Q; sum of two remainders < 2Q. Full-precision mulDiv/mulmod avoids overflow in user amount*delta (see [OpenZeppelin Math utilities](https://docs.openzeppelin.com/contracts/5.x/api/utils#Math)). The implementation must prove accumulator additions, allocatedRewards and user rewards remain bounded; never use unchecked casts. Reject deposits exceeding the cap before transfer. Pool functions contain no unbounded iteration.

After end, checkpoint globally; the ONLY refundable amount is `B - allocatedRewards - refundedUnallocated`. Creator may call refundUnallocated; mark it consumed before exact-transfer checks. It cannot refund allocated-but-unclaimed rewards, rounding reserves or donations, even when all users withdrew. Claim rights never expire. Allocated rounding dust and sub-unit user remainders can remain locked permanently; this is the deliberate smallest safe recovery model. No claim-deadline forfeiture is introduced.

Required invariants under supported-token behavior:

1. Successful creation implies exact budget received and exact Treasury fee forwarded; failure leaves no child/event/registry entry/nonce consumption/fee/funding change.
2. totalStaked = sum(user.amount); stakeBalance >= totalStaked, even with donations. No method pays rewards from principal.
3. 0 <= rewardsPaid <= allocatedRewards <= B; refundedUnallocated <= B-allocatedRewards. Reward balance >= B-rewardsPaid-refundedUnallocated. Sum of whole claimable entitlements never exceeds allocatedRewards-rewardsPaid.
4. Fixed tokens, schedule, rate, budget, creator, factory and guardian never change. No post-creation privileged signature is needed for user deposits, exits or claims.
5. Token/fee callbacks cannot enter another mutation; inactive children cannot be used before activation. Every successful indexed pool is a registered child of the approved factory/version.
6. Pauses affect only new creations or new deposits. Accrual, stake exit, claims and the fixed schedule continue. Reward transfer failure cannot block principal withdrawal.
7. Expected nonce makes the identical successful request non-replayable for its creator. Another account cannot consume it; intentional new requests remain permissionless.

## 7. Reverts and user-visible failure handling

Proposed custom errors (no ambiguous success fallback):

```solidity
error WrongChain(uint256 actual);
error Unauthorized();
error CreationIsPaused();
error DepositsArePaused();
error InvalidToken(address token);
error SameToken();
error UnsupportedDecimals(address token, uint256 decimals);
error InvalidSchedule();
error InvalidRate();
error InvalidBudget(uint256 supplied, uint256 required);
error IncorrectFee(uint256 sent, uint256 expected);
error BadNonce(uint256 sent, uint256 expected);
error ExactTransferRequired(address token);
error FeeForwardFailed();
error OnlyFactory();
error AlreadyActivated();
error NotActivated();
error PoolNotStarted();
error PoolEnded();
error ZeroAmount();
error StakeCapExceeded();
error InsufficientStake(uint256 requested, uint256 available);
error PoolNotEnded();
error NothingToRefund();
```

Use dependency-native SafeERC20 and reentrancy errors rather than duplicate low-level wrappers. Checked arithmetic panics, child creation failure, out-of-gas and arbitrary token revert data remain possible; the UI handles unknown reverts without claiming payment or creation. It must not render unsanitized token revert strings/HTML. Custom errors explain invalid schedule/fee/allowance; simulation is advisory, inclusion-time validation is authoritative. On revert show transaction status and explain retained allowance/retry; refresh nonce, chain head and fee before retry. Never automatically retry a submitted transaction with a new nonce while receipt status is unknown.

## 8. Exact wallet sequence

1. Select chain 56, stake/reward addresses, rate and start/end blocks. Read approved factory identity/version, quoteFee, creatorNonce, pause state and token metadata; compute exact B in integer units. UI clearly shows fee, reward debit, gas estimate, immutable schedule, community status, no automatic reward withdrawal, and unsupported-token limits.
2. Read allowance of rewardToken for factory. If it equals B, no approval. Otherwise set allowance exactly B; for a token requiring zero-first, reset a nonzero allowance to zero before approving B (two approval transactions in that compatibility case). Never request unlimited allowance by default. Existing allowance > B is reduced to B for the exact-approval flow.
3. After approval receipt, refresh nonce/fee/schedule and simulate `createPool(p)` with caller wallet and exact msg.value. User signs and broadcasts it directly. A moved start block may require updating the form; no server signs.
4. Parse the successful receipt's event from the approved factory only. Show the created address immediately as pending indexing/finality, not as an official pool. Handle replaced/dropped/reverted transactions and chain switches explicitly. Confirm against isPool and child parameters.
5. The reward allowance normally falls to zero after the exact pull; offer revoke if token behavior leaves allowance. Staking later uses a separate exact stake-token approval to the child, then deposit. Withdrawal sends only stake; claim is a separate action.

No backend private key is needed by the indexer or runtime. A wallet RPC transaction submission service is transport, not custody or a permissioned signer.

## 9. Authenticated event discovery and dynamic runtime

Current `lib/bsc-indexer/registry/discoverSmartChefOnChain.ts` seeds static JSON inventories. `state/pools/index.ts`, fetch helpers and `utils/contractHelpers.ts:getSouschefContract` resolve numeric sousId through static configuration. An event scanner alone will not deliver self-service execution.

Add one approved factory deployment descriptor: chainId 56, address, deployment block/hash, version, compiled factory code hash and child artifact/immutable layout, ABI, MARCO, Treasury, guardian. This is release configuration once per factory version, **not a new per-pool config edit**. No arbitrary factory URL parameter is trusted.

Indexer specification:

- Scan only exact factory address plus exact PoolCreated topic, from deployment block using bounded eth_getLogs ranges. Persist chain/factory/version, cursor block/hash, event block/hash, transaction hash and log index. Events are keyed by chain + factory + txHash + logIndex; pools by `56:<lowercase address>`. No numeric ID allocation.
- Process at most 2,000 blocks/request initially, splitting on RPC limits; concurrency <=4, bounded retry/backoff. Paginated API defaults 25, max 100. Limit token metadata bytes/time and sanitize text. Never load all pool histories per web request. These are tunable operational limits, not contract restrictions.
- Use provider's verified finalized head if available; otherwise 64 confirmations is the proposed conservative fallback, explicitly not an absolute finality guarantee. Before publishing a batch, verify its canonical block hashes. Store provisional events separately; receipt UI may show a pending record. On cursor mismatch rewind to common ancestor, remove orphaned events/descriptors and replay; beyond retained history rebuild from deployment block. Atomic cursor/event writes prevent gaps on crashes.
- Verify successful receipt, chain, emitter/topic/version, factory isPool(pool), nonempty child code, factory/creator/tokens/schedule/budget/guardian getters against event/descriptor. Reconstruct child deployed bytecode with immutable substitutions against the pinned artifact; a universal child code hash would be wrong for constructor immutables. Do not trust arbitrary child-emitted copies of PoolCreated. Compare creation funding proof at creation block when historical balance reads are available; later depleted reward balance does not invalidate original funding.
- RPC errors yield stale/unverified status, never fabricated funding. Current reward solvency uses reserve accounting from section 6 and current balances. Preserve snapshots/cursors and expose observedAt/syncBlock/staleness. Reorged receipts lose final status. Unsupported providers cannot silently advance the cursor.
- Community factory provenance is not “official”, token verification or price verification. Every genuine pool stays retrievable by address and by creator; default lists may rank/filter but must expose a paginated community listing. No preapproval, human moderation or featured payment is required for discovery or staking. Preserve user's positions even when a pool is spam-filtered from default browsing.

Dynamic descriptor schema (uints as base-unit decimal strings in JSON):

```typescript
type PublicPoolDescriptorV1 = {
  poolKey: string; chainId: 56; address: string; factory: string; version: 1;
  creator: string; guardian: string; stakedToken: string; rewardToken: string;
  rewardBudget: string; rewardPerBlock: string; startBlock: string; endBlock: string;
  creatorNonce: string; feePaid: string;
  origin: 'public-pool-v1'; provenance: 'community';
  creation: { txHash: string; blockNumber: string; blockHash: string; logIndex: number };
  verification: 'pending' | 'confirmed' | 'stale' | 'invalid' | 'orphaned';
  syncBlock: string; observedAt: string;
};
```

Add address-keyed public/user data slices and a discriminated adapter (`legacy-smartchef` versus `public-pool-v1`). Keep legacy sousId behavior for legacy contracts; do not hash/truncate new addresses into sousId. Update allowance, balances, APR/status, cards, positions, action host, contract helper and transaction refresh paths end to end. V1 withdraw does not claim: do not reuse a legacy ABI/semantic assumption. No trusted price => APR unavailable rather than invented. Pool detail and wallet positions remain accessible during indexer delay/outage through verified address reads, with stale badges. Search/index endpoints are read-only, no signer credentials.

Minimal duplicate/spam controls: creator expectedNonce prevents accidental replay/races; CREATE avoids caller salt squatting; positive exact budget, schedule ceilings and gas impose finite cost. Free MARCO creation remains free, with no extra fee or signature. Creator nonce alone does not stop Sybil spam and identical parameters under a new nonce are allowed. Pagination, bounded metadata/RPC work, deduplication, per-client read rate limits and ranking separate from canonical enumeration prevent an unbounded UI/indexer workload. Stress-test this explicitly; do not claim spam-proofness.

## 10. MUST HAVE security gates and test matrix

These are acceptance criteria for the next implementation, not tests claimed to have run in this spec-only mission.

**M1 — authority and compatibility.** Ordinary EOA and smart-account callers create without privileged signatures; guardian cannot seize/retarget/change terms; unauthorized pause/activate/refund attempts revert. Legacy bytecode/owner reads remain unchanged on fork. No frontend re-exposure until final product gate.

**M2 — atomic funding and fees.** MARCO=0, non-MARCO=0.25 BNB, fake-symbol MARCO charged, under/overpayment rejected. Exact allowance, insufficient allowance/balance, no-return/false/reverting tokens, sender/receiver taxes, pre-funded child donations, Treasury revert/reentry and activation failure. For every failed path assert balances, nonce, isPool and logs revert, and no child remains deployed. Preexisting approval persists as expected. Forced factory BNB cannot subsidize fee.

**M3 — accounting proof.** Unit and property tests at start-1/start/end-1/end/end+1; deposits before start rejected; empty intervals, donations, two/many users, tiny 0-decimal assets, 18-decimal assets, repeated small checkpoints, complete exit/reentry, maximum budget/rate/stake caps, overflow inputs and partial claims. Differential reference model with exact rational accrual and explicit global flooring. Fuzz >=10,000 parameter/action cases; invariant runner >=1,000 runs of depth >=128 with ghost sums for principal/entitlements/funding. Persist seeds/failures. Demonstrate every invariant in section 6 rather than testing only examples.

**M4 — token and reentrancy isolation.** Malicious callbacks on transferFrom/transfer/Treasury and privileged pause; fake/reverting/large-return metadata, reward blacklisting after funding, token rebase and sender-tax mocks, nonstandard returns. Verify claim failure preserves accrued rewards and principal-only withdraw still succeeds when stake token is functional. State explicitly that malicious stake tokens can prevent transfer; never falsify a liveness proof. Avoid cross-pool effects.

**M5 — emergency/refunds.** Pause creation leaves existing pools operational; pool deposit pause does not pause accrual, withdraw, claim or refund. Creator refund only after end, only idle allocation, no reward debt/dust/principal/donation recovery. Claims remain valid indefinitely after full exit and after refund. Guardian loss/compromise exercised as denial-of-service only for protected entry actions.

**M6 — artifact and independent review.** Pin compiler, dependency commits, EVM target and optimizer settings; inspect factory and child code size/creation gas on BSC fork. Full deploy/verify reproducibility including immutable parameters. Static analysis and independent security review with no unresolved critical/high issues; explicitly resolve or accept lower findings with owner and rationale before release. An unreviewed copy of Farm or legacy code cannot satisfy this gate.

**M7 — discovery/runtime.** Spoofed event emitter/child, mismatched getters/version, orphaned logs, duplicated/reordered batches, reorgs deeper than confirmation fallback, process crash at cursor commit, RPC rate limit/outage and restart/backfill all tested. >=10,000 synthetic pool events processed in bounded pages without all-pool request fanout. Newly created address must browse/stake/withdraw/claim and enter My Melega without editing static config or assigning sousId; legacy routes stay functional. Ended/refunded pools remain reachable.

**M8 — wallet/product.** Exact and zero-first approval, rejected signatures, simulation/inclusion race, changed nonce/start, wrong chain, replacement/drop/revert and successful receipt; no signer service. Desktop 1440×900/mobile 390×844 browser tests; fee/risk labels, pending confirmation and separate Withdraw/Claim are correct. Public affordance stays hidden until the independent release gate; missing price is not an APR of zero or a made-up value.

## 11. OPTIONAL LATER

New immutable clone design if measured gas justifies it; permit; transfer-tax/rebase support under separate accounting review; advanced/extendable schedules; optional stake limits; reward dust recovery with proven liabilities; richer ranking/moderation/analytics; metadata hosting; guardian rotation; other chains. No DAO, timelock, multichain registry or upgrade governance is required in V1. None of these may weaken MUST HAVE gates or add a privileged per-pool handoff.

## 12. Proposed implementation file map

Only this specification is changed now. Proposed future files, subject to repository conventions during implementation:

- New `contracts/public-pool-factory/PublicPoolFactoryV1.sol`, `PublicPoolV1.sol`, `interfaces/IPublicPoolFactoryV1.sol`, `interfaces/IPublicPoolV1.sol`, `README.md`.
- New `test/public-pool-factory/PublicPoolFactoryV1.t.sol`, `PublicPoolAccounting.t.sol`, `PublicPoolInvariant.t.sol`, `PublicPoolAdversarialTokens.t.sol`, `PublicPoolBscFork.t.sol`, and `mocks/` for adversarial token/Treasury actors.
- Later gated `script/DeployPublicPoolFactoryV1.s.sol`, verification script and `deployments/public-pool-factory/bsc-56.json`; a dedicated Foundry profile only if needed for isolation. No broad compiler change for Farm/SmartSwap.
- New `apps/web/src/config/abi/publicPoolFactoryV1.ts`, `publicPoolV1.ts`, `config/constants/publicPoolFactory.ts` and `lib/pools/publicPoolDescriptor.ts`.
- New `lib/bsc-indexer/registry/discoverPublicPoolsV1.ts` and durable event/cursor store module; integrate `discoverSmartChefOnChain.ts` / `pages/api/pools/classification.ts` additively and add `pages/api/pools/public-v1.ts` for paginated descriptors/details. Select existing deployment-compatible persistent storage in implementation; filesystem-only ephemeral serverless state is unacceptable. Prove restart/backfill before release.
- Update `state/pools/index.ts`, `hooks.ts`, `fetchPools.ts`, `fetchPoolsUser.ts`, selectors/types and `utils/contractHelpers.ts` with the separate address adapter, preserving legacy behavior. Update `PoolsStudio/poolsRuntime/usePoolsStakingRuntime.ts`, `PoolsActionHost.tsx`, wallet portfolio/card models and My Melega pool aggregation as required by the identity trace.
- New `views/PoolsStudio/hooks/useCreatePublicPool.ts`; later bind retained `components/CreatePoolCta.tsx`, `createPoolWizardState.ts`, `CreatePoolWizardPreview.tsx` and receipt/error helpers. Current hide entry points are not restored during contract-only implementation. Existing canonical fee JSON is unchanged; contract/UI parity test reads it.
- Focused unit/integration/browser tests beside affected runtime/indexer/wallet files. Do not modify SmartSwap execution, Farm LP attestation or legacy deployed artifacts.

## 13. Local and fork plan; deployment and rollback gates

Local implementation tests: isolated Foundry profile with pinned solc/dependencies, unit/fuzz/stateful invariants above, full event/error ABI snapshot and gas/size report. Local tests use mocks and no external writes. Web tests use generated descriptors, read-only RPC mocks and mocked wallets. Run existing affected pool/fee/Farm tests once to detect integration regression; distinguish baseline failures.

Fork tests: pinned BSC block/hash and RPC endpoint recorded without credentials; deploy the proposed new factory only inside an ephemeral local fork. Use funded test actors/impersonation only in that fork. Assert legacy factory code/owners are unchanged, canonical MARCO transfer semantics and exact fee path, actual Treasury behavior (including contract/delegation if present), ordinary-wallet end-to-end creation and principal/reward operations. Select and record a real reward token supported at that block. Fork state mutations never broadcast to BSC. Replay another recent pinned block before release to catch token/Treasury drift. No mainnet private key in tests.

Deployment sequence — each later step requires its preceding evidence and explicit release authorization:

1. Architect approves this spec: model, caps, authority, indefinite claims/locked dust, block schedules and token limits. Founder merges Phase A separately; no self-service UI exposure.
2. Bounded contract-only implementation with all M1–M6 tests, reproducible artifacts and independent review. Draft PR; no broadcast. Approve compiler/dependency pins and guardian address (not chosen in this mission).
3. Separate indexer/runtime/wallet implementation behind disabled public creation; prove M7–M8 locally and on isolated fork. Choose/verify durable storage, finalized-head strategy and supported-token UI. No per-pool signer.
4. Approve release manifest: chain, factory/child artifacts, exact MARCO/Treasury/guardian constants, deployment gas budget, signer and operational pause runbook. Any testnet rehearsal uses a separately declared test fixture, never relaxes production chain checks silently.
5. Only after explicit production deployment approval, deploy new factory once; verify source, constructor/bytecode and policy on BSC. Record deployment receipt/block/code hash. Deployment authority is a one-time operation, not user pool authorization.
6. Separate approved funded canary: ordinary user wallet exact approve/create/stake/withdraw/claim; fee-requiring case and MARCO-free case demonstrated, amount/exposure approved first. Confirm dynamic ingestion, no static edits, reserves, emergency controls and legacy coexistence.
7. Architect/Founder product-release gate authorizes UI exposure only after all evidence is accepted. Production frontend deployment is separately authorized. Preview builds are not production approval.

Rollback: before exposure keep creation hidden. After exposure hide the entry point and guardian-pause new creation if needed; pause affected pools' deposits directly, preserve withdrawal/claim access and display incident status. Keep indexing/position lookup running for existing users. No proxy upgrade, forced migration, fund confiscation or reversal of confirmed creation. To replace faulty logic, deploy a new reviewed version after fresh authorization and add its approved factory descriptor; retain old descriptors/read/exit adapters. Lost guardian keys do not prevent exit. Token-level freezes may require token issuer resolution; the protocol cannot promise to bypass them.

## 14. Bounded next mission and review result

Proposed next mission: `MELEGA-POOL-SELF-SERVICE-V1-CONTRACTS-AND-LOCAL-SECURITY-TESTS`.

After spec approval only, implement the two new contracts/interfaces and isolated local/fork test suite, pin dependencies, produce ABI/artifact/gas/size report and independent review evidence. No deployment, on-chain write, legacy modification, main merge, indexer production enablement or public button restoration. Draft PR only. Return proof for M1–M6 and explicit unresolved findings. If full deployments exceed safe size/gas, or arithmetic/emergency invariants cannot be proven, stop for a spec amendment; do not silently weaken them. M7–M8 and all live release gates belong to later separately approved integration/release missions.

Current blockers: none for spec review. Implementation/deployment blockers remain intentional: Architect approval; pinned compiler/dependencies (submodule unavailable here); guardian selection; proven arithmetic and gas bounds; independent security review; durable indexer storage and recovery evidence; token/Treasury fork checks; separate funded canary and release authorization. This document makes no security certification claim.

SPEC_READY_FOR_ARCHITECT_REVIEW=true
LEGACY_FACTORIES_UNCHANGED=true
PER_POOL_PRIVILEGED_SIGNATURE_REQUIRED=false (proposed architecture)
SOLIDITY_PRODUCTION_CHANGED=false
ONCHAIN_WRITE=false
DEPLOYED=false
MERGED=false

### Spec-only validation performed

`accounting-model.py` is a deterministic documentation reference model (Python standard library; run `python3 docs/pools/self-service-factory-spec/accounting-model.py`). It exercised 100,000 deposit/partial-withdraw/claim/refund transitions across 200 seeds, checking principal sums, reward allocation/payment/reserve bounds and user remainders. Result: PASS. This sanity-check does not implement token calls, factory authorization, EVM execution or reentrancy, does not prove all boundary cases and does not replace M1–M8 or independent contract review. No Solidity was compiled or deployed in this mission. Source/bytecode comparisons above were performed against the pinned audit evidence, with both metadata-adjusted equalities passing.
