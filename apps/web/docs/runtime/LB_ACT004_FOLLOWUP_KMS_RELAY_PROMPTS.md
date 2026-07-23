# LB-ACT-004 — Follow-up Implementation Prompts (External Repos)

These prompts are prepared because production KMS / bounded relay ownership is **outside** MelegaSwapV2 application authority. Do not fake gates locally.

---

## Prompt 1 — Production KMS / Authorizer authority (LB-G03B / LB-G11)

**Destination chat / repo:** KERL / execution-runtime (see `docs/handoffs/LB008_KERL_KMS_SIGNATURE_NORMALIZATION.md`).  
Sibling observed: `meleganza/melega-kiri-treasury-runtime` (Treasury SmartDrop signer is **testnet hot-key** and **must not** be reused for LB mainnet).

```text
MISSION: LB-KMS-PROD-BIND — Bind existing AWS KMS secp256k1 authority for Liquidity Building V1

CONSTRAINTS:
- Do NOT create a new signer unless the existing production KMS key is proven incompatible
- Do NOT use a hot private key / mnemonic
- Do NOT export private material
- chainId 56 only for production verification
- Publish only: address, key type, provider class, nonExportable=true, fingerprint, region, alias

REQUIRED RESULTS FOR MelegaSwapV2 artifacts:
- productionAuthority.address non-null
- productionAuthority.verdict = AUTONOMOUS_AUTHORITY_PRODUCTION_READY
- signatureNormalization.productionKmsVerified = true
- Authorizer constructor signingAuthority_ = that address
- activation-gate-final rows LB-G03B and LB-G11 = PASS with evidence URIs

IMPLEMENT:
EIP-712 ExecutionIntent V1 → KMS Sign → DER decode → low-s → 65-byte r||s||v
→ recover == production authority → validate against LiquidityBuildingExecutionAuthorizerV1

Return evidence pack consumable by MelegaSwapV2 without secrets.
```

---

## Prompt 2 — Bounded Liquidity Building relay (LB-G03C)

**Destination:** Prefer reuse of an existing certified autonomous transaction worker pattern (Treasury broadcast worker is a reference architecture only; it must be re-scoped to LB allowlists and KMS — not SmartDrop hot-key testnet).

```text
MISSION: LB-RELAY-BOUNDED-WORKER — Production relay for Liquidity Building executeLiquidityBuilding only

REQUIRED PROPERTIES:
- chainId 56
- KMS signer (no hot key, no unrestricted /sign endpoint)
- allowlisted LB contract addresses only (Factory programs / Program.executeLiquidityBuilding)
- allowlisted function selectors only
- gas limits, nonce safety, deadlines, idempotency, duplicate prevention
- receipt tracking + pause enforcement
- health / readiness / authority endpoints
- no economic authority (no budget decisions)

DELIVER TO MelegaSwapV2:
- LB_RELAY_URL
- relay.status = READY
- relay authority identity
- evidence for activation-gate-final LB-G03C = PASS

FORBIDDEN:
- arbitrary transaction signing API
- Next.js in-process mainnet broadcaster holding keys
- funded EOA “ops wallet” fallback as authority
```

---

## Compatibility note

`melega-kiri-treasury-runtime/external-services/treasury-signer-service` is labeled **BSC TESTNET ONLY** and uses private-key env vars. It is **not** a valid LB-G03B production authority.
