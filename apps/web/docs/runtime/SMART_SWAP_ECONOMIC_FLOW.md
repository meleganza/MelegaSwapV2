# Smart Swap — Economic Flow

Architecture 000 lock. Documents **current authority** only. Does not modify economics.

## End-to-end flow

```
Swap volume (user trade)
        ↓
LP / AMM fee (on-chain pair economics)
        ↓
Protocol fee (D87 policy — 30 bps standard / 20 bps buy-MARCO)
        ↓
Fee collection (ADAPTER: metadata + handoff prep; WRAPPER target: on-chain collector)
        ↓
Treasury Runtime intake (settlement truth)
        ↓
FSC-01 fee split (Treasury Runtime only)
        ↓
KERL / civilization attribution (policy + accounting references)
        ↓
Civilization accounting (Treasury / KERL systems — not DEX)
```

## Step authorities

| Step | Authority | Data source | Contract / runtime | Evidence |
| --- | --- | --- | --- | --- |
| Swap volume | User wallet + Router execution | Tx receipt / trade amounts | Smart Router / V2 Router | Confirmed tx hash |
| LP fee | On-chain pair math | Pair reserves + `BASE_FEE` (25 bps) | AMM pair | Trade math / pair fee |
| Protocol fee policy | D87 ratified codex | `D87_DEX_PRICING_RATIFIED` | `lib/d87-pricing/codex/ratified.ts` | 30 / 20 bps rules |
| Protocol fee compute (DEX) | Melega Smart Router adapter | Trade + MARCO registry | `protocolFee.ts`, `prepareMelegaSmartRouterSwap` | Execution manifest metadata |
| Protocol fee settle (target) | Wrapper contract | On-chain transfer to collector | MelegaSmartRouterWrapper (target) | Wrapper events |
| Fee split | Treasury Runtime | FSC-01 | External Runtime | Settlement records |
| Referral slice | SRD-01 / Referral Runtime | FSC-01 10% | Treasury / Referral Runtime | Not DEX-local |
| KERL attribution | KERL / civilization layer | Registry + handoff refs | `lib/kerl-constitutional`, civilization-router | Testnet enforcement matrix |
| Civilization accounting | Treasury / KERL systems | Settlement IDs | Off-DEX | Runtime docs |

## Fee split (FSC-01) — Treasury Runtime ownership

| Destination | Percent |
| --- | --- |
| treasury_melega | 52.5 |
| civilization_treasury | 22.5 |
| buyback_and_burn | 10 |
| referral_distribution (SRD-01) | 10 |
| strategic_allocation | 5 |

DEX policy: **`forward_protocol_fee_only`**. DEX must never compute or send waterfall amounts.

## LP fee isolation

LP fees remain for liquidity providers (`lpFee.policy: 'unaffected'`). LP fees **never** enter FSC-01.

## MARCO incentive rule

| Condition | Protocol fee |
| --- | --- |
| Output token is MARCO (buy MARCO) | 20 bps |
| Otherwise (incl. sell MARCO) | 30 bps |

Detection authority: MARCO registry (`marcoRegistry` / KERL registry metadata) — not symbol-only identity.

## Receipt / handoff

| Actor | Responsibility |
| --- | --- |
| DEX | Verified execution receipt + settlement reference storage |
| DEX | Must not invent `settlement_id` or split amounts |
| Treasury Runtime | Settlement normalization and economic truth |

## What is not economic truth on DEX

- UI “savings” without reserve-backed trade math  
- Hardcoded rankings presented as fee outcomes  
- Local referral payouts  
- Buyback amount computation in the web app  
