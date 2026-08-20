# ATOMICITY_PROOF

Proven on BNB mainnet fork via `SmartSwapExecutorV1BnbForkTest`. Post-state, not events alone.

## SUCCESS

Fee collected **and** swap succeeded **and** user USDT ≥ min. Executor residual 0.

## FAILURE (Treasury unchanged; no swap)

| case | result |
|------|--------|
| Venue swap reverts (`minUserOut = type(uint256).max`) | Treasury WBNB unchanged; user WBNB unchanged; executor empty |
| Minimum output fails | same (Pancake revert) |
| Invalid intent (`version = 2`) | `WrongPolicy`; Treasury unchanged |
| Wrong beneficiary | `WrongBeneficiary` |
| Wrong router (Melega) | `WrongRouter` |
| Expired intent | `Expired` |
| Replay | second `execute` → `Replay` |
| Wrong chain (`chainId = 1`) | `WrongChain` |
| Wrong signer | `WrongSigner` |

Atomicity is the Solidity revert of the whole `execute` call. Fee is transferred inside the same transaction as the venue swap; a later revert rolls both back.
