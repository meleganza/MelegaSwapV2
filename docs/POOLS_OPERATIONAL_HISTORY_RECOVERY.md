# Pools Operational History Recovery

**Mission:** POOLS_HISTORY_01  
**Type:** Read-only canonical recovery — no code, config, contract, or UI changes  
**Branch:** `design-system-foundation`  
**Generated:** 2026-07-01  
**Primary chain:** BSC (56) — 243 pool records recovered  

---

## 1. Executive summary

This mission recovers **operational history** (when pools were actually live), not just current config state.

| Finding | Evidence |
| --- | --- |
| Repository tracks Melega DEX pool config from **2024-05-02** (`e3389a2`) | Git first commit |
| **Auto MARCO**, **Manual MARCO**, **Flexible MARCO** present from first commit | `vaultPoolConfig` + `sousId 0` in `e3389a2` |
| Auto MARCO branding commit | `fa0bef2` — 2024-05-28 — message: `auto marco` |
| BSC partner campaigns deployed **before** repo import (on-chain starts ~2023) | RPC `startBlock` timestamps |
| **10–15 pools visible at once** | **Partially confirmed** — see §6 |
| Melega repo era (≥2024-05-02) typical UI visibility | **3–7 pools** (2–3 permanent + 0–4 campaigns) |
| Config listed 125–187 “live” pools while most campaigns had already ended on-chain | Config drift — not operational visibility |
| Today (2026) BSC on-chain open campaigns | **0** (+ 2–3 permanent MARCO surfaces) |

**Product intent recovered:** Permanent MARCO staking (Auto / Manual / Flexible) + time-boxed partner campaigns. Ended campaigns should appear in **History** (read-only), not Live.

---

## 2. Evidence methodology

| Source | Used? | Notes |
| --- | --- | --- |
| Git history (`pools.tsx`) | **Yes** | 80+ commits; per-`sousId` first-seen via `git log -S` |
| Git tags | **No** | No tags in repository |
| Old branches | **No** | Not exhaustively diffed; main history on `main` lineage |
| On-chain `startBlock` / `bonusEndBlock` | **Yes** | BSC RPC multicall per sousChef contract |
| Block → date conversion | **Yes** | `eth_getBlock` timestamps |
| `docs/POOLS_CANONICAL_RECOVERY_REPORT.md` | **Yes** | Prior classification cross-check |
| `docs/pools-canonical-inventory.json` | **Yes** | Multi-chain snapshot |
| Deployment reports | **Missing** | No deploy scripts or reports in repo |
| Changelogs | **Missing** | No CHANGELOG with pool entries |
| Screenshots | **Missing** | No historical /pools UI screenshots |
| Public assets | **Partial** | Token images in `apps/web/public/images` — not dated per pool |

**Rule:** No assumptions. Gaps marked **insufficient evidence** or **missing**.

---

## 3. Git history findings

### 3.1 Repository timeline (BSC pool config)

| Date | Commit | Live in config | Finished in config | Notes |
| --- | --- | ---: | ---: | --- |
| 2024-05-02 | `e3389a2` | 125 | 78 | First commit; `livePools` export; vault + sousId 0 |
| 2024-05-11 | `86ddee1` | 125 | 79 | `pool add bsf` |
| 2024-05-28 | `fa0bef2` | 129 | 78 | **`auto marco`** — contracts, pools, pages |
| 2024-09-11 | `c214d31` | 153 | 79 | Major pool additions |
| 2024-12-29 | `58a3541` | 170 | 79 | Continued campaign imports |
| 2025-11-17 | `599c52b` | 187 | 78 | Latest bulk update |
| 2026-07-01 | HEAD | 187 | 78 | Current |

### 3.2 Permanent pool git evidence

| Pool | First git evidence | Commit | Date |
| --- | --- | --- | --- |
| **Manual MARCO** | `sousId: 0` + MARCO/MARCO | `e3389a2` | 2024-05-02 |
| **Auto MARCO** | `vaultPoolConfig` → “Auto MARCO” | `e3389a2` | 2024-05-02 |
| **Auto MARCO** (ops commit) | contracts + pools update | `fa0bef2` | 2024-05-28 |
| **Flexible MARCO** | `vaultPoolConfig` → “Flexible MARCO” | `e3389a2` | 2024-05-02 |

### 3.3 Config vs operations gap

At **2024-09-11** (153 campaigns in config):

| Metric | Count |
| --- | ---: |
| Campaigns in `livePools` config | 150 |
| Campaigns **on-chain open** that day | 3 |
| + Permanent MARCO surfaces | +2–3 |
| **Actually visible if UI respected chain state** | **~5–6** |

**Conclusion:** Config growth after mid-2024 mostly **imported historical/ended deployments** into `livePools56` without marking `isFinished: true`. Git proves listing; on-chain proves liveness.

---

## 4. Pool inventory table (BSC)

Full machine-readable annex: [`docs/pools-operational-history.json`](./pools-operational-history.json)

