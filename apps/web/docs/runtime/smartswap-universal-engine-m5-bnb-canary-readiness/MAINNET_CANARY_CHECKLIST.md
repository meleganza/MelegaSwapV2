# MAINNET_CANARY_CHECKLIST

**M5 does not execute this checklist on mainnet.**

## Preflight

- [ ] Executor deployed
- [ ] Source / bytecode verified against this mission’s hashes
- [ ] Treasury `0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b`
- [ ] Pancake V2 router allowlisted; Melega not allowlisted
- [ ] Policy `SMARTSWAP_REVENUE_POLICY_V1` / `1.0.0`
- [ ] Fee cap 25 bps
- [ ] V2 globally disabled except this explicit canary (`LEGACY_PRODUCTION` still authoritative)
- [ ] Wallet funded
- [ ] WBNB balance ≥ 0.01
- [ ] BNB for gas
- [ ] Fresh `getAmountsOut` on net input

## Execution (future authorized mission only)

- [ ] Fresh quote
- [ ] Derive 20 bps from structural 25 via policy (do not type the band)
- [ ] Seal intent (user, deadline, nonce set at broadcast)
- [ ] Approve executor if required
- [ ] Execute
- [ ] Wait receipt

## Post-state

- [ ] Swap success
- [ ] User USDT ≥ sealed min
- [ ] Treasury WBNB delta == fee
- [ ] Venue input == amount − fee
- [ ] Executor residual 0
- [ ] Nonce consumed
- [ ] Status may become `FEE_VERIFIED` **only** after that mainnet proof — not before

`broadcastNow: false`
