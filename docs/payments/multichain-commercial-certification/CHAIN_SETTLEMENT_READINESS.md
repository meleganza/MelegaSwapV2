# Chain settlement readiness (repo truth only)

Sources: `lib/marco-bridge/wave1Registry.ts`, `lib/marco-bridge/{arc,polygon,robinhood}Chain.ts`, `lib/marco-pay/walletTransfer.ts`,
`lib/marco-pay/orders.ts`, `config/dexEconomicAuthority.ts`. MARCO existing on a chain does not make it READY.

| Field | BNB | Solana | Base | Polygon | Arc | Robinhood Chain |
| --- | --- | --- | --- | --- | --- | --- |
| Chain ID | 56 | n/a (LZ EID 30168) | 8453 | 137 | 5042 | 4663 |
| Canonical MARCO | `0x963556de0eb8138E97A85F0A86eE0acD159D210b` | mint `6SWgjmuTyPAcYYU77Mzf1gE6QA7ZcZsbsfiThz2cW1VF` | `0xa2c8b941542AE0599774D1661CB7B773BC0e79C7` | `0xF31A621A0e75d90fdA320EeE52956D718Fa34615` | `0x30eb6f2878f60ba0ed6418bfe7cadcd0f475a265` | `0x803925DacEcCc32343cdac0C731dB07a1A384bFB` |
| Decimals | 18 (verified on fork: `decimals()`=18, `symbol()`=MARCO) | 9 | 18 | 18 | 18 | 18 |
| Gas token | BNB | SOL | ETH | POL | USDC | ETH |
| Supported wallet | EVM injected / wagmi; MARCO Pay handoff page | none for payments | none for payments | none for payments | none for payments | none for payments |
| Payment preparation | `buildMarcoPayWalletTransfer` (ERC-20 `transfer` to Treasury, chain 56 only) | none | none (`CHAIN_MISMATCH`) | none (`CHAIN_MISMATCH`) | none | none |
| Authorized Treasury | `0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b` (`MELEGA_TREASURY_BSC`) | none in repo | same EVM beneficiary listed in `chainIdsSupported` for DEX fees, not for MARCO Pay | same as Base | none in repo | none in repo |
| Settlement verifier | MARCO signed `payment.completed` webhook + `/api/public/pay/state` reconcile (amount, Treasury, chain 56, receipt) | none | none | none | none | none |
| Finality | delegated to MARCO Pay settlement; DEX has no confirmation count for this path | n/a | n/a | n/a | n/a | n/a |
| RPC / fallback | app wagmi BSC RPCs; MARCO Pay settlement off-chain | bridge-only | bridge-only | `polygon-bor-rpc.publicnode.com` (bridge) | `rpc.mainnet.arc.io` (bridge) | `rpc.mainnet.chain.robinhood.com` (bridge) |
| Service activation | `fulfilPaidBoostOrder` only after receipt + PAYMENT_CONFIRMED | none | none | none | none | none |
| Referral | Passport PRO via MARCO session (`referral_code`, `catalog_ref`) | none | none | none | none | none |
| **Status** | **PARTIAL** | **BLOCKED** | **BLOCKED** | **BLOCKED** | **BLOCKED** | **BLOCKED** |

BNB PARTIAL reasons: settlement verification is delegated to MARCO and was not observed end to end (no real payment allowed); submitted tx
hash is not sent to the DEX; no reconcile cron in `vercel.json`. Non-BNB BLOCKED reasons: no payment preparation, no settlement verifier,
no MARCO Pay Treasury for that chain in the repo. Bridge addresses above are bridge facts, not payment readiness.
