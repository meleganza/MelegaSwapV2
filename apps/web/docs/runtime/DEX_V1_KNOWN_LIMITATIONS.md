# Melega DEX V1 — Known Limitations

Honest production limitations for the sealed V1 release candidate. These are not defects invented by the seal mission; they are carried forward from certified product missions.

## Product / data honesty

1. **Passport verification** — No identity/KYC API; live “Verified” must not be fabricated.
2. **Passport portfolio / assets** — USD valuations and M-Credits ledger may be unavailable (`—` / Unavailable).
3. **Passport activity** — No durable production activity feed; empty state is honest.
4. **Passport security** — Sessions / recovery / alerts may report Unavailable.
5. **List Create Token** — `LIST_CREATE_TOKEN_AVAILABLE=false` (Coming Soon).
6. **Liquidity Building activation** — May remain externally gated depending on Treasury/deployment readiness.

## Navigation / IA

7. **List on mobile** — Not in bottom rail; reachable via global header List link.
8. **Soft aliases** — `/command-center`, `/portfolio`, `/workspace`, `/liquidity` may still render legacy pages while parent nav marks Passport/Liquidity.

## Engineering debt (pre-existing)

9. **Repo-wide `tsc --noEmit`** — Known failures outside sealed mission surfaces (Trade/Trending/tokens, etc.). Gate for V1 seal is mission-scoped tests + successful `next build`.
10. **ESLint `next/babel` config warning** during build — non-blocking on this tip.

## Out of scope for V1 seal

- Performance optimization mission
- Soft-alias hard-redirect cleanup
- Command Center cutover from dual Passport surface
- New APIs for Passport controlled-projects producer

Machine-readable copy: `docs/runtime/dex-v1-production-seal/known-limitations.json`