| Pool | sousId | Chain | Stake token | Reward token | Evidence | Live period | Current status | Recommended status |
| --- | ---: | ---: | --- | --- | --- | --- | --- | --- |
| Flexible MARCO | 0 | 56 | MARCO | MARCO | git:e3389a2 (2024-05-02); vaultPoolConfig | ≥ 2024-05-02 (permanent vault, conditional UI) | LIVE_NOW | LIVE_NOW |
| Auto MARCO | 0 | 56 | MARCO | MARCO | git:e3389a2 (2024-05-02); vaultPoolConfig | ≥ 2024-05-02 (permanent vault) | LIVE_NOW | LIVE_NOW |
| Manual MARCO | 0 | 56 | ? | ? | git:e3389a2 (2024-05-02) | ≥ 2024-05-02 (permanent) | LIVE_NOW | LIVE_NOW |
| Stake CAKE → Earn MXMX | 1 | 56 | cake | mxmx | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=21824724; config:finishedPools | 2022-08-15 → 2022-10-02 | ARCHIVE | ARCHIVE |
| Stake CAKE → Earn GITTO | 2 | 56 | cake | gitto | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=21824724; config:finishedPools | 2022-08-15 → 2022-10-02 | ARCHIVE | ARCHIVE |
| Stake CAKE → Earn GCC2 | 3 | 56 | cake | gcc2 | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=21824724; config:finishedPools | 2022-08-15 → 2022-10-02 | ARCHIVE | ARCHIVE |
| Stake ? → Earn ? | 4 | 56 | ? | ? | git:e3389a2 (2024-05-02) | — | UNKNOWN | UNKNOWN |
| Stake CAKE → Earn RMBR | 5 | 56 | cake | rmbr | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=20865568; config:finishedPools | 2022-08-15 → 2022-08-29 | ARCHIVE | ARCHIVE |
| Stake ? → Earn ? | 6 | 56 | ? | ? | git:e3389a2 (2024-05-02) | — | UNKNOWN | UNKNOWN |
| Stake MXMX → Earn CAKE | 7 | 56 | mxmx | cake | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=21824724; config:finishedPools | 2022-08-15 → 2022-10-02 | ARCHIVE | ARCHIVE |
| Stake GITTO → Earn CAKE | 8 | 56 | gitto | cake | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=21824724; config:finishedPools | 2022-08-15 → 2022-10-02 | ARCHIVE | ARCHIVE |
| Stake GCC2 → Earn CAKE | 9 | 56 | gcc2 | cake | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=21824724; config:finishedPools | 2022-08-15 → 2022-10-02 | ARCHIVE | ARCHIVE |
| Stake MM72 → Earn CAKE | 10 | 56 | mm72 | cake | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=23578908; config:finishedPools | 2022-08-23 → 2022-12-03 | ARCHIVE | ARCHIVE |
| Stake MARCOBNB → Earn CAKE | 11 | 56 | marcobnb | cake | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=25355927; config:finishedPools | 2022-08-30 → 2023-02-03 | ARCHIVE | ARCHIVE |
| Stake MXMXBNB → Earn MXMX | 12 | 56 | mxmxbnb | mxmx | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=25355937; config:finishedPools | 2022-08-30 → 2023-02-03 | ARCHIVE | ARCHIVE |
| Stake MM72BNB → Earn MM72 | 13 | 56 | mm72bnb | mm72 | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=25355949; config:finishedPools | 2022-08-30 → 2023-02-03 | ARCHIVE | ARCHIVE |
| Stake CAKE → Earn MXMX | 14 | 56 | cake | mxmx | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=99681294 | 2026-03-30 → 2026-05-22 | ENDED | HISTORY |
| Stake CAKE → Earn GITTO | 15 | 56 | cake | gitto | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=24647852; config:finishedPools | 2022-10-02 → 2023-01-09 | ARCHIVE | ARCHIVE |
| Stake CAKE → Earn GCC2 | 16 | 56 | cake | gcc2 | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=24647852; config:finishedPools | 2022-10-02 → 2023-01-09 | ARCHIVE | ARCHIVE |
| Stake MXMX → Earn CAKE | 17 | 56 | mxmx | cake | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=24647852; config:finishedPools | 2022-10-02 → 2023-01-09 | ARCHIVE | ARCHIVE |
| Stake GITTO → Earn CAKE | 18 | 56 | gitto | cake | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=24647852; config:finishedPools | 2022-10-02 → 2023-01-09 | ARCHIVE | ARCHIVE |
| Stake GCC2 → Earn CAKE | 19 | 56 | gcc2 | cake | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=24647852; config:finishedPools | 2022-10-02 → 2023-01-09 | ARCHIVE | ARCHIVE |
| Stake CAKE → Earn BEAR | 20 | 56 | cake | bear | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=99679461 | 2026-03-30 → 2026-05-22 | ENDED | HISTORY |
| Stake CAKE → Earn VOLT | 21 | 56 | cake | volt | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=27461128; config:finishedPools | 2023-01-07 → 2023-04-18 | ARCHIVE | ARCHIVE |
| Stake CAKE → Earn GCC2 | 22 | 56 | cake | gcc2 | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=99999999 | 2026-03-30 → 2026-05-23 | ENDED | HISTORY |
| Stake CAKE → Earn MXMX | 23 | 56 | cake | mxmx | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=25971854; config:finishedPools | 2023-01-10 → 2023-02-25 | ARCHIVE | ARCHIVE |
| Stake CAKE → Earn FBTC | 24 | 56 | cake | fbtc | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=27566944; config:finishedPools | 2023-01-11 → 2023-04-22 | ARCHIVE | ARCHIVE |
| Stake CAKE → Earn GWT | 25 | 56 | cake | gwt | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=25962985; config:finishedPools | 2023-02-18 → 2023-02-25 | ARCHIVE | ARCHIVE |
| Stake CAKE → Earn QCWC | 26 | 56 | cake | qcwc | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=25962985; config:finishedPools | 2023-02-18 → 2023-02-25 | ARCHIVE | ARCHIVE |
| Stake CAKE → Earn OSTRICH | 27 | 56 | cake | ostrich | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=25569015; config:finishedPools | 2023-01-13 → 2023-02-11 | ARCHIVE | ARCHIVE |
| Stake CAKE → Earn KOALA | 28 | 56 | cake | koala | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=27634008; config:finishedPools | 2023-01-13 → 2023-04-24 | ARCHIVE | ARCHIVE |
| Stake CAKE → Earn FROGE | 29 | 56 | cake | froge | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=26511569; config:finishedPools | 2023-01-15 → 2023-03-16 | ARCHIVE | ARCHIVE |
| Stake CAKE → Earn ROTTO | 30 | 56 | cake | rotto | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=27709916; config:finishedPools | 2023-01-16 → 2023-04-27 | ARCHIVE | ARCHIVE |
| Stake CAKE → Earn GPAY | 31 | 56 | cake | gpay | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=25883876; config:finishedPools | 2023-01-17 → 2023-02-22 | ARCHIVE | ARCHIVE |
| Stake CAKE → Earn GGW | 32 | 56 | cake | ggw | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=27202333; config:finishedPools | 2023-04-01 → 2023-04-09 | ARCHIVE | ARCHIVE |
| Stake CAKE → Earn HBIT | 33 | 56 | cake | hbit | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=27828389; config:finishedPools | 2023-01-20 → 2023-05-01 | ARCHIVE | ARCHIVE |
| Stake CAKE → Earn LIRA | 34 | 56 | cake | lira | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=29448253 | 2023-06-01 → 2023-06-26 | ENDED | HISTORY |
| Stake CAKE → Earn SPX | 35 | 56 | cake | spx | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=25828372; config:finishedPools | 2023-02-13 → 2023-02-20 | ARCHIVE | ARCHIVE |
| Stake CAKE → Earn LOIS | 36 | 56 | cake | lois | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=25265524; config:finishedPools | 2023-01-25 → 2023-01-31 | ARCHIVE | ARCHIVE |
| Stake CAKE → Earn DOGEBIT | 37 | 56 | cake | dogebit | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=26529533; config:finishedPools | 2023-01-25 → 2023-03-17 | ARCHIVE | ARCHIVE |
| Stake CAKE → Earn C4CV2 | 38 | 56 | cake | C4Cv2 | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=26555702; config:finishedPools | 2023-01-26 → 2023-03-17 | ARCHIVE | ARCHIVE |
| Stake CAKE → Earn SFE | 39 | 56 | cake | sfe | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=27353118; config:finishedPools | 2023-01-28 → 2023-04-14 | ARCHIVE | ARCHIVE |
| Stake CAKE → Earn BEFXOLD | 40 | 56 | cake | befxold | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=26508476; config:finishedPools | 2023-01-28 → 2023-03-16 | ARCHIVE | ARCHIVE |
| Stake CAKE → Earn FWC | 41 | 56 | cake | fwc | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=28051991; config:finishedPools | 2023-01-28 → 2023-05-09 | ARCHIVE | ARCHIVE |
| Stake CAKE → Earn BORZ | 42 | 56 | cake | borz | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=29625575 | 2023-05-03 → 2023-07-03 | ENDED | HISTORY |
| Stake CAKE → Earn FAS | 43 | 56 | cake | fas | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=26753775; config:finishedPools | 2023-02-02 → 2023-03-24 | ARCHIVE | ARCHIVE |
| Stake CAKE → Earn CTI | 44 | 56 | cake | cti | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=26788779; config:finishedPools | 2023-02-03 → 2023-03-26 | ARCHIVE | ARCHIVE |
| Stake CAKE → Earn CVL | 45 | 56 | cake | cvl | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=25761490; config:finishedPools | 2023-02-03 → 2023-02-18 | ARCHIVE | ARCHIVE |
| Stake CAKE → Earn POOP | 46 | 56 | cake | poop | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=29417261 | 2023-06-22 → 2023-06-25 | ENDED | HISTORY |
| Stake CAKE → Earn LUCK | 47 | 56 | cake | luck | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=99679440 | 2026-03-30 → 2026-05-22 | ENDED | HISTORY |
| Stake CAKE → Earn HSE | 48 | 56 | cake | hse | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=27629346; config:finishedPools | 2023-04-05 → 2023-04-24 | ARCHIVE | ARCHIVE |
| Stake CAKE → Earn TPCV3 | 49 | 56 | cake | tpcv3 | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=27335641; config:finishedPools | 2023-03-26 → 2023-04-14 | ARCHIVE | ARCHIVE |
| Stake CAKE → Earn SPACEAPE | 50 | 56 | cake | spaceape | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=26231600; config:finishedPools | 2023-02-14 → 2023-03-06 | ARCHIVE | ARCHIVE |
| Stake CAKE → Earn SFEA | 51 | 56 | cake | sfea | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=27353139; config:finishedPools | 2023-02-14 → 2023-04-14 | ARCHIVE | ARCHIVE |
| Stake CAKE → Earn GGTKN | 52 | 56 | cake | ggtkn | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=33711930 | 2023-10-23 → 2023-11-22 | ENDED | HISTORY |
| Stake CAKE → Earn SBDEX | 53 | 56 | cake | sbdex | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=26865382; config:finishedPools | 2023-02-16 → 2023-03-28 | ARCHIVE | ARCHIVE |
| Stake CAKE → Earn RUG | 54 | 56 | cake | rug | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=26577382; config:finishedPools | 2023-02-16 → 2023-03-18 | ARCHIVE | ARCHIVE |
| Stake CAKE → Earn LCSC | 55 | 56 | cake | lcsc | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=26640815; config:finishedPools | 2023-03-10 → 2023-03-20 | ARCHIVE | ARCHIVE |
| Stake CAKE → Earn DYN | 56 | 56 | cake | dyn | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=27574760; config:finishedPools | 2023-02-19 → 2023-04-22 | ARCHIVE | ARCHIVE |
| Stake CAKE → Earn IPL | 57 | 56 | cake | ipl | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=26386112; config:finishedPools | 2023-02-19 → 2023-03-12 | ARCHIVE | ARCHIVE |
| Stake CAKE → Earn SUSU | 58 | 56 | cake | susu | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=28470091; config:finishedPools | 2023-02-21 → 2023-05-23 | ARCHIVE | ARCHIVE |
| Stake CAKE → Earn WHEXDAO | 59 | 56 | cake | WHEXDAO | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=27078372; config:finishedPools | 2023-03-16 → 2023-04-05 | ARCHIVE | ARCHIVE |
| Stake CAKE → Earn DIGA | 60 | 56 | cake | diga | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=27379843; config:finishedPools | 2023-04-08 → 2023-04-15 | ARCHIVE | ARCHIVE |
| Stake CAKE → Earn SWEEP | 61 | 56 | cake | sweep | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=27888838; config:finishedPools | 2023-03-04 → 2023-05-03 | ARCHIVE | ARCHIVE |
| Stake CAKE → Earn XPHX | 62 | 56 | cake | XPHX | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=29103084 | 2023-03-06 → 2023-06-14 | ENDED | HISTORY |
| Stake CAKE → Earn HYPEC | 63 | 56 | cake | HYPEC | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=26799084; config:finishedPools | 2023-03-06 → 2023-03-26 | ARCHIVE | ARCHIVE |
| Stake CAKE → Earn DOGEUM | 64 | 56 | cake | DOGEUM | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=27916868; config:finishedPools | 2023-03-06 → 2023-05-04 | ARCHIVE | ARCHIVE |
| Stake CAKE → Earn HELP | 65 | 56 | cake | help | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=28686395; config:finishedPools | 2023-03-12 → 2023-05-31 | ARCHIVE | ARCHIVE |
| Stake CAKE → Earn ALT | 66 | 56 | cake | alt | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=33497063 | 2023-10-25 → 2023-11-14 | ENDED | HISTORY |
| Stake CAKE → Earn BEP40 | 67 | 56 | cake | BEP40 | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=27202287; config:finishedPools | 2023-04-05 → 2023-04-09 | ARCHIVE | ARCHIVE |
| Stake CAKE → Earn WHEX | 68 | 56 | cake | WHEX | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=27403993; config:finishedPools | 2023-04-09 → 2023-04-16 | ARCHIVE | ARCHIVE |
| Stake CAKE → Earn BTCF | 69 | 56 | cake | BTCF | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=27792737; config:finishedPools | 2023-03-16 → 2023-04-30 | ARCHIVE | ARCHIVE |
| Stake CAKE → Earn DOWA | 70 | 56 | cake | DOWA | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=27362629; config:finishedPools | 2023-04-08 → 2023-04-15 | ARCHIVE | ARCHIVE |
| Stake CAKE → Earn BEFX | 71 | 56 | cake | befx | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=29388535 | 2023-03-16 → 2023-06-24 | ENDED | HISTORY |
| Stake CAKE → Earn MRABBIT | 72 | 56 | cake | MRABBIT | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=27000031; config:finishedPools | 2023-03-18 → 2023-04-02 | ARCHIVE | ARCHIVE |
| Stake CAKE → Earn FNT | 73 | 56 | cake | FNT | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=27000031; config:finishedPools | 2023-03-18 → 2023-04-02 | ARCHIVE | ARCHIVE |
| Stake CAKE → Earn WCHK | 74 | 56 | cake | wCHK | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=27824008; config:finishedPools | 2023-04-16 → 2023-05-01 | ARCHIVE | ARCHIVE |
| Stake CAKE → Earn YKS | 75 | 56 | cake | YKS | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=27313366; config:finishedPools | 2023-03-24 → 2023-04-13 | ARCHIVE | ARCHIVE |
| Stake CAKE → Earn BERA | 76 | 56 | cake | Bera | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=27403993; config:finishedPools | 2023-04-09 → 2023-04-16 | ARCHIVE | ARCHIVE |
| Stake CAKE → Earn REAL | 77 | 56 | cake | REAL | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=27221235; config:finishedPools | 2023-03-26 → 2023-04-10 | ARCHIVE | ARCHIVE |
| Stake CAKE → Earn TREE | 78 | 56 | cake | TREE | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=27852761; config:finishedPools | 2023-03-28 → 2023-05-02 | ARCHIVE | ARCHIVE |
| Stake CAKE → Earn FLOSHIDO | 79 | 56 | cake | FLOSHIDO | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=27289268; config:finishedPools | 2023-03-28 → 2023-04-12 | ARCHIVE | ARCHIVE |
| Stake CAKE → Earn RFX | 80 | 56 | cake | RFX | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=30417693 | 2023-07-25 → 2023-07-30 | ENDED | HISTORY |
| Stake CAKE → Earn MIR | 81 | 56 | cake | MIR | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=30362946 | 2023-07-16 → 2023-07-28 | ENDED | HISTORY |
| Stake CAKE → Earn TFT | 82 | 56 | cake | TFT | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=27853114; config:finishedPools | 2023-04-01 → 2023-05-02 | ARCHIVE | ARCHIVE |
| Stake CAKE → Earn LMCSWAP | 83 | 56 | cake | LMCSWAP | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=29661546 | 2023-06-30 → 2023-07-04 | ENDED | HISTORY |
| Stake CAKE → Earn BYTC | 84 | 56 | cake | bytc | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=27550930; config:finishedPools | 2023-04-01 → 2023-04-21 | ARCHIVE | ARCHIVE |
| Stake CAKE → Earn KUSH | 85 | 56 | cake | KUSH | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=27308141; config:finishedPools | 2023-04-03 → 2023-04-13 | ARCHIVE | ARCHIVE |
| Stake CAKE → Earn FRTC | 86 | 56 | cake | FRTC | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=29642321 | 2023-06-26 → 2023-07-03 | ENDED | HISTORY |
| Stake CAKE → Earn EBTC | 87 | 56 | cake | EBTC | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=27881020; config:finishedPools | 2023-04-18 → 2023-05-03 | ARCHIVE | ARCHIVE |
| Stake CAKE → Earn PHDAO | 88 | 56 | cake | PHDAO | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=30329020 | 2023-04-18 → 2023-07-27 | ENDED | HISTORY |
| Stake CAKE → Earn UFCB | 89 | 56 | cake | UFCB | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=27881020; config:finishedPools | 2023-04-18 → 2023-05-03 | ARCHIVE | ARCHIVE |
| Stake CAKE → Earn NERVE | 90 | 56 | cake | NERVE | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=27913555; config:finishedPools | 2023-04-19 → 2023-05-04 | ARCHIVE | ARCHIVE |
| Stake CAKE → Earn CDIG | 91 | 56 | cake | CDIG | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=28921555 | 2023-04-19 → 2023-06-08 | ENDED | HISTORY |
| Stake CAKE → Earn DSUN | 92 | 56 | cake | Dsun | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=28237413; config:finishedPools | 2023-04-25 → 2023-05-15 | ARCHIVE | ARCHIVE |
| Stake CAKE → Earn SLR | 93 | 56 | cake | SLR | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=28028616; config:finishedPools | 2023-04-28 → 2023-05-08 | ARCHIVE | ARCHIVE |
| Stake CAKE → Earn SVR | 94 | 56 | cake | SVR | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=28761006 | 2023-05-03 → 2023-06-02 | ENDED | HISTORY |
| Stake CAKE → Earn IFRIT | 95 | 56 | cake | IFRIT | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=27950965; config:finishedPools | 2023-05-05 → 2023-05-05 | ARCHIVE | ARCHIVE |
| Stake CAKE → Earn BACD2 | 96 | 56 | cake | BACD2 | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=29789583 | 2023-07-08 → 2023-07-08 | ENDED | HISTORY |
| Stake CAKE → Earn SHAUN | 97 | 56 | cake | SHAUN | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=28530987; config:finishedPools | 2023-05-10 → 2023-05-25 | ARCHIVE | ARCHIVE |
| Stake CAKE → Earn XCEO | 98 | 56 | cake | XCEO | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=28608333; config:finishedPools | 2023-05-18 → 2023-05-28 | ARCHIVE | ARCHIVE |
| Stake CAKE → Earn RZ4 | 99 | 56 | cake | RZ4 | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=29925052 | 2023-07-12 → 2023-07-13 | ENDED | HISTORY |
| Stake CAKE → Earn MONGBNB | 100 | 56 | cake | MongBNB | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=28780733 | 2023-05-19 → 2023-06-03 | ENDED | HISTORY |
| Stake CAKE → Earn BART | 101 | 56 | cake | BART | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=29062514; config:finishedPools | 2023-05-21 → 2023-06-13 | ARCHIVE | ARCHIVE |
| Stake CAKE → Earn EYED | 102 | 56 | cake | EYED | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=97500940 | 2025-08-13 → 2026-05-10 | ENDED | HISTORY |
| Stake CAKE → Earn PORN | 103 | 56 | cake | PORN | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=28803026 | 2023-05-25 → 2023-06-04 | ENDED | HISTORY |
| Stake CAKE → Earn EDENX | 104 | 56 | cake | EDENX | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=29160039 | 2023-06-01 → 2023-06-16 | ENDED | HISTORY |
| Stake CAKE → Earn PRP | 105 | 56 | cake | PRP | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=29016039 | 2023-06-01 → 2023-06-11 | ENDED | HISTORY |
| Stake CAKE → Earn HUGO | 106 | 56 | cake | HUGO | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=29071022 | 2023-06-03 → 2023-06-13 | ENDED | HISTORY |
| Stake CAKE → Earn GOGU | 107 | 56 | cake | GOGU | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=29071022 | 2023-06-03 → 2023-06-13 | ENDED | HISTORY |
| Stake CAKE → Earn POP | 108 | 56 | cake | POP | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=99855280 | 2026-03-30 → 2026-05-22 | ENDED | HISTORY |
| Stake CAKE → Earn SUP | 109 | 56 | cake | SUP | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=99977284 | 2026-03-30 → 2026-05-23 | ENDED | HISTORY |
| Stake CAKE → Earn JABA | 110 | 56 | cake | jaba | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=29817364 | 2023-06-19 → 2023-07-09 | ENDED | HISTORY |
| Stake CAKE → Earn LSPHERE | 111 | 56 | cake | lsphere | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=30217038 | 2023-07-20 → 2023-07-23 | ENDED | HISTORY |
| Stake CAKE → Earn CUBY | 112 | 56 | cake | cuby | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=33774424 | 2023-11-04 → 2023-11-24 | ENDED | HISTORY |
| Stake CAKE → Earn ROCKET | 113 | 56 | cake | rocket | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=32521115 | 2023-07-13 → 2023-10-11 | ENDED | HISTORY |
| Stake CAKE → Earn SKID | 114 | 56 | cake | skid | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=30694812 | 2023-08-04 → 2023-08-09 | ENDED | HISTORY |
| Stake CAKE → Earn AXPE | 115 | 56 | cake | axpe | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=30587476 | 2023-07-31 → 2023-08-05 | ENDED | HISTORY |
| Stake CAKE → Earn FLY | 116 | 56 | cake | fly | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=29952082 | 2023-07-04 → 2023-07-14 | ENDED | HISTORY |
| Stake CAKE → Earn VIBRA | 117 | 56 | cake | vibra | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=44304978 | 2024-08-12 → 2024-11-25 | ENDED | HISTORY |
| Stake CAKE → Earn BOAI | 118 | 56 | cake | boai | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=33261533 | 2023-10-30 → 2023-11-06 | ENDED | HISTORY |
| Stake CAKE → Earn AARON | 119 | 56 | cake | aaron | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=99398313 | 2025-05-10 → 2026-05-20 | ENDED | HISTORY |
| Stake CAKE → Earn PCO | 120 | 56 | cake | pco | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=30190603 | 2023-07-21 → 2023-07-22 | ENDED | HISTORY |
| Stake CAKE → Earn MONG2 | 121 | 56 | cake | mong2 | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=30217511 | 2023-07-07 → 2023-07-23 | ENDED | HISTORY |
| Stake CAKE → Earn TEENY | 122 | 56 | cake | teeny | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=30326554 | 2023-07-24 → 2023-07-27 | ENDED | HISTORY |
| Stake CAKE → Earn CHAME | 123 | 56 | cake | chame | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=30304197 | 2023-07-10 → 2023-07-26 | ENDED | HISTORY |
| Stake CAKE → Earn PTC | 124 | 56 | cake | ptc | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=30591545 | 2023-08-01 → 2023-08-05 | ENDED | HISTORY |
| Stake CAKE → Earn BODE | 125 | 56 | cake | bode | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=30563297 | 2023-08-01 → 2023-08-04 | ENDED | HISTORY |
| Stake CAKE → Earn WDT | 126 | 56 | cake | wdt | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=30987927 | 2023-08-14 → 2023-08-19 | ENDED | HISTORY |
| Stake CAKE → Earn YATINU | 127 | 56 | cake | yatinu | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=30447903 | 2023-07-21 → 2023-07-31 | ENDED | HISTORY |
| Stake CAKE → Earn RAKY | 128 | 56 | cake | raky | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=97477282 | 2026-03-30 → 2026-05-10 | ENDED | HISTORY |
| Stake CAKE → Earn MOB | 129 | 56 | cake | mob | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=30683394 | 2023-07-24 → 2023-08-08 | ENDED | HISTORY |
| Stake CAKE → Earn YD | 130 | 56 | cake | yd | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=95483928 | 2025-07-27 → 2026-04-30 | ENDED | HISTORY |
| Stake CAKE → Earn COCK | 131 | 56 | cake | cock | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=31137479 | 2023-08-20 → 2023-08-24 | ENDED | HISTORY |
| Stake CAKE → Earn ALTER | 132 | 56 | cake | alter | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=30217843 | 2023-07-23 → 2023-07-23 | ENDED | HISTORY |
| Stake CAKE → Earn RDRS | 133 | 56 | cake | rdrs | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=31915767 | 2023-08-11 → 2023-09-20 | ENDED | HISTORY |
| Stake CAKE → Earn TRT | 134 | 56 | cake | trt | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=31447536 | 2023-08-05 → 2023-09-04 | ENDED | HISTORY |
| Stake CAKE → Earn APEMAX | 135 | 56 | cake | apemax | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=31137755 | 2023-08-20 → 2023-08-24 | ENDED | HISTORY |
| Stake CAKE → Earn PEPECB | 136 | 56 | cake | pepecb | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=32998954 | 2023-10-18 → 2023-10-28 | ENDED | HISTORY |
| Stake CAKE → Earn CHOCO | 137 | 56 | cake | choco | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=30996680 | 2023-08-19 → 2023-08-19 | ENDED | HISTORY |
| Stake CAKE → Earn AGAPE | 138 | 56 | cake | agape | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=31414565 | 2023-08-27 → 2023-09-03 | ENDED | HISTORY |
| Stake CAKE → Earn CAT | 139 | 56 | cake | cat | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=31470916 | 2023-09-05 → 2023-09-05 | ENDED | HISTORY |
| Stake CAKE → Earn ICN | 140 | 56 | cake | icn | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=32162873 | 2023-09-26 → 2023-09-29 | ENDED | HISTORY |
| Stake CAKE → Earn DOCSWAP | 141 | 56 | cake | docswap | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=34475426 | 2023-09-09 → 2023-12-19 | ENDED | HISTORY |
| Stake CAKE → Earn AGAPEAI | 142 | 56 | cake | agapeai | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=32106621 | 2023-09-12 → 2023-09-27 | ENDED | HISTORY |
| Stake CAKE → Earn SAFO | 143 | 56 | cake | safo | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=33553807 | 2023-11-12 → 2023-11-16 | ENDED | HISTORY |
| Stake CAKE → Earn M420 | 144 | 56 | cake | m420 | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=35083925 | 2024-01-02 → 2024-01-09 | ENDED | HISTORY |
| Stake CAKE → Earn CLAN | 145 | 56 | cake | clan | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=32397472 | 2023-10-05 → 2023-10-07 | ENDED | HISTORY |
| Stake CAKE → Earn RARI | 146 | 56 | cake | rari | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=98577284 | 2026-03-30 → 2026-05-16 | ENDED | HISTORY |
| Stake CAKE → Earn SHIFO | 147 | 56 | cake | shifo | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=32449683 | 2023-10-06 → 2023-10-09 | ENDED | HISTORY |
| Stake CAKE → Earn MIX2 | 148 | 56 | cake | mix2 | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=32449683 | 2023-10-06 → 2023-10-09 | ENDED | HISTORY |
| Stake CAKE → Earn CHC | 149 | 56 | cake | chc | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=33920572 | 2023-11-23 → 2023-11-29 | ENDED | HISTORY |
| Stake CAKE → Earn CRYSTALS | 150 | 56 | cake | crystals | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=32075509 | 2023-09-26 → 2023-09-26 | ENDED | HISTORY |
| Stake CAKE → Earn DRAI | 151 | 56 | cake | drai | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=34667190 | 2023-12-22 → 2023-12-25 | ENDED | HISTORY |
| Stake CAKE → Earn DEENCOIN | 152 | 56 | cake | deencoin | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=43320926 | 2024-09-15 → 2024-10-21 | ENDED | HISTORY |
| Stake CAKE → Earn PSPAY | 153 | 56 | cake | pspay | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=33060969 | 2023-10-25 → 2023-10-30 | ENDED | HISTORY |
| Stake CAKE → Earn CLOWNS | 154 | 56 | cake | clowns | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=33062157 | 2023-10-26 → 2023-10-30 | ENDED | HISTORY |
| Stake CAKE → Earn HADA | 155 | 56 | cake | hada | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=33366851 | 2023-11-08 → 2023-11-10 | ENDED | HISTORY |
| Stake CAKE → Earn CAVEA | 156 | 56 | cake | cavea | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=99679440 | 2026-03-30 → 2026-05-22 | ENDED | HISTORY |
| Stake CAKE → Earn CBNB | 157 | 56 | cake | cbnb | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=41350954 | 2023-10-18 → 2024-08-14 | ENDED | HISTORY |
| Stake CAKE → Earn GECK | 158 | 56 | cake | geck | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=33032984 | 2023-10-24 → 2023-10-29 | ENDED | HISTORY |
| Stake CAKE → Earn NGD | 159 | 56 | cake | ngd | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=33068194 | 2023-10-10 → 2023-10-30 | ENDED | HISTORY |
| Stake CAKE → Earn CMC | 160 | 56 | cake | cmc | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=32937883 | 2023-10-11 → 2023-10-26 | ENDED | HISTORY |
| Stake CAKE → Earn WFX | 161 | 56 | cake | wfx | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=33001129 | 2023-10-23 → 2023-10-28 | ENDED | HISTORY |
| Stake CAKE → Earn BGCAT | 162 | 56 | cake | bgcat | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=33652972 | 2023-11-17 → 2023-11-20 | ENDED | HISTORY |
| Stake CAKE → Earn VOC | 163 | 56 | cake | voc | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=33175435 | 2023-11-01 → 2023-11-03 | ENDED | HISTORY |
| Stake CAKE → Earn XRPGROW | 164 | 56 | cake | xrpgrow | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=32944329 | 2023-10-19 → 2023-10-26 | ENDED | HISTORY |
| Stake CAKE → Earn RICKINU | 165 | 56 | cake | rickinu | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=32988589 | 2023-10-22 → 2023-10-28 | ENDED | HISTORY |
| Stake CAKE → Earn FUGC | 166 | 56 | cake | fugc | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=32597005 | 2023-10-14 → 2023-10-14 | ENDED | HISTORY |
| Stake CAKE → Earn CPEPE | 167 | 56 | cake | cpepe | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=33322270 | 2023-10-24 → 2023-11-08 | ENDED | HISTORY |
| Stake CAKE → Earn ESSO | 168 | 56 | cake | esso | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=32940124 | 2023-10-25 → 2023-10-26 | ENDED | HISTORY |
| Stake CAKE → Earn CUSDT | 169 | 56 | cake | cusdt | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=41805746 | 2024-07-26 → 2024-08-30 | ENDED | HISTORY |
| Stake CAKE → Earn CXRP | 170 | 56 | cake | cxrp | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=41882971 | 2024-07-03 → 2024-09-01 | ENDED | HISTORY |
| Stake CAKE → Earn PIPI | 171 | 56 | cake | pipi | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=33275834 | 2023-11-04 → 2023-11-07 | ENDED | HISTORY |
| Stake CAKE → Earn TOTO | 172 | 56 | cake | toto | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=33333434 | 2023-11-04 → 2023-11-09 | ENDED | HISTORY |
| Stake CAKE → Earn PEPEBURNV2 | 173 | 56 | cake | pepeburnv2 | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=34501055 | 2023-11-24 → 2023-12-19 | ENDED | HISTORY |
| Stake CAKE → Earn CHONKY | 174 | 56 | cake | chonky | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=33862753 | 2023-11-19 → 2023-11-27 | ENDED | HISTORY |
| Stake CAKE → Earn BKP | 175 | 56 | cake | bkp | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=33892700 | 2023-11-20 → 2023-11-28 | ENDED | HISTORY |
| Stake CAKE → Earn DXR | 176 | 56 | cake | dxr | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=35830438 | 2024-01-24 → 2024-02-04 | ENDED | HISTORY |
| Stake CAKE → Earn DBU | 177 | 56 | cake | dbu | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=33823022 | 2023-11-24 → 2023-11-26 | ENDED | HISTORY |
| Stake CAKE → Earn LONE | 178 | 56 | cake | lone | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=35083925 | 2024-01-02 → 2024-01-09 | ENDED | HISTORY |
| Stake CAKE → Earn SLAFAC | 179 | 56 | cake | slafac | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=35108146 | 2024-01-06 → 2024-01-10 | ENDED | HISTORY |
| Stake CAKE → Earn OTL | 180 | 56 | cake | otl | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=34380538 | 2023-12-08 → 2023-12-15 | ENDED | HISTORY |
| Stake CAKE → Earn GXM | 181 | 56 | cake | gxm | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=34505392 | 2023-12-17 → 2023-12-20 | ENDED | HISTORY |
| Stake CAKE → Earn NODES7 | 182 | 56 | cake | nodes7 | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=35234116 | 2023-12-17 → 2024-01-14 | ENDED | HISTORY |
| Stake CAKE → Earn HAAGA420 | 183 | 56 | cake | haaga420 | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=34749558 | 2023-12-23 → 2023-12-28 | ENDED | HISTORY |
| Stake CAKE → Earn EFCR | 184 | 56 | cake | efcr | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=34752638 | 2023-12-23 → 2023-12-28 | ENDED | HISTORY |
| Stake CAKE → Earn TAH | 185 | 56 | cake | tah | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=35098785 | 2024-01-02 → 2024-01-09 | ENDED | HISTORY |
| Stake CAKE → Earn BBUCK | 186 | 56 | cake | bbuck | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=35322754 | 2024-01-03 → 2024-01-17 | ENDED | HISTORY |
| Stake CAKE → Earn GROKLABS | 187 | 56 | cake | groklabs | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=35772485 | 2024-01-26 → 2024-02-02 | ENDED | HISTORY |
| Stake CAKE → Earn WZM | 188 | 56 | cake | wzm | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=35946049 | 2024-02-06 → 2024-02-08 | ENDED | HISTORY |
| Stake CAKE → Earn MEMEMINT | 189 | 56 | cake | mememint | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=37478975 | 2024-03-26 → 2024-04-01 | ENDED | HISTORY |
| Stake CAKE → Earn MLB | 190 | 56 | cake | mlb | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=36174422 | 2024-02-14 → 2024-02-16 | ENDED | HISTORY |
| Stake CAKE → Earn NBD | 191 | 56 | cake | nbd | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=36267999 | 2024-02-17 → 2024-02-19 | ENDED | HISTORY |
| Stake CAKE → Earn TOR | 192 | 56 | cake | tor | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=36724078 | 2024-03-05 → 2024-03-06 | ENDED | HISTORY |
| Stake CAKE → Earn SGROK | 193 | 56 | cake | sgrok | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=36567917 | 2024-02-24 → 2024-02-29 | ENDED | HISTORY |
| Stake CAKE → Earn LOVE69 | 194 | 56 | cake | love69 | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=36582121 | 2024-02-23 → 2024-03-01 | ENDED | HISTORY |
| Stake CAKE → Earn GROKLABS2 | 195 | 56 | cake | groklabs2 | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=36620922 | 2024-02-26 → 2024-03-02 | ENDED | HISTORY |
| Stake CAKE → Earn RAO | 196 | 56 | cake | rao | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=36700729 | 2024-02-29 → 2024-03-05 | ENDED | HISTORY |
| Stake CAKE → Earn DC4 | 197 | 56 | cake | dc4 | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=37104983 | 2024-03-11 → 2024-03-19 | ENDED | HISTORY |
| Stake CAKE → Earn XEX | 198 | 56 | cake | xex | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=40009572 | 2024-06-18 → 2024-06-28 | ENDED | HISTORY |
| Stake CAKE → Earn MSOC | 199 | 56 | cake | msoc | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=37280030 | 2024-03-25 → 2024-03-25 | ENDED | HISTORY |
| Stake CAKE → Earn NYNYC | 200 | 56 | cake | nynyc | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=38164075 | 2024-04-23 → 2024-04-25 | ENDED | HISTORY |
| Stake CAKE → Earn FR | 201 | 56 | cake | fr | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=37785726 | 2024-04-10 → 2024-04-12 | ENDED | HISTORY |
| Stake CAKE → Earn FARM | 202 | 56 | cake | farm | git:e3389a2 (2024-05-02); on-chain:bonusEndBlock=99977284 | 2026-03-30 → 2026-05-23 | ENDED | HISTORY |
| Stake CAKE → Earn BULLSTAR | 203 | 56 | cake | bullstar | git:86ddee1 (2024-05-11); on-chain:bonusEndBlock=38854435 | 2024-05-12 → 2024-05-19 | ENDED | HISTORY |
| Stake CAKE → Earn PLZ | 204 | 56 | cake | plz | git:02dfe47 (2024-05-22); on-chain:bonusEndBlock=39172636 | 2024-05-22 → 2024-05-30 | ENDED | HISTORY |
| Stake CAKE → Earn BUTT | 205 | 56 | cake | butt | git:55fb3c4 (2024-05-23); on-chain:bonusEndBlock=39213122 | 2024-05-23 → 2024-05-31 | ENDED | HISTORY |
| Stake CAKE → Earn BABYFOX | 206 | 56 | cake | babyfox | git:6dfba93 (2024-05-24); on-chain:bonusEndBlock=39317228 | 2024-06-03 → 2024-06-04 | ENDED | HISTORY |
| Stake CAKE → Earn MGC | 207 | 56 | cake | mgc | git:7b45d6e (2024-05-31); on-chain:bonusEndBlock=39199313 | 2024-05-31 → 2024-05-31 | ENDED | HISTORY |
| Stake CAKE → Earn JIMBO | 208 | 56 | cake | jimbo | git:4d07f82 (2024-06-03); on-chain:bonusEndBlock=39909131 | 2024-06-18 → 2024-06-25 | ENDED | HISTORY |
| Stake CAKE → Earn WKFX | 209 | 56 | cake | wkfx | git:f0d69a2 (2024-06-05); on-chain:bonusEndBlock=40560999 | 2024-06-30 → 2024-07-17 | ENDED | HISTORY |
| Stake CAKE → Earn ARCT | 210 | 56 | cake | arct | git:c3d700b (2024-06-08); on-chain:bonusEndBlock=39438281 | 2024-06-08 → 2024-06-08 | ENDED | HISTORY |
| Stake CAKE → Earn AIVOLD | 211 | 56 | cake | aivold | git:d2c56ca (2024-07-11); on-chain:bonusEndBlock=41607575 | 2024-08-23 → 2024-08-23 | ENDED | HISTORY |
| Stake CAKE → Earn IFNET | 212 | 56 | cake | ifnet | git:f94cb06 (2024-07-17); on-chain:bonusEndBlock=40830326 | 2024-07-26 → 2024-07-27 | ENDED | HISTORY |
| Stake CAKE → Earn TRUMP | 213 | 56 | cake | trump | git:0d2f93e (2024-07-22); on-chain:bonusEndBlock=40981143 | 2024-07-22 → 2024-08-01 | ENDED | HISTORY |
| Stake CAKE → Earn GODEN | 214 | 56 | cake | goden | git:616a134 (2024-08-05); on-chain:bonusEndBlock=41678497 | 2024-08-05 → 2024-08-25 | ENDED | HISTORY |
| Stake CAKE → Earn CSOL | 215 | 56 | cake | csol | git:a1e979f (2024-08-13); on-chain:bonusEndBlock=41330880 | 2024-08-13 → 2024-08-13 | ENDED | HISTORY |
| Stake CAKE → Earn AIVNEW | 216 | 56 | cake | aivnew | git:29828b3 (2024-08-16); on-chain:bonusEndBlock=42328935 | 2024-08-17 → 2024-09-17 | ENDED | HISTORY |
| Stake CAKE → Earn TONGUE | 217 | 56 | cake | tongue | git:a392943 (2024-08-31); on-chain:bonusEndBlock=99679999 | 2026-03-30 → 2026-05-22 | ENDED | HISTORY |
| Stake CAKE → Earn BABYMARCO | 218 | 56 | cake | babymarco | git:c418c33 (2024-09-01); on-chain:bonusEndBlock=95483928 | 2025-07-27 → 2026-04-30 | ENDED | HISTORY |
| Stake CAKE → Earn WAX | 219 | 56 | cake | wax | git:c5a1d31 (2024-09-05); on-chain:bonusEndBlock=42423023 | 2024-09-05 → 2024-09-20 | ENDED | HISTORY |
| Stake CAKE → Earn NESG | 220 | 56 | cake | nesg | git:9282ea9 (2024-09-12); on-chain:bonusEndBlock=42914457 | 2024-09-12 → 2024-10-07 | ENDED | HISTORY |
| Stake CAKE → Earn USDCG | 221 | 56 | cake | usdcg | git:3768488 (2024-09-13); on-chain:bonusEndBlock=42267086 | 2024-09-13 → 2024-09-15 | ENDED | HISTORY |
| Stake CAKE → Earn DEENCOIN | 222 | 56 | cake | deencoin | git:c8a6ce8 (2024-09-15); on-chain:bonusEndBlock=43320926 | 2024-09-15 → 2024-10-21 | ENDED | HISTORY |
| Stake CAKE → Earn MOGUL | 223 | 56 | cake | mogul | git:d071475 (2024-09-20); on-chain:bonusEndBlock=43315186 | 2024-10-20 → 2024-10-21 | ENDED | HISTORY |
| Stake CAKE → Earn MEL | 224 | 56 | cake | mel | git:adb2b1c (2024-09-21); on-chain:bonusEndBlock=42810207 | 2024-09-20 → 2024-10-04 | ENDED | HISTORY |
| Stake CAKE → Earn CBS | 225 | 56 | cake | cbs | git:f109ca8 (2024-10-21); on-chain:bonusEndBlock=43608829 | 2024-10-21 → 2024-10-31 | ENDED | HISTORY |
| Stake CAKE → Earn GAMEXT | 226 | 56 | cake | gamext | git:ede542d (2024-11-02); on-chain:bonusEndBlock=43983247 | 2024-11-03 → 2024-11-13 | ENDED | HISTORY |
| Stake CAKE → Earn BCX | 227 | 56 | cake | bcx | git:5bf5273 (2024-11-17); on-chain:bonusEndBlock=44352454 | 2024-11-24 → 2024-11-26 | ENDED | HISTORY |
| Stake CAKE → Earn TRAFF | 228 | 56 | cake | traff | git:e08664e (2024-12-10); on-chain:bonusEndBlock=45151056 | 2024-12-10 → 2024-12-24 | ENDED | HISTORY |
| Stake CAKE → Earn SAITA | 229 | 56 | cake | saita | git:9830df0 (2024-12-27); on-chain:bonusEndBlock=45591208 | 2025-01-06 → 2025-01-08 | ENDED | HISTORY |
| Stake CAKE → Earn TENCO | 230 | 56 | cake | tenco | git:58a3541 (2024-12-29); on-chain:bonusEndBlock=46115599 | 2024-12-29 → 2025-01-26 | ENDED | HISTORY |
| Stake CAKE → Earn THEPUG | 231 | 56 | cake | thepug | git:3d7e85c (2025-01-08); on-chain:bonusEndBlock=45637069 | 2025-01-09 → 2025-01-10 | ENDED | HISTORY |
| Stake CAKE → Earn RTIME | 232 | 56 | cake | rtime | git:c2f988f (2025-01-16); on-chain:bonusEndBlock=46837573 | 2025-01-25 → 2025-02-20 | ENDED | HISTORY |
| Stake CAKE → Earn GGFT | 233 | 56 | cake | ggft | git:8f3498f (2025-02-23); on-chain:bonusEndBlock=48707645 | 2025-02-23 → 2025-04-26 | ENDED | HISTORY |
| Stake CAKE → Earn BNBDOG | 234 | 56 | cake | bnbdog | git:c410858 (2025-03-02); on-chain:bonusEndBlock=99679461 | 2026-03-30 → 2026-05-22 | ENDED | HISTORY |
| Stake CAKE → Earn WMN | 235 | 56 | cake | wmn | git:87756be (2025-03-15); on-chain:bonusEndBlock=49327599 | 2025-04-13 → 2025-05-08 | ENDED | HISTORY |
| Stake CAKE → Earn QWRX | 236 | 56 | cake | qwrx | git:0abbe5f (2025-07-28); on-chain:bonusEndBlock=58500940 | 2025-08-13 → 2025-08-22 | ENDED | HISTORY |
| Stake CAKE → Earn QLM | 237 | 56 | cake | qlm | git:2c83833 (2025-10-18); on-chain:bonusEndBlock=66253741 | 2025-10-27 → 2025-10-28 | ENDED | HISTORY |
| Stake CAKE → Earn BLION | 238 | 56 | cake | blion | git:45e7fca (2025-10-18); on-chain:bonusEndBlock=99679400 | 2026-03-30 → 2026-05-22 | ENDED | HISTORY |
| Stake CAKE → Earn ORBE | 239 | 56 | cake | orbe | git:2b1a06b (2025-11-13); on-chain:bonusEndBlock=68028074 | 2025-11-13 → 2025-11-13 | ENDED | HISTORY |
| Stake CAKE → Earn ZANNA | 240 | 56 | cake | zanna | git:599c52b (2025-11-17); on-chain:bonusEndBlock=68555553 | 2025-11-17 → 2025-11-17 | ENDED | HISTORY |

