# UNSIGNED_DEPLOYMENT_PACKAGE

**Not prepared.**

Part 10 requires exact M5 bytecode reproduction before an unsigned deploy package. Reproduction failed.

No `data` payload is published for a drifted compile. No predicted CREATE address is certified.

Address model if a later recertified artifact is deployed with `CREATE` from `0xB6eEb3ab9695979F5b2Ef6Df4112e63212E33EE0`: `address = keccak256(rlp([deployer, nonce]))[12:]`. At observation, nonce was `3193` (would yield `0x8A591dbA8532f71Ba3A503BC42F1CFbDF2e645F4` **only for a tx at that nonce**; nonce is not frozen; not an executor).
