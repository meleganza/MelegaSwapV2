# FEE_ENFORCEMENT_MODEL

States (unchanged from M1):

| State | Production execution |
|-------|----------------------|
| `FEE_UNAVAILABLE` | No |
| `FEE_PREVIEW_ONLY` | No |
| `FEE_ENFORCEABLE` | Candidate (cutover still forbidden in M2) |
| `FEE_VERIFIED` | After fill |

Preferred production architecture: **atomic** collection with orchestrated execution. Never a standalone second fee tx described as atomic.

Future adapter methods (documented, not deployed):

- `NATIVE_INSIDE_EXECUTION`
- `WRAPPER_ROUTER`
- `AGGREGATOR_SUPPORTED`
- `SETTLEMENT_CONTRACT`
- `NOT_ENFORCEABLE`

Current Melega live path: **NOT_ENFORCEABLE** / `FEE_PREVIEW_ONLY`.

Beneficiary is the existing canonical treasury `0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b`. Adapters may not substitute a different destination. Treasury was **not** changed in M2.

Fee asset may be input, output, native gas, or settlement — adapters declare support. M2 shadow calculations default to output-denominated amount parameters.

Quote fee is sealed (`policyVersion`, `feeBand`, `feeBps`, `feeAmount`, asset, timestamp, expiry) and immutable until expiry.
