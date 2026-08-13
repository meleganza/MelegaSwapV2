# Yield participant index

Farms and Pools use one release snapshot for participant counts. The browser
does not scan logs and does not issue per-card RPC calls.

`Participants` means unique wallets with a positive current position in the
specific MasterChef PID or SmartChef contract. Transaction count, token supply,
LP supply and deposited token quantity are never used as substitutes.

Build or incrementally refresh the snapshot with an archive/log-capable private
BNB Chain endpoint:

```sh
BSC_LOG_RPC_URL=https://your-dedicated-archive-rpc \
  yarn workspace web yield:participants:backfill
```

The resumable wallet-level state is stored under
`apps/web/data/bsc-indexer/yield-participants/` and stays server-side. Only the
aggregate `yieldParticipants.generated.json` artifact is shipped with a release.
While a new entity is still being backfilled, the UI displays `Indexing…`; zero
is displayed only when the index has certified that the entity has no active
participants.
