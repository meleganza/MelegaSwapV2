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

### Earn Sandbox

The protected preview defaults to read-only simulation. For transaction testing,
configure `EVO_EARN_SANDBOX_RPC_URL` for the Preview environment only. Its value is
the wallet-facing HTTPS endpoint of a private BNB Chain fork reporting chain ID
31337. This URL is visible to preview users. Keep upstream API keys and fork
administration on the host. Fund test wallets on the fork with test BNB, MARCO and
ETH/WBNB LP tokens. Production does not enable this configuration.

For local testing with Foundry:

```sh
anvil --host 127.0.0.1 --port 8545 --chain-id 31337 --fork-url https://bsc-rpc.publicnode.com
# In another terminal, from apps/next-gen:
bash scripts/fund-earn-sandbox.sh TEST_WALLET_ADDRESS
EVO_EARN_SANDBOX_RPC_URL=http://127.0.0.1:8545 npm run dev
```

The funding script changes only the localhost Anvil fork. If upstream reads
stop working at the selected block, restart with a fresh fork or use an archive
RPC. Connect a test wallet, open **Earn → Positions**, select a market and review
the operation. After an approval confirms, review again and confirm the deposit.
For the ETH/WBNB withdrawal, enter the number of vault shares to redeem.
