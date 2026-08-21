# SEALED_INTENT

Not sealed.

Intent signer is frozen as the canonical deployer `0xB6eEb3ab9695979F5b2Ef6Df4112e63212E33EE0` (constructor `intentSigner_`). User for the canary is the same address (holds the 0.015 WBNB).

Seal only after:

1. CREATE mined
2. On-chain runtime equals `m6-expected-onchain-runtime.hex`
3. `setRouter` confirmed
4. Fresh quote, deadline, unused nonce

No automatic retry. Do not mutate a sealed intent.
