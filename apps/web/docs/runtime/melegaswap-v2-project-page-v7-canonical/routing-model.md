# Routing model — Project Page V7

## Public destinations

```text
Claimed:   /@{slug}/     → rewrite → /project-hq/{slug}  (ISR)
Unclaimed: /token/{chain}/{address}                     (SSR)
Execution: /swap?outputCurrency={address}&chain={id}    (Trade CTA only)
```

## Chain path segments

| chainId | path |
|---------|------|
| 56 | bsc |
| 1 | eth |
| 8453 | base |
| 137 | polygon |
| 42161 | arbitrum |
| 43114 | avalanche |

## Resolver

`resolveCanonicalProjectHref({ slug?, chainId?, address? })`

1. If slug resolves in registry → `/@{canonicalSlug}/`
2. Else if address resolves to a registry project → `/@{slug}/`
3. Else if address present → `/token/{chain}/{address}`
4. Else → `/projects` (never invent `/@fake-slug`)

## Unclaimed page behavior

`pages/token/[chain]/[address].tsx`

- Canonicalize path (chain alias + checksum address)
- If address maps to a claimed project → **permanent redirect** to `/@slug`
- Else render unclaimed V7 shell from dex-asset-index metadata