---

## 5. Historical concurrent visibility analysis

### Dated on-chain snapshots (BSC)

| Date | Approx. block | Open pools (incl. MARCO vaults) | Campaign pools open |
| --- | ---: | ---: | ---: |
| 2023-04-08 | 27,154,320 | **30** | 27 |
| 2024-05-02 (repo import) | 38,355,069 | 4 | 1 |
| 2024-05-28 (auto marco commit) | 39,102,206 | 6 | 3 |
| 2024-09-11 (config peak growth) | 42,145,246 | 6 | 3 |
| 2024-12-29 | 45,283,089 | 3 | 0 |
| 2025-11-17 | 68,448,664 | 7 | 4 |
| 2026-06-01 | 101,590,092 | 3 | 0 |

Peak theoretical overlap (all campaigns in config, any era): **29 concurrent campaigns** + 2 permanent ≈ **31** at block ~27,178,243 (**2023-04-08**).

---

## 6. Were 10–15 pools visible at once?

**Verdict: PARTIALLY CONFIRMED**

| Era | Confirmed? | Detail |
| --- | --- | --- |
| **Pre-repo / early BSC (~2023 Q1–Q2)** | **Yes** | 2023-04-08 snapshot: **30 open** (3 MARCO + 27 campaigns) |
| **Melega repo era (2024-05+)** | **No** | Typical **3–7** visible; never 10–15 in dated snapshots |
| **User memory of “10–15”** | **Plausible for 2023** | Aligns with on-chain overlap before repo import |
| **Today** | **No** | 2–3 permanent only on BSC |

