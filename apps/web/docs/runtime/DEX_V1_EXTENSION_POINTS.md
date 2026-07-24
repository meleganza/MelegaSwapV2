# Melega DEX V1 — Extension Points

Safe future expansion points that preserve V1 ownership and freezes. Extensions must not duplicate operational owners.

## Recommended extension surfaces

| Extension | Owner surface | Notes |
| --- | --- | --- |
| Passport identity / KYC producer | Passport | Enables live Verified without mock data |
| Passport controlled-projects feed | Passport → deep-link List/Project Page | Never infer ownership from token holdings |
| Passport activity evidence stream | Passport | Evidence URLs only; execution elsewhere |
| List Create Token factory | List | Flip `LIST_CREATE_TOKEN_AVAILABLE` only when certified |
| Liquidity Building activation | Liquidity Studio `view=building` | Keep Treasury boundary honest |
| Soft-alias hard redirects | `next.config.mjs` | After compatibility audit |
| Discover directory polish | Home `focus=projects` | Do not recreate Project Page ops |
| Earn opportunity deep-links | Farms / Pools | Project Page may summarize only |

## Forbidden extension patterns

- Second swap UI outside Trade/Home Instant Swap
- Onboarding forms on Project Pages or Passport
- Liquidity management outside Liquidity Studio
- Fake production metrics / mock balances
- Geometry changes to frozen Passport / List modules without new freeze exception

## Performance follow-ups (non-blocking for V1 seal)

Documented for a later production hardening mission:

- Route-level provider duplication
- Prefetch / navigation data reload loops
- Soft-alias cleanup
