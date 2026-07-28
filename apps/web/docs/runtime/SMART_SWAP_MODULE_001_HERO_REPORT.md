# Smart Swap Module 001 — Hero

## Final verdict

**SMART_SWAP_MODULE_001_HERO_CERTIFIED**

## Mission

`SMART_SWAP_MODULE_001_HERO`

## Certified base

| Item | Value |
| --- | --- |
| Architecture | `SMART_SWAP_ARCHITECTURE_000_CERTIFIED` |
| Tip | `47892a9d` |
| Global product | `94d4979a` — `MELEGA_DEX_V1_GLOBAL_PRODUCT_CERTIFIED` |
| Branch | `smart-swap-module-001-hero` |

## Scope

Implemented **only** Module 001 Hero.

Not implemented: Route Engine, Execution Preview, Fee Transparency, History, AI Assistance, Analytics, Final Polish.

## Product purpose

Hero explains Smart Swap as intelligent execution **on top of** Melega DEX — improving route visibility, execution transparency, and user confidence.

It does **not** execute trades, calculate new economics, or replace the Router.

## Core message

Smart Swap is a smarter execution experience — not a new exchange, not a guaranteed optimizer, not an AI trader.

Instant Swap and Smart Swap are two experiences over the **same** swap engine (`SmartSwapForm`).

## Geometry (desktop 1440)

| Spec | Value |
| --- | --- |
| Content | 1376px |
| Hero | 260px |
| Columns | 440 · 48 · 480 · 48 · 360 |
| Trust panel | 360×230 |

Live certify: hero **1376×260**, trust **360×230**, artwork **480×230**.

## Copy

- Title: Smart Swap  
- Description: Find better execution routes with transparent pricing, liquidity paths and execution details.  
- Primary CTA: Start Smart Swap → `#smart-swap-execution`  
- Secondary: How It Works → factual `TradeHowItWorksPanel`  
- Trust: Why Smart Swap? — Better Route Visibility · Transparent Fees · Execution Confidence · Non-Custodial Trading  

Forbidden claims absent: best price guaranteed, zero slippage, risk free, guaranteed savings.

## Runtime independence

Hero module has no wallet, Router, quote, liquidity, Treasury, or KERL imports. Mounted above Trade Content; shared engine remains `SmartSwapForm` (untouched).

## Files

| Path | Role |
| --- | --- |
| `views/SmartSwapStudio/modules/smartSwapHeroTokens.ts` | Geometry + copy |
| `views/SmartSwapStudio/modules/SmartSwapHeroModule.tsx` | Hero shell |
| `views/SmartSwapStudio/modules/SmartSwapHeroArtwork.tsx` | Route path artwork |
| `views/SmartSwapStudio/modules/SmartSwapHeroTrustPanel.tsx` | Trust principles |
| `views/Trade/TradeTerminalScreen.tsx` | Mount + How It Works wiring |

## Tests / build / certify

- Vitest Module 001 + Architecture 000 freeze — pass  
- `yarn build` — pass  
- Playwright 1440 / 1024 / 390 / 430 — **CERTIFIED**

## Evidence

`apps/web/docs/runtime/smart-swap-module-001-hero/`

## Mission commit

`f392f4847320739bbb21405607707cca9b5a6595`

## Delivery

Push only. No merge. No deploy. Certification server stopped.

---

**SMART_SWAP_MODULE_001_HERO_CERTIFIED**
