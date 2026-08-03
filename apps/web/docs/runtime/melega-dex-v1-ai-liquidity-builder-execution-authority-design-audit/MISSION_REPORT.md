# MELEGA_DEX_V1_AI_LIQUIDITY_BUILDER_EXECUTION_AUTHORITY_DESIGN_AUDIT

## Verdict

**MELEGA_DEX_V1_AI_LIQUIDITY_BUILDER_EXECUTION_AUTHORITY_DESIGN_READY**

## Objective

Design the future AI execution authority model — no implementation, no LB contract changes, no redeploy in this mission.

## Authorizer capabilities

| Question | Answer |
|----------|--------|
| Can signing authority change? | **No** — immutable on Authorizer; Factory.executionAuthorizer also immutable |
| Multiple authorities? | **No** — single `signingAuthority` |
| Can ERC-1271 validation delegate? | **Yes** — if `signingAuthority` has code, Authorizer calls `isValidSignature`. Live Founder address is EIP-7702 delegated (`ef0100…`), so validation can be implemented in the delegate without changing Authorizer |

## Options

| ID | Name | Near-term fit |
|----|------|---------------|
| A | Founder-only | Fallback / emergency |
| B | AI replaces Founder authority address | Requires redeploy — deferred |
| **C** | **AI + Founder recovery via 7702/1271 policy** | **RECOMMENDED** |
| D | Multi-sig authority | Optional hardening of C |
| E | New Authorizer/Factory | Later generation |

## Recommended architecture

**C — EIP-7702 ERC-1271 AI Policy Module at the existing signingAuthority**

- AI signs ExecutionIntent digests only (no fund custody)
- No KMS dependency
- No Treasury Runtime
- No Factory/Authorizer redeploy
- Founder recovery via revoke / pause / re-delegate
- Permissionless relay remains broadcast-only

## Runtime required

Decision engine → Policy engine → Signer (AI) → Relay → Program execution + Scheduler + Monitoring

## Evidence

| File | Role |
|------|------|
| `execution-authority-options.json` | A–E + live 7702 facts |
| `recommended-architecture.json` | Chosen design + sequence |
| `security-model.json` | Custody / compromise / recovery |

## Scope

Design audit only. No code shipped.
