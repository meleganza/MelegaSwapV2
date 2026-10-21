# Beta deployment

This repository change does not deploy and does not change production DNS. `www.melega.finance` stays on the current production project. Do not attach that domain to the Next Gen project.

## Access

The app does not ask for a password. The visible label is “Beta — read-only”. Anonymous visitors get that shell. `/access` redirects to `/`. The retired login routes answer 410. Responses stay `noindex` and `private, no-store`. Idle Home does not request `/api/*`, including the Trend Boost feed.

Do not put an access token, RPC key, or wallet key in this app. Do not run a command that publishes source or logs. If the host still has a separate platform lock, this code does not remove it and does not bypass it.

## Isolation

| Item | Live DEX | Next Gen beta |
| --- | --- | --- |
| App | `apps/web` | `apps/next-gen` |
| Vercel project | Existing production project | The existing Next Gen project only |
| Domain | `www.melega.finance` | No production domain |
| Env | Existing production env | No app password. Do not copy production RPC or wallet keys |
| Crons | Indexer crons on the live project | None |
| Build | Existing production build | `yarn workspace @melega/next-gen build` |

## Local run

```sh
cd ../..
yarn install --ignore-scripts
cd apps/next-gen
yarn build
yarn start
```

The start port is 4317. Opening `http://127.0.0.1:4317/` does not require a password.
