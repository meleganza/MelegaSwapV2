# Beta deployment — do not run this mission's host against production

This repository change does not deploy. Production DNS for `www.melega.finance` stays on the current Vercel project. Do not add that domain, or any other public Melega domain, to the beta project.

## Isolation

| Item | Live DEX | Next Gen beta |
| --- | --- | --- |
| App | `apps/web` | `apps/next-gen` |
| Vercel project | Existing production project | New project, created only when a human has credentials and asks for the deploy |
| Root directory | Current production root (`apps/web` if that is what production uses) | `apps/next-gen` |
| Domain | `www.melega.finance` | None. Vercel-generated hostname only, behind Deployment Protection |
| Env | Existing production env | `BETA_ACCESS_TOKEN` only. Do not copy production RPC keys, indexer secrets, or wallet keys |
| Crons | `/api/indexer/run/` every 5 minutes and `/api/indexer/registry/refresh/` daily | None |
| Build command | Existing `yarn build` (turbo `--filter=web`) | `yarn workspace @melega/next-gen build` |
| Install | Existing install from the repo root | Same lockfile. The beta project root is `apps/next-gen`, so its install command must still be able to see the workspace. Use the repository root as the Vercel root only if the install runs at the root and the output directory is overridden. Preferred: root directory `apps/next-gen`, install command `cd ../.. && yarn install --ignore-scripts`, build command `yarn build`. |

`BETA_ACCESS_TOKEN` is named in the middleware source so Next.js 13 records it for the edge sandbox. The running server reads the value from its environment, so rotating the token does not require a code change. Do not expose the token to the browser.

Generate the token with `openssl rand -base64 32`. Reject anything shorter than 16 characters; the app treats that as closed.

## Gates before any human deploy

1. Create a new Vercel project. Do not reuse the production project.
2. Turn on Deployment Protection (Vercel Authentication or Password Protection) for Production and Preview.
3. Set `BETA_ACCESS_TOKEN` in that project's Production and Preview environments only.
4. Confirm the project has zero Cron Jobs.
5. Confirm no production domain is attached.
6. Deploy only after those four checks. This mission does not perform step 6.

## How a reviewer opens it

1. Open the Vercel-protected URL and pass Deployment Protection.
2. The app then shows the access page, which has no Swap, Bridge, or Earn navigation.
3. Submit the beta token. The cookie lasts 12 hours, is HttpOnly, and is SameSite=Strict. On Vercel it is also Secure.
4. The shell loads. Every module says "Not operational".
5. "Leave beta" clears the cookie.

Anonymous `GET /` redirects to `/access`. A request that does not accept HTML receives `401` with an empty body. Next.js 13.0.7 middleware cannot return a response body. If the token is unset, browsers are sent to `/access`, which says the shell stays closed. Other clients receive `401`.

## Local run

```sh
cd ../..
yarn install --ignore-scripts
cd apps/next-gen
export BETA_ACCESS_TOKEN="$(openssl rand -base64 32)"
yarn build
yarn start
```

The dev and start port is 4317. Do not point this process at a production RPC.

## Preview access plan

There is no public preview URL in this change. A preview exists only after a human creates the separate project, enables Deployment Protection, sets the token, and deploys. Until then the blocker is: no Vercel credentials in this mission, and the founder gate forbids an unprotected deploy.
