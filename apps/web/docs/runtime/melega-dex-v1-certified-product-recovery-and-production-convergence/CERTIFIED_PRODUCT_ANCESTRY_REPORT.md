# Certified Product Ancestry Report

## Production fact

At forensics capture, **https://www.melega.finance** was served by Vercel Production deployment **5631594160** at commit **`2a887252`** (`Mission Liquidity V1: Final Integration and Certification`).

This is **not** `origin/main` (`ff6d6179`).

## Mechanism

Mission branches were auto-deployed to Production. Each Liquidity modular tip overwrote the previous Production artifact. The Liquidity V1 tip carries Liquidity 001–008 but still embeds **legacy** Farms / Pools studio screens and pre–Smart-Swap Home CTAs, because Farms V1 / Pools V1 / Smart Swap cumulative tips were never merged into that line.

## Cumulative Smart Swap tip

`95c1cbf4` (route-logo-and-true-trending-repair) **contains** `77ec697b` (final-regression-and-trending-polish). Selected as Smart Swap recovery source.

## Convergence method

Isolated branch based on `2a887252`, then **content restore** (git checkout of certified trees) from:

| Product | Tip |
| --- | --- |
| Farms V1 | `2f834b45` |
| Pools V1 | `99258574` |
| Smart Swap Home/Swap | `95c1cbf4` |
| List Studio | `7a29e691` |
| Passport V1 | `70d2bd19` |

Liquidity V1 modules retained from base. Legacy `views/Pool` body removed from `/liquidity` production mount.
