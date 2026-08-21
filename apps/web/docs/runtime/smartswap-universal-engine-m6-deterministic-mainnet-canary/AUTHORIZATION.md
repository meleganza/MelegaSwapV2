# AUTHORIZATION

Status: **present**

Grant: `FOUNDER REAUTHORIZATION — SMARTSWAP M6 DETERMINISTIC MAINNET CANARY`

The Founder sent `I explicitly authorize continuation and execution of MELEGASWAP_V2_SMARTSWAP_UNIVERSAL_ENGINE_M6_BNB_MAINNET_CANARY` against evidence commit `33fe0062401d813e601054732d1a0ab3c0b78f81` on branch `mission-smartswap-universal-engine-m6-deterministic-mainnet-canary`.

Named artifact (matches the recertified lock):

| | |
|--|--|
| Creation keccak | `0xaa68423fc2a7e4fb80b54516bed42dccda8978ff4a5dd1d24180c5add2ad0791` |
| Runtime template keccak | `0x22b936d04dda69aa1fc31e031793ce922a18013fa9c2f0587043a627e75da0e1` |

Authorized only:

1. BNB Smart Chain mainnet deploy of that exact artifact
2. Treasury `0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b`
3. Deployer/signer `0xB6eEb3ab9695979F5b2Ef6Df4112e63212E33EE0`
4. PancakeSwap V2 only
5. WBNB → USDT only
6. Maximum input 0.01 WBNB
7. Re-derive SmartSwap fee from a fresh factual quote via `SMARTSWAP_REVENUE_POLICY_V1`
8. Minimum ERC-20 approval for this canary only, if necessary
9. Exactly one SmartSwap V2 canary
10. No automatic retry

Prior 20 Aug 2026 grant against superseded M5 hashes is **not reused**.

This grant does **not** authorize production cutover, UX change, merge to main, a second canary, or any other venue/pair/chain.

Broadcast from this agent: **none**. The agent cannot sign as the canonical deployer. See `deployments/mainnet/m6-unsigned-create-tx.json`.
