# NOT EXECUTED

This directory is a Founder decision package for the existing `SmartSwapExecutorV2`.

Nothing in this package was broadcast.

Not done:

- public deployment
- `eth_sendTransaction` / `eth_sendRawTransaction` on BSC or Ethereum
- wallet popup or Founder signature
- token approval, payment, or ownership transaction on a public chain
- `setRouter` on a public chain
- contract verification submission to BscScan or Etherscan
- production executor configuration
- V2 enablement, canary activation, or cutover

Local Anvil fork sends used test accounts, or a localhost impersonation of the future owner address with no key, only to measure gas, rehearse, or cross-check runtime bytes. Those transactions died with the local Anvil process. Local executor addresses are disposable and must not be written as future public executor addresses.

Every transaction object in `bsc.json` and `ethereum.json` has `status: NOT_EXECUTED`, `signed: false`, and `rawTransaction: null`.

`executorAddress` is `NON_DEPLOYED / UNKNOWN` because deployment would be a normal CREATE and the deployer nonce is not fixed.

## Stopped BSC attempt reconciliation

A prior Founder-authorized BSC deploy attempt (`DEPLOY_BSC = APPROVE`) stopped safely before signature.

| Field | Value |
| --- | --- |
| PUBLIC_DEPLOY_TX | NONE |
| FOUNDER_SIGNATURE | NONE |
| SETROUTER_TX | NONE |
| RUNTIME_CONFIG | NOT_CONFIGURED |
| CANARY | NOT_STARTED |
| CUTOVER | FALSE |
| Ethereum | NOT AUTHORIZED / untouched |

Fresh read-only observation at gate-correction time: Founder BSC nonce latest=pending=`3280`, balance ≈ `0.016460216118043106` BNB. Nonce was not consumed. No public CREATE exists from that stopped run.

## Founder gates

- `DEPLOY_BSC` was previously approved, but no public tx was sent. Re-approval is an Architect/Founder decision after this gate correction.
- `DEPLOY_ETH = NOT_AUTHORIZED`

This package does not broadcast.
