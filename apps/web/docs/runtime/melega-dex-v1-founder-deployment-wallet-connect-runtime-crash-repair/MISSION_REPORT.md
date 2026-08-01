# MISSION REPORT — Wallet Connect Runtime Crash Repair

## Verdict

`MELEGA_DEX_V1_FOUNDER_DEPLOYMENT_WALLET_CONNECT_CRASH_WEB_RELEASE_PENDING`

## Root cause

`WalletModal` / `WalletUserMenuItem` called `data.value.lte(...)` on a wagmi **bigint**, throwing `TypeError: value.lte is not a function` immediately after connect (Error Tracking Id `5b8e1204c7294a189eca7931f51336a4`).

## Fix

Safe BigInt helpers + wallet menu balance formatting + Founder shell provider/balance/gas containment.

## Unchanged

Contracts, bytecode, fees, Treasury, deployment order, certified manifest.
