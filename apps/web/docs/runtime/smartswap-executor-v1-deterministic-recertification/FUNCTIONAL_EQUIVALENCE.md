# FUNCTIONAL_EQUIVALENCE

`SmartSwapExecutorV1.sol` is the M4/M5 git blob. No source edit.

## Unit suite (`SmartSwapExecutorV1Test`)

Default profile and `smartswap_executor_release` profile: 4/4 pass.

- exact-in 20 bps fee + atomic venue revert / treasury rollback
- fee bypass (`feeBps=0`) rejection
- wrong beneficiary covered in the same revert test
- replay rejection
- wrong chain rejection
- native-in excess refund; no trapped WBNB

## Original BNB fork suite (`SmartSwapExecutorV1BnbForkTest`)

8/8 pass (source-compiled executor on fork). Includes min received, venue failure rollback, wrong router, expired intent, replay, wrong chain, wrong signer, pause leaving legacy Pancake path intact, approval then execute, Treasury exact delta, no trapped funds.

## Artifact-deployed fork suite (`SmartSwapExecutorV1DeterministicArtifactTest`)

Deploys **stored creation bytecode** (not `new SmartSwapExecutorV1()`). 4/4 pass.

No previous security invariant was weakened.
