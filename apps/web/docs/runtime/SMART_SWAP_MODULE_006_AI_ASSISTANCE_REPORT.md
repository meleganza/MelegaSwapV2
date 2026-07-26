# Smart Swap Module 006 — AI Assistance

## Final verdict

**SMART_SWAP_MODULE_006_AI_ASSISTANCE_CERTIFIED**

## Mission

`SMART_SWAP_MODULE_006_AI_ASSISTANCE`

## Certified base

| Item | Value |
| --- | --- |
| Module 005 | `SMART_SWAP_MODULE_005_HISTORY_CERTIFIED` tip `e401a8d5` |
| Module 005 mission | `2f210afb` |
| Architecture | `47892a9d` |
| Branch | `smart-swap-module-006-ai-assistance` |

## Scope

Explanation layer only.

- No execution / routing / economic authority  
- No SmartSwapForm / Route Engine / Preview lib / Fee lib edits  
- Optional — never blocks confirmation  
- Grounded explanations from public preview/fee context  

## Ownership

| Concern | Owner |
| --- | --- |
| Explanation / education | Module 006 AI Assistance |
| Routes / quotes / execution | Smart Swap Engine |
| Fees | Canonical fee engine |
| Settlement | Treasury Runtime |
| Economic attribution | KERL |

## Model

`SmartSwapAIAssistance` — contextType, explanation, source, confidence + confidenceReason, generatedAt, freshness, relatedRoute, relatedToken, warnings.

Types: `ROUTE_EXPLANATION` · `PRICE_IMPACT_EXPLANATION` · `LIQUIDITY_EXPLANATION` · `FEE_EXPLANATION` · `ERROR_EXPLANATION`.

Failures (optional): `AI_UNAVAILABLE` · `CONTEXT_UNAVAILABLE` · `INSUFFICIENT_DATA` · `TIMEOUT` · `PARTIAL_CONTEXT`.

Forbidden advisory / guarantee language is rejected.

## UI

Panel after Execution Preview + Fee Transparency inside `SmartSwapExecutionPreviewModule`.

## Library

`apps/web/src/lib/smart-swap-ai-assistance/`

## Evidence

`apps/web/docs/runtime/smart-swap-module-006-ai-assistance/`

## Tests / build

- Vitest Module 006 — pass  
- Freeze guards — pass  
- `yarn build` — see build-summary.json  

## Delivery

Push only. No merge. No deploy. Certification servers stopped.

---

**SMART_SWAP_MODULE_006_AI_ASSISTANCE_CERTIFIED**
