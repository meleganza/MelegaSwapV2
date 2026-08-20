# FINAL_REPORT

SMARTSWAP_M6_PREFLIGHT_BLOCKED_BYTECODE_REPRODUCTION

M6 Founder broadcast authorization was **not reused**. No deploy, wrap, approve, swap, or mainnet signature.

| field | value |
|-------|--------|
| Branch | `mission-smartswap-m6-preflight-recovery` |
| Baseline | `c5330b301489ad30e782f089ed0b9833b7159820` |
| Source hash SHA-256 | `5ecdeb832ad0990a1ed7a6a024b8a60bbf1b683afc2738adceadefa5150b8cee` |
| Source git blob | `7869980ca19ce62bebc99e17670c99cc7e637172` |
| M5 source match | **yes** |
| Compiler | 0.8.20+commit.a1b79de6 |
| Forge | 1.7.1 |
| Build profile | default |
| Creation bytecode hash (session A) | `0xd0534f444328674466c9bc6c1b72cb2ebd26d870f564c0cb8b85bc8566cb74c9` |
| M5 expected creation | `0x044040c2af494c8d1e34f1de7e3dd3071ae9cdf39df0fdfec908b9d4d261510c` |
| Deployed bytecode hash (session A) | `0x49a9a3b7ff50e96b7bdd29687bafd40c05edb9e6b42b145407d025afa020cd5f` |
| M5 expected deployed | `0x0f0b418f1b3f1a7a0897864c271eacedd6ebeb4bf226fcfc3c23aa2153b74fa3` |
| Bytecode exact match | **no** (ipfs metadata; compile-unit drift) |
| Canonical deployer | `0xB6eEb3ab9695979F5b2Ef6Df4112e63212E33EE0` |
| Signer method | founder-held unsigned-tx signing (package not built) |
| Current BNB | `18462459335635472` |
| Current WBNB | `15000000000000000` (0.015; canary 0.01 covered) |
| Required BNB | ~0.01 recommended gas reserve |
| Required WBNB | 0.01 |
| Structural route cost | 25 bps |
| Fee band | 20 bps |
| Expected fee | `20000000000000` WBNB |
| Treasury | `0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b` |
| Unsigned deployment package | not prepared |
| UX_DIFF | ZERO |
| Tests | M1–M6 + recovery 98 passed; Foundry SmartSwapExecutorV1Test 4 passed |
| Build | `next build` passed |
| Evidence | `apps/web/docs/runtime/smartswap-m6-preflight-recovery/` |

A later mission may recertify a **new** pinned artifact (`bytecode_hash` none / locked compiler input). That is not this mission.

HARD STOP. NO DEPLOY. NO APPROVAL. NO WRAP. NO SWAP. NO MAINNET BROADCAST.
