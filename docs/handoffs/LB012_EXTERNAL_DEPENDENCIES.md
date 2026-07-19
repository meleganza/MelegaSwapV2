# LB012 Handoff — Exact External Dependencies Remaining

Generated: `2026-07-19T18:10:00Z`
Companion: `deployments/liquidity-building/chain-56/production-dependency-closure.v1.json`

| Blocker | Exact external dependency | Owner boundary |
| --- | --- | --- |
| LB-G03B | Provision non-exportable secp256k1 KMS/HSM + service identity; publish Ethereum address | Infra / KERL signing |
| LB-G11 | Production DER signature over Intent → Authorizer `validateExecutionIntent` PASS | Same + MelegaSwapV2 Authorizer deploy |
| LB-G03C | Permissionless gas-funded relay (submit-only, no sign/economics) | Execution infra |
| LB-G04B | Canonical Treasury LB receiver contract on chain 56 (non-EOA, Treasury/D99 custody) | Treasury architecture |
| LB-G04C / G12 | Implement + deploy `melega.treasury.liquidity-building-settlement.v1` in `meleganza/melega-kiri-treasury-runtime` with chainId 56 | Treasury Runtime repo |
| LB-G08 | Founder ratification of WBNB (and any enabled) floors → RATIFIED in deployment inputs | Founder economic policy |
| LB-G09 | Pinned on-chain WBNB/stable conversion with reserve floors — or keep NotActive | Markets / Treasury |
| LB-G10 | Ops finality certification ≥ 15 for observer + ingestion | Infra / indexer / Treasury |

## Verified origins

| Repo | Origin | LB012 action |
| --- | --- | --- |
| MelegaSwapV2 | `https://github.com/meleganza/MelegaSwapV2.git` | Closure artifacts + docs |
| melega-kiri-treasury-runtime | `https://github.com/meleganza/melega-kiri-treasury-runtime.git` | **Not modified** — no LB routes in checkout; ingestion must land there later |

Do not implement Treasury economic authority inside MelegaSwapV2.
