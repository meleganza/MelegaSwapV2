# Melega Next Gen beta

Isolated shell for the protected Next Gen beta. It is not the live DEX.

The live app remains `apps/web` on `www.melega.finance`. This package does not import it and does not execute swaps, bridges, deposits, or withdrawals.

- Architecture: [docs/ADR-NG001.md](docs/ADR-NG001.md)
- Reuse matrix: [docs/CODE-REUSE-MATRIX.md](docs/CODE-REUSE-MATRIX.md)
- Budget: [docs/BUDGET.md](docs/BUDGET.md)
- Deploy plan (no deploy in NG001): [docs/BETA-DEPLOYMENT.md](docs/BETA-DEPLOYMENT.md)
- Next mission: [docs/NG002.md](docs/NG002.md)

```sh
yarn workspace @melega/next-gen test
yarn workspace @melega/next-gen typecheck
yarn workspace @melega/next-gen build
yarn workspace @melega/next-gen budget
```

Open the beta from its link. There is no app password. Reads stay on demand, and the app does not sign or send transactions. A platform lock on the host, if one is still enabled outside this app, is separate from this code.
