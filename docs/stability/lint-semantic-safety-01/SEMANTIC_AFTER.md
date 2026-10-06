# Semantic lint inventory — after

Mission: `MELEGA-DEX-LINT-SEMANTIC-SAFETY-01`

Candidate findings: **659**

- S1: 0
- S2: 0
- N1: 67
- N2: 158
- N3: 397
- N4: 37

| Rule | File | Line | Scope | Runtime reachable | Risk | Classification |
| --- | --- | ---: | --- | --- | --- | --- |
| import/no-named-as-default | apps/web/src/app-shell/GlobalTrendingBar.tsx | 6 | ACTIVE | YES | Style or redundant dependency/import identity; no demonstrated runtime defect. | N1 |
| no-void | apps/web/src/app-shell/components/GlobalSearch.tsx | 225 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-void | apps/web/src/app-shell/components/GlobalSearch.tsx | 278 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-void | apps/web/src/app-shell/components/GlobalSearch.tsx | 282 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-void | apps/web/src/components/ConnectWalletButton.tsx | 56 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-void | apps/web/src/components/ConnectWalletButton.tsx | 67 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-void | apps/web/src/components/ConnectWalletButton.tsx | 71 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| import/no-named-as-default | apps/web/src/components/ErrorBoundary/SentryErrorBoundary.tsx | 2 | ACTIVE | YES | Style or redundant dependency/import identity; no demonstrated runtime defect. | N1 |
| import/no-named-as-default | apps/web/src/components/Layout/Page.tsx | 4 | ACTIVE | YES | Style or redundant dependency/import identity; no demonstrated runtime defect. | N1 |
| no-await-in-loop | apps/web/src/components/MarcoWidgets/MarcoConnect.tsx | 72 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-void | apps/web/src/components/MarcoWidgets/MarcoConnect.tsx | 246 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-void | apps/web/src/components/MarcoWidgets/MarcoReferralCapture.tsx | 27 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-void | apps/web/src/components/MarcoWidgets/marcoConnectSession.ts | 22 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-void | apps/web/src/components/Menu/UserMenu/NetworkSwitchModal.tsx | 182 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| react-hooks/exhaustive-deps | apps/web/src/components/Menu/hooks/useMenuItems.ts | 21 | ACTIVE | YES | Style or redundant dependency/import identity; no demonstrated runtime defect. | N1 |
| react-hooks/exhaustive-deps | apps/web/src/components/Menu/hooks/useTopMenuItems.ts | 21 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-cycle | apps/web/src/components/MyMelega/MyMelegaDrawer.tsx | 16 | ACTIVE | YES | Contextual false positive or guarded/stable identity; no demonstrated product risk. | N4 |
| consistent-return | apps/web/src/components/MyMelega/MyMelegaDrawer.tsx | 298 | ACTIVE | YES | Contextual false positive or guarded/stable identity; no demonstrated product risk. | N4 |
| no-void | apps/web/src/components/MyMelega/MyMelegaDrawer.tsx | 345 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| import/no-cycle | apps/web/src/components/MyMelega/MyMelegaProvider.tsx | 13 | ACTIVE | YES | Contextual false positive or guarded/stable identity; no demonstrated product risk. | N4 |
| no-void | apps/web/src/components/NetworkModal/PageNetworkSupportModal.tsx | 71 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-void | apps/web/src/components/NetworkSwitcher.tsx | 221 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-void | apps/web/src/components/NetworkSwitcher.tsx | 294 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| import/no-duplicates | apps/web/src/config/constants/ifo.ts | 3 | ACTIVE | YES | Style or redundant dependency/import identity; no demonstrated runtime defect. | N1 |
| import/no-duplicates | apps/web/src/config/constants/ifo.ts | 5 | ACTIVE | YES | Style or redundant dependency/import identity; no demonstrated runtime defect. | N1 |
| no-void | apps/web/src/design-system/melega/components/GlobalHeader/MelegaGlobalHeader.tsx | 406 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-void | apps/web/src/design-system/melega/components/GlobalHeader/MelegaGlobalHeader.tsx | 407 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-void | apps/web/src/design-system/melega/components/Sidebar/MelegaSidebar.tsx | 8 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| react-hooks/exhaustive-deps | apps/web/src/hooks/Tokens.ts | 246 | ACTIVE | YES | Style or redundant dependency/import identity; no demonstrated runtime defect. | N1 |
| no-loop-func | apps/web/src/hooks/__tests__/lpApprovalRefresh.test.tsx | 85 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/hooks/restoreEagerWalletSession.ts | 24 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-await-in-loop | apps/web/src/hooks/restoreEagerWalletSession.ts | 33 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| react-hooks/exhaustive-deps | apps/web/src/hooks/useApproveCallback.ts | 114 | ACTIVE | YES | Contextual false positive or guarded/stable identity; no demonstrated product risk. | N4 |
| react-hooks/exhaustive-deps | apps/web/src/hooks/useTokenBalance.ts | 61 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-void | apps/web/src/hooks/useWalletChainId.ts | 54 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-void | apps/web/src/hooks/useWalletChainId.ts | 79 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| consistent-return | apps/web/src/hooks/useWalletChainId.ts | 83 | ACTIVE | YES | Contextual false positive or guarded/stable identity; no demonstrated product risk. | N4 |
| no-void | apps/web/src/hooks/useWalletChainId.ts | 89 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-await-in-loop | apps/web/src/lib/bsc-indexer/featuredMarkets.ts | 209 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-await-in-loop | apps/web/src/lib/bsc-indexer/featuredMarkets.ts | 272 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-await-in-loop | apps/web/src/lib/bsc-indexer/indexer/canonicalTierPairs.ts | 109 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/lib/bsc-indexer/indexer/canonicalTierPairs.ts | 112 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/lib/bsc-indexer/indexer/canonicalTierPairs.ts | 115 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/lib/bsc-indexer/indexer/farmerParticipantIndex.ts | 339 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-await-in-loop | apps/web/src/lib/bsc-indexer/indexer/indexerOrchestrator.ts | 201 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-duplicates | apps/web/src/lib/bsc-indexer/indexer/pairSyncEngine.ts | 9 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-duplicates | apps/web/src/lib/bsc-indexer/indexer/pairSyncEngine.ts | 18 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/lib/bsc-indexer/indexer/pairSyncEngine.ts | 66 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/lib/bsc-indexer/indexer/pairSyncEngine.ts | 243 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/lib/bsc-indexer/indexer/pairSyncEngine.ts | 269 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/lib/bsc-indexer/indexer/pairSyncEngine.ts | 299 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/lib/bsc-indexer/indexer/pairSyncEngine.ts | 325 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/lib/bsc-indexer/indexer/protocolActivitySync.ts | 141 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-void | apps/web/src/lib/bsc-indexer/indexer/publicFarmFactoryDiscovery.ts | 61 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-duplicates | apps/web/src/lib/bsc-indexer/indexer/syncIncremental.ts | 14 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-duplicates | apps/web/src/lib/bsc-indexer/indexer/syncIncremental.ts | 26 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/lib/bsc-indexer/indexer/syncIncremental.ts | 84 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/lib/bsc-indexer/indexer/syncIncremental.ts | 102 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/lib/bsc-indexer/indexer/syncIncremental.ts | 125 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/lib/bsc-indexer/indexer/tierInventory.ts | 185 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-await-in-loop | apps/web/src/lib/bsc-indexer/indexer/tierScheduler.ts | 107 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-duplicates | apps/web/src/lib/bsc-indexer/marketIndexHealth.ts | 2 | ACTIVE | YES | Style or redundant dependency/import identity; no demonstrated runtime defect. | N1 |
| import/no-duplicates | apps/web/src/lib/bsc-indexer/marketIndexHealth.ts | 4 | ACTIVE | YES | Style or redundant dependency/import identity; no demonstrated runtime defect. | N1 |
| no-await-in-loop | apps/web/src/lib/bsc-indexer/registry/discoverSmartChefOnChain.ts | 176 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-loop-func | apps/web/src/lib/bsc-indexer/registry/discoverSmartChefOnChain.ts | 177 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-await-in-loop | apps/web/src/lib/bsc-indexer/registry/refreshOnChainRegistry.ts | 61 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-await-in-loop | apps/web/src/lib/bsc-indexer/registry/refreshOnChainRegistry.ts | 64 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-await-in-loop | apps/web/src/lib/bsc-indexer/registry/refreshOnChainRegistry.ts | 65 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-await-in-loop | apps/web/src/lib/bsc-indexer/registry/refreshOnChainRegistry.ts | 66 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-await-in-loop | apps/web/src/lib/bsc-indexer/registry/refreshOnChainRegistry.ts | 88 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-await-in-loop | apps/web/src/lib/bsc-indexer/registry/refreshOnChainRegistry.ts | 90 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-await-in-loop | apps/web/src/lib/bsc-indexer/registry/refreshOnChainRegistry.ts | 99 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-await-in-loop | apps/web/src/lib/bsc-indexer/registry/refreshOnChainRegistry.ts | 113 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-await-in-loop | apps/web/src/lib/bsc-indexer/rpc/chunkedLogs.ts | 126 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-await-in-loop | apps/web/src/lib/bsc-indexer/rpc/chunkedLogs.ts | 133 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-await-in-loop | apps/web/src/lib/bsc-indexer/rpc/chunkedLogs.ts | 146 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-await-in-loop | apps/web/src/lib/bsc-indexer/rpc/chunkedLogs.ts | 185 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-await-in-loop | apps/web/src/lib/bsc-indexer/rpc/chunkedLogs.ts | 235 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-await-in-loop | apps/web/src/lib/bsc-indexer/rpc/chunkedLogs.ts | 244 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-await-in-loop | apps/web/src/lib/bsc-indexer/rpc/chunkedLogs.ts | 249 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-await-in-loop | apps/web/src/lib/bsc-indexer/rpc/chunkedLogs.ts | 278 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-await-in-loop | apps/web/src/lib/bsc-indexer/rpc/chunkedLogs.ts | 287 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-await-in-loop | apps/web/src/lib/bsc-indexer/rpc/chunkedLogs.ts | 320 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-await-in-loop | apps/web/src/lib/bsc-indexer/rpc/chunkedLogs.ts | 325 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-await-in-loop | apps/web/src/lib/bsc-indexer/rpc/chunkedLogs.ts | 338 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-await-in-loop | apps/web/src/lib/bsc-indexer/rpc/scanBlockRange.ts | 23 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/lib/bsc-indexer/rpc/scanBlockRange.ts | 56 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/lib/bsc-indexer/rpc/scanBlockRange.ts | 69 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/lib/bsc-indexer/server/loadTierMetricsSnapshot.ts | 61 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-await-in-loop | apps/web/src/lib/bsc-indexer/storage/index.ts | 96 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-await-in-loop | apps/web/src/lib/bsc-indexer/storage/index.ts | 99 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| import/no-duplicates | apps/web/src/lib/civilization-runtime/event-fabric.ts | 1 | ACTIVE | YES | Style or redundant dependency/import identity; no demonstrated runtime defect. | N1 |
| import/no-duplicates | apps/web/src/lib/civilization-runtime/event-fabric.ts | 14 | ACTIVE | YES | Style or redundant dependency/import identity; no demonstrated runtime defect. | N1 |
| import/export | apps/web/src/lib/civilization-runtime/index.ts | 2 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/export | apps/web/src/lib/civilization-runtime/index.ts | 3 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/export | apps/web/src/lib/civilization-runtime/index.ts | 3 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/export | apps/web/src/lib/civilization-runtime/index.ts | 3 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/export | apps/web/src/lib/civilization-runtime/index.ts | 3 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/export | apps/web/src/lib/civilization-runtime/index.ts | 3 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/export | apps/web/src/lib/civilization-runtime/index.ts | 3 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/export | apps/web/src/lib/civilization-runtime/index.ts | 3 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/export | apps/web/src/lib/civilization-runtime/index.ts | 3 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/export | apps/web/src/lib/civilization-runtime/index.ts | 3 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/export | apps/web/src/lib/civilization-runtime/index.ts | 3 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/export | apps/web/src/lib/civilization-runtime/index.ts | 3 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/export | apps/web/src/lib/civilization-runtime/index.ts | 3 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/export | apps/web/src/lib/civilization-runtime/index.ts | 3 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/export | apps/web/src/lib/civilization-runtime/index.ts | 3 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/export | apps/web/src/lib/civilization-runtime/index.ts | 4 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/export | apps/web/src/lib/civilization-runtime/index.ts | 4 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/export | apps/web/src/lib/civilization-runtime/index.ts | 4 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/export | apps/web/src/lib/civilization-runtime/index.ts | 4 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/export | apps/web/src/lib/civilization-runtime/index.ts | 4 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/export | apps/web/src/lib/civilization-runtime/index.ts | 4 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/export | apps/web/src/lib/civilization-runtime/index.ts | 5 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/export | apps/web/src/lib/civilization-runtime/index.ts | 6 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/export | apps/web/src/lib/civilization-runtime/index.ts | 6 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/export | apps/web/src/lib/civilization-runtime/index.ts | 7 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/export | apps/web/src/lib/civilization-runtime/index.ts | 7 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/export | apps/web/src/lib/civilization-runtime/index.ts | 7 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/export | apps/web/src/lib/civilization-runtime/index.ts | 7 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/export | apps/web/src/lib/civilization-runtime/index.ts | 8 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/export | apps/web/src/lib/civilization-runtime/index.ts | 8 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/export | apps/web/src/lib/civilization-runtime/index.ts | 11 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/export | apps/web/src/lib/civilization-runtime/index.ts | 11 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/export | apps/web/src/lib/civilization-runtime/index.ts | 11 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/export | apps/web/src/lib/civilization-runtime/index.ts | 11 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/export | apps/web/src/lib/civilization-runtime/index.ts | 11 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/export | apps/web/src/lib/civilization-runtime/index.ts | 11 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/export | apps/web/src/lib/civilization-runtime/index.ts | 11 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/export | apps/web/src/lib/civilization-runtime/index.ts | 11 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/export | apps/web/src/lib/civilization-runtime/index.ts | 11 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/export | apps/web/src/lib/civilization-runtime/index.ts | 11 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/export | apps/web/src/lib/civilization-runtime/index.ts | 11 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/export | apps/web/src/lib/civilization-runtime/index.ts | 11 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/export | apps/web/src/lib/civilization-runtime/index.ts | 11 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/export | apps/web/src/lib/civilization-runtime/index.ts | 11 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/export | apps/web/src/lib/civilization-runtime/index.ts | 12 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/export | apps/web/src/lib/civilization-runtime/index.ts | 12 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/export | apps/web/src/lib/civilization-runtime/index.ts | 12 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/export | apps/web/src/lib/civilization-runtime/index.ts | 12 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/export | apps/web/src/lib/civilization-runtime/index.ts | 12 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/export | apps/web/src/lib/civilization-runtime/index.ts | 12 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/export | apps/web/src/lib/civilization-runtime/index.ts | 12 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/export | apps/web/src/lib/civilization-runtime/index.ts | 13 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/export | apps/web/src/lib/civilization-runtime/index.ts | 13 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/export | apps/web/src/lib/civilization-runtime/index.ts | 13 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/export | apps/web/src/lib/civilization-runtime/index.ts | 13 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/export | apps/web/src/lib/civilization-runtime/index.ts | 14 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/export | apps/web/src/lib/civilization-runtime/index.ts | 14 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-duplicates | apps/web/src/lib/civilization-runtime/validate-fabric.ts | 1 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-duplicates | apps/web/src/lib/civilization-runtime/validate-fabric.ts | 2 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-cycle | apps/web/src/lib/data-truth/globalYieldInventory.ts | 121 | ACTIVE | YES | Contextual false positive or guarded/stable identity; no demonstrated product risk. | N4 |
| no-void | apps/web/src/lib/deployment-orchestrator/founderExecutionSession.ts | 125 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-void | apps/web/src/lib/deployment-orchestrator/subsystems.ts | 46 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-void | apps/web/src/lib/deployment-orchestrator/subsystems.ts | 105 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-void | apps/web/src/lib/deployment-orchestrator/subsystems.ts | 164 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/export | apps/web/src/lib/economic-orchestrator/index.ts | 2 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/export | apps/web/src/lib/economic-orchestrator/index.ts | 2 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/export | apps/web/src/lib/economic-orchestrator/index.ts | 2 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/export | apps/web/src/lib/economic-orchestrator/index.ts | 5 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/export | apps/web/src/lib/economic-orchestrator/index.ts | 5 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/export | apps/web/src/lib/economic-orchestrator/index.ts | 5 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/export | apps/web/src/lib/economic-submission/index.ts | 4 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/export | apps/web/src/lib/economic-submission/index.ts | 5 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/export | apps/web/src/lib/economic-submission/index.ts | 6 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/export | apps/web/src/lib/economic-submission/index.ts | 6 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-duplicates | apps/web/src/lib/execution-handoff-consumer/certified-handshake.ts | 1 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-duplicates | apps/web/src/lib/execution-handoff-consumer/certified-handshake.ts | 4 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-duplicates | apps/web/src/lib/execution-handoff-consumer/consume.ts | 2 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-duplicates | apps/web/src/lib/execution-handoff-consumer/consume.ts | 5 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-duplicates | apps/web/src/lib/execution-handoff-intake/__tests__/registry-handoff-intake.test.ts | 10 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-duplicates | apps/web/src/lib/execution-handoff-intake/__tests__/registry-handoff-intake.test.ts | 11 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-duplicates | apps/web/src/lib/execution-handoff-intake/__tests__/registry-handoff-intake.test.ts | 16 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-duplicates | apps/web/src/lib/execution-handoff-intake/__tests__/registry-handoff-intake.test.ts | 21 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-cycle | apps/web/src/lib/execution-modes/index.ts | 86 | ACTIVE | YES | Contextual false positive or guarded/stable identity; no demonstrated product risk. | N4 |
| no-await-in-loop | apps/web/src/lib/featured-placement/orderStore.ts | 118 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-await-in-loop | apps/web/src/lib/global-liquidity/server.ts | 122 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-await-in-loop | apps/web/src/lib/global-liquidity/server.ts | 142 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-await-in-loop | apps/web/src/lib/global-liquidity/server.ts | 180 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| import/no-duplicates | apps/web/src/lib/kerl-constitutional/settlement.ts | 4 | ACTIVE | YES | Style or redundant dependency/import identity; no demonstrated runtime defect. | N1 |
| import/no-duplicates | apps/web/src/lib/kerl-constitutional/settlement.ts | 5 | ACTIVE | YES | Style or redundant dependency/import identity; no demonstrated runtime defect. | N1 |
| import/export | apps/web/src/lib/labs-runtime/index.ts | 5 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/export | apps/web/src/lib/labs-runtime/index.ts | 5 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/export | apps/web/src/lib/labs-runtime/index.ts | 6 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/export | apps/web/src/lib/labs-runtime/index.ts | 6 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-duplicates | apps/web/src/lib/labs-runtime/runtime-mapping.ts | 1 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-duplicates | apps/web/src/lib/labs-runtime/runtime-mapping.ts | 133 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-duplicates | apps/web/src/lib/liquidity-builder-indexer/__tests__/inventoryApi.test.ts | 1 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-duplicates | apps/web/src/lib/liquidity-builder-indexer/__tests__/inventoryApi.test.ts | 9 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/lib/liquidity-builder-indexer/sync.ts | 133 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/lib/liquidity-builder-indexer/sync.ts | 157 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-duplicates | apps/web/src/lib/liquidity-building-runtime/__tests__/lb-act003-activation-simplification.test.ts | 13 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-duplicates | apps/web/src/lib/liquidity-building-runtime/__tests__/lb-act003-activation-simplification.test.ts | 20 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/lib/marco-bridge/__tests__/evmSimulation.test.ts | 44 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/lib/marco-bridge/__tests__/polygonCanaryGate.test.ts | 73 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/lib/marco-bridge/__tests__/polygonCanaryGate.test.ts | 103 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/lib/marco-bridge/__tests__/solanaBnbBridge.test.ts | 482 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/lib/marco-bridge/simulate.ts | 71 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/lib/marco-bridge/solanaOftSdk.ts | 69 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-await-in-loop | apps/web/src/lib/marco-bridge/solanaOftSdk.ts | 232 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-await-in-loop | apps/web/src/lib/marco-bridge/solanaSourceStatus.ts | 24 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/lib/marco-bridge/solanaStoreRead.ts | 131 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-await-in-loop | apps/web/src/lib/marco-bridge/walletSubmit.ts | 85 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-await-in-loop | apps/web/src/lib/marco-bridge/walletSubmit.ts | 89 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-await-in-loop | apps/web/src/lib/marco-bridge/walletSubmit.ts | 98 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-await-in-loop | apps/web/src/lib/marco-bridge/walletSubmit.ts | 481 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-await-in-loop | apps/web/src/lib/marco-pay/__tests__/orders.test.ts | 253 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/lib/marco-pay/orders.ts | 185 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-await-in-loop | apps/web/src/lib/marco-pay/orders.ts | 487 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-void | apps/web/src/lib/market-data/__tests__/marketDataCertification.test.ts | 151 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/lib/market-data/bnbUsd.ts | 81 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-await-in-loop | apps/web/src/lib/market-data/canonicalMarketSnapshot.ts | 70 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-void | apps/web/src/lib/market-registry/listedProjectsCount.ts | 90 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| import/no-duplicates | apps/web/src/lib/melega-smart-router/policy-engine/resolvePolicies.ts | 7 | ACTIVE | YES | Style or redundant dependency/import identity; no demonstrated runtime defect. | N1 |
| import/no-duplicates | apps/web/src/lib/melega-smart-router/policy-engine/resolvePolicies.ts | 9 | ACTIVE | YES | Style or redundant dependency/import identity; no demonstrated runtime defect. | N1 |
| no-await-in-loop | apps/web/src/lib/monetization/trendBoostOrders.ts | 157 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| import/export | apps/web/src/lib/phase-d-readiness/index.ts | 2 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/export | apps/web/src/lib/phase-d-readiness/index.ts | 3 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/lib/project-claims/resolveContractAuthority.ts | 88 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-await-in-loop | apps/web/src/lib/project-claims/resolveContractAuthority.ts | 93 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| import/export | apps/web/src/lib/real-event-intake/index.ts | 5 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/export | apps/web/src/lib/real-event-intake/index.ts | 6 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/lib/runtime-indexing/rpcLogReader.ts | 99 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/lib/runtime-indexing/rpcLogReader.ts | 130 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/founderDeploymentPackageForkRehearsal.test.ts | 104 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/founderDeploymentPackageForkRehearsal.test.ts | 109 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/founderDeploymentPackageForkRehearsal.test.ts | 111 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/founderDeploymentPackageForkRehearsal.test.ts | 116 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/founderDeploymentPackageForkRehearsal.test.ts | 118 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/founderDeploymentPackageForkRehearsal.test.ts | 123 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/founderDeploymentPackageForkRehearsal.test.ts | 166 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/founderDeploymentPackageForkRehearsal.test.ts | 170 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/founderDeploymentPackageForkRehearsal.test.ts | 199 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/founderDeploymentPackageForkRehearsal.test.ts | 202 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/founderDeploymentPackageForkRehearsal.test.ts | 208 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/founderDeploymentPackageForkRehearsal.test.ts | 341 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/founderDeploymentPackageForkRehearsal.test.ts | 403 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/founderDeploymentPackageForkRehearsal.test.ts | 431 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/immutableRuntimeGate.test.ts | 144 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/immutableRuntimeGate.test.ts | 148 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-duplicates | apps/web/src/lib/smartswap-universal-engine/__tests__/m2RevenuePolicy.test.ts | 5 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-duplicates | apps/web/src/lib/smartswap-universal-engine/__tests__/m2RevenuePolicy.test.ts | 40 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-duplicates | apps/web/src/lib/smartswap-universal-engine/__tests__/m3EvmMultivenueShadow.test.ts | 9 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-duplicates | apps/web/src/lib/smartswap-universal-engine/__tests__/m3EvmMultivenueShadow.test.ts | 66 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/v2BscPublicCutover.test.ts | 469 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/v2ConfirmModalStability.test.tsx | 513 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/v2FactualPriceImpactLiveDiagnostics.test.ts | 45 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/v2FactualPriceImpactLiveDiagnostics.test.ts | 48 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/v2FactualPriceImpactLiveDiagnostics.test.ts | 54 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-loop-func | apps/web/src/lib/smartswap-universal-engine/__tests__/v2FactualPriceImpactLiveDiagnostics.test.ts | 58 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/v2FactualPriceImpactReadonly.test.ts | 70 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/v2FactualPriceImpactReadonly.test.ts | 94 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/v2FactualPriceImpactReadonly.test.ts | 117 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/v2RealRouterForkProof.test.ts | 459 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/v2RealRouterForkProof.test.ts | 466 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/v2RealRouterForkProof.test.ts | 472 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/v2RealRouterForkProof.test.ts | 480 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/v2RealRouterForkProof.test.ts | 488 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/v2RealRouterForkProof.test.ts | 544 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/v2RealRouterForkProof.test.ts | 546 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/v2RealRouterForkProof.test.ts | 550 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/v2RealRouterForkProof.test.ts | 552 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/v2RealRouterForkProof.test.ts | 557 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/v2RealRouterForkProof.test.ts | 636 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/v2RealRouterForkProof.test.ts | 652 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/v2RealRouterForkProof.test.ts | 683 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/v2RealRouterForkProof.test.ts | 891 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/v2RealRouterForkProof.test.ts | 892 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/v2RealRouterForkProof.test.ts | 974 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/v2RealRouterForkProof.test.ts | 1263 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/v2RealRouterForkProof.test.ts | 1303 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/v2RealRouterForkProof.test.ts | 1329 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/v2RealRouterForkProof.test.ts | 1405 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/v2RealRouterForkProof.test.ts | 1431 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/v2TransactionPreparation.test.ts | 593 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/v2TransactionPreparation.test.ts | 599 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/v2TransactionPreparation.test.ts | 681 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/v2TransactionPreparation.test.ts | 718 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/v2TransactionPreparation.test.ts | 753 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/v2UserCtaBinding.test.ts | 618 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/__tests__/v2UserCtaBinding.test.ts | 624 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/evmV2Quote.ts | 326 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/evmV2Quote.ts | 351 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/evmV2Quote.ts | 357 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/evmV2Quote.ts | 363 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-loop-func | apps/web/src/lib/smartswap-universal-engine/evmV2Quote.ts | 455 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| import/no-duplicates | apps/web/src/lib/smartswap-universal-engine/externalEvmAdapter.ts | 6 | ACTIVE | YES | Style or redundant dependency/import identity; no demonstrated runtime defect. | N1 |
| import/no-duplicates | apps/web/src/lib/smartswap-universal-engine/externalEvmAdapter.ts | 14 | ACTIVE | YES | Style or redundant dependency/import identity; no demonstrated runtime defect. | N1 |
| no-void | apps/web/src/lib/smartswap-universal-engine/latency.ts | 83 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-void | apps/web/src/lib/smartswap-universal-engine/shadowEconomics.ts | 76 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| consistent-return | apps/web/src/lib/smartswap-universal-engine/v2ExecutionBinding.ts | 137 | ACTIVE | YES | Contextual false positive or guarded/stable identity; no demonstrated product risk. | N4 |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/v2UserExecutionPlan.ts | 779 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-await-in-loop | apps/web/src/lib/smartswap-universal-engine/v2UserExecutionPlan.ts | 780 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-void | apps/web/src/lib/treasury-handoff/submitSettlementHandoff.ts | 62 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-void | apps/web/src/pages/add/[[...currency]].tsx | 17 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-duplicates | apps/web/src/pages/api/deployment/founder.ts | 2 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-duplicates | apps/web/src/pages/api/deployment/founder.ts | 4 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-void | apps/web/src/pages/api/featured/orders/[orderId].ts | 40 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-duplicates | apps/web/src/pages/api/indexer/coverage.ts | 2 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-duplicates | apps/web/src/pages/api/indexer/coverage.ts | 6 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-duplicates | apps/web/src/pages/api/indexer/health.ts | 2 | ACTIVE | YES | Style or redundant dependency/import identity; no demonstrated runtime defect. | N1 |
| import/no-duplicates | apps/web/src/pages/api/indexer/health.ts | 14 | ACTIVE | YES | Style or redundant dependency/import identity; no demonstrated runtime defect. | N1 |
| no-await-in-loop | apps/web/src/pages/api/indexer/health.ts | 52 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-await-in-loop | apps/web/src/pages/api/indexer/liquidity-positions.ts | 124 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/pages/api/indexer/liquidity-positions.ts | 167 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/pages/api/indexer/liquidity-positions.ts | 193 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/pages/api/indexer/liquidity-positions.ts | 237 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-void | apps/web/src/pages/api/indexer/run.ts | 131 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/pages/api/indexer/tier-metrics.ts | 58 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/pages/api/masterchef/emission.ts | 48 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/pages/api/masterchef/emission.ts | 77 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| consistent-return | apps/web/src/pages/api/private/projects/[slug]/control-center/audit.ts | 13 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| consistent-return | apps/web/src/pages/api/private/projects/[slug]/control-center/developer.ts | 17 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| consistent-return | apps/web/src/pages/api/private/projects/[slug]/control-center/ecosystem.ts | 17 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| consistent-return | apps/web/src/pages/api/private/projects/[slug]/control-center/index.ts | 16 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| consistent-return | apps/web/src/pages/api/private/projects/[slug]/control-center/profile.ts | 20 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| consistent-return | apps/web/src/pages/api/private/projects/[slug]/control-center/resources.ts | 17 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| consistent-return | apps/web/src/pages/api/private/projects/[slug]/control-center/session.ts | 22 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| consistent-return | apps/web/src/pages/api/private/projects/[slug]/control-center/updates.ts | 17 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-void | apps/web/src/pages/claim-project.tsx | 15 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-void | apps/web/src/pages/project/[slug].tsx | 112 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-duplicates | apps/web/src/registry/graph/resolveGraph.ts | 4 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-duplicates | apps/web/src/registry/graph/resolveGraph.ts | 7 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-void | apps/web/src/registry/projects/identity/governance/buildProjectGovernanceDocument.ts | 583 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-void | apps/web/src/registry/projects/identity/governance/buildProjectGovernanceDocument.ts | 584 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-void | apps/web/src/registry/projects/identity/governance/buildProjectGovernanceDocument.ts | 585 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| import/no-duplicates | apps/web/src/registry/projects/identity/participation/buildProjectParticipationDocument.ts | 8 | ACTIVE | YES | Style or redundant dependency/import identity; no demonstrated runtime defect. | N1 |
| import/no-duplicates | apps/web/src/registry/projects/identity/participation/buildProjectParticipationDocument.ts | 9 | ACTIVE | YES | Style or redundant dependency/import identity; no demonstrated runtime defect. | N1 |
| no-void | apps/web/src/registry/projects/identity/readiness/buildTrustSnapshot.ts | 291 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-void | apps/web/src/registry/projects/identity/readiness/buildWarnings.ts | 119 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-void | apps/web/src/registry/projects/identity/readiness/computeReadinessComponents.ts | 326 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-void | apps/web/src/registry/projects/identity/walletRelationship/buildWalletRelationshipDocument.ts | 537 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-await-in-loop | apps/web/src/registry/projects/pending/fetchErc20OnChainIdentity.ts | 62 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| react-hooks/exhaustive-deps | apps/web/src/state/lists/hooks.ts | 203 | ACTIVE | YES | Style or redundant dependency/import identity; no demonstrated runtime defect. | N1 |
| consistent-return | apps/web/src/state/multicall/updater.tsx | 270 | ACTIVE | YES | Contextual false positive or guarded/stable identity; no demonstrated product risk. | N4 |
| import/no-named-as-default | apps/web/src/state/transactions/WalletTransactionUpdaters.tsx | 3 | ACTIVE | YES | Style or redundant dependency/import identity; no demonstrated runtime defect. | N1 |
| no-void | apps/web/src/views/AuditStudio/AuditCenterV2.tsx | 477 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| react-hooks/exhaustive-deps | apps/web/src/views/Bridge/BridgeForm/index.tsx | 192 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-named-as-default | apps/web/src/views/BuildStudio/BuildStudioScreen.tsx | 9 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-named-as-default | apps/web/src/views/BuildStudio/BuildStudioScreen.tsx | 10 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-named-as-default | apps/web/src/views/BuildStudio/BuildStudioScreen.tsx | 11 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-named-as-default | apps/web/src/views/BuildStudio/BuildStudioScreen.tsx | 12 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-named-as-default | apps/web/src/views/BuildStudio/BuildStudioScreen.tsx | 13 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-named-as-default | apps/web/src/views/BuildStudio/BuildStudioScreen.tsx | 14 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-named-as-default | apps/web/src/views/BuildStudio/BuildStudioScreen.tsx | 15 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-named-as-default | apps/web/src/views/BuildStudio/BuildStudioScreen.tsx | 17 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-named-as-default | apps/web/src/views/BuildStudio/BuildStudioScreen.tsx | 18 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-named-as-default | apps/web/src/views/BuildStudio/BuildStudioScreen.tsx | 19 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-named-as-default | apps/web/src/views/BuildStudio/BuildStudioScreen.tsx | 20 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-named-as-default | apps/web/src/views/BuildStudio/BuildStudioScreen.tsx | 21 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-void | apps/web/src/views/BuildStudio/components/AIManifestPanel.tsx | 99 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-void | apps/web/src/views/BuildStudio/components/BuildMachinePanel.tsx | 99 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-named-as-default | apps/web/src/views/BuildStudio/components/BuildStudioPageHeader.tsx | 12 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-named-as-default | apps/web/src/views/BuildStudio/components/CenterBuildColumn.tsx | 4 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-named-as-default | apps/web/src/views/BuildStudio/components/ImportTokenPanel.tsx | 5 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-named-as-default | apps/web/src/views/CollectiblesStudio/CollectiblesStudioScreen.tsx | 6 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-named-as-default | apps/web/src/views/CollectiblesStudio/CollectiblesStudioScreen.tsx | 7 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-named-as-default | apps/web/src/views/CollectiblesStudio/CollectiblesStudioScreen.tsx | 8 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-named-as-default | apps/web/src/views/CollectiblesStudio/CollectiblesStudioScreen.tsx | 9 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-named-as-default | apps/web/src/views/CollectiblesStudio/CollectiblesStudioScreen.tsx | 10 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-named-as-default | apps/web/src/views/CollectiblesStudio/CollectiblesStudioScreen.tsx | 11 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-named-as-default | apps/web/src/views/CollectiblesStudio/CollectiblesStudioScreen.tsx | 12 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-named-as-default | apps/web/src/views/CollectiblesStudio/CollectiblesStudioScreen.tsx | 13 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/views/CollectiblesStudio/collectiblesRuntime/useWalletCollectibleOwnership.ts | 67 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-named-as-default | apps/web/src/views/CollectiblesStudio/components/CollectiblesGrid.tsx | 5 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-named-as-default | apps/web/src/views/CollectiblesStudio/components/CollectiblesRightSidebar.tsx | 12 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-duplicates | apps/web/src/views/CommandCenter/commandCenterRuntime/useCommandCenterOrchestrationRuntime.ts | 43 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-duplicates | apps/web/src/views/CommandCenter/commandCenterRuntime/useCommandCenterOrchestrationRuntime.ts | 44 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-named-as-default | apps/web/src/views/CommandCenter/components/CommandCenterRuntimeBoundary.tsx | 2 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/views/DeploymentOrchestrator/FounderAvalancheLiveSeedPanel.tsx | 92 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/views/DeploymentOrchestrator/FounderAvalancheLiveSeedPanel.tsx | 98 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-void | apps/web/src/views/DeploymentOrchestrator/FounderAvalancheLiveSeedPanel.tsx | 276 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-void | apps/web/src/views/DeploymentOrchestrator/FounderAvalancheV2RouterPanel.tsx | 283 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-void | apps/web/src/views/DeploymentOrchestrator/FounderAvalancheV2RouterPanel.tsx | 287 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-void | apps/web/src/views/DeploymentOrchestrator/FounderAvalancheV2RouterPanel.tsx | 295 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-void | apps/web/src/views/DeploymentOrchestrator/FounderDeploymentPanel.tsx | 230 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-void | apps/web/src/views/DeploymentOrchestrator/FounderDeploymentShell.tsx | 531 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/views/DeploymentOrchestrator/FounderDeploymentShell.tsx | 634 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/views/DeploymentOrchestrator/FounderDeploymentShell.tsx | 635 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-void | apps/web/src/views/DeploymentOrchestrator/FounderDeploymentShell.tsx | 808 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-void | apps/web/src/views/DeploymentOrchestrator/FounderDeploymentShell.tsx | 809 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-void | apps/web/src/views/DeploymentOrchestrator/FounderDeploymentShell.tsx | 810 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-void | apps/web/src/views/DeploymentOrchestrator/FounderDeploymentShell.tsx | 1169 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-void | apps/web/src/views/DeploymentOrchestrator/FounderDeploymentShell.tsx | 1203 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-void | apps/web/src/views/DeploymentOrchestrator/FounderDeploymentShell.tsx | 1220 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-named-as-default | apps/web/src/views/FarmsStudio/FarmsStudioScreen.tsx | 9 | ACTIVE | YES | Style or redundant dependency/import identity; no demonstrated runtime defect. | N1 |
| no-void | apps/web/src/views/FarmsStudio/FarmsStudioScreen.tsx | 85 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-void | apps/web/src/views/FarmsStudio/FarmsStudioScreen.tsx | 96 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| import/no-duplicates | apps/web/src/views/FarmsStudio/__tests__/publicFarmFactory.eligibility.test.ts | 10 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-duplicates | apps/web/src/views/FarmsStudio/__tests__/publicFarmFactory.eligibility.test.ts | 12 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-named-as-default | apps/web/src/views/FarmsStudio/components/FarmsGrid.tsx | 5 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-named-as-default | apps/web/src/views/FarmsStudio/farmsRuntime/FarmsActionHost.tsx | 27 | ACTIVE | YES | Style or redundant dependency/import identity; no demonstrated runtime defect. | N1 |
| react-hooks/exhaustive-deps | apps/web/src/views/FarmsStudio/farmsRuntime/FarmsActionHost.tsx | 198 | ACTIVE | YES | Contextual false positive or guarded/stable identity; no demonstrated product risk. | N4 |
| react-hooks/exhaustive-deps | apps/web/src/views/FarmsStudio/farmsRuntime/FarmsActionHost.tsx | 224 | ACTIVE | YES | Contextual false positive or guarded/stable identity; no demonstrated product risk. | N4 |
| react-hooks/exhaustive-deps | apps/web/src/views/FarmsStudio/farmsRuntime/FarmsActionHost.tsx | 237 | ACTIVE | YES | Contextual false positive or guarded/stable identity; no demonstrated product risk. | N4 |
| no-void | apps/web/src/views/FarmsStudio/farmsRuntime/useFarmsStakingRuntime.ts | 221 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| react-hooks/exhaustive-deps | apps/web/src/views/FarmsStudio/modules/FarmInlineLiquidityStep.tsx | 72 | ACTIVE | YES | Contextual false positive or guarded/stable identity; no demonstrated product risk. | N4 |
| import/no-duplicates | apps/web/src/views/FarmsStudio/modules/FarmsExploreFarmCard.tsx | 13 | ACTIVE | YES | Style or redundant dependency/import identity; no demonstrated runtime defect. | N1 |
| import/no-duplicates | apps/web/src/views/FarmsStudio/modules/FarmsExploreFarmCard.tsx | 14 | ACTIVE | YES | Style or redundant dependency/import identity; no demonstrated runtime defect. | N1 |
| no-void | apps/web/src/views/FarmsStudio/modules/FarmsExploreFarmCard.tsx | 520 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-void | apps/web/src/views/FarmsStudio/modules/FarmsExploreFarmCard.tsx | 573 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| consistent-return | apps/web/src/views/FarmsStudio/modules/FarmsExploreFarmsModule.tsx | 669 | ACTIVE | YES | Contextual false positive or guarded/stable identity; no demonstrated product risk. | N4 |
| no-void | apps/web/src/views/FarmsStudio/modules/FarmsFinishedFarmCard.tsx | 401 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-void | apps/web/src/views/FarmsStudio/modules/PublicFarmFactoryWorkspace.tsx | 744 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-void | apps/web/src/views/FarmsStudio/modules/PublicFarmFactoryWorkspace.tsx | 965 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| import/no-duplicates | apps/web/src/views/Home/components/CakeDataRow.tsx | 9 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-duplicates | apps/web/src/views/Home/components/CakeDataRow.tsx | 13 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-duplicates | apps/web/src/views/Home/components/UserBanner/HarvestCard.tsx | 3 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-duplicates | apps/web/src/views/Home/components/UserBanner/HarvestCard.tsx | 7 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| react-hooks/exhaustive-deps | apps/web/src/views/Home/hooks/useFarmsWithBalance.tsx | 48 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-duplicates | apps/web/src/views/Home/hooks/useGetTopPoolsByApr.tsx | 8 | ACTIVE | YES | Style or redundant dependency/import identity; no demonstrated runtime defect. | N1 |
| import/no-duplicates | apps/web/src/views/Home/hooks/useGetTopPoolsByApr.tsx | 12 | ACTIVE | YES | Style or redundant dependency/import identity; no demonstrated runtime defect. | N1 |
| import/no-named-as-default | apps/web/src/views/HomeTrade/DexHomeScreen.tsx | 13 | ACTIVE | YES | Style or redundant dependency/import identity; no demonstrated runtime defect. | N1 |
| react-hooks/exhaustive-deps | apps/web/src/views/HomeTrade/DexHomeScreen.tsx | 545 | ACTIVE | YES | Style or redundant dependency/import identity; no demonstrated runtime defect. | N1 |
| no-void | apps/web/src/views/HomeTrade/DexHomeScreen.tsx | 599 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-void | apps/web/src/views/HomeTrade/DexHomeScreen.tsx | 605 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| import/no-named-as-default | apps/web/src/views/HomeTrade/HomeMarketOverview.tsx | 5 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-named-as-default | apps/web/src/views/HomeTrade/HomeTradeDataContext.tsx | 3 | ACTIVE | YES | Style or redundant dependency/import identity; no demonstrated runtime defect. | N1 |
| import/no-named-as-default | apps/web/src/views/HomeTrade/HomeTradeDataRuntime.tsx | 2 | ACTIVE | YES | Style or redundant dependency/import identity; no demonstrated runtime defect. | N1 |
| import/no-named-as-default | apps/web/src/views/HomeTrade/MarketPulsePanel.tsx | 5 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-named-as-default | apps/web/src/views/HomeTrade/MarketPulsePanel.tsx | 6 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-named-as-default | apps/web/src/views/HomeTrade/TopMoversSnapshotRuntime.tsx | 10 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-void | apps/web/src/views/HomeTrade/__tests__/featuredMarketPolling.test.tsx | 14 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-named-as-default | apps/web/src/views/HomeTrade/__tests__/homeRuntimeFeedback.test.tsx | 4 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| react-hooks/rules-of-hooks | apps/web/src/views/HomeTrade/__tests__/homeRuntimeFeedback.test.tsx | 10 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/views/HomeTrade/useDexTrendingRankings.ts | 165 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/views/HomeTrade/useDexTrendingRankings.ts | 169 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-duplicates | apps/web/src/views/Ilos/components/IfoFoldableCard/IfoPoolCard/ClaimButton.tsx | 2 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-duplicates | apps/web/src/views/Ilos/components/IfoFoldableCard/IfoPoolCard/ClaimButton.tsx | 6 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-duplicates | apps/web/src/views/Ilos/components/IfoFoldableCard/IfoPoolCard/ContributeButtonBNB.tsx | 3 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-duplicates | apps/web/src/views/Ilos/components/IfoFoldableCard/IfoPoolCard/ContributeButtonBNB.tsx | 9 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-duplicates | apps/web/src/views/Ilos/components/IfoFoldableCard/IfoPoolCard/ContributeButtonETH.tsx | 3 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-duplicates | apps/web/src/views/Ilos/components/IfoFoldableCard/IfoPoolCard/ContributeButtonETH.tsx | 9 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-duplicates | apps/web/src/views/Ilos/components/IfoFoldableCard/IfoPoolCard/ContributeModalBNB.tsx | 5 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-duplicates | apps/web/src/views/Ilos/components/IfoFoldableCard/IfoPoolCard/ContributeModalBNB.tsx | 17 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-duplicates | apps/web/src/views/Ilos/components/IfoFoldableCard/IfoPoolCard/ContributeModalETH.tsx | 5 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-duplicates | apps/web/src/views/Ilos/components/IfoFoldableCard/IfoPoolCard/ContributeModalETH.tsx | 18 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-duplicates | apps/web/src/views/Ilos/components/IfoFoldableCard/index.tsx | 13 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-duplicates | apps/web/src/views/Ilos/components/IfoFoldableCard/index.tsx | 18 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-named-as-default | apps/web/src/views/ImportExistingToken/ImportExistingTokenScreen.tsx | 4 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-named-as-default | apps/web/src/views/ImportExistingToken/ImportExistingTokenScreen.tsx | 5 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-named-as-default | apps/web/src/views/ImportExistingToken/ImportExistingTokenScreen.tsx | 6 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-named-as-default | apps/web/src/views/ImportExistingToken/ImportExistingTokenScreen.tsx | 7 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-named-as-default | apps/web/src/views/ImportExistingToken/ImportExistingTokenScreen.tsx | 8 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-named-as-default | apps/web/src/views/ImportExistingToken/ImportExistingTokenScreen.tsx | 9 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-named-as-default | apps/web/src/views/ImportExistingToken/ImportExistingTokenScreen.tsx | 10 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-named-as-default | apps/web/src/views/ImportExistingToken/ImportExistingTokenScreen.tsx | 11 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-named-as-default | apps/web/src/views/ImportExistingToken/ImportExistingTokenScreen.tsx | 12 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-named-as-default | apps/web/src/views/ImportExistingToken/ImportExistingTokenScreen.tsx | 13 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-void | apps/web/src/views/ImportExistingToken/components/AIManifestSection.tsx | 66 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-void | apps/web/src/views/ImportExistingToken/importExistingTokenRuntime/useImportExistingTokenRuntime.ts | 147 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-named-as-default | apps/web/src/views/LiquidityStudio/components/LiquidityBuilderPanel.tsx | 10 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-constant-condition | apps/web/src/views/LiquidityStudio/components/LiquidityBuildingPanel.tsx | 149 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-void | apps/web/src/views/LiquidityStudio/components/LiquidityStudioChrome.tsx | 179 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-void | apps/web/src/views/LiquidityStudio/liquidityBuilding/product/LbReviewView.tsx | 369 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-void | apps/web/src/views/LiquidityStudio/liquidityBuilding/useLbOwnerPrograms.ts | 33 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| consistent-return | apps/web/src/views/LiquidityStudio/liquidityBuilding/useLbOwnerPrograms.ts | 57 | ACTIVE | YES | Contextual false positive or guarded/stable identity; no demonstrated product risk. | N4 |
| no-void | apps/web/src/views/LiquidityStudio/liquidityBuilding/useLbProgramDetail.ts | 38 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| consistent-return | apps/web/src/views/LiquidityStudio/liquidityBuilding/useLbProgramDetail.ts | 69 | ACTIVE | YES | Contextual false positive or guarded/stable identity; no demonstrated product risk. | N4 |
| no-void | apps/web/src/views/LiquidityStudio/liquidityBuilding/useLiquidityBuildingCard.ts | 282 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-loop-func | apps/web/src/views/LiquidityStudio/liquidityRuntime/__tests__/addLiquidityApprovalLifecycle.test.tsx | 135 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/views/LiquidityStudio/liquidityRuntime/__tests__/addLiquidityApprovalLifecycle.test.tsx | 324 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-named-as-default | apps/web/src/views/LiquidityStudio/liquidityRuntime/useLiquidityMintRuntime.tsx | 49 | ACTIVE | YES | Style or redundant dependency/import identity; no demonstrated runtime defect. | N1 |
| no-void | apps/web/src/views/LiquidityStudio/liquidityRuntime/useLiquidityMintRuntime.tsx | 310 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-void | apps/web/src/views/LiquidityStudio/liquidityRuntime/useLiquidityMintRuntime.tsx | 853 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-void | apps/web/src/views/LiquidityStudio/liquidityRuntime/useLiquidityMintRuntime.tsx | 1042 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-void | apps/web/src/views/LiquidityStudio/liquidityRuntime/useLiquidityMintRuntime.tsx | 1065 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-void | apps/web/src/views/LiquidityStudio/modules/LiquidityAddModule.tsx | 886 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-void | apps/web/src/views/LiquidityStudio/modules/LiquidityMyPositionsModule.tsx | 883 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-void | apps/web/src/views/LiquidityStudio/onePage/DexLiquiditySnapshot.tsx | 440 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-void | apps/web/src/views/LiquidityStudio/onePage/DexLiquiditySnapshot.tsx | 441 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-void | apps/web/src/views/LiquidityStudio/onePage/DexLiquiditySnapshot.tsx | 453 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-void | apps/web/src/views/LiquidityStudio/onePage/LiquidityBuildingCard.tsx | 1255 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-void | apps/web/src/views/LiquidityStudio/onePage/LiquidityBuildingCard.tsx | 1266 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-void | apps/web/src/views/LiquidityStudio/onePage/LiquidityBuildingCard.tsx | 1307 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-void | apps/web/src/views/LiquidityStudio/onePage/LiquidityBuildingCard.tsx | 1388 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-void | apps/web/src/views/LiquidityStudio/onePage/LiquidityBuildingCard.tsx | 1552 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-void | apps/web/src/views/LiquidityStudio/onePage/UnifiedLiquidityPage.tsx | 118 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-named-as-default | apps/web/src/views/LiquidityStudio/v3/LiquidityStudioV3Shell.tsx | 19 | ACTIVE | YES | Style or redundant dependency/import identity; no demonstrated runtime defect. | N1 |
| no-void | apps/web/src/views/ListStudio/ClaimProjectFallback.tsx | 40 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| consistent-return | apps/web/src/views/ListStudio/ListAiCopilot.tsx | 575 | ACTIVE | YES | Contextual false positive or guarded/stable identity; no demonstrated product risk. | N4 |
| no-void | apps/web/src/views/ListStudio/ListContractFirstFunnel.tsx | 326 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-void | apps/web/src/views/ListStudio/ListContractFirstFunnel.tsx | 330 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-void | apps/web/src/views/ListStudio/ListContractFirstFunnel.tsx | 385 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-void | apps/web/src/views/ListStudio/ListContractFirstFunnel.tsx | 391 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-void | apps/web/src/views/ListStudio/ListFeaturedCheckout.tsx | 316 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| react-hooks/exhaustive-deps | apps/web/src/views/ListStudio/ListInlineLiquidityStep.tsx | 89 | ACTIVE | YES | Contextual false positive or guarded/stable identity; no demonstrated product risk. | N4 |
| no-void | apps/web/src/views/ListStudio/ListTrendBoostCheckout.tsx | 280 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-void | apps/web/src/views/ListStudio/ListWorkspace.tsx | 1134 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| consistent-return | apps/web/src/views/ListStudio/ListWorkspace.tsx | 1191 | ACTIVE | YES | Contextual false positive or guarded/stable identity; no demonstrated product risk. | N4 |
| consistent-return | apps/web/src/views/ListStudio/ListWorkspace.tsx | 1211 | ACTIVE | YES | Contextual false positive or guarded/stable identity; no demonstrated product risk. | N4 |
| consistent-return | apps/web/src/views/ListStudio/ListWorkspace.tsx | 1235 | ACTIVE | YES | Contextual false positive or guarded/stable identity; no demonstrated product risk. | N4 |
| no-void | apps/web/src/views/ListStudio/ListWorkspace.tsx | 1567 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-void | apps/web/src/views/ListStudio/ListWorkspace.tsx | 1584 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-void | apps/web/src/views/ListStudio/ListWorkspace.tsx | 1587 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-void | apps/web/src/views/ListStudio/ListWorkspace.tsx | 1592 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-void | apps/web/src/views/ListStudio/ListWorkspace.tsx | 1622 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-void | apps/web/src/views/ListStudio/createToken/CreateTokenPostCreationFunnel.tsx | 310 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-void | apps/web/src/views/ListStudio/useListIntent.ts | 22 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-void | apps/web/src/views/ListStudio/useListIntent.ts | 30 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-void | apps/web/src/views/MarcoBridge/MarcoBridgeWorkspace.tsx | 603 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-void | apps/web/src/views/MarcoBridge/MarcoBridgeWorkspace.tsx | 662 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| consistent-return | apps/web/src/views/MarcoBridge/MarcoBridgeWorkspace.tsx | 680 | ACTIVE | YES | Contextual false positive or guarded/stable identity; no demonstrated product risk. | N4 |
| no-void | apps/web/src/views/MarcoBridge/MarcoBridgeWorkspace.tsx | 690 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| consistent-return | apps/web/src/views/MarcoBridge/MarcoBridgeWorkspace.tsx | 707 | ACTIVE | YES | Contextual false positive or guarded/stable identity; no demonstrated product risk. | N4 |
| no-void | apps/web/src/views/MarcoBridge/MarcoBridgeWorkspace.tsx | 715 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| consistent-return | apps/web/src/views/MarcoBridge/MarcoBridgeWorkspace.tsx | 721 | ACTIVE | YES | Contextual false positive or guarded/stable identity; no demonstrated product risk. | N4 |
| no-void | apps/web/src/views/MarcoBridge/MarcoBridgeWorkspace.tsx | 741 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-void | apps/web/src/views/MarcoBridge/MarcoBridgeWorkspace.tsx | 828 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| react-hooks/exhaustive-deps | apps/web/src/views/Passport/v1/usePassportV1Runtime.ts | 152 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| react-hooks/exhaustive-deps | apps/web/src/views/Passport/v1/usePassportV1Runtime.ts | 227 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| react-hooks/exhaustive-deps | apps/web/src/views/Passport/v1/usePassportV1Runtime.ts | 238 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| react-hooks/exhaustive-deps | apps/web/src/views/Passport/v1/usePassportV1Runtime.ts | 239 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| react-hooks/exhaustive-deps | apps/web/src/views/Passport/v1/usePassportV1Runtime.ts | 240 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| react-hooks/exhaustive-deps | apps/web/src/views/Passport/v1/usePassportV1Runtime.ts | 241 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-void | apps/web/src/views/PassportStudio/buildPassportRecentActivityViewModel.ts | 276 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-duplicates | apps/web/src/views/Pool/index.tsx | 2 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-duplicates | apps/web/src/views/Pool/index.tsx | 3 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-duplicates | apps/web/src/views/Pools/components/CakeVaultCard/VaultStakeModal.tsx | 13 | ACTIVE | YES | Style or redundant dependency/import identity; no demonstrated runtime defect. | N1 |
| import/no-duplicates | apps/web/src/views/Pools/components/CakeVaultCard/VaultStakeModal.tsx | 25 | ACTIVE | YES | Style or redundant dependency/import identity; no demonstrated runtime defect. | N1 |
| import/no-duplicates | apps/web/src/views/Pools/components/PoolCard/Modals/CollectModal.tsx | 13 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-duplicates | apps/web/src/views/Pools/components/PoolCard/Modals/CollectModal.tsx | 16 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-duplicates | apps/web/src/views/Pools/components/PoolCard/Modals/StakeModal.tsx | 14 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-duplicates | apps/web/src/views/Pools/components/PoolCard/Modals/StakeModal.tsx | 17 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-named-as-default | apps/web/src/views/PoolsStudio/PoolsStudioScreen.tsx | 9 | ACTIVE | YES | Style or redundant dependency/import identity; no demonstrated runtime defect. | N1 |
| react-hooks/exhaustive-deps | apps/web/src/views/PoolsStudio/PoolsStudioScreen.tsx | 71 | ACTIVE | YES | Contextual false positive or guarded/stable identity; no demonstrated product risk. | N4 |
| import/no-named-as-default | apps/web/src/views/PoolsStudio/__tests__/publicPoolCreationHidden.test.tsx | 24 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-named-as-default | apps/web/src/views/PoolsStudio/components/CreatePoolCta.tsx | 7 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| consistent-return | apps/web/src/views/PoolsStudio/components/CreatePoolCta.tsx | 888 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| consistent-return | apps/web/src/views/PoolsStudio/components/CreatePoolCta.tsx | 907 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-named-as-default | apps/web/src/views/PoolsStudio/components/FeaturedPoolHero.tsx | 8 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-named-as-default | apps/web/src/views/PoolsStudio/components/FeaturedPoolPanel.tsx | 9 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-named-as-default | apps/web/src/views/PoolsStudio/components/PoolsBelowFold.tsx | 4 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-named-as-default | apps/web/src/views/PoolsStudio/components/PoolsGrid.tsx | 7 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-named-as-default | apps/web/src/views/PoolsStudio/components/PoolsSidebar.tsx | 3 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-named-as-default | apps/web/src/views/PoolsStudio/components/PoolsSidebar.tsx | 4 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-named-as-default | apps/web/src/views/PoolsStudio/components/PoolsSidebar.tsx | 5 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-named-as-default | apps/web/src/views/PoolsStudio/components/PoolsViewToolbar.tsx | 5 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-named-as-default | apps/web/src/views/PoolsStudio/components/PoolsViewToolbar.tsx | 6 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-named-as-default | apps/web/src/views/PoolsStudio/components/__tests__/PoolGridCard.test.tsx | 4 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| consistent-return | apps/web/src/views/PoolsStudio/modules/PoolsExplorePoolsModule.tsx | 638 | ACTIVE | YES | Contextual false positive or guarded/stable identity; no demonstrated product risk. | N4 |
| react-hooks/exhaustive-deps | apps/web/src/views/PoolsStudio/poolsRuntime/PoolsActionHost.tsx | 57 | ACTIVE | YES | Contextual false positive or guarded/stable identity; no demonstrated product risk. | N4 |
| react-hooks/exhaustive-deps | apps/web/src/views/PoolsStudio/poolsRuntime/PoolsActionHost.tsx | 68 | ACTIVE | YES | Contextual false positive or guarded/stable identity; no demonstrated product risk. | N4 |
| react-hooks/exhaustive-deps | apps/web/src/views/PoolsStudio/poolsRuntime/PoolsActionHost.tsx | 73 | ACTIVE | YES | Contextual false positive or guarded/stable identity; no demonstrated product risk. | N4 |
| react-hooks/exhaustive-deps | apps/web/src/views/PoolsStudio/poolsRuntime/PoolsActionHost.tsx | 85 | ACTIVE | YES | Contextual false positive or guarded/stable identity; no demonstrated product risk. | N4 |
| react-hooks/exhaustive-deps | apps/web/src/views/PoolsStudio/poolsRuntime/PoolsActionHost.tsx | 95 | ACTIVE | YES | Contextual false positive or guarded/stable identity; no demonstrated product risk. | N4 |
| no-await-in-loop | apps/web/src/views/PoolsStudio/poolsRuntime/useMelegaFactoryPools.ts | 85 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-await-in-loop | apps/web/src/views/PoolsStudio/poolsRuntime/useMelegaFactoryPools.ts | 92 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| import/no-named-as-default | apps/web/src/views/PoolsStudio/poolsRuntime/usePoolsStakingRuntime.ts | 25 | ACTIVE | YES | Style or redundant dependency/import identity; no demonstrated runtime defect. | N1 |
| no-void | apps/web/src/views/PoolsStudio/poolsRuntime/usePoolsStakingRuntime.ts | 279 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-void | apps/web/src/views/PoolsStudio/poolsRuntime/usePoolsStakingRuntime.ts | 289 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| react-hooks/exhaustive-deps | apps/web/src/views/PortfolioStudio/runtime/usePortfolioRuntime.ts | 142 | ACTIVE | YES | Style or redundant dependency/import identity; no demonstrated runtime defect. | N1 |
| react-hooks/exhaustive-deps | apps/web/src/views/PortfolioStudio/runtime/usePortfolioRuntime.ts | 221 | ACTIVE | YES | Style or redundant dependency/import identity; no demonstrated runtime defect. | N1 |
| react-hooks/exhaustive-deps | apps/web/src/views/PortfolioStudio/runtime/usePortfolioRuntime.ts | 232 | ACTIVE | YES | Contextual false positive or guarded/stable identity; no demonstrated product risk. | N4 |
| react-hooks/exhaustive-deps | apps/web/src/views/PortfolioStudio/runtime/usePortfolioRuntime.ts | 233 | ACTIVE | YES | Contextual false positive or guarded/stable identity; no demonstrated product risk. | N4 |
| react-hooks/exhaustive-deps | apps/web/src/views/PortfolioStudio/runtime/usePortfolioRuntime.ts | 234 | ACTIVE | YES | Contextual false positive or guarded/stable identity; no demonstrated product risk. | N4 |
| react-hooks/exhaustive-deps | apps/web/src/views/ProjectPage/useProjectWalletRelationship.ts | 57 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| react-hooks/exhaustive-deps | apps/web/src/views/ProjectPage/useProjectWalletRelationship.ts | 231 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-void | apps/web/src/views/ProjectPage/v1/ProjectTradingEmbed.tsx | 175 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| consistent-return | apps/web/src/views/ProjectPage/v1/ProjectTradingEmbed.tsx | 179 | ACTIVE | YES | Contextual false positive or guarded/stable identity; no demonstrated product risk. | N4 |
| consistent-return | apps/web/src/views/ProjectPage/v1/useProjectLiveMarket.ts | 93 | ACTIVE | YES | Contextual false positive or guarded/stable identity; no demonstrated product risk. | N4 |
| no-void | apps/web/src/views/ProjectPage/v3/ProjectPageV3Shell.tsx | 597 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-void | apps/web/src/views/ProjectPage/v4/ProjectPageV4Shell.tsx | 644 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-void | apps/web/src/views/ProjectPage/v5/ProjectPageV5Shell.tsx | 657 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| consistent-return | apps/web/src/views/ProjectPage/v5/ProjectPageV5Shell.tsx | 683 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-void | apps/web/src/views/ProjectPage/v6/ProjectPageV6Shell.tsx | 615 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| consistent-return | apps/web/src/views/ProjectPage/v6/ProjectPageV6Shell.tsx | 641 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-void | apps/web/src/views/ProjectPage/v7/ProjectPageV7Shell.tsx | 1176 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| consistent-return | apps/web/src/views/ProjectPage/v7/ProjectPageV7Shell.tsx | 1202 | ACTIVE | YES | Contextual false positive or guarded/stable identity; no demonstrated product risk. | N4 |
| import/no-named-as-default | apps/web/src/views/ProjectsStudio/ProjectsStudioScreen.tsx | 5 | ACTIVE | YES | Style or redundant dependency/import identity; no demonstrated runtime defect. | N1 |
| import/no-named-as-default | apps/web/src/views/ProjectsStudio/ProjectsStudioScreen.tsx | 6 | ACTIVE | YES | Style or redundant dependency/import identity; no demonstrated runtime defect. | N1 |
| import/no-named-as-default | apps/web/src/views/ProjectsStudio/ProjectsStudioScreen.tsx | 7 | ACTIVE | YES | Style or redundant dependency/import identity; no demonstrated runtime defect. | N1 |
| no-void | apps/web/src/views/ProjectsStudio/components/ProjectsFilterRow.tsx | 213 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-void | apps/web/src/views/ProjectsStudio/components/ProjectsFilterRow.tsx | 219 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-void | apps/web/src/views/ProjectsStudio/projectsRuntime/useProjectsIntelligenceRuntime.ts | 488 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| import/no-named-as-default | apps/web/src/views/RadarStudio/RadarStudioScreen.tsx | 6 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-named-as-default | apps/web/src/views/RadarStudio/RadarStudioScreen.tsx | 7 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-named-as-default | apps/web/src/views/RadarStudio/RadarStudioScreen.tsx | 8 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-named-as-default | apps/web/src/views/RadarStudio/RadarStudioScreen.tsx | 9 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-named-as-default | apps/web/src/views/RadarStudio/RadarStudioScreen.tsx | 10 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-named-as-default | apps/web/src/views/RadarStudio/RadarStudioScreen.tsx | 11 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-named-as-default | apps/web/src/views/RadarStudio/RadarStudioScreen.tsx | 12 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-named-as-default | apps/web/src/views/RadarStudio/RadarStudioScreen.tsx | 13 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-named-as-default | apps/web/src/views/RadarStudio/RadarStudioScreen.tsx | 14 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-named-as-default | apps/web/src/views/RadarStudio/RadarStudioScreen.tsx | 15 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-duplicates | apps/web/src/views/RadarStudio/components/ContractIntelligencePreview.tsx | 3 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-duplicates | apps/web/src/views/RadarStudio/components/ContractIntelligencePreview.tsx | 4 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| consistent-return | apps/web/src/views/RadarStudio/components/ContractIntelligencePreview.tsx | 280 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-named-as-default | apps/web/src/views/RadarStudio/components/RadarContractIntelligenceInput.tsx | 5 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-named-as-default | apps/web/src/views/RadarStudio/components/RadarDiscoveriesGrid.tsx | 6 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-named-as-default | apps/web/src/views/RadarStudio/components/RadarEventCard.tsx | 6 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-void | apps/web/src/views/SmartSwapStudio/modules/SmartSwapExecutionPreview/useShadowRuntimePreflight.ts | 326 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-void | apps/web/src/views/SmartSwapStudio/modules/SmartSwapExecutionPreview/useShadowRuntimePreflight.ts | 399 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| react-hooks/exhaustive-deps | apps/web/src/views/SmartSwapStudio/modules/SmartSwapHistory/useSmartSwapHistory.ts | 56 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| react/no-unused-state | apps/web/src/views/TestnetLiquidity/EmergencyTestnetLiquidityPage.tsx | 407 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/views/TestnetLiquidity/emergencyWalletActions.ts | 125 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/views/TestnetLiquidity/emergencyWalletActions.ts | 133 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| react/no-unused-state | apps/web/src/views/TestnetWrapperDeploy/FounderWrapperDeployPage.tsx | 360 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/views/TestnetWrapperDeploy/wrapperDeployActions.ts | 207 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/views/TestnetWrapperDeploy/wrapperDeployActions.ts | 220 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| react/no-unused-state | apps/web/src/views/TestnetWrapperValidate/FounderWrapperValidatePage.tsx | 433 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/views/TestnetWrapperValidate/wrapperValidateActions.ts | 197 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-await-in-loop | apps/web/src/views/TestnetWrapperValidate/wrapperValidateActions.ts | 209 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-named-as-default | apps/web/src/views/Trade/TradeCenterPanel.tsx | 3 | ACTIVE | YES | Style or redundant dependency/import identity; no demonstrated runtime defect. | N1 |
| import/no-named-as-default | apps/web/src/views/Trade/TradeCenterPanel.tsx | 4 | ACTIVE | YES | Style or redundant dependency/import identity; no demonstrated runtime defect. | N1 |
| import/no-named-as-default | apps/web/src/views/Trade/TradeCenterPanel.tsx | 5 | ACTIVE | YES | Style or redundant dependency/import identity; no demonstrated runtime defect. | N1 |
| import/no-named-as-default | apps/web/src/views/Trade/TradeMarketPanel.tsx | 3 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-named-as-default | apps/web/src/views/Trade/TradeMarketPanel.tsx | 4 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-named-as-default | apps/web/src/views/Trade/TradeMarketPanel.tsx | 5 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-named-as-default | apps/web/src/views/Trade/TradeMarketPanel.tsx | 6 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-named-as-default | apps/web/src/views/Trade/TradeMarketPanel.tsx | 7 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-named-as-default | apps/web/src/views/Trade/TradeTerminalScreen.tsx | 12 | ACTIVE | YES | Style or redundant dependency/import identity; no demonstrated runtime defect. | N1 |
| import/no-named-as-default | apps/web/src/views/Trade/TradeTerminalScreen.tsx | 13 | ACTIVE | YES | Style or redundant dependency/import identity; no demonstrated runtime defect. | N1 |
| import/no-named-as-default | apps/web/src/views/Trade/TradeTerminalScreen.tsx | 14 | ACTIVE | YES | Style or redundant dependency/import identity; no demonstrated runtime defect. | N1 |
| import/no-named-as-default | apps/web/src/views/Trade/TradeTerminalScreen.tsx | 15 | ACTIVE | YES | Style or redundant dependency/import identity; no demonstrated runtime defect. | N1 |
| import/no-named-as-default | apps/web/src/views/Trade/TradeTerminalScreen.tsx | 16 | ACTIVE | YES | Style or redundant dependency/import identity; no demonstrated runtime defect. | N1 |
| import/no-named-as-default | apps/web/src/views/Trade/TradeTerminalScreen.tsx | 17 | ACTIVE | YES | Style or redundant dependency/import identity; no demonstrated runtime defect. | N1 |
| import/no-named-as-default | apps/web/src/views/Trade/TradeTerminalScreen.tsx | 18 | ACTIVE | YES | Style or redundant dependency/import identity; no demonstrated runtime defect. | N1 |
| import/no-named-as-default | apps/web/src/views/Trade/components/TradeChartPanel.tsx | 4 | ACTIVE | YES | Style or redundant dependency/import identity; no demonstrated runtime defect. | N1 |
| import/no-named-as-default | apps/web/src/views/Trade/components/TradePriceChart.tsx | 11 | ACTIVE | YES | Style or redundant dependency/import identity; no demonstrated runtime defect. | N1 |
| import/no-named-as-default | apps/web/src/views/Trade/components/TradeRecentSwaps.tsx | 4 | ACTIVE | YES | Style or redundant dependency/import identity; no demonstrated runtime defect. | N1 |
| import/no-named-as-default | apps/web/src/views/Trade/components/TradeRightRail.tsx | 7 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-named-as-default | apps/web/src/views/Trade/components/TradeRightRail.tsx | 8 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-named-as-default | apps/web/src/views/Trade/components/TradeRightRail.tsx | 12 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-named-as-default | apps/web/src/views/Trade/components/TradeSwapsTable.tsx | 7 | ACTIVE | YES | Style or redundant dependency/import identity; no demonstrated runtime defect. | N1 |
| import/no-named-as-default | apps/web/src/views/Trade/components/TradeWatchlist.tsx | 5 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-named-as-default | apps/web/src/views/Trade/components/__tests__/TradePriceChart.priceTruth.test.tsx | 67 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-duplicates | apps/web/src/views/Trade/tradeRuntime/formatTradeRouter.ts | 1 | ACTIVE | YES | Style or redundant dependency/import identity; no demonstrated runtime defect. | N1 |
| import/no-duplicates | apps/web/src/views/Trade/tradeRuntime/formatTradeRouter.ts | 2 | ACTIVE | YES | Style or redundant dependency/import identity; no demonstrated runtime defect. | N1 |
| react-hooks/exhaustive-deps | apps/web/src/views/Trade/tradeRuntime/useTradeSettlementMetadata.ts | 41 | ACTIVE | YES | Style or redundant dependency/import identity; no demonstrated runtime defect. | N1 |
| import/no-duplicates | apps/web/src/views/Trade/useTradeTerminalData.ts | 7 | ACTIVE | YES | Style or redundant dependency/import identity; no demonstrated runtime defect. | N1 |
| import/no-duplicates | apps/web/src/views/Trade/useTradeTerminalData.ts | 15 | ACTIVE | YES | Style or redundant dependency/import identity; no demonstrated runtime defect. | N1 |
| import/no-duplicates | apps/web/src/views/Trade/useTradeTerminalData.ts | 19 | ACTIVE | YES | Style or redundant dependency/import identity; no demonstrated runtime defect. | N1 |
| import/no-duplicates | apps/web/src/views/Trade/useTradeTerminalData.ts | 20 | ACTIVE | YES | Style or redundant dependency/import identity; no demonstrated runtime defect. | N1 |
| react-hooks/exhaustive-deps | apps/web/src/views/Trade/useTradeTerminalData.ts | 650 | ACTIVE | YES | Style or redundant dependency/import identity; no demonstrated runtime defect. | N1 |
| react-hooks/exhaustive-deps | apps/web/src/views/Trade/useTradeTerminalData.ts | 823 | ACTIVE | YES | Style or redundant dependency/import identity; no demonstrated runtime defect. | N1 |
| import/no-named-as-default | apps/web/src/views/TrendingStudio/TrendingStudioScreen.tsx | 5 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-named-as-default | apps/web/src/views/TrendingStudio/TrendingStudioScreen.tsx | 6 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-named-as-default | apps/web/src/views/TrendingStudio/TrendingStudioScreen.tsx | 7 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-named-as-default | apps/web/src/views/TrendingStudio/TrendingStudioScreen.tsx | 8 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-named-as-default | apps/web/src/views/TrendingStudio/TrendingStudioScreen.tsx | 9 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-named-as-default | apps/web/src/views/TrendingStudio/TrendingStudioScreen.tsx | 10 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-named-as-default | apps/web/src/views/TrendingStudio/TrendingStudioScreen.tsx | 11 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| import/no-named-as-default | apps/web/src/views/TrendingStudio/components/TrendingNowGrid.tsx | 6 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-void | apps/web/src/views/shared/monetization/ClaimProjectWizardModal.tsx | 334 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-void | apps/web/src/views/shared/monetization/ClaimProjectWizardModal.tsx | 339 | TEST/TOOLING | NO | Outside the active production closure (test/tooling/historical). | N3 |
| no-void | apps/web/src/views/shared/monetization/CommercialCheckoutModal.tsx | 1520 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-void | apps/web/src/views/shared/monetization/CommercialCheckoutModal.tsx | 1536 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-void | apps/web/src/views/shared/monetization/CommercialCheckoutModal.tsx | 1586 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-void | apps/web/src/views/shared/monetization/CommercialCheckoutModal.tsx | 1615 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-void | apps/web/src/views/shared/monetization/CommercialCheckoutModal.tsx | 1780 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-void | apps/web/src/views/shared/monetization/CommercialCheckoutModal.tsx | 1894 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-void | apps/web/src/views/shared/monetization/CommercialCheckoutModal.tsx | 1895 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-void | apps/web/src/views/shared/monetization/CommercialCheckoutModal.tsx | 2357 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-void | apps/web/src/views/shared/monetization/CommercialCheckoutModal.tsx | 2366 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-void | apps/web/src/views/shared/monetization/CommercialCheckoutModal.tsx | 2375 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-void | apps/web/src/views/shared/monetization/CommercialCheckoutModal.tsx | 2438 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
| no-void | apps/web/src/views/shared/monetization/CommercialCheckoutModal.tsx | 2739 | ACTIVE | YES | Intentional sequencing or explicitly detached promise with bounded handling. | N2 |
