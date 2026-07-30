# Go-Live Validation Sequence (Post-Deployment)

Run **after** factual LB then CT deployment, verification, and binding.  
Do not use this sequence to claim LIVE while addresses are null.

Canonical Treasury: `0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b`

---

## 0. Contract bindings & fee routing (gate)

1. Registry + frontend SSOT addresses match; chainId 56
2. `eth_getCode` non-empty for every bound LB core address + CT factory
3. LB `successFeeBps() == 1000`
4. CT `creationFee() == 100000000000000000` and `feeRecipient() ==` Treasury
5. No Treasury Runtime dependency in fee path
6. `/api/liquidity-building/readiness` READY; `/api/create-token/readiness` READY

---

## 1. Surface matrix

| # | Surface | Validation |
|---|---|---|
| 1 | Home | Loads; market widgets not blank-error; Featured cards render from certified pipeline |
| 2 | Trending | Rankings load; no fabricated pairs |
| 3 | Featured | 99 USD / 7d offer; payments destination = Treasury; cashback copy intact |
| 4 | Liquidity | Add/remove liquidity studio operable; AMM factory/router unchanged |
| 5 | Liquidity Builder | Bound addresses shown; activation path honest; fee disclosure 10% |
| 6 | Pools | Lists/runtime economics intact; no LB/CT regression |
| 7 | Farms | Lists/stake UI intact |
| 8 | List | Studio loads; Create Token section reflects bound factory + 0.10 BNB |
| 9 | Create Token | Execution path READY on chain 56 with fee balance; review facts correct |
| 10 | Passport | Loads; no address fabrication |
| 11 | Project Page | Loads; Featured promo disclosure unchanged |
| 12 | Swap | Quote/swap path intact |
| 13 | Smart Swap | Smart router path intact; gas-fee governance schedule unchanged |

---

## 2. API health

- [ ] `/api/market-data/snapshot` returns certified schema / healthy payload
- [ ] `/api/liquidity-building/health` + `/readiness` + `/activation-status`
- [ ] `/api/create-token/readiness`
- [ ] No 5xx on cold load of Home / Trade / Liquidity

## 3. Market snapshot

- [ ] Snapshot consumers (Home / Liquidity / Featured) share canonical BNB/USD path
- [ ] 24H volume methodology untouched

## 4. Treasury destination & fee routing

- [ ] Featured checkout quotes → Treasury wallet
- [ ] CT createToken fee forward → Treasury (exact wei)
- [ ] LB fee sink → FeeReceiver beneficiary (approved Treasury path)
- [ ] Confirm Treasury Runtime not invoked

## 5. Sign-off

Record: timestamp, operator, commit SHA, LB addresses, CT factory, explorer links, readiness JSON excerpts.  
Only then mark operations dashboard LIVE for each system independently.
