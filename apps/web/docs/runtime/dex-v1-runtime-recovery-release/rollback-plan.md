# Rollback plan — DEX V1 runtime recovery release

## Previous known-good production

- Deployment ID: `dpl_6xaRHRz5hkHUAGpvDZ1TURYzs2yb`
- Git SHA: `74b4f2e4` (Liquidity MODULE_007)
- Aliases: `https://www.melega.finance`, `https://melega.finance`

## Platform

Vercel project `melega-swap-v2-web` (org melegazas-projects).

## Rollback command

```bash
npx vercel rollback dpl_6xaRHRz5hkHUAGpvDZ1TURYzs2yb --yes
# or: npx vercel promote dpl_6xaRHRz5hkHUAGpvDZ1TURYzs2yb --scope melegazas-projects
```

Verify:

```bash
npx vercel inspect https://www.melega.finance
# expect id dpl_6xaRHRz5hkHUAGpvDZ1TURYzs2yb (or prior known-good)
curl -sI https://www.melega.finance | head
```

## Expected duration

1–5 minutes for alias reassignment (no rebuild).

## Owner

Release operator (Founder / deploy account `meleganza`).

## Data migration impact

None — frontend-only release; no DB migrations.

## Cache

Hard-refresh / purge Vercel CDN for HTML if stale bundle observed; indexer cron remains `/api/indexer/run`.
