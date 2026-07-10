# R747 — Smart Router Testnet Canonical Publication

**Date:** 2026-07-09  
**Verdict:** `SMART_ROUTER_TESTNET_CANONICAL`  
**Chain:** BNB Testnet (97) only — **Mainnet (56) not activated**

---

## Architecture

Melega Smart Router Wrapper V2 is the constitutional economic entrypoint for exact-input swaps on BNB Testnet. It sits between the user and the underlying Pancake V2 router:

```
User (tBNB or ERC20)
  → MelegaSmartRouterWrapper (0x9D2451…)
      → protocol fee → WBNB ERC20 → Treasury Intake
      → net amount → Pancake V2 Router (0xD99D1c…)
  → recipient
```

**Native-input path (V2 fix):** protocol fee is wrapped to WBNB inside the wrapper and transferred to Treasury Intake as ERC20. Plain ETH `call` from the wrapper contract is not used (Treasury Intake rejects contract-origin native transfers).

**ERC20 path (unchanged):** fee deducted from `amountIn` via `safeTransfer` to Treasury Intake before underlying router delegation.

Treasury Runtime owns FSC-01 settlement post-confirmation. The wrapper emits `TreasuryHandoffPrepared` metadata only — it does not execute waterfall splits locally.

---

## Canonical publication

| Artifact | Path |
|---|---|
| Smart Router Registry | `apps/web/public/registry/smart-router/index.json` |
| Civilization Router Contract | `apps/web/public/registry/smart-router/civilization-router-contract.json` |
| Validation Certificate | `apps/web/public/registry/smart-router/testnet-validation-certificate.json` |

**Registry version:** `0.4.0`  
**Wrapper version:** `2`  
**Civilization status:** `ACTIVE_TESTNET`

---

## Wrapper deployment

| Field | Value |
|---|---|
| Address | [`0x9D2451b30102B098570bfCeae0E8b8C9Fd2bb2Db`](https://testnet.bscscan.com/address/0x9D2451b30102B098570bfCeae0E8b8C9Fd2bb2Db) |
| Deploy tx | [`0xef5be1c2…2d009ef`](https://testnet.bscscan.com/tx/0xef5be1c2324a0b68853f15a8d1c729c2bffae2c82372fe9a3c4f9b95f2d009ef) |
| Block | `118153243` |
| Timestamp | `2026-07-09T16:17:17.000Z` |
| Bytecode hash | `0x38b51c47d376400b04c3af1c7425d4af830dc71aec9a7faee23e80e51213d610` |

**Immutables (on-chain verified):**

- Underlying router: `0xD99D1c33F9fC3444f8101754aBC46c52416550D1`
- Treasury Intake: `0xe674b1d925d79f5A0053e40cC7cdED7841AD4164`
- MARCO: `0x963556de0eb8138E97A85F0A86eE0acD159D210b`
- Pricing ref: `D87_DEX_PRICING_RATIFIED`
- Treasury ref: `FSC-01`

Supersedes V1 wrapper `0xe29b30099f7E5B7205151f9893e6829dbC964002` (native fee path defect).

---

## Validation evidence (3/3 PASS)

### BUY_MARCO — 20 bps

- Tx: [`0x8a19f2eb…22ec1`](https://testnet.bscscan.com/tx/0x8a19f2eb24793dad439cb9779bc1586579fa411bc004dee8302ce37757e22ec1)
- Method: `swapExactETHForTokens`
- Gross: `0.01 tBNB` → fee `20_000_000_000_000` wei WBNB (20 bps)
- `buyMarcoIncentiveApplied`: `true`

### SELL_MARCO — 30 bps

- Tx: [`0x5602377a…61486`](https://testnet.bscscan.com/tx/0x5602377a4f9eed55a047ef215e3e2b437b5df4e919ac9a3bd04b5a1d4a961486)
- Method: `swapExactTokensForTokens`
- Gross: `100 MARCO` → fee `300000000000000000` MARCO (30 bps)

### STANDARD_SWAP — 30 bps

- Tx: [`0x80969383…138ec`](https://testnet.bscscan.com/tx/0x80969383a47713d6e0dd115b8382f6a0531b7a0575b8ae1d6ef942fdb2b138ec)
- Method: `swapExactETHForTokens`
- Gross: `0.01 tBNB` → fee `30_000_000_000_000` wei WBNB (30 bps)

### Events verified (all three routes)

Each successful swap receipt includes wrapper logs for:

1. **ProtocolFeeCollected** — fee bps, gross/net, treasury collector, policy hashes
2. **SmartRouterSwapRouted** — net routed amount and output
3. **TreasuryHandoffPrepared** — execution handoff metadata for Treasury Runtime reconciliation

### Treasury Intake

Native-route fees arrive as **WBNB ERC20**. SELL-route fees arrive as **MARCO ERC20**. Treasury balance deltas matched `ProtocolFeeCollected.feeAmount` during founder validation ceremony.

### Execution manifest

On-chain: `TreasuryHandoffPrepared` verified per swap. Off-chain DEX execution manifest generation remains adapter/wrapper-event-driven; Treasury Runtime intake is separate from DEX settlement ownership.

---

## Lessons learned

1. **Treasury Intake accepts ERC20 from contracts but rejects plain ETH from contract senders.** Native wrapper fees must use WBNB deposit + ERC20 transfer, not `treasury.call{value}`.
2. **Registry and machine contract must track testnet wrapper independently from mainnet.** Chain 56 remains `partial` / wrapper null; chain 97 is `active_testnet`.
3. **Constitutional validation requires real founder-signed txs**, not shell simulation — three routes with distinct fee tiers prove both native and ERC20 paths.

---

## Known limitations (testnet)

- Exact-output swaps not certified (hard revert in v1)
- Fee-on-transfer tokens blocked
- Narrative trade, AI service, marketplace routes remain blocked (no executable wrapper routes)
- Production UI may still route through ADAPTER on some surfaces until explicitly wired to wrapper registry address
- V1 wrapper address must not be used — superseded

---

## Mainnet blockers (chain 56 — unchanged)

| Blocker | Status |
|---|---|
| Wrapper not deployed on BNB Chain mainnet | BLOCKED |
| Treasury collector null for chain 56 in registry | BLOCKED |
| External security audit / ceremony for mainnet | Not started |
| Mainnet liquidity + registry publication gate | Not started |

**Do not claim canonical mainnet routing until chain 56 wrapper deploy + validation completes.**

---

## Files changed (R747)

| File | Action |
|---|---|
| `apps/web/public/registry/smart-router/index.json` | Chain 97 → active_testnet, wrapper V2, validation passed |
| `apps/web/public/registry/smart-router/civilization-router-contract.json` | Chain 97 machine contract + testnetPublication |
| `apps/web/public/registry/smart-router/testnet-validation-certificate.json` | **Created** |
| `apps/web/src/lib/melega-smart-router/registry/smartRouterRegistry.ts` | Read top-level `wrapperAddress` |
| `apps/web/src/lib/melega-smart-router/civilization-router/route-matrix.ts` | Testnet readiness reflects V2 |
| `apps/web/src/lib/melega-smart-router/civilization-router/chain-registry.ts` | active_testnet when wrapper present |

---

## Final verdict

**`SMART_ROUTER_TESTNET_CANONICAL`**

BNB Testnet Smart Router Wrapper V2 is published as the canonical economic entrypoint for `STANDARD_SWAP`, `BUY_MARCO`, and `SELL_MARCO`. Mainnet remains blocked.
