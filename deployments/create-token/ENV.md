# Create Token Factory — environment documentation

## Founder-approved immutable constructor fee

| Field | Value |
|---|---|
| `creationFeeBnb` | `0.10` |
| `CT_CREATION_FEE_WEI` | `100000000000000000` |
| `creationFeeDecision` | `APPROVED` |
| `CT_FEE_RECIPIENT` | `0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b` |

## Broadcast gates (fail-closed)

```bash
export CT_FEE_FOUNDER_APPROVED=1
export CT_CREATION_FEE_WEI=100000000000000000
export CT_FEE_RECIPIENT=0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b
export CT_MAINNET_DEPLOY_AUTHORIZED=1
export BNB_MAINNET_RPC_URL=<canonical-bsc-mainnet-rpc>
export MAINNET_DEPLOYER=<deployer-private-key-uint>   # never commit
export BSCSCAN_API_KEY=<key>                          # never commit
```

## Remaining blocker after fee finalization

production deployment authority only:

- `MAINNET_DEPLOYER`
- `CT_MAINNET_DEPLOY_AUTHORIZED=1`
- `BNB_MAINNET_RPC_URL`
- `BSCSCAN_API_KEY` (for verification)

Do not invent factory addresses. Do not bind frontend until verified mainnet bytecode exists.
