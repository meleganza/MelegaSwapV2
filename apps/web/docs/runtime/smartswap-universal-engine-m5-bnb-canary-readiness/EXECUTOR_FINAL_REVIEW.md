# EXECUTOR_FINAL_REVIEW

Internal review of `contracts/smartswap/SmartSwapExecutorV1.sol`. **Not a third-party audit. Not deployed.**

## Compiler / artifact

| | |
|--|--|
| solc | 0.8.20 |
| optimizer | true, 200 runs, via_ir |
| Creation bytecode keccak256 | `0x044040c2af494c8d1e34f1de7e3dd3071ae9cdf39df0fdfec908b9d4d261510c` |
| Creation bytecode sha256 | `487002f09f61418310fed745ea9d24fcb936333010118a7aaf68e646419a449c` |
| Deployed bytecode keccak256 | `0x0f0b418f1b3f1a7a0897864c271eacedd6ebeb4bf226fcfc3c23aa2153b74fa3` |
| Deployed bytecode sha256 | `88a7c3bdec89153740034d48477763fc48f013f34222bb7ba71f8501fd6fb99e` |

`out/` is generated. Do not treat it as source.

## Constructor / config

`(treasury, intentSigner, wrappedNative, owner)`  
Treasury and wrapped native are immutable. M5 dry-run and fork bind treasury `0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b` and WBNB. Intent signer and owner are deploy-time keys — **not founder-signed in M5**.

## Controls reviewed

| area | behavior |
|------|----------|
| Treasury | immutable; `intent.beneficiary` must match |
| Venue allowlist | `allowedVenue[router] == venueId`; Melega not allowlisted on the canary deploy |
| Fee bounds | max 25; 0 reverts `FeeBypass`; `feeBps == authorizedFeeBps(structural)` |
| Quote intent | full-field hash; ECDSA `intentSigner` |
| Nonce | `usedNonce[user][nonce]` set after validate, before external calls |
| Deadline | `block.timestamp > deadline` → `Expired` |
| Chain | `intent.chainId == block.chainid` |
| Route | `routeHash(path, nativeIn, nativeOut)` |
| Recipient | router `to` is `intent.user` |
| Minimum output | post-SmartSwap user output; venue `amountOutMin` |
| Native | wrap fee to WBNB then Treasury; swap net as ETH; excess `msg.value` refunded to user |
| ERC20 | `transferFrom` full; Treasury fee; `forceApprove` net then 0 |
| Reentrancy | `nonReentrant`; nonce consumed first |
| Pause | owner `pause`/`unpause` |
| Events | `SmartSwapExecuted`, `RouterAllowlisted` |

No arbitrary `call`. No Permit2. No CREATE2 in this mission.
