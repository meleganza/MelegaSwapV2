# SIGNER_READINESS

Do not export or decrypt private keys.

## Intended deployer

`0xB6eEb3ab9695979F5b2Ef6Df4112e63212E33EE0` (prior Melega mainnet deploys).

## What is available

| method | status |
|--------|--------|
| `MAINNET_DEPLOYER` env | unset |
| root `.env` | missing |
| Foundry keystore `melega-team` / `melega-canary-seller` | encrypted v3; empty password fails; addresses not bound in plaintext |
| Hardware wallet in-repo | none |
| Cursor/Work unsigned package | **preferred**, but not produced this mission because M5 bytecode was not reproduced |

## Preferred model (later recertification)

Cursor prepares the exact unsigned transaction (`chainId`, `from` = canonical deployer, `data`, gas). Founder signs/broadcasts from `0xB6eEb3ab9695979F5b2Ef6Df4112e63212E33EE0`. No plaintext key in the agent environment.

This recovery does **not** return `SMARTSWAP_M6_PREFLIGHT_BLOCKED_SIGNER` as the primary verdict: the signer path can exist as founder-held signing of an unsigned package. The blocking issue is bytecode reproduction.
