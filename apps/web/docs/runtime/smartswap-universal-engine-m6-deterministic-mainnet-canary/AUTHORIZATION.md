# AUTHORIZATION

Status: **absent**

Verdict: `MELEGASWAP_V2_SMARTSWAP_M6_AWAITING_FOUNDER_REAUTHORIZATION`

No mainnet deploy, sign, approve, wrap, or swap.

## Why the prior grant cannot be reused

On 20 Aug 2026 the Founder sent `FOUNDER MAINNET AUTHORIZATION — M6` with `I explicitly authorize execution of MELEGASWAP_V2_SMARTSWAP_UNIVERSAL_ENGINE_M6_BNB_MAINNET_CANARY` against the **M5-certified** creation/runtime hashes.

Those hashes are now `SUPERSEDED_UNREPRODUCIBLE_ARTIFACT`. Recovery and recertification forbade reusing that grant for broadcast.

This chat message is a **procedure** for a reauthorized canary. It names the deterministic artifact and the allowed scope, but it does **not** contain a fresh explicit Founder sentence of the form:

`I explicitly authorize execution of …`  
naming creation keccak `0xaa68423fc2a7e4fb80b54516bed42dccda8978ff4a5dd1d24180c5add2ad0791`  
and runtime keccak `0x22b936d04dda69aa1fc31e031793ce922a18013fa9c2f0587043a627e75da0e1`.

The original M6 wait-state used the same rule: a mission text that is `NOT YET AUTHORIZED` or that only *describes* required authorization is not itself the grant.

## Required grant (not yet received)

The Founder grant must explicitly permit only:

1. Deploy the deterministic `SmartSwapExecutorV1` identified by those two keccaks  
2. BNB Smart Chain mainnet only  
3. Treasury `0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b` only  
4. PancakeSwap V2 canary only  
5. WBNB → USDT only  
6. Maximum input 0.01 WBNB  
7. Required ERC-20 approval only if necessary  
8. Exactly one SmartSwap V2 canary  
9. No automatic retry  

Until that grant is in this mission context: **HARD STOP.**
