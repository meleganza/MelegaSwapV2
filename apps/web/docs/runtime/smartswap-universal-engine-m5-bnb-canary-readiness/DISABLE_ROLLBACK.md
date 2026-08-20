# DISABLE_ROLLBACK

SmartSwap V2 can be disabled without breaking legacy SmartSwap.

| | |
|--|--|
| Production authority | `ACTIVE_V2_ROLLOUT = LEGACY_PRODUCTION` (already true in M5) |
| V2 disable | owner `pause()` on `SmartSwapExecutorV1` and/or `setRouter(pancake, venue, false)` |
| UX | no change |
| User migration | none |
| Legacy path | direct production router remains available (fork: paused executor + successful direct Pancake swap) |

Future authorized canary rollback is the same: pause V2 executor, leave production SmartSwap on the frozen UI.
