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

Local Anvil fork sends used test accounts, or a localhost impersonation of the future owner address with no key, only to measure gas and rehearse. Those transactions died with the local Anvil process.

Every transaction object in `bsc.json` and `ethereum.json` has `status: NOT_EXECUTED`, `signed: false`, and `rawTransaction: null`.

`executorAddress` is `NON_DEPLOYED / UNKNOWN` because deployment would be a normal CREATE and the deployer nonce is not fixed.

Founder gates, undecided:

- `DEPLOY_BSC = READY_FOR_FOUNDER_APPROVAL`
- `DEPLOY_ETH = READY_FOR_FOUNDER_APPROVAL`

This package does not approve either gate.
