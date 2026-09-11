# LATENCY_AND_FAILURE_MODEL

## Parallelism

Quotes are collected with `collectBoundedParallel`. Never sequential venue A then B then C.

Each adapter gets its own `AbortSignal` and timeout. Overall cycle has a hard cap.

## Recommended defaults (configurable)

| Budget | Default | Role |
|--------|---------|------|
| `initialResponseMs` | 400 | Feel-fast target |
| `quoteTimeoutMs` | 1200 | Per adapter |
| `staleQuoteMs` | 15000 | Freshness |
| `comparisonMs` | 50 | Ranking |
| `fallbackWaitMs` | 250 | Wait after first quote |
| `overallBudgetMs` | 1800 | Hard cap |

These are starting values, not live telemetry. Override per environment.

Return the best **verified** quote inside the budget. Do not wait forever.

## Failure isolation

| Mechanism | Behaviour |
|-----------|-----------|
| Adapter timeout | Result `timeout`; others continue |
| Adapter error | Normalized `VENUE_ERROR`; others continue |
| Circuit breaker | After 3 failures, `UNAVAILABLE` for 15s cooldown |
| Disabled venue | Skipped (`DISABLED`) |
| V2 engine failure in SHADOW | Legacy production continues; V2 is not on the commit path |

A failed venue must not freeze SmartSwap. In M1 there is still only one live venue (Melega); isolation is proven in tests for future adapters.

## Degraded

`DEGRADED` remains quote-eligible with lower confidence. `UNAVAILABLE` / `DISABLED` are not.

## Shadow failure

If shadow mapping throws, do not redirect the user. Tests run shadow independently of `useSwapCallback`.
