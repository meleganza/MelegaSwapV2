# MARCO Wave-1 Bridge — isolated release record

## Scope

This release adds the reusable MARCO Bridge product surface and its canonical,
fail-closed Wave-1 domain layer. It does not activate public bridge execution,
unpause Solana, provision liquidity, or submit listings.

The same `SmartSwapBridgeTabs` and `MarcoBridgeWorkspace` components are reused
by Home, Trade, the MARCO Project Page, and the standalone `/bridge` route.

## Canonical mainnet binding

| Network         | Chain ID | LayerZero EID | Consumer token / mint                          | Protocol identity                                        | Local decimals |
| --------------- | -------: | ------------: | ---------------------------------------------- | -------------------------------------------------------- | -------------: |
| BNB Smart Chain |       56 |         30102 | `0x963556de0eb8138E97A85F0A86eE0acD159D210b`   | Adapter `0xC92B49ddF9312cbfc01Ad397963dF915C7a2399E`     |             18 |
| Base            |     8453 |         30184 | `0xa2c8b941542AE0599774D1661CB7B773BC0e79C7`   | Same canonical OFT                                       |             18 |
| Solana          |      n/a |         30168 | `6SWgjmuTyPAcYYU77Mzf1gE6QA7ZcZsbsfiThz2cW1VF` | OFT Store `7L8x99W1yVVgtsu3wWy9DgD9ysnnfF4XXhdKhUrQxEuW` |              9 |
| Robinhood Chain |     4663 |         30416 | `0x803925DacEcCc32343cdac0C731dB07a1A384bFB`   | Same canonical OFT                                       |             18 |

`wave1Registry.ts` is the sole frontend source for this protocol truth.
LayerZero shared decimals are 6. Amount conversion removes sub-shared-decimal
dust and never increases the destination amount.

## Certified route matrix

Only these direct routes exist:

- BNB ↔ Base
- BNB ↔ Solana
- BNB ↔ Robinhood Chain

Spoke-to-spoke selection is not represented as a direct or atomic route. It
requires two independent, user-confirmed journeys through BNB, and the first
delivery must complete before the second journey begins.

## Execution state

The product is intentionally deployed-capable but execution-disabled:

- `MARCO_BRIDGE_PUBLIC_ACTIVATION_AUTHORIZED` is `false`.
- Every network has `publiclyActive: false` and `executionEnabled: false`.
- Every route has `publiclyActive: false` and `executionEnabled: false`.
- Solana additionally has `protectivePaused: true`.
- Quote and submit both call the public-execution guard before transport.
- The default service has no quote/send transport and no public tracker.

These are independent, cumulative controls. Changing only one cannot enable a
transaction.

## Transaction binding

EVM quote and send calls target the source network's canonical adapter/OFT.
Only the BNB route needs ERC-20 approval, from the BNB consumer token to the
canonical BNB adapter. Base and Robinhood are native OFTs and do not request a
separate token approval.

Solana currently produces a typed instruction plan bound to the canonical OFT
Store; it deliberately does not claim to serialize an executable instruction.

Every review requires a fresh quote. Quotes older than 30 seconds, quote
failure, wrong source chain or wallet family, invalid destination, insufficient
MARCO, and insufficient native gas fail closed.

## Delivery model

The source receipt must yield one LayerZero GUID. Tracking advances that same
GUID through:

1. Transaction submitted
2. Source confirmed
3. Cross-chain verification
4. Destination execution
5. MARCO delivered

Pending destination delivery never tells the user to resend. A tracker response
with a different GUID or a regressing state is rejected/ignored respectively.

## Promotion blockers

Production promotion and UX certification remain blocked until all of the
following canonical dependencies are supplied and independently validated:

1. Solana executable OFT program ID, compatible SDK/IDL, required account
   derivation, and quote/send instruction serialization. The mint and OFT Store
   alone are not sufficient to sign safely.
2. Robinhood Chain canonical public RPC URL, explorer URLs, native gas symbol,
   and an audited wagmi chain definition for chain ID 4663.
3. A production EVM/Solana bridge transport that extracts the actual GUID from
   confirmed source receipts.
4. A production delivery-status endpoint bound to the same GUID and returning
   source and destination transaction hashes.
5. Browser and mobile wallet certification for EVM→EVM, EVM→Solana, and
   Solana→EVM using the real Melega DEX surface.

## Minimal public-activation procedure (future gated mission)

After product and protocol certification, perform these actions in a dedicated
activation release, never as part of this product release:

1. Verify all four canonical identities, peers, enforced options, DVN/ULN
   configuration, ownership, and pause state directly from mainnet.
2. Register and test the certified Robinhood chain metadata in Melega DEX.
3. Bind the audited EVM/Solana quote, approval, send, and GUID-tracking
   transports.
4. Run read-only quote/preflight tests, staging UX tests, and one explicitly
   approved canary per direct route.
5. Unpause Solana only under its separate, explicit on-chain approval.
6. Set only certified network and route `publiclyActive`/`executionEnabled`
   flags to true.
7. Change the global founder-controlled activation gate to true in a reviewed,
   committed release and re-run the full build/test/canary suite.

No liquidity or listing work belongs to the activation transaction itself.

## Release validation

- Canonical registry, route policy, decimals, wallet-family validation,
  transaction binding, preflight failures, fresh quotes, same-GUID delivery,
  shared product reuse, and mobile layout are covered by 19 passing Wave-1
  tests.
- The production Next build completes and includes the `/bridge` route.
- A targeted Home/Trade/Project regression run reports 35 passing tests and
  three pre-existing checkout failures that are outside this isolated diff:
  the certified Smart Swap base commit `94d4979a` is not an ancestor of the
  selected release base, `recovery-state.json` is absent, and the existing
  `SwapExperienceSelector` does not satisfy its 44px CSS evidence assertion.
  None of those files is changed by this release.
- A standalone repository-wide TypeScript pass was stopped after two minutes
  without diagnostics; the project disables that gate in its Next
  configuration. The production build is therefore the authoritative compile
  gate for this isolated release.
- The repository's generated package-bin links still reference an obsolete
  recovery worktree, so validation uses the package entry points from the
  current root install. This checkout issue does not alter application code.
- Repository-wide ESLint currently cannot resolve the pre-existing
  `next/babel` extension. The production build reports that warning but
  completes successfully.