**Approximate date range (10+ visible):** **2023-01 → 2023-04** (declining as early campaigns ended).  
**Example pool names at peak (2023-04-08):** VOLT, FBTC, KOALA, ROTTO, GGW, HBIT, SFE, FWC, HSE, TPCV3, XPHX, DOGEUM, HELP + Manual/Auto/Flexible MARCO.

**Insufficient evidence for:** exact daily UI card count (no screenshots); whether Flexible MARCO always counted as separate card.

---

## 7. Truly permanent pools

| Pool | Type | Evidence |
| --- | --- | --- |
| **Manual MARCO** | `sousId 0` sousChef/MasterChef | No `bonusEndBlock` filter in `fetchPools.ts`; live since config import |
| **Auto MARCO** | `VaultKey.CakeVault` composite | `vaultPoolConfig` since `e3389a2`; ops commit `fa0bef2` |
| **Flexible MARCO** | `VaultKey.CakeFlexibleSideVault` | `vaultPoolConfig` since `e3389a2`; conditional UI |

---

## 8. Campaign-based pools

All BSC `sousId ≥ 1` partner pools (stake MARCO → earn partner token):

- Finite `bonusEndBlock` on-chain (~10M block windows common)
- **160** ended campaigns → recommend **HISTORY**
- **78** in `finishedPools` / superseded contracts → recommend **ARCHIVE**
- **0** currently on-chain open on BSC

