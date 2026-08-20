# NEXT_M6_PREFLIGHT

M6 must be **re-authorized and re-run** against **this** deterministic artifact.

Do not reuse:

- M5 creation/deployed keccaks
- the prior M6 founder authorization from the blocked preflight
- any locally compiled `out/` artifact that is not the stored JSON

## Required future checks

1. `yarn smartswap:executor:verify-artifact` exits 0.
2. Deploy tx data matches stored creation bytecode plus chosen constructor args.
3. `eth_getCode` matches expected runtime after immutable substitution.
4. Treasury, Pancake router allowlist, fee cap 25, unpaused, chain 56.
5. Canary still Pancake V2 WBNB→USDT 0.01 WBNB; derive structural bps then policy fee (25 → 20 if still 25).
6. Signer from `0xB6eEb3ab9695979F5b2Ef6Df4112e63212E33EE0`.
7. Balances still cover 0.01 WBNB + gas.

Until that future mission: **HARD STOP**. No deploy, no FEE_VERIFIED, no V2 activation.
