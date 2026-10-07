# Control-flow inventory — before

Mission: `MELEGA-DEX-LINT-CONTROL-FLOW-04`

Baseline SHA: `d775418974e98527965d7691607f2a9a0278bcfd`

## Certified baseline

- Full lint: **1,640 errors / 1,389 warnings**.
- `no-continue`: **339 errors**.
- `no-await-in-loop`: **163 errors**.
- `no-void`: **140 errors**.
- Typecheck: 0 diagnostics.
- Certification: 29 files / 271 tests passed.
- Global TVL deterministic regression: 5/5 passed.
- Boost authority regression: 4 files / 24 tests passed.
- Production build: passed.

## Classification

| Class | Count |
| --- | ---: |
| C1 | 1 |
| C2 | 8 |
| N1 | 105 |
| N2 | 316 |
| N3 | 64 |
| N4 | 83 |
| N5 | 65 |

Findings reviewed: **642**.

| Rule | File:line | Class | Reason |
| --- | --- | --- | --- |
| no-void | apps/web/src/app-shell/components/GlobalSearch.tsx:225 | C2 | Search runtime rejection was detached. Loading stayed true and the rejected import stayed cached. |
| no-void | apps/web/src/app-shell/components/GlobalSearch.tsx:278 | C2 | Search runtime rejection was detached. Loading stayed true and the rejected import stayed cached. |
| no-void | apps/web/src/app-shell/components/GlobalSearch.tsx:282 | C2 | Search runtime rejection was detached. Loading stayed true and the rejected import stayed cached. |
| no-void | apps/web/src/components/ConnectWalletButton.tsx:56 | C2 | Wallet-modal preload rethrows after clearing its cache. Callers detached that rejection, so a failed preload never opened the modal. |
| no-void | apps/web/src/components/ConnectWalletButton.tsx:67 | C2 | Wallet-modal preload rethrows after clearing its cache. Callers detached that rejection, so a failed preload never opened the modal. |
| no-void | apps/web/src/components/ConnectWalletButton.tsx:71 | C2 | Wallet-modal preload rethrows after clearing its cache. Callers detached that rejection, so a failed preload never opened the modal. |
| no-await-in-loop | apps/web/src/components/MarcoWidgets/MarcoConnect.tsx:72 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-void | apps/web/src/components/MarcoWidgets/MarcoConnect.tsx:246 | N3 | Rejection is owned by try/catch, .catch, a toast, or a callee that does not reject. |
| no-void | apps/web/src/components/MarcoWidgets/MarcoReferralCapture.tsx:27 | N3 | Rejection is owned by try/catch, .catch, a toast, or a callee that does not reject. |
| no-void | apps/web/src/components/MarcoWidgets/marcoConnectSession.ts:22 | N5 | void discards a non-promise value. |
| no-void | apps/web/src/components/Menu/UserMenu/NetworkSwitchModal.tsx:182 | N5 | Next.js navigation promise. Cancellation stays with the router. |
| no-void | apps/web/src/components/MyMelega/MyMelegaDrawer.tsx:345 | N5 | Clipboard success is committed only in then. A denied write does not mark the value copied. |
| no-void | apps/web/src/components/NetworkModal/PageNetworkSupportModal.tsx:71 | N3 | Rejection is owned by try/catch, .catch, a toast, or a callee that does not reject. |
| no-void | apps/web/src/components/NetworkSwitcher.tsx:221 | N3 | Rejection is owned by try/catch, .catch, a toast, or a callee that does not reject. |
| no-void | apps/web/src/components/NetworkSwitcher.tsx:294 | N3 | Rejection is owned by try/catch, .catch, a toast, or a callee that does not reject. |
| no-void | apps/web/src/design-system/melega/components/GlobalHeader/MelegaGlobalHeader.tsx:406 | N5 | Next.js navigation promise. Cancellation stays with the router. |
| no-void | apps/web/src/design-system/melega/components/GlobalHeader/MelegaGlobalHeader.tsx:407 | N5 | Next.js navigation promise. Cancellation stays with the router. |
| no-void | apps/web/src/design-system/melega/components/Sidebar/MelegaSidebar.tsx:8 | N5 | void discards a non-promise value. |
| no-await-in-loop | apps/web/src/hooks/restoreEagerWalletSession.ts:24 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-await-in-loop | apps/web/src/hooks/restoreEagerWalletSession.ts:33 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-void | apps/web/src/hooks/useWalletChainId.ts:54 | N3 | Rejection is owned by try/catch, .catch, a toast, or a callee that does not reject. |
| no-void | apps/web/src/hooks/useWalletChainId.ts:79 | N3 | Rejection is owned by try/catch, .catch, a toast, or a callee that does not reject. |
| no-void | apps/web/src/hooks/useWalletChainId.ts:89 | C2 | connector.getProvider rejection was detached, so the chainChanged subscription was skipped. |
| no-continue | apps/web/src/lib/__tests__/treasuryRuntimeDecommission.forbidden.test.ts:47 | N4 | Test or fixture control flow. It does not change production runtime. |
| no-continue | apps/web/src/lib/bsc-indexer/featuredMarkets.ts:182 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/lib/bsc-indexer/featuredMarkets.ts:196 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-await-in-loop | apps/web/src/lib/bsc-indexer/featuredMarkets.ts:209 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-await-in-loop | apps/web/src/lib/bsc-indexer/featuredMarkets.ts:272 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-continue | apps/web/src/lib/bsc-indexer/indexer/candles.ts:43 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/lib/bsc-indexer/indexer/candles.ts:47 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/lib/bsc-indexer/indexer/candles.ts:74 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/lib/bsc-indexer/indexer/canonicalTierPairs.ts:107 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-await-in-loop | apps/web/src/lib/bsc-indexer/indexer/canonicalTierPairs.ts:109 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-continue | apps/web/src/lib/bsc-indexer/indexer/canonicalTierPairs.ts:110 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-await-in-loop | apps/web/src/lib/bsc-indexer/indexer/canonicalTierPairs.ts:112 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-continue | apps/web/src/lib/bsc-indexer/indexer/canonicalTierPairs.ts:113 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-await-in-loop | apps/web/src/lib/bsc-indexer/indexer/canonicalTierPairs.ts:115 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-continue | apps/web/src/lib/bsc-indexer/indexer/canonicalTierPairs.ts:116 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/lib/bsc-indexer/indexer/coldPromotion.ts:92 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/lib/bsc-indexer/indexer/coldPromotion.ts:123 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/lib/bsc-indexer/indexer/coldPromotion.ts:125 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/lib/bsc-indexer/indexer/coldPromotion.ts:170 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/lib/bsc-indexer/indexer/coldPromotion.ts:173 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/lib/bsc-indexer/indexer/coldPromotion.ts:177 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/lib/bsc-indexer/indexer/coldPromotion.ts:214 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/lib/bsc-indexer/indexer/coldPromotion.ts:216 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/lib/bsc-indexer/indexer/coldPromotion.ts:217 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/lib/bsc-indexer/indexer/coldPromotion.ts:220 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/lib/bsc-indexer/indexer/coldPromotion.ts:231 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/lib/bsc-indexer/indexer/coldPromotion.ts:237 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/lib/bsc-indexer/indexer/coldPromotion.ts:245 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/lib/bsc-indexer/indexer/coldPromotion.ts:247 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/lib/bsc-indexer/indexer/coldPromotion.ts:251 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/lib/bsc-indexer/indexer/coverageRanges.ts:38 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/lib/bsc-indexer/indexer/coverageRanges.ts:68 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/lib/bsc-indexer/indexer/farmerParticipantIndex.ts:271 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/lib/bsc-indexer/indexer/farmerParticipantIndex.ts:274 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-await-in-loop | apps/web/src/lib/bsc-indexer/indexer/farmerParticipantIndex.ts:339 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-continue | apps/web/src/lib/bsc-indexer/indexer/indexerOrchestrator.ts:199 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-await-in-loop | apps/web/src/lib/bsc-indexer/indexer/indexerOrchestrator.ts:201 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-continue | apps/web/src/lib/bsc-indexer/indexer/pairSyncEngine.ts:56 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-await-in-loop | apps/web/src/lib/bsc-indexer/indexer/pairSyncEngine.ts:66 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-await-in-loop | apps/web/src/lib/bsc-indexer/indexer/pairSyncEngine.ts:243 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-await-in-loop | apps/web/src/lib/bsc-indexer/indexer/pairSyncEngine.ts:269 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-continue | apps/web/src/lib/bsc-indexer/indexer/pairSyncEngine.ts:278 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-await-in-loop | apps/web/src/lib/bsc-indexer/indexer/pairSyncEngine.ts:299 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-await-in-loop | apps/web/src/lib/bsc-indexer/indexer/pairSyncEngine.ts:325 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-continue | apps/web/src/lib/bsc-indexer/indexer/protocolActivitySync.ts:130 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-await-in-loop | apps/web/src/lib/bsc-indexer/indexer/protocolActivitySync.ts:136 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-continue | apps/web/src/lib/bsc-indexer/indexer/protocolActivitySync.ts:220 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-void | apps/web/src/lib/bsc-indexer/indexer/publicFarmFactoryDiscovery.ts:61 | N5 | void discards a non-promise value. |
| no-continue | apps/web/src/lib/bsc-indexer/indexer/publicFarmFactoryTopics.ts:44 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-await-in-loop | apps/web/src/lib/bsc-indexer/indexer/syncIncremental.ts:84 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-continue | apps/web/src/lib/bsc-indexer/indexer/syncIncremental.ts:96 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/lib/bsc-indexer/indexer/syncIncremental.ts:100 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/lib/bsc-indexer/indexer/syncIncremental.ts:101 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-await-in-loop | apps/web/src/lib/bsc-indexer/indexer/syncIncremental.ts:102 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-await-in-loop | apps/web/src/lib/bsc-indexer/indexer/syncIncremental.ts:125 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-await-in-loop | apps/web/src/lib/bsc-indexer/indexer/tierInventory.ts:185 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-await-in-loop | apps/web/src/lib/bsc-indexer/indexer/tierScheduler.ts:107 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-continue | apps/web/src/lib/bsc-indexer/registry/discoverSmartChefOnChain.ts:60 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-await-in-loop | apps/web/src/lib/bsc-indexer/registry/discoverSmartChefOnChain.ts:176 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-await-in-loop | apps/web/src/lib/bsc-indexer/registry/refreshOnChainRegistry.ts:61 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-continue | apps/web/src/lib/bsc-indexer/registry/refreshOnChainRegistry.ts:62 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-await-in-loop | apps/web/src/lib/bsc-indexer/registry/refreshOnChainRegistry.ts:64 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-await-in-loop | apps/web/src/lib/bsc-indexer/registry/refreshOnChainRegistry.ts:65 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-await-in-loop | apps/web/src/lib/bsc-indexer/registry/refreshOnChainRegistry.ts:66 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-await-in-loop | apps/web/src/lib/bsc-indexer/registry/refreshOnChainRegistry.ts:88 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-await-in-loop | apps/web/src/lib/bsc-indexer/registry/refreshOnChainRegistry.ts:90 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-await-in-loop | apps/web/src/lib/bsc-indexer/registry/refreshOnChainRegistry.ts:99 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-await-in-loop | apps/web/src/lib/bsc-indexer/registry/refreshOnChainRegistry.ts:113 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-continue | apps/web/src/lib/bsc-indexer/rpc/chunkedLogs.ts:122 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-await-in-loop | apps/web/src/lib/bsc-indexer/rpc/chunkedLogs.ts:126 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-await-in-loop | apps/web/src/lib/bsc-indexer/rpc/chunkedLogs.ts:133 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-continue | apps/web/src/lib/bsc-indexer/rpc/chunkedLogs.ts:143 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-await-in-loop | apps/web/src/lib/bsc-indexer/rpc/chunkedLogs.ts:146 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-continue | apps/web/src/lib/bsc-indexer/rpc/chunkedLogs.ts:182 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-await-in-loop | apps/web/src/lib/bsc-indexer/rpc/chunkedLogs.ts:185 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-await-in-loop | apps/web/src/lib/bsc-indexer/rpc/chunkedLogs.ts:235 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-await-in-loop | apps/web/src/lib/bsc-indexer/rpc/chunkedLogs.ts:244 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-await-in-loop | apps/web/src/lib/bsc-indexer/rpc/chunkedLogs.ts:249 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-await-in-loop | apps/web/src/lib/bsc-indexer/rpc/chunkedLogs.ts:278 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-await-in-loop | apps/web/src/lib/bsc-indexer/rpc/chunkedLogs.ts:287 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-await-in-loop | apps/web/src/lib/bsc-indexer/rpc/chunkedLogs.ts:320 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-await-in-loop | apps/web/src/lib/bsc-indexer/rpc/chunkedLogs.ts:325 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-await-in-loop | apps/web/src/lib/bsc-indexer/rpc/chunkedLogs.ts:338 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-continue | apps/web/src/lib/bsc-indexer/rpc/chunkedLogs.ts:358 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/lib/bsc-indexer/rpc/chunkedLogs.ts:362 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-await-in-loop | apps/web/src/lib/bsc-indexer/rpc/scanBlockRange.ts:23 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-await-in-loop | apps/web/src/lib/bsc-indexer/rpc/scanBlockRange.ts:56 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-await-in-loop | apps/web/src/lib/bsc-indexer/rpc/scanBlockRange.ts:69 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-continue | apps/web/src/lib/bsc-indexer/rpc/scanBlockRange.ts:85 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-await-in-loop | apps/web/src/lib/bsc-indexer/server/loadTierMetricsSnapshot.ts:61 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-await-in-loop | apps/web/src/lib/bsc-indexer/storage/index.ts:96 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-await-in-loop | apps/web/src/lib/bsc-indexer/storage/index.ts:99 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-continue | apps/web/src/lib/canonical-token-registry/buildCanonicalTokenRegistry.ts:37 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/lib/canonical-token-registry/buildCanonicalTokenRegistry.ts:79 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/lib/canonical-token-registry/buildCanonicalTokenRegistry.ts:81 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/lib/canonical-token-registry/buildCanonicalTokenRegistry.ts:125 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/lib/canonical-token-registry/buildCanonicalTokenRegistry.ts:127 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/lib/data-truth/farmConfigPreviewCards.ts:92 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/lib/data-truth/farmConfigPreviewCards.ts:122 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/lib/data-truth/globalYieldInventory.ts:68 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/lib/data-truth/globalYieldInventory.ts:69 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/lib/data-truth/globalYieldInventory.ts:70 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/lib/data-truth/globalYieldInventory.ts:72 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/lib/data-truth/globalYieldInventory.ts:75 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/lib/data-truth/globalYieldInventory.ts:76 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/lib/data-truth/globalYieldInventory.ts:77 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/lib/data-truth/liveInventoryCounts.ts:61 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/lib/data-truth/liveInventoryCounts.ts:62 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/lib/data-truth/multichainPositions.ts:15 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/lib/data-truth/poolConfigPreviewCards.ts:24 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/lib/data-truth/poolConfigPreviewCards.ts:25 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/lib/data-truth/poolConfigPreviewCards.ts:99 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-void | apps/web/src/lib/deployment-orchestrator/founderExecutionSession.ts:125 | N5 | void discards a non-promise value. |
| no-continue | apps/web/src/lib/deployment-orchestrator/founderLbSession.ts:401 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-void | apps/web/src/lib/deployment-orchestrator/subsystems.ts:46 | N5 | void discards a non-promise value. |
| no-void | apps/web/src/lib/deployment-orchestrator/subsystems.ts:105 | N5 | void discards a non-promise value. |
| no-void | apps/web/src/lib/deployment-orchestrator/subsystems.ts:164 | N5 | void discards a non-promise value. |
| no-continue | apps/web/src/lib/execution-handoff-consumer/__tests__/offline-e2e-dry-run-fixture.test.ts:186 | N4 | Test or fixture control flow. It does not change production runtime. |
| no-continue | apps/web/src/lib/execution-tracker/tracker.ts:234 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/lib/execution-tracker/tracker.ts:238 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-await-in-loop | apps/web/src/lib/featured-placement/orderStore.ts:117 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-await-in-loop | apps/web/src/lib/global-liquidity/server.ts:122 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-continue | apps/web/src/lib/global-liquidity/server.ts:127 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-await-in-loop | apps/web/src/lib/global-liquidity/server.ts:142 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-await-in-loop | apps/web/src/lib/global-liquidity/server.ts:180 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-continue | apps/web/src/lib/global-liquidity/server.ts:230 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/lib/global-liquidity/server.ts:231 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/lib/global-liquidity/server.ts:236 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/lib/global-search/searchGlobal.ts:121 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/lib/global-search/searchGlobal.ts:126 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-await-in-loop | apps/web/src/lib/liquidity-builder-indexer/sync.ts:133 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-await-in-loop | apps/web/src/lib/liquidity-builder-indexer/sync.ts:157 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-continue | apps/web/src/lib/liquidity-building-runtime/activationGateConsumer.ts:382 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/lib/liquidity-building-runtime/eligible-flow.ts:154 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/lib/marco-bridge/__tests__/arcMainnetLaunch.test.ts:134 | N4 | Test or fixture control flow. It does not change production runtime. |
| no-continue | apps/web/src/lib/marco-bridge/__tests__/arcMainnetLaunch.test.ts:336 | N4 | Test or fixture control flow. It does not change production runtime. |
| no-await-in-loop | apps/web/src/lib/marco-bridge/__tests__/evmSimulation.test.ts:44 | N4 | Test or fixture control flow. It does not change production runtime. |
| no-await-in-loop | apps/web/src/lib/marco-bridge/__tests__/polygonCanaryGate.test.ts:73 | N4 | Test or fixture control flow. It does not change production runtime. |
| no-await-in-loop | apps/web/src/lib/marco-bridge/__tests__/polygonCanaryGate.test.ts:103 | N4 | Test or fixture control flow. It does not change production runtime. |
| no-await-in-loop | apps/web/src/lib/marco-bridge/__tests__/solanaBnbBridge.test.ts:482 | N4 | Test or fixture control flow. It does not change production runtime. |
| no-continue | apps/web/src/lib/marco-bridge/routeAuthority.ts:81 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/lib/marco-bridge/routeAuthority.ts:113 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/lib/marco-bridge/simulate.ts:66 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-await-in-loop | apps/web/src/lib/marco-bridge/simulate.ts:71 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-await-in-loop | apps/web/src/lib/marco-bridge/solanaOftSdk.ts:69 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-await-in-loop | apps/web/src/lib/marco-bridge/solanaOftSdk.ts:232 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-await-in-loop | apps/web/src/lib/marco-bridge/solanaSourceStatus.ts:24 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-continue | apps/web/src/lib/marco-bridge/solanaSourceStatus.ts:29 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-await-in-loop | apps/web/src/lib/marco-bridge/solanaStoreRead.ts:131 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-await-in-loop | apps/web/src/lib/marco-bridge/walletSubmit.ts:85 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-await-in-loop | apps/web/src/lib/marco-bridge/walletSubmit.ts:89 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-await-in-loop | apps/web/src/lib/marco-bridge/walletSubmit.ts:98 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-await-in-loop | apps/web/src/lib/marco-bridge/walletSubmit.ts:481 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-continue | apps/web/src/lib/marco-pay/__tests__/merchantKeyIsolation.test.ts:10 | N4 | Test or fixture control flow. It does not change production runtime. |
| no-await-in-loop | apps/web/src/lib/marco-pay/__tests__/orders.test.ts:253 | N4 | Test or fixture control flow. It does not change production runtime. |
| no-await-in-loop | apps/web/src/lib/marco-pay/clientReadiness.ts:31 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-await-in-loop | apps/web/src/lib/marco-pay/clientReadiness.ts:33 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-await-in-loop | apps/web/src/lib/marco-pay/clientReadiness.ts:35 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-await-in-loop | apps/web/src/lib/marco-pay/orders.ts:185 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-continue | apps/web/src/lib/marco-pay/orders.ts:483 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/lib/marco-pay/orders.ts:485 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-await-in-loop | apps/web/src/lib/marco-pay/orders.ts:487 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-void | apps/web/src/lib/market-data/__tests__/marketDataCertification.test.ts:151 | N4 | Test or fixture control flow. It does not change production runtime. |
| no-await-in-loop | apps/web/src/lib/market-data/bnbUsd.ts:81 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-await-in-loop | apps/web/src/lib/market-data/canonicalMarketSnapshot.ts:70 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-continue | apps/web/src/lib/market-data/projectDexAnalytics.ts:69 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-void | apps/web/src/lib/market-registry/listedProjectsCount.ts:90 | N5 | void discards a non-promise value. |
| no-continue | apps/web/src/lib/market-registry/listedProjectsCount.ts:94 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-await-in-loop | apps/web/src/lib/monetization/trendBoostOrders.ts:157 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-await-in-loop | apps/web/src/lib/project-claims/resolveContractAuthority.ts:88 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-continue | apps/web/src/lib/project-claims/resolveContractAuthority.ts:89 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-await-in-loop | apps/web/src/lib/project-claims/resolveContractAuthority.ts:93 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-continue | apps/web/src/lib/project-claims/resolveContractAuthority.ts:95 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-await-in-loop | apps/web/src/lib/runtime-indexing/rpcLogReader.ts:99 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-await-in-loop | apps/web/src/lib/runtime-indexing/rpcLogReader.ts:130 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/founderDeploymentPackageForkRehearsal.test.ts:104 | N4 | Test or fixture control flow. It does not change production runtime. |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/founderDeploymentPackageForkRehearsal.test.ts:109 | N4 | Test or fixture control flow. It does not change production runtime. |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/founderDeploymentPackageForkRehearsal.test.ts:111 | N4 | Test or fixture control flow. It does not change production runtime. |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/founderDeploymentPackageForkRehearsal.test.ts:116 | N4 | Test or fixture control flow. It does not change production runtime. |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/founderDeploymentPackageForkRehearsal.test.ts:118 | N4 | Test or fixture control flow. It does not change production runtime. |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/founderDeploymentPackageForkRehearsal.test.ts:123 | N4 | Test or fixture control flow. It does not change production runtime. |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/founderDeploymentPackageForkRehearsal.test.ts:166 | N4 | Test or fixture control flow. It does not change production runtime. |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/founderDeploymentPackageForkRehearsal.test.ts:170 | N4 | Test or fixture control flow. It does not change production runtime. |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/founderDeploymentPackageForkRehearsal.test.ts:199 | N4 | Test or fixture control flow. It does not change production runtime. |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/founderDeploymentPackageForkRehearsal.test.ts:202 | N4 | Test or fixture control flow. It does not change production runtime. |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/founderDeploymentPackageForkRehearsal.test.ts:208 | N4 | Test or fixture control flow. It does not change production runtime. |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/founderDeploymentPackageForkRehearsal.test.ts:341 | N4 | Test or fixture control flow. It does not change production runtime. |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/founderDeploymentPackageForkRehearsal.test.ts:403 | N4 | Test or fixture control flow. It does not change production runtime. |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/founderDeploymentPackageForkRehearsal.test.ts:431 | N4 | Test or fixture control flow. It does not change production runtime. |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/immutableRuntimeGate.test.ts:144 | N4 | Test or fixture control flow. It does not change production runtime. |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/immutableRuntimeGate.test.ts:148 | N4 | Test or fixture control flow. It does not change production runtime. |
| no-continue | apps/web/src/lib/smartswap-universal-engine/__tests__/m3EvmMultivenueShadow.test.ts:655 | N4 | Test or fixture control flow. It does not change production runtime. |
| no-continue | apps/web/src/lib/smartswap-universal-engine/__tests__/melegaBscExactQuoteAndBinding.test.ts:336 | N4 | Test or fixture control flow. It does not change production runtime. |
| no-continue | apps/web/src/lib/smartswap-universal-engine/__tests__/netInputQuoteEconomics.test.ts:355 | N4 | Test or fixture control flow. It does not change production runtime. |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/v2BscPublicCutover.test.ts:469 | N4 | Test or fixture control flow. It does not change production runtime. |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/v2ConfirmModalStability.test.tsx:513 | N4 | Test or fixture control flow. It does not change production runtime. |
| no-continue | apps/web/src/lib/smartswap-universal-engine/__tests__/v2ExecutionBinding.test.ts:476 | N4 | Test or fixture control flow. It does not change production runtime. |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/v2FactualPriceImpactLiveDiagnostics.test.ts:45 | N4 | Test or fixture control flow. It does not change production runtime. |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/v2FactualPriceImpactLiveDiagnostics.test.ts:48 | N4 | Test or fixture control flow. It does not change production runtime. |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/v2FactualPriceImpactLiveDiagnostics.test.ts:54 | N4 | Test or fixture control flow. It does not change production runtime. |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/v2FactualPriceImpactReadonly.test.ts:70 | N4 | Test or fixture control flow. It does not change production runtime. |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/v2FactualPriceImpactReadonly.test.ts:94 | N4 | Test or fixture control flow. It does not change production runtime. |
| no-continue | apps/web/src/lib/smartswap-universal-engine/__tests__/v2FactualPriceImpactReadonly.test.ts:110 | N4 | Test or fixture control flow. It does not change production runtime. |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/v2FactualPriceImpactReadonly.test.ts:117 | N4 | Test or fixture control flow. It does not change production runtime. |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/v2RealRouterForkProof.test.ts:459 | N4 | Test or fixture control flow. It does not change production runtime. |
| no-continue | apps/web/src/lib/smartswap-universal-engine/__tests__/v2RealRouterForkProof.test.ts:464 | N4 | Test or fixture control flow. It does not change production runtime. |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/v2RealRouterForkProof.test.ts:466 | N4 | Test or fixture control flow. It does not change production runtime. |
| no-continue | apps/web/src/lib/smartswap-universal-engine/__tests__/v2RealRouterForkProof.test.ts:469 | N4 | Test or fixture control flow. It does not change production runtime. |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/v2RealRouterForkProof.test.ts:472 | N4 | Test or fixture control flow. It does not change production runtime. |
| no-continue | apps/web/src/lib/smartswap-universal-engine/__tests__/v2RealRouterForkProof.test.ts:476 | N4 | Test or fixture control flow. It does not change production runtime. |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/v2RealRouterForkProof.test.ts:480 | N4 | Test or fixture control flow. It does not change production runtime. |
| no-continue | apps/web/src/lib/smartswap-universal-engine/__tests__/v2RealRouterForkProof.test.ts:487 | N4 | Test or fixture control flow. It does not change production runtime. |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/v2RealRouterForkProof.test.ts:488 | N4 | Test or fixture control flow. It does not change production runtime. |
| no-continue | apps/web/src/lib/smartswap-universal-engine/__tests__/v2RealRouterForkProof.test.ts:491 | N4 | Test or fixture control flow. It does not change production runtime. |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/v2RealRouterForkProof.test.ts:544 | N4 | Test or fixture control flow. It does not change production runtime. |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/v2RealRouterForkProof.test.ts:546 | N4 | Test or fixture control flow. It does not change production runtime. |
| no-continue | apps/web/src/lib/smartswap-universal-engine/__tests__/v2RealRouterForkProof.test.ts:547 | N4 | Test or fixture control flow. It does not change production runtime. |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/v2RealRouterForkProof.test.ts:550 | N4 | Test or fixture control flow. It does not change production runtime. |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/v2RealRouterForkProof.test.ts:552 | N4 | Test or fixture control flow. It does not change production runtime. |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/v2RealRouterForkProof.test.ts:557 | N4 | Test or fixture control flow. It does not change production runtime. |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/v2RealRouterForkProof.test.ts:636 | N4 | Test or fixture control flow. It does not change production runtime. |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/v2RealRouterForkProof.test.ts:652 | N4 | Test or fixture control flow. It does not change production runtime. |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/v2RealRouterForkProof.test.ts:683 | N4 | Test or fixture control flow. It does not change production runtime. |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/v2RealRouterForkProof.test.ts:891 | N4 | Test or fixture control flow. It does not change production runtime. |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/v2RealRouterForkProof.test.ts:892 | N4 | Test or fixture control flow. It does not change production runtime. |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/v2RealRouterForkProof.test.ts:974 | N4 | Test or fixture control flow. It does not change production runtime. |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/v2RealRouterForkProof.test.ts:1263 | N4 | Test or fixture control flow. It does not change production runtime. |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/v2RealRouterForkProof.test.ts:1303 | N4 | Test or fixture control flow. It does not change production runtime. |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/v2RealRouterForkProof.test.ts:1329 | N4 | Test or fixture control flow. It does not change production runtime. |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/v2RealRouterForkProof.test.ts:1405 | N4 | Test or fixture control flow. It does not change production runtime. |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/v2RealRouterForkProof.test.ts:1431 | N4 | Test or fixture control flow. It does not change production runtime. |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/v2TransactionPreparation.test.ts:593 | N4 | Test or fixture control flow. It does not change production runtime. |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/v2TransactionPreparation.test.ts:599 | N4 | Test or fixture control flow. It does not change production runtime. |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/v2TransactionPreparation.test.ts:681 | N4 | Test or fixture control flow. It does not change production runtime. |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/v2TransactionPreparation.test.ts:718 | N4 | Test or fixture control flow. It does not change production runtime. |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/v2TransactionPreparation.test.ts:753 | N4 | Test or fixture control flow. It does not change production runtime. |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/v2UserCtaBinding.test.ts:618 | N4 | Test or fixture control flow. It does not change production runtime. |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/v2UserCtaBinding.test.ts:624 | N4 | Test or fixture control flow. It does not change production runtime. |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/evmV2Quote.ts:326 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/evmV2Quote.ts:351 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/evmV2Quote.ts:357 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/evmV2Quote.ts:363 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-void | apps/web/src/lib/smartswap-universal-engine/latency.ts:83 | N5 | void discards a non-promise value. |
| no-void | apps/web/src/lib/smartswap-universal-engine/shadowEconomics.ts:76 | N5 | void discards a non-promise value. |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/v2UserExecutionPlan.ts:779 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/v2UserExecutionPlan.ts:780 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-continue | apps/web/src/lib/treasury-handoff/settlementReferenceStore.ts:25 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/lib/treasury-handoff/settlementReferenceStore.ts:26 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-void | apps/web/src/lib/treasury-handoff/submitSettlementHandoff.ts:62 | N5 | void discards a non-promise value. |
| no-continue | apps/web/src/lib/trending/buildServerTopMoversSnapshot.ts:87 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/lib/trending/buildServerTopMoversSnapshot.ts:89 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/lib/trending/buildServerTopMoversSnapshot.ts:100 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/lib/trending/buildServerTopMoversSnapshot.ts:112 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/lib/trending/observationUniverse.ts:17 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/lib/trending/observationUniverse.ts:18 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/lib/trending/observationUniverse.ts:20 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/lib/trending/observationUniverse.ts:29 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-void | apps/web/src/pages/add/[[...currency]].tsx:17 | N5 | Next.js navigation promise. Cancellation stays with the router. |
| no-void | apps/web/src/pages/api/featured/orders/[orderId].ts:40 | N5 | void discards a non-promise value. |
| no-await-in-loop | apps/web/src/pages/api/indexer/health.ts:52 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-await-in-loop | apps/web/src/pages/api/indexer/liquidity-positions.ts:124 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-await-in-loop | apps/web/src/pages/api/indexer/liquidity-positions.ts:167 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-await-in-loop | apps/web/src/pages/api/indexer/liquidity-positions.ts:193 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-await-in-loop | apps/web/src/pages/api/indexer/liquidity-positions.ts:237 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-void | apps/web/src/pages/api/indexer/run.ts:131 | C2 | Interval lease heartbeat write was detached. A blob rejection became an unhandled rejection during the indexer run. |
| no-await-in-loop | apps/web/src/pages/api/indexer/tier-metrics.ts:58 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-await-in-loop | apps/web/src/pages/api/masterchef/emission.ts:48 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-await-in-loop | apps/web/src/pages/api/masterchef/emission.ts:77 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-void | apps/web/src/pages/claim-project.tsx:15 | N5 | Next.js navigation promise. Cancellation stays with the router. |
| no-void | apps/web/src/pages/project/[slug].tsx:112 | N5 | Next.js navigation promise. Cancellation stays with the router. |
| no-continue | apps/web/src/registry/projects/identity/__tests__/pp-cert.projectOs.test.ts:211 | N4 | Test or fixture control flow. It does not change production runtime. |
| no-continue | apps/web/src/registry/projects/identity/controlCenter/schema.ts:122 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/developer/buildProjectDeveloperDocument.ts:104 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/developer/buildProjectDeveloperDocument.ts:124 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/developer/buildProjectDeveloperDocument.ts:158 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/developer/buildProjectDeveloperDocument.ts:179 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/developer/buildProjectDeveloperDocument.ts:187 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/developer/buildProjectDeveloperDocument.ts:195 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/developer/buildProjectDeveloperDocument.ts:220 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/developer/buildProjectDeveloperDocument.ts:306 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/developer/buildProjectDeveloperDocument.ts:315 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/ecosystem/buildProjectEcosystemDocument.ts:102 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/ecosystem/buildProjectEcosystemDocument.ts:133 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/ecosystem/buildProjectEcosystemDocument.ts:154 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/ecosystem/buildProjectEcosystemDocument.ts:162 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/ecosystem/buildProjectEcosystemDocument.ts:170 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/ecosystem/buildProjectEcosystemDocument.ts:195 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/ecosystem/buildProjectEcosystemDocument.ts:276 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/ecosystem/buildProjectEcosystemDocument.ts:285 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/evidence/buildProjectEvidence.ts:174 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/evidence/buildProjectEvidence.ts:341 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/evidence/buildProjectEvidence.ts:343 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/evidence/buildProjectEvidence.ts:430 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/evidence/buildProjectEvidence.ts:433 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/evidence/conflict.ts:35 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/evidence/conflict.ts:36 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/evidence/conflict.ts:37 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/evidence/conflict.ts:38 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/evidence/conflict.ts:40 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/evidence/conflict.ts:55 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/evidence/conflict.ts:60 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/governance/buildProjectGovernanceDocument.ts:177 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/governance/buildProjectGovernanceDocument.ts:197 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/governance/buildProjectGovernanceDocument.ts:216 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/governance/buildProjectGovernanceDocument.ts:251 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/governance/buildProjectGovernanceDocument.ts:262 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/governance/buildProjectGovernanceDocument.ts:274 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/governance/buildProjectGovernanceDocument.ts:281 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/governance/buildProjectGovernanceDocument.ts:292 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/governance/buildProjectGovernanceDocument.ts:304 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/governance/buildProjectGovernanceDocument.ts:312 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/governance/buildProjectGovernanceDocument.ts:315 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/governance/buildProjectGovernanceDocument.ts:373 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/governance/buildProjectGovernanceDocument.ts:381 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/governance/buildProjectGovernanceDocument.ts:384 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/governance/buildProjectGovernanceDocument.ts:438 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/governance/buildProjectGovernanceDocument.ts:442 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/governance/buildProjectGovernanceDocument.ts:482 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/governance/buildProjectGovernanceDocument.ts:485 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/governance/buildProjectGovernanceDocument.ts:523 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/governance/buildProjectGovernanceDocument.ts:526 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/governance/buildProjectGovernanceDocument.ts:581 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-void | apps/web/src/registry/projects/identity/governance/buildProjectGovernanceDocument.ts:583 | N5 | Synchronous lookup. Returned ids are unused because the governance graph is built separately. |
| no-void | apps/web/src/registry/projects/identity/governance/buildProjectGovernanceDocument.ts:584 | N5 | Synchronous lookup. Returned ids are unused because the governance graph is built separately. |
| no-void | apps/web/src/registry/projects/identity/governance/buildProjectGovernanceDocument.ts:585 | N5 | Synchronous lookup. Returned ids are unused because the governance graph is built separately. |
| no-continue | apps/web/src/registry/projects/identity/governance/buildProjectGovernanceDocument.ts:590 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/governance/buildProjectGovernanceDocument.ts:599 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/governance/buildProjectGovernanceDocument.ts:616 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/growth/buildProjectGrowthDocument.ts:103 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/growth/buildProjectGrowthDocument.ts:123 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/growth/buildProjectGrowthDocument.ts:142 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/growth/buildProjectGrowthDocument.ts:178 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/growth/buildProjectGrowthDocument.ts:199 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/growth/buildProjectGrowthDocument.ts:207 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/growth/buildProjectGrowthDocument.ts:215 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/growth/buildProjectGrowthDocument.ts:250 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/growth/buildProjectGrowthDocument.ts:327 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/growth/buildProjectGrowthDocument.ts:336 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/machine/buildProjectMachineDocument.ts:133 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/machine/buildProjectMachineDocument.ts:140 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/machine/buildProjectMachineDocument.ts:152 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/machine/buildProjectMachineDocument.ts:165 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/machine/buildProjectMachineDocument.ts:169 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/machine/buildProjectMachineDocument.ts:180 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/machine/buildProjectMachineDocument.ts:229 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/machine/buildProjectMachineDocument.ts:233 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/machine/buildProjectMachineDocument.ts:271 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/machine/buildProjectMachineDocument.ts:274 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/machine/buildProjectMachineDocument.ts:321 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/machine/buildProjectMachineDocument.ts:330 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/markets/buildProjectMarketsDocument.ts:278 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/markets/buildProjectMarketsDocument.ts:281 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/markets/buildProjectMarketsDocument.ts:290 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/markets/buildProjectMarketsDocument.ts:291 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/markets/buildProjectMarketsDocument.ts:323 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/markets/buildProjectMarketsDocument.ts:352 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/normalizeProject.ts:116 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/normalizeProject.ts:121 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/normalizeProject.ts:125 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/participation/buildProjectParticipationDocument.ts:60 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/participation/buildProjectParticipationDocument.ts:75 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/participation/buildProjectParticipationDocument.ts:309 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/participation/buildProjectParticipationDocument.ts:310 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-void | apps/web/src/registry/projects/identity/readiness/buildTrustSnapshot.ts:291 | N5 | void discards a non-promise value. |
| no-continue | apps/web/src/registry/projects/identity/readiness/buildWarnings.ts:69 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/readiness/buildWarnings.ts:70 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-void | apps/web/src/registry/projects/identity/readiness/buildWarnings.ts:119 | N5 | void discards a non-promise value. |
| no-void | apps/web/src/registry/projects/identity/readiness/computeReadinessComponents.ts:326 | N5 | void discards a non-promise value. |
| no-continue | apps/web/src/registry/projects/identity/resolveProject.ts:87 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/updates/buildProjectUpdatesDocument.ts:97 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/updates/buildProjectUpdatesDocument.ts:119 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/updates/buildProjectUpdatesDocument.ts:127 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/updates/buildProjectUpdatesDocument.ts:129 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/updates/buildProjectUpdatesDocument.ts:130 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/updates/buildProjectUpdatesDocument.ts:135 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/walletRelationship/buildWalletRelationshipDocument.ts:232 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/walletRelationship/buildWalletRelationshipDocument.ts:284 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/walletRelationship/buildWalletRelationshipDocument.ts:286 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/walletRelationship/buildWalletRelationshipDocument.ts:337 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/walletRelationship/buildWalletRelationshipDocument.ts:338 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/walletRelationship/buildWalletRelationshipDocument.ts:340 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/walletRelationship/buildWalletRelationshipDocument.ts:426 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/walletRelationship/buildWalletRelationshipDocument.ts:427 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/registry/projects/identity/walletRelationship/buildWalletRelationshipDocument.ts:429 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-void | apps/web/src/registry/projects/identity/walletRelationship/buildWalletRelationshipDocument.ts:537 | N5 | void discards a non-promise value. |
| no-await-in-loop | apps/web/src/registry/projects/pending/fetchErc20OnChainIdentity.ts:62 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-void | apps/web/src/views/AuditStudio/AuditCenterV2.tsx:477 | N3 | Rejection is owned by try/catch, .catch, a toast, or a callee that does not reject. |
| no-continue | apps/web/src/views/AuditStudio/buildOfficialContracts.ts:120 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/AuditStudio/buildOfficialContracts.ts:133 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/AuditStudio/buildOfficialContracts.ts:166 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/AuditStudio/buildOfficialContracts.ts:192 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/AuditStudio/buildOfficialContracts.ts:196 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/AuditStudio/buildOfficialContracts.ts:289 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/AuditStudio/buildOfficialContracts.ts:293 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-void | apps/web/src/views/BuildStudio/components/AIManifestPanel.tsx:99 | N5 | Clipboard success is committed only in then. A denied write does not mark the value copied. |
| no-void | apps/web/src/views/BuildStudio/components/BuildMachinePanel.tsx:99 | N5 | Clipboard success is committed only in then. A denied write does not mark the value copied. |
| no-continue | apps/web/src/views/CollectiblesStudio/collectiblesRuntime/useWalletCollectibleOwnership.ts:52 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/CollectiblesStudio/collectiblesRuntime/useWalletCollectibleOwnership.ts:63 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-await-in-loop | apps/web/src/views/CollectiblesStudio/collectiblesRuntime/useWalletCollectibleOwnership.ts:67 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-continue | apps/web/src/views/CommandCenter/commandCenterRuntime/commandCenterPortfolioCutover.ts:371 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/CommandCenter/commandCenterRuntime/commandCenterPortfolioCutover.ts:386 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/CommandCenter/commandCenterRuntime/portfolioActionOrchestration.ts:188 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/CommandCenter/commandCenterRuntime/portfolioActionOrchestration.ts:208 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/CommandCenter/commandCenterRuntime/portfolioAssistantContext.ts:253 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/CommandCenter/commandCenterRuntime/portfolioAssistantContext.ts:261 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/CommandCenter/commandCenterRuntime/portfolioIntelligence.ts:111 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/CommandCenter/commandCenterRuntime/portfolioIntelligence.ts:124 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/CommandCenter/commandCenterRuntime/portfolioIntelligence.ts:145 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/CommandCenter/commandCenterRuntime/portfolioIntelligence.ts:146 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/CommandCenter/commandCenterRuntime/portfolioIntelligence.ts:148 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/CommandCenter/commandCenterRuntime/portfolioIntelligence.ts:172 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/CommandCenter/components/MyPositionsSection.tsx:194 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/CommandCenter/components/PortfolioAssistantPanel.tsx:183 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/CommandCenter/components/portfolioComposition.tsx:86 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-await-in-loop | apps/web/src/views/DeploymentOrchestrator/FounderAvalancheLiveSeedPanel.tsx:76 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-await-in-loop | apps/web/src/views/DeploymentOrchestrator/FounderAvalancheLiveSeedPanel.tsx:82 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-void | apps/web/src/views/DeploymentOrchestrator/FounderAvalancheLiveSeedPanel.tsx:260 | N3 | Rejection is owned by try/catch, .catch, a toast, or a callee that does not reject. |
| no-void | apps/web/src/views/DeploymentOrchestrator/FounderAvalancheV2RouterPanel.tsx:283 | N3 | Rejection is owned by try/catch, .catch, a toast, or a callee that does not reject. |
| no-void | apps/web/src/views/DeploymentOrchestrator/FounderAvalancheV2RouterPanel.tsx:287 | N3 | Rejection is owned by try/catch, .catch, a toast, or a callee that does not reject. |
| no-void | apps/web/src/views/DeploymentOrchestrator/FounderAvalancheV2RouterPanel.tsx:295 | N3 | Rejection is owned by try/catch, .catch, a toast, or a callee that does not reject. |
| no-void | apps/web/src/views/DeploymentOrchestrator/FounderDeploymentPanel.tsx:230 | N3 | Rejection is owned by try/catch, .catch, a toast, or a callee that does not reject. |
| no-void | apps/web/src/views/DeploymentOrchestrator/FounderDeploymentShell.tsx:531 | N3 | Rejection is owned by try/catch, .catch, a toast, or a callee that does not reject. |
| no-await-in-loop | apps/web/src/views/DeploymentOrchestrator/FounderDeploymentShell.tsx:634 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-await-in-loop | apps/web/src/views/DeploymentOrchestrator/FounderDeploymentShell.tsx:635 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-void | apps/web/src/views/DeploymentOrchestrator/FounderDeploymentShell.tsx:808 | N5 | void discards a non-promise value. |
| no-void | apps/web/src/views/DeploymentOrchestrator/FounderDeploymentShell.tsx:809 | N5 | void discards a non-promise value. |
| no-void | apps/web/src/views/DeploymentOrchestrator/FounderDeploymentShell.tsx:810 | N5 | void discards a non-promise value. |
| no-void | apps/web/src/views/DeploymentOrchestrator/FounderDeploymentShell.tsx:1169 | N3 | Rejection is owned by try/catch, .catch, a toast, or a callee that does not reject. |
| no-void | apps/web/src/views/DeploymentOrchestrator/FounderDeploymentShell.tsx:1203 | N3 | Rejection is owned by try/catch, .catch, a toast, or a callee that does not reject. |
| no-void | apps/web/src/views/DeploymentOrchestrator/FounderDeploymentShell.tsx:1220 | N3 | Rejection is owned by try/catch, .catch, a toast, or a callee that does not reject. |
| no-void | apps/web/src/views/FarmsStudio/FarmsStudioScreen.tsx:85 | N5 | Next.js navigation promise. Cancellation stays with the router. |
| no-void | apps/web/src/views/FarmsStudio/FarmsStudioScreen.tsx:96 | N5 | Next.js navigation promise. Cancellation stays with the router. |
| no-void | apps/web/src/views/FarmsStudio/farmsRuntime/useFarmsStakingRuntime.ts:214 | N5 | Next.js navigation promise. Cancellation stays with the router. |
| no-void | apps/web/src/views/FarmsStudio/modules/FarmsExploreFarmCard.tsx:493 | N3 | Rejection is owned by try/catch, .catch, a toast, or a callee that does not reject. |
| no-void | apps/web/src/views/FarmsStudio/modules/FarmsExploreFarmCard.tsx:546 | N3 | Rejection is owned by try/catch, .catch, a toast, or a callee that does not reject. |
| no-void | apps/web/src/views/FarmsStudio/modules/FarmsFinishedFarmCard.tsx:401 | N3 | Rejection is owned by try/catch, .catch, a toast, or a callee that does not reject. |
| no-void | apps/web/src/views/FarmsStudio/modules/PublicFarmFactoryWorkspace.tsx:723 | N3 | Rejection is owned by try/catch, .catch, a toast, or a callee that does not reject. |
| no-void | apps/web/src/views/FarmsStudio/modules/PublicFarmFactoryWorkspace.tsx:944 | N3 | Rejection is owned by try/catch, .catch, a toast, or a callee that does not reject. |
| no-continue | apps/web/src/views/FarmsStudio/modules/buildFarmsExploreFarms.ts:439 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/FarmsStudio/modules/useFarmsWalletPositions.ts:25 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/FarmsStudio/modules/useFarmsWalletPositions.ts:26 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-void | apps/web/src/views/HomeTrade/DexHomeScreen.tsx:599 | N5 | Next.js navigation promise. Cancellation stays with the router. |
| no-void | apps/web/src/views/HomeTrade/DexHomeScreen.tsx:605 | N5 | Next.js navigation promise. Cancellation stays with the router. |
| no-continue | apps/web/src/views/HomeTrade/LiveActivityFeed.tsx:308 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/HomeTrade/LiveActivityFeed.tsx:310 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/HomeTrade/TrendingRibbon.tsx:26 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-void | apps/web/src/views/HomeTrade/__tests__/featuredMarketPolling.test.tsx:14 | N4 | Test or fixture control flow. It does not change production runtime. |
| no-continue | apps/web/src/views/HomeTrade/featuredProjectsCatalog.ts:39 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/HomeTrade/featuredProjectsCatalog.ts:48 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/HomeTrade/formatHomeActivity.ts:65 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/HomeTrade/formatHomeActivity.ts:67 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/HomeTrade/useDexTrendingRankings.ts:61 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-await-in-loop | apps/web/src/views/HomeTrade/useDexTrendingRankings.ts:165 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-await-in-loop | apps/web/src/views/HomeTrade/useDexTrendingRankings.ts:169 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-continue | apps/web/src/views/HomeTrade/useDexTrendingRankings.ts:348 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/HomeTrade/useDexTrendingRankings.ts:350 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/HomeTrade/useDexTrendingRankings.ts:355 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/HomeTrade/useDexTrendingRankings.ts:364 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/HomeTrade/useDexTrendingRankings.ts:639 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/HomeTrade/useDexTrendingRankings.ts:641 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/HomeTrade/useDexTrendingRankings.ts:653 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/HomeTrade/useDexTrendingRankings.ts:666 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/HomeTrade/useDexTrendingRankings.ts:668 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/HomeTrade/useDexTrendingRankings.ts:686 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/HomeTrade/useDexTrendingRankings.ts:688 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/HomeTrade/useDexTrendingRankings.ts:728 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/HomeTrade/useDexTrendingRankings.ts:732 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/HomeTrade/useDexTrendingRankings.ts:765 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/HomeTrade/useDexTrendingRankings.ts:805 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/HomeTrade/useDexTrendingRankings.ts:807 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/HomeTrade/useDexTrendingRankings.ts:809 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/HomeTrade/useDexTrendingRankings.ts:842 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/HomeTrade/useDexTrendingRankings.ts:843 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/HomeTrade/useDexTrendingRankings.ts:845 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/HomeTrade/useDexTrendingRankings.ts:847 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/HomeTrade/useDexTrendingRankings.ts:856 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/HomeTrade/useDexTrendingRankings.ts:884 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/HomeTrade/useDexTrendingRankings.ts:886 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/HomeTrade/useDexTrendingRankings.ts:907 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/HomeTrade/useDexTrendingRankings.ts:936 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/HomeTrade/useDexTrendingRankings.ts:938 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/HomeTrade/useDexTrendingRankings.ts:946 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/HomeTrade/useDexTrendingRankings.ts:962 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/HomeTrade/useDexTrendingRankings.ts:963 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/HomeTrade/useDexTrendingRankings.ts:965 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/HomeTrade/useFeaturedProjectMarkets.ts:66 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-void | apps/web/src/views/ImportExistingToken/components/AIManifestSection.tsx:66 | N5 | Clipboard success is committed only in then. A denied write does not mark the value copied. |
| no-void | apps/web/src/views/ImportExistingToken/importExistingTokenRuntime/useImportExistingTokenRuntime.ts:147 | N3 | Rejection is owned by try/catch, .catch, a toast, or a callee that does not reject. |
| no-continue | apps/web/src/views/LiquidityStudio/__tests__/liquidityV1.finalCertification.test.ts:153 | N4 | Test or fixture control flow. It does not change production runtime. |
| no-void | apps/web/src/views/LiquidityStudio/components/LiquidityStudioChrome.tsx:179 | N5 | Next.js navigation promise. Cancellation stays with the router. |
| no-continue | apps/web/src/views/LiquidityStudio/liquidityBuilding/mapActivityEvents.ts:49 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/LiquidityStudio/liquidityBuilding/mapActivityEvents.ts:62 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/LiquidityStudio/liquidityBuilding/mapActivityEvents.ts:73 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/LiquidityStudio/liquidityBuilding/mapActivityEvents.ts:84 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-void | apps/web/src/views/LiquidityStudio/liquidityBuilding/product/LbReviewView.tsx:369 | N3 | Rejection is owned by try/catch, .catch, a toast, or a callee that does not reject. |
| no-void | apps/web/src/views/LiquidityStudio/liquidityBuilding/useLbOwnerPrograms.ts:33 | N3 | Rejection is owned by try/catch, .catch, a toast, or a callee that does not reject. |
| no-void | apps/web/src/views/LiquidityStudio/liquidityBuilding/useLbProgramDetail.ts:38 | N3 | Rejection is owned by try/catch, .catch, a toast, or a callee that does not reject. |
| no-continue | apps/web/src/views/LiquidityStudio/liquidityBuilding/useLiquidityBuildingCard.ts:179 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/LiquidityStudio/liquidityBuilding/useLiquidityBuildingCard.ts:181 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/LiquidityStudio/liquidityBuilding/useLiquidityBuildingCard.ts:183 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-void | apps/web/src/views/LiquidityStudio/liquidityBuilding/useLiquidityBuildingCard.ts:282 | N5 | Next.js navigation promise. Cancellation stays with the router. |
| no-await-in-loop | apps/web/src/views/LiquidityStudio/liquidityRuntime/__tests__/addLiquidityApprovalLifecycle.test.tsx:324 | N4 | Test or fixture control flow. It does not change production runtime. |
| no-continue | apps/web/src/views/LiquidityStudio/liquidityRuntime/useFactoryLiquidityTokenPairs.ts:112 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/LiquidityStudio/liquidityRuntime/useFactoryLiquidityTokenPairs.ts:117 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/LiquidityStudio/liquidityRuntime/useFactoryLiquidityTokenPairs.ts:130 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/LiquidityStudio/liquidityRuntime/useFactoryLiquidityTokenPairs.ts:132 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/LiquidityStudio/liquidityRuntime/useFactoryLiquidityTokenPairs.ts:143 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/LiquidityStudio/liquidityRuntime/useFactoryLiquidityTokenPairs.ts:154 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/LiquidityStudio/liquidityRuntime/useFactoryLiquidityTokenPairs.ts:172 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-void | apps/web/src/views/LiquidityStudio/liquidityRuntime/useLiquidityMintRuntime.tsx:302 | N5 | Next.js navigation promise. Cancellation stays with the router. |
| no-void | apps/web/src/views/LiquidityStudio/liquidityRuntime/useLiquidityMintRuntime.tsx:835 | N3 | Rejection is owned by try/catch, .catch, a toast, or a callee that does not reject. |
| no-void | apps/web/src/views/LiquidityStudio/liquidityRuntime/useLiquidityMintRuntime.tsx:1024 | N3 | Rejection is owned by try/catch, .catch, a toast, or a callee that does not reject. |
| no-void | apps/web/src/views/LiquidityStudio/liquidityRuntime/useLiquidityMintRuntime.tsx:1047 | N3 | Rejection is owned by try/catch, .catch, a toast, or a callee that does not reject. |
| no-continue | apps/web/src/views/LiquidityStudio/liquidityRuntime/useLiquidityPositions.ts:131 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/LiquidityStudio/liquidityRuntime/useLiquidityPositions.ts:225 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/LiquidityStudio/liquidityRuntime/useLiquidityPositions.ts:249 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/LiquidityStudio/liquidityRuntime/useMultichainLiquidityPositions.ts:146 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/LiquidityStudio/liquidityRuntime/useMultichainLiquidityPositions.ts:161 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/LiquidityStudio/liquidityRuntime/useMultichainLiquidityPositions.ts:202 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-void | apps/web/src/views/LiquidityStudio/modules/LiquidityAddModule.tsx:886 | C1 | Confirm-switch chains .finally onto switchNetworkAsync. The local-switch branch returned a Promise that never settled, so the dialog could not close. |
| no-void | apps/web/src/views/LiquidityStudio/modules/LiquidityMyPositionsModule.tsx:871 | N3 | Rejection is owned by try/catch, .catch, a toast, or a callee that does not reject. |
| no-continue | apps/web/src/views/LiquidityStudio/modules/liquidityPoolDiscoveryModel.ts:17 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-void | apps/web/src/views/LiquidityStudio/onePage/DexLiquiditySnapshot.tsx:440 | N5 | void discards a non-promise value. |
| no-void | apps/web/src/views/LiquidityStudio/onePage/DexLiquiditySnapshot.tsx:441 | N5 | void discards a non-promise value. |
| no-void | apps/web/src/views/LiquidityStudio/onePage/DexLiquiditySnapshot.tsx:453 | N3 | Rejection is owned by try/catch, .catch, a toast, or a callee that does not reject. |
| no-void | apps/web/src/views/LiquidityStudio/onePage/LiquidityBuildingCard.tsx:1242 | N5 | Next.js navigation promise. Cancellation stays with the router. |
| no-void | apps/web/src/views/LiquidityStudio/onePage/LiquidityBuildingCard.tsx:1253 | N5 | Next.js navigation promise. Cancellation stays with the router. |
| no-void | apps/web/src/views/LiquidityStudio/onePage/LiquidityBuildingCard.tsx:1294 | N5 | Next.js navigation promise. Cancellation stays with the router. |
| no-void | apps/web/src/views/LiquidityStudio/onePage/LiquidityBuildingCard.tsx:1375 | N5 | Next.js navigation promise. Cancellation stays with the router. |
| no-void | apps/web/src/views/LiquidityStudio/onePage/LiquidityBuildingCard.tsx:1539 | N5 | Next.js navigation promise. Cancellation stays with the router. |
| no-void | apps/web/src/views/LiquidityStudio/onePage/UnifiedLiquidityPage.tsx:118 | N5 | Next.js navigation promise. Cancellation stays with the router. |
| no-continue | apps/web/src/views/LiquidityStudio/onePage/WalletLiquidityOverview.tsx:374 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/LiquidityStudio/onePage/WalletLiquidityOverview.tsx:380 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/LiquidityStudio/onePage/WalletLiquidityOverview.tsx:488 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/LiquidityStudio/onePage/WalletLiquidityOverview.tsx:489 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-void | apps/web/src/views/ListStudio/ClaimProjectFallback.tsx:40 | N3 | Rejection is owned by try/catch, .catch, a toast, or a callee that does not reject. |
| no-void | apps/web/src/views/ListStudio/ListContractFirstFunnel.tsx:326 | N5 | Next.js navigation promise. Cancellation stays with the router. |
| no-void | apps/web/src/views/ListStudio/ListContractFirstFunnel.tsx:330 | N5 | Next.js navigation promise. Cancellation stays with the router. |
| no-void | apps/web/src/views/ListStudio/ListContractFirstFunnel.tsx:385 | N3 | Rejection is owned by try/catch, .catch, a toast, or a callee that does not reject. |
| no-void | apps/web/src/views/ListStudio/ListContractFirstFunnel.tsx:391 | N3 | Rejection is owned by try/catch, .catch, a toast, or a callee that does not reject. |
| no-void | apps/web/src/views/ListStudio/ListFeaturedCheckout.tsx:316 | N3 | Rejection is owned by try/catch, .catch, a toast, or a callee that does not reject. |
| no-void | apps/web/src/views/ListStudio/ListTrendBoostCheckout.tsx:280 | N3 | Rejection is owned by try/catch, .catch, a toast, or a callee that does not reject. |
| no-void | apps/web/src/views/ListStudio/ListWorkspace.tsx:1105 | N3 | Rejection is owned by try/catch, .catch, a toast, or a callee that does not reject. |
| no-void | apps/web/src/views/ListStudio/ListWorkspace.tsx:1538 | N5 | Next.js navigation promise. Cancellation stays with the router. |
| no-void | apps/web/src/views/ListStudio/ListWorkspace.tsx:1555 | N3 | Rejection is owned by try/catch, .catch, a toast, or a callee that does not reject. |
| no-void | apps/web/src/views/ListStudio/ListWorkspace.tsx:1558 | N3 | Rejection is owned by try/catch, .catch, a toast, or a callee that does not reject. |
| no-void | apps/web/src/views/ListStudio/ListWorkspace.tsx:1563 | N5 | Next.js navigation promise. Cancellation stays with the router. |
| no-void | apps/web/src/views/ListStudio/ListWorkspace.tsx:1593 | N3 | Rejection is owned by try/catch, .catch, a toast, or a callee that does not reject. |
| no-void | apps/web/src/views/ListStudio/createToken/CreateTokenPostCreationFunnel.tsx:310 | N3 | Rejection is owned by try/catch, .catch, a toast, or a callee that does not reject. |
| no-void | apps/web/src/views/ListStudio/useListIntent.ts:22 | N5 | Next.js navigation promise. Cancellation stays with the router. |
| no-void | apps/web/src/views/ListStudio/useListIntent.ts:30 | N5 | Next.js navigation promise. Cancellation stays with the router. |
| no-void | apps/web/src/views/MarcoBridge/MarcoBridgeWorkspace.tsx:603 | N3 | Rejection is owned by try/catch, .catch, a toast, or a callee that does not reject. |
| no-void | apps/web/src/views/MarcoBridge/MarcoBridgeWorkspace.tsx:662 | N3 | Rejection is owned by try/catch, .catch, a toast, or a callee that does not reject. |
| no-void | apps/web/src/views/MarcoBridge/MarcoBridgeWorkspace.tsx:690 | N3 | Rejection is owned by try/catch, .catch, a toast, or a callee that does not reject. |
| no-void | apps/web/src/views/MarcoBridge/MarcoBridgeWorkspace.tsx:715 | N3 | Rejection is owned by try/catch, .catch, a toast, or a callee that does not reject. |
| no-void | apps/web/src/views/MarcoBridge/MarcoBridgeWorkspace.tsx:741 | N3 | Rejection is owned by try/catch, .catch, a toast, or a callee that does not reject. |
| no-void | apps/web/src/views/MarcoBridge/MarcoBridgeWorkspace.tsx:828 | N3 | Rejection is owned by try/catch, .catch, a toast, or a callee that does not reject. |
| no-continue | apps/web/src/views/Passport/v1/buildPassportV1Model.ts:84 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/Passport/v1/buildPassportV1Model.ts:101 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/PassportStudio/buildPassportRecentActivityViewModel.ts:124 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/PassportStudio/buildPassportRecentActivityViewModel.ts:126 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-void | apps/web/src/views/PassportStudio/buildPassportRecentActivityViewModel.ts:276 | N5 | void discards a non-promise value. |
| no-continue | apps/web/src/views/PoolsStudio/__tests__/createPoolWizardLogos.test.ts:41 | N4 | Test or fixture control flow. It does not change production runtime. |
| no-continue | apps/web/src/views/PoolsStudio/modules/buildPools24hRewards.ts:143 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/PoolsStudio/modules/buildPools24hRewards.ts:146 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/PoolsStudio/modules/buildPools24hRewards.ts:155 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/PoolsStudio/modules/buildPools24hRewards.ts:157 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/PoolsStudio/modules/poolContractLink.ts:13 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/PoolsStudio/modules/usePoolsWalletPositions.ts:47 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/PoolsStudio/modules/usePoolsWalletPositions.ts:48 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/PoolsStudio/poolsRuntime/poolCardInventoryDedup.ts:58 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/PoolsStudio/poolsRuntime/poolCardInventoryDedup.ts:60 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/PoolsStudio/poolsRuntime/poolClassificationSummary.ts:72 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/PoolsStudio/poolsRuntime/poolClassificationSummary.ts:73 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-await-in-loop | apps/web/src/views/PoolsStudio/poolsRuntime/useMelegaFactoryPools.ts:85 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-await-in-loop | apps/web/src/views/PoolsStudio/poolsRuntime/useMelegaFactoryPools.ts:92 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-void | apps/web/src/views/PoolsStudio/poolsRuntime/usePoolsStakingRuntime.ts:279 | N5 | Next.js navigation promise. Cancellation stays with the router. |
| no-void | apps/web/src/views/PoolsStudio/poolsRuntime/usePoolsStakingRuntime.ts:289 | N5 | Next.js navigation promise. Cancellation stays with the router. |
| no-continue | apps/web/src/views/PortfolioStudio/runtime/buildPortfolioViewModel.ts:90 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/PortfolioStudio/runtime/buildPortfolioViewModel.ts:107 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/ProjectPage/useProjectWalletRelationship.ts:64 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/ProjectPage/useProjectWalletRelationship.ts:66 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-continue | apps/web/src/views/ProjectPage/useProjectWalletRelationship.ts:127 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-void | apps/web/src/views/ProjectPage/v1/ProjectTradingEmbed.tsx:170 | N3 | Rejection is owned by try/catch, .catch, a toast, or a callee that does not reject. |
| no-void | apps/web/src/views/ProjectPage/v3/ProjectPageV3Shell.tsx:597 | N5 | Clipboard success is committed only in then. A denied write does not mark the value copied. |
| no-void | apps/web/src/views/ProjectPage/v4/ProjectPageV4Shell.tsx:644 | N5 | Clipboard success is committed only in then. A denied write does not mark the value copied. |
| no-void | apps/web/src/views/ProjectPage/v5/ProjectPageV5Shell.tsx:657 | N5 | Clipboard success is committed only in then. A denied write does not mark the value copied. |
| no-void | apps/web/src/views/ProjectPage/v6/ProjectPageV6Shell.tsx:615 | N5 | Clipboard success is committed only in then. A denied write does not mark the value copied. |
| no-void | apps/web/src/views/ProjectPage/v7/ProjectPageV7Shell.tsx:1106 | N5 | Clipboard success is committed only in then. A denied write does not mark the value copied. |
| no-void | apps/web/src/views/ProjectsStudio/components/ProjectsFilterRow.tsx:213 | N5 | Next.js navigation promise. Cancellation stays with the router. |
| no-void | apps/web/src/views/ProjectsStudio/components/ProjectsFilterRow.tsx:219 | N5 | Next.js navigation promise. Cancellation stays with the router. |
| no-void | apps/web/src/views/ProjectsStudio/projectsRuntime/useProjectsIntelligenceRuntime.ts:488 | N5 | void discards a non-promise value. |
| no-void | apps/web/src/views/SmartSwapStudio/modules/SmartSwapExecutionPreview/useShadowRuntimePreflight.ts:326 | N3 | Rejection is owned by try/catch, .catch, a toast, or a callee that does not reject. |
| no-void | apps/web/src/views/SmartSwapStudio/modules/SmartSwapExecutionPreview/useShadowRuntimePreflight.ts:399 | N3 | Rejection is owned by try/catch, .catch, a toast, or a callee that does not reject. |
| no-await-in-loop | apps/web/src/views/TestnetLiquidity/emergencyWalletActions.ts:125 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-await-in-loop | apps/web/src/views/TestnetLiquidity/emergencyWalletActions.ts:133 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-await-in-loop | apps/web/src/views/TestnetWrapperDeploy/wrapperDeployActions.ts:207 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-await-in-loop | apps/web/src/views/TestnetWrapperDeploy/wrapperDeployActions.ts:220 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-continue | apps/web/src/views/TestnetWrapperValidate/wrapperValidateActions.ts:168 | N2 | Guard-style continue in a for loop whose update is in the header. It skips an ineligible item. |
| no-await-in-loop | apps/web/src/views/TestnetWrapperValidate/wrapperValidateActions.ts:188 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-await-in-loop | apps/web/src/views/TestnetWrapperValidate/wrapperValidateActions.ts:200 | N1 | Sequential await preserves nonce, fallback, checkpoint, pagination, retry, or RPC rate-limit order. |
| no-continue | apps/web/src/views/__tests__/melegaDexV1.productRecovery.test.ts:71 | N4 | Test or fixture control flow. It does not change production runtime. |
| no-continue | apps/web/src/views/__tests__/melegaDexV1.productRecovery.test.ts:74 | N4 | Test or fixture control flow. It does not change production runtime. |
| no-continue | apps/web/src/views/__tests__/melegaDexV1.productRecovery.test.ts:81 | N4 | Test or fixture control flow. It does not change production runtime. |
| no-continue | apps/web/src/views/__tests__/rcListedProjectsExport.test.ts:54 | N4 | Test or fixture control flow. It does not change production runtime. |
| no-void | apps/web/src/views/shared/monetization/ClaimProjectWizardModal.tsx:334 | N3 | Rejection is owned by try/catch, .catch, a toast, or a callee that does not reject. |
| no-void | apps/web/src/views/shared/monetization/ClaimProjectWizardModal.tsx:339 | N3 | Rejection is owned by try/catch, .catch, a toast, or a callee that does not reject. |
| no-void | apps/web/src/views/shared/monetization/CommercialCheckoutModal.tsx:1484 | N3 | Rejection is owned by try/catch, .catch, a toast, or a callee that does not reject. |
| no-void | apps/web/src/views/shared/monetization/CommercialCheckoutModal.tsx:1501 | N3 | Rejection is owned by try/catch, .catch, a toast, or a callee that does not reject. |
| no-void | apps/web/src/views/shared/monetization/CommercialCheckoutModal.tsx:1548 | N3 | Rejection is owned by try/catch, .catch, a toast, or a callee that does not reject. |
| no-void | apps/web/src/views/shared/monetization/CommercialCheckoutModal.tsx:1577 | N3 | Rejection is owned by try/catch, .catch, a toast, or a callee that does not reject. |
| no-void | apps/web/src/views/shared/monetization/CommercialCheckoutModal.tsx:1750 | N3 | Rejection is owned by try/catch, .catch, a toast, or a callee that does not reject. |
| no-void | apps/web/src/views/shared/monetization/CommercialCheckoutModal.tsx:1864 | N3 | Rejection is owned by try/catch, .catch, a toast, or a callee that does not reject. |
| no-void | apps/web/src/views/shared/monetization/CommercialCheckoutModal.tsx:1865 | N3 | Rejection is owned by try/catch, .catch, a toast, or a callee that does not reject. |
| no-void | apps/web/src/views/shared/monetization/CommercialCheckoutModal.tsx:2327 | N3 | Rejection is owned by try/catch, .catch, a toast, or a callee that does not reject. |
| no-void | apps/web/src/views/shared/monetization/CommercialCheckoutModal.tsx:2336 | N3 | Rejection is owned by try/catch, .catch, a toast, or a callee that does not reject. |
| no-void | apps/web/src/views/shared/monetization/CommercialCheckoutModal.tsx:2345 | N3 | Rejection is owned by try/catch, .catch, a toast, or a callee that does not reject. |
| no-void | apps/web/src/views/shared/monetization/CommercialCheckoutModal.tsx:2408 | N3 | Rejection is owned by try/catch, .catch, a toast, or a callee that does not reject. |
| no-void | apps/web/src/views/shared/monetization/CommercialCheckoutModal.tsx:2708 | N3 | Rejection is owned by try/catch, .catch, a toast, or a callee that does not reject. |
