# Melega DEX — Wallet QA Operator Checklist

**Environment:** https://v2.melega.finance  
**Chain:** BNB Smart Chain (BSC, chainId 56)  
**Wallet:** MetaMask or WalletConnect  
**Purpose:** Sign-off funded-wallet flows before production cutover to `www.melega.finance`

---

## Prerequisites

- [ ] MetaMask installed with a funded BSC test or main wallet
- [ ] Small BNB balance for gas (~0.01 BNB minimum)
- [ ] Small MARCO or paired token balance for swap/stake tests
- [ ] Browser: Chrome or Firefox, desktop 1440px and mobile 390px spot-check

---

## 1. Connect wallet

| Step | Action | Pass |
|------|--------|------|
| 1.1 | Open `/trade` | ⬜ |
| 1.2 | Click **Connect Wallet** (visible on mobile and desktop) | ⬜ |
| 1.3 | Approve MetaMask connection | ⬜ |
| 1.4 | Wallet address shown in header/shell | ⬜ |
| 1.5 | Disconnect and reconnect — no duplicate WS errors | ⬜ |

---

## 2. Switch to BSC

| Step | Action | Pass |
|------|--------|------|
| 2.1 | If prompted, switch network to **BNB Smart Chain** | ⬜ |
| 2.2 | Chain indicator shows BSC / 56 | ⬜ |
| 2.3 | Balances load in Trade right rail **Your Assets** | ⬜ |

---

## 3. Approve token

| Step | Action | Pass |
|------|--------|------|
| 3.1 | On `/trade` SmartSwap, select input token (e.g. BNB → MARCO) | ⬜ |
| 3.2 | Enter small swap amount | ⬜ |
| 3.3 | If approval required, click **Approve** and confirm in wallet | ⬜ |
| 3.4 | Approval state updates (no infinite spinner) | ⬜ |

---

## 4. Swap small amount

| Step | Action | Pass |
|------|--------|------|
| 4.1 | Review route in SmartSwap box and right rail | ⬜ |
| 4.2 | Confirm swap in wallet | ⬜ |
| 4.3 | Tx pending toast appears | ⬜ |
| 4.4 | Tx confirms on BscScan | ⬜ |
| 4.5 | Output balance updates | ⬜ |

---

## 5. Verify receipt

| Step | Action | Pass |
|------|--------|------|
| 5.1 | Open **History** tab on `/trade` | ⬜ |
| 5.2 | Swap appears with tx hash, pair, amount, status **confirmed** | ⬜ |
| 5.3 | Tx link opens BscScan | ⬜ |
| 5.4 | No fabricated/hardcoded history rows | ⬜ |

---

## 6. Verify settlement status

| Step | Action | Pass |
|------|--------|------|
| 6.1 | Check **SETTLEMENT STATUS** in Trade right rail | ⬜ |
| 6.2 | Status shows one of: Settlement Pending, Settled, Treasury Unavailable, No settlement data | ⬜ |
| 6.3 | Tx hash and settlement id (if any) match latest swap | ⬜ |
| 6.4 | Expand machine JSON — `settlement` block present | ⬜ |

---

## 7. Add liquidity

| Step | Action | Pass |
|------|--------|------|
| 7.1 | Open `/liquidity-studio` | ⬜ |
| 7.2 | Select pair, enter amounts on **Add Liquidity** tab | ⬜ |
| 7.3 | Approve tokens if needed | ⬜ |
| 7.4 | Confirm add liquidity | ⬜ |
| 7.5 | Position appears under **My Positions** | ⬜ |

---

## 8. Remove liquidity

| Step | Action | Pass |
|------|--------|------|
| 8.1 | Switch to **Remove Liquidity** tab | ⬜ |
| 8.2 | Set remove % (e.g. 25%) | ⬜ |
| 8.3 | Confirm remove | ⬜ |
| 8.4 | LP balance decreases; tokens returned | ⬜ |

---

## 9. Stake pool

| Step | Action | Pass |
|------|--------|------|
| 9.1 | Open `/pools` | ⬜ |
| 9.2 | Click **Stake** on a live pool card | ⬜ |
| 9.3 | Enter amount and confirm | ⬜ |
| 9.4 | **Unstake** button appears when staked > 0 | ⬜ |

---

## 10. Unstake pool

| Step | Action | Pass |
|------|--------|------|
| 10.1 | Click **Unstake** on staked pool | ⬜ |
| 10.2 | Confirm unstake in modal | ⬜ |
| 10.3 | Staked balance returns to wallet | ⬜ |

---

## 11. Stake farm

| Step | Action | Pass |
|------|--------|------|
| 11.1 | Open `/farms` | ⬜ |
| 11.2 | Click **Stake** on a live farm | ⬜ |
| 11.3 | Confirm deposit | ⬜ |
| 11.4 | **Withdraw** visible when farm position > 0 | ⬜ |

---

## 12. Withdraw farm

| Step | Action | Pass |
|------|--------|------|
| 12.1 | Click **Withdraw** on staked farm | ⬜ |
| 12.2 | Confirm withdraw | ⬜ |
| 12.3 | LP/farm stake balance decreases | ⬜ |

---

## 13. Claim rewards

| Step | Action | Pass |
|------|--------|------|
| 13.1 | On `/pools` or `/farms`, wait for pending rewards > 0 (or use existing position) | ⬜ |
| 13.2 | **Claim** button visible when pending > 0 | ⬜ |
| 13.3 | Confirm claim/harvest | ⬜ |
| 13.4 | Reward token balance increases | ⬜ |

---

## Sign-off

| Field | Value |
|-------|-------|
| Operator | |
| Date | |
| Wallet address | |
| Result | ⬜ PASS / ⬜ FAIL |
| Notes | |

**FAIL criteria:** Any step crashes UI, shows Sentry Oops, silent no-op on primary CTA, or fabricated data.