---

## 9. Pools that should return to human visibility as History

**All 160 ended BSC campaign pools** still in `livePools56` with passed `bonusEndBlock`:

- Show in **History** tab: name, partner token, live period, “Campaign ended” badge
- **No stake CTA**
- Unstake/claim only in **Ended** if user has legacy stake (existing `/pools/history` behaviour)

**Permanent pools** stay in **Live** — do not move to History.

---

## 10. Pools that should remain hidden

| Group | Count | Recommended bucket |
| --- | ---: | --- |
| `finishedPools` deprecated deployments | 78 | **ARCHIVE** (operator inventory only) |
| Duplicate superseded contracts (e.g. early MXMX sousId 1 in finished vs 14 in live) | — | **ARCHIVE** for older entry |

---

## 11. Recommended UI model

| Tab | Contents | Stake CTA? |
| --- | --- | --- |
| **LIVE** | Auto MARCO, Manual MARCO, Flexible MARCO (if applicable) + on-chain open campaigns | Yes |
| **ENDED** | Recently ended; user has stake; unstake/claim | Unstake/claim only |
| **HISTORY** | All past Melega campaigns (read-only catalog with dates, partner, evidence) | **No** |
| **ARCHIVE** | Deprecated/superseded contracts from `finishedPools` | **No** |

Never mix: ended campaigns must not appear in Live because config says `isFinished: false`.

---

## 12. Open questions / missing evidence

1. **No historical UI screenshots** — cannot confirm exact card layout or count users saw.
2. **No deployment logs** — pool launch dates rely on on-chain blocks, not internal ops records.
3. **Pre-2024 MelegaSwap branding** — on-chain pools exist from 2023; rebrand timing not in repo.
4. **Admin bonusEndBlock extensions** — no git record of manual on-chain extensions after deploy.
5. **ETH / Polygon / Base operational history** — partial in `pools-canonical-inventory.json`; not fully git-archived per chain in this pass.
6. **Exact “10–15” user memory** — confirmed for **2023** on-chain overlap; **not** for Melega repo era.

---

## Files created

| File | Description |
| --- | --- |
| `docs/POOLS_OPERATIONAL_HISTORY_RECOVERY.md` | This report |
| `docs/pools-operational-history.json` | Machine-readable annex (243 BSC records + snapshots) |

**Forbidden files untouched.** No application code modified.

---

## Return code

`POOLS_OPERATIONAL_HISTORY_RECOVERY_READY`
