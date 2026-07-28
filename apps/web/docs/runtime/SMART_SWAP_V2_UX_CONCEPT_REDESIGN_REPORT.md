# SMART_SWAP_V2_UX_CONCEPT_REDESIGN_REPORT

**Mission:** `SMART_SWAP_V2_UX_CONCEPT_REDESIGN`  
**Severity:** P0 — Product UX redesign (functionality already proven)  
**Branch:** `smart-swap-v2-ux-concept-redesign`  
**Base:** `smart-swap-ux-redesign-and-home-integration` @ `7ff1ff8f`
**Delivery commit:** `50d573e3`

---

## Concept

Smart Swap is an **execution cockpit**, not a long technical page.

User questions answered in order:

1. What am I swapping? → left form  
2. What route? → horizontal icon route  
3. Why / which source? → Melega Router · Direct Pool / Smart Router / …  
4. What fees? → compact Fee insight  
5. Can I execute? → form CTA + readiness in Details  

---

## Changes (presentation only)

| Area | Change |
| --- | --- |
| Desktop ≥900px | Wider Smart card (~920px): form left / intelligence right |
| Route | Horizontal `[Token] → [Pool] → [Token]` with type labels + execution source |
| Metrics | Expected / Minimum / Impact / Fee / Confidence |
| Insights | Compact Route · Fee · AI cards (≤2 lines) |
| Details | Gas, freshness, diagnostics collapsed |
| Gas UX | Available / Estimating execution cost… / Unavailable + wallet verify |
| Trending | Multi-asset ticker with ↑/↓ % when factual; pair backfill toward ≥10; marquee |
| Home | Single Swap CTA preserved |

**Untouched:** SmartSwapForm execution, Router, calldata, Route/Fee engines, Treasury, KERL, D87, FSC-01.

---

## Validation

- Focused vitest: pass (gas, execution source, trending model, home CTA, accordion SSOT, module 003)
- `next build`: pass  
- Evidence: `apps/web/docs/runtime/smart-swap-v2-ux-concept-redesign/`

---

## Remaining limitations

- Live PNG screenshot packs are source-documented; optional browser capture can follow.
- Trending reaches 10+ only when indexer/pairs supply enough real assets — otherwise honest fewer items / unavailable accents (no fake %).
- Route icons use symbol initials when CDN logos are not wired into the hop viz.

---

## Delivery

Push branch only. No merge. No deploy.
