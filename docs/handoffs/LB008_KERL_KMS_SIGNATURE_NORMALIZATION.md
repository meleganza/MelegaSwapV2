# LB008 Handoff — KERL / Execution Runtime KMS Signature Normalization

**Status:** REQUIRED — NOT IMPLEMENTED IN MelegaSwapV2  
**Blocker:** LB-G03B, LB-G11  
**Target repository:** Not present in this checkout as a sibling Git root under `Projects/`.  
Prior evidence in-repo: `apps/web/src/lib/kerl-signing-gate/signer-audit.ts` reports `KMS_HSM` adapter **MISSING**; preferred model remains `HOT_SIGNER` (rejected for Liquidity Building).

Desktop sibling observed during discovery (outside MelegaSwapV2 workspace):  
`/Users/marcomelega/Desktop/melega-kiri-treasury-runtime` → remote `meleganza/melega-kiri-treasury-runtime`  
KERL signing adapter source was **not** verified as available for modification in this mission environment.

## Required module

Implement in the verified KERL / execution-runtime repository only (do not copy into MelegaSwapV2):

```
EIP-712 ExecutionIntent V1
→ Authorizer-compatible digest (keccak256 of typed data matching LiquidityBuildingExecutionAuthorizerV1)
→ KMS Sign with DIGEST semantics (provider-specific: verify raw vs SHA-256 vs pre-hashed Keccak-256)
→ DER decode
→ extract r, s
→ enforce secp256k1 scalar bounds
→ normalize s to low-s
→ determine recovery ID (bounded search 0/1)
→ verify recovered address == production authority
→ return canonical 65-byte r || s || v
→ locally validate against LiquidityBuildingExecutionAuthorizerV1
```

## Hard constraints

- No private-key path
- No mnemonic / keystore
- No transaction broadcast in signing module
- Typed-intent-only (reject arbitrary digests)
- Service identity policy, not human credentials
- Publish only: Ethereum authority address, key type, provider class, non-exportability verdict, algorithm, public-key fingerprint

## Solidity Authorizer contract (already in MelegaSwapV2)

- `contracts/liquidity-building/LiquidityBuildingExecutionAuthorizerV1.sol`
- Schema: `LIQUIDITY_BUILDING_EXECUTION_INTENT_V1`
- Immutable `signingAuthority` — no rotation

## Test vectors required (in KERL repo)

Valid DER; leading-zero r/s; high-s; invalid ASN.1; truncated; zero r/s; out-of-order; recovery fail; wrong authority; mutated digest/intent; cross-program/chain/Factory/Authorizer; Authorizer acceptance of 65-byte output.

## Production authority signature (when KMS available)

Non-executable test intent only:
- expired deadline
- impossible Program binding / zero eligibility
- NO MAINNET BROADCAST
- Mark: `PRODUCTION AUTHORITY SIGNATURE VALIDATION`

## Migration if key replaced

1. Deploy new Authorizer version with new authority
2. Deploy new Factory version pointing to new Authorizer
3. Create new Programs voluntarily
4. Preserve historical Programs — never mutate authority on existing Authorizer
