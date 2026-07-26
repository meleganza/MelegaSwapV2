# SMART_SWAP_UX_REDESIGN_AND_HOME_INTEGRATION_REPORT

**Mission:** `SMART_SWAP_UX_REDESIGN_AND_HOME_INTEGRATION`  
**Severity:** P0 — Product UX refinement after mainnet execution proof  
**Branch:** `smart-swap-ux-redesign-and-home-integration`  
**Base:** `smart-swap-post-mainnet-ux-stability-repair` @ `71273b62`  
**Reference:** Founder Smart Swap UX redesign mockup (information hierarchy, not pixel copy)

---

## Problems solved

1. **Information wall** — Smart transparency no longer stacks four full technical panels. Primary view is route + metrics + compact AI/fee; diagnostics move into a stable accordion.
2. **Verbose Execution Preview** — Compact preview rows (input / expected / min / slippage / impact / fee) with softened gas copy.
3. **Text-only route** — Icon-led vertical route visualization (`SmartSwapVisualRoute`) replaces long path strings as the primary route UI.
4. **Scary gas unavailable** — States: Available / Estimating / Unavailable (muted, wallet-simulation guidance). Not red unless execution is blocked.
5. **Home duplicate Swap messaging** — Confirmed single **Swap** CTA that scrolls + focuses the on-page terminal (Instant|Smart via tabs only).
6. **Mobile hierarchy** — Below 900px Smart stays single-column; no horizontal intel split.
7. **Desktop Smart density** — Smart cockpit can expand (~860px) with form left / intelligence right.

---

## UX decisions

| Decision | Rationale |
| --- | --- |
| Smart is a mode, not a product | Instant \| Smart tabs; same `SmartSwapForm` engine |
| Progressive disclosure | Accordion SSOT via `executionDetailsOpen` |
| Visual route first | Matches founder hierarchy: understand path before numbers |
| Compact metrics (4 cells) | Slippage / impact / fee / confidence above the fold |
| AI ≤ 2 lines | Insight, not essay |
| Fee flow kept, details expandable | Protocol fee → Treasury Runtime → KERL without long copy |
| Modal portal + z=2100 | Preserved from prior certified mission |

---

## Preserved architecture

**Untouched (absolute boundaries):**

- SmartSwapForm execution logic
- Router / calldata
- Route Engine calculations
- Fee Engine / Treasury Runtime / KERL / D87 / FSC-01

**Presentation-only changes** in Smart Studio panels, Trade cockpit layout, Home CTA focus, gas display copy.

---

## Responsive validation

| Viewport | Expectation | Status |
| --- | --- | --- |
| 1440 / 1280 | Smart: form + intel side-by-side when ≥900px | source-certified |
| 390 / 430 | Single column; tabs → inputs → route → metrics → execute → details | source-certified |
| Home mobile | One Swap CTA; terminal accessible; bottom nav unchanged | source-certified |

Evidence: `apps/web/docs/runtime/smart-swap-ux-redesign-and-home-integration/`

---

## Validation summary

- Focused vitest: **22 passed**
- `next build`: **pass**
- Forbidden files: **untouched**
- Trending multi-asset honesty: **preserved** from prior stability mission
- Modal layering: **preserved** (portal + z-index 2100)

---

## Remaining limitations

- Live PNG screenshot pack is documented via before/after READMEs (source + unit + build certified); optional live visual pass can follow.
- Visual route uses symbol initials in circular/pool badges (not full token CDN art in all cases).
- Trending still depends on indexer coverage for multi-asset population.

---

## Delivery

- Push branch only — no merge, no deploy
- Working tree clean after commit
