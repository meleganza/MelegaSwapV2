# Repository hygiene baseline

Mission: `MELEGA-DEX-REPOSITORY-HYGIENE-AND-LEGACY-DEBT-ZERO`

Base main: `ce61ef9cfa292d0b184e7572c5447dd25b79a67d`

No fixes were applied before this inventory was captured. The source of truth is [BEFORE_DIAGNOSTICS.json](./BEFORE_DIAGNOSTICS.json), which records every diagnostic with file, line, column, error code, message, and category.

## Commands and counts

- Repository typecheck: `cd apps/web && yarn tsc --noEmit --pretty false`
- Repository diagnostics: **438**
- Active-production diagnostics: **0**
- Category C (tests/historical): **212**
- Category D (unreachable first-party/generated/vendor/tooling): **226**

## Detailed categories

| Category | Meaning | Count |
| --- | --- | ---: |
| C1 | Stale test fixtures or fixture-facing types | 123 |
| C2 | Historical test expectation or import drift | 71 |
| C3 | Test harness or mock typing | 18 |
| D1 | First-party scripts or tooling | 0 |
| D2 | Generated artifacts | 0 |
| D3 | Dead or unreachable first-party modules | 226 |
| D4 | Third-party/vendor/toolchain incompatibility | 0 |

Category D reachability is based on the #117 TypeScript-resolved active-production classifier. It reported 1,533 reachable files and zero diagnostics in that closure on this checkout. A D3 label is a reachability classification, not yet authorization to delete a file; removals require separate reference and entrypoint proof.

## Diagnostics by code

| Code | Count |
| --- | ---: |
| `TS2339` | 165 |
| `TS2307` | 92 |
| `TS2322` | 62 |
| `TS2345` | 24 |
| `TS2352` | 22 |
| `TS2551` | 18 |
| `TS2769` | 13 |
| `TS2739` | 9 |
| `TS2367` | 6 |
| `TS2741` | 5 |
| `TS2556` | 4 |
| `TS8020` | 4 |
| `TS2740` | 3 |
| `TS2300` | 2 |
| `TS2304` | 2 |
| `TS1208` | 1 |
| `TS2305` | 1 |
| `TS2459` | 1 |
| `TS2614` | 1 |
| `TS2702` | 1 |
| `TS2724` | 1 |
| `TS2820` | 1 |

## Diagnostics by file

| File | Count |
| --- | ---: |
| `src/lib/melega-smart-router/__tests__/melega-smart-router-d87.test.ts` | 16 |
| `src/lib/execution-handoff-intake/__tests__/registry-handoff-intake.test.ts` | 14 |
| `src/lib/execution-handoff-consumer/__tests__/execution-handoff-consumer.test.ts` | 12 |
| `src/lib/economic-identity/identity-read-model.ts` | 11 |
| `src/views/CommandCenter/components/CommandDashboardCards.tsx` | 11 |
| `src/views/CommandCenter/components/commandCenterPrimitives.tsx` | 10 |
| `src/lib/execution-handoff-consumer/__tests__/certified-dry-run-handshake.test.ts` | 9 |
| `src/views/ProjectPage/v5/ProjectPageV5Shell.tsx` | 9 |
| `src/lib/liquidity-building-runtime/__tests__/kms-signature-normalization.test.ts` | 8 |
| `src/views/ProjectPage/_archived_wave04_consumer/consumer/ProjectTransparencySummary.tsx` | 8 |
| `src/design-system/melega/components/Ticker/__tests__/tickerContinuity.test.tsx` | 7 |
| `src/lib/execution-gateway/__tests__/execution-gateway.test.ts` | 7 |
| `src/lib/execution-handoff-consumer/__tests__/offline-e2e-dry-run-fixture.test.ts` | 7 |
| `src/lib/execution-ingress/__tests__/execution-ingress.test.ts` | 6 |
| `src/views/CommandCenter/components/CommandKpiCluster.tsx` | 6 |
| `src/lib/data-truth/__tests__/tradeReconciliation.test.ts` | 5 |
| `src/lib/execution-handoff-intake/intake.ts` | 5 |
| `src/views/FarmsStudio/__tests__/publicFarmFactory.feesAndHandoffs.test.ts` | 5 |
| `src/views/ListStudio/ListActionCards.tsx` | 5 |
| `src/lib/liquidity-building-runtime/__tests__/decision-signing-relay.test.ts` | 4 |
| `src/lib/melega-smart-router/__tests__/civilization-router.test.ts` | 4 |
| `src/lib/melega-smart-router/__tests__/melega-smart-router-phase25.test.ts` | 4 |
| `src/views/CommandCenter/components/AIDailyBriefing.tsx` | 4 |
| `src/views/DeploymentOrchestrator/FounderDeploymentPanel.tsx` | 4 |
| `src/views/ListStudio/ListWhyBuildRail.tsx` | 4 |
| `src/views/Pools/components/PoolCard/StyledCardHeader.tsx` | 4 |
| `src/views/PoolsStudio/components/PoolsAnalyticsRow.tsx` | 4 |
| `src/views/ProjectPage/_archived_wave04_consumer/consumer/ProjectHero.tsx` | 4 |
| `src/views/ProjectPage/v6/ProjectPageV6Shell.tsx` | 4 |
| `src/views/TestnetLiquidity/useTestnetLiquidityRuntime.ts` | 4 |
| `src/lib/deployment-orchestrator/__tests__/avalancheV2RouterFounderPrep.test.ts` | 3 |
| `src/lib/deployment-orchestrator/__tests__/bytecodeAutoload.test.ts` | 3 |
| `src/lib/deployment-orchestrator/__tests__/ctMainnetPrep.test.ts` | 3 |
| `src/lib/deployment-orchestrator/__tests__/lbStep2Sequential.test.ts` | 3 |
| `src/lib/deployment-orchestrator/__tests__/lbStep3Sequential.test.ts` | 3 |
| `src/lib/deployment-orchestrator/__tests__/vercelManifestRecovery.test.ts` | 3 |
| `src/lib/economic-review/review-read-model.ts` | 3 |
| `src/lib/execution-handoff-consumer/validate-certified-handshake.ts` | 3 |
| `src/lib/execution-modes/__tests__/execution-modes.test.ts` | 3 |
| `src/lib/homepage-live/resolve-homepage-live.ts` | 3 |
| `src/lib/liquidity-building-runtime/__tests__/lb-act003-activation-simplification.test.ts` | 3 |
| `src/views/BuildStudio/BuildStudioGlobalStyle.tsx` | 3 |
| `src/views/DeploymentOrchestrator/FounderDeploymentShell.tsx` | 3 |
| `src/views/FarmsStudio/__tests__/farmsModule002.overviewKpis.test.ts` | 3 |
| `src/views/Home/components/UserBanner/UserDetail.tsx` | 3 |
| `src/views/Pools/components/PoolsTable/Cells/AutoEarningsCell.tsx` | 3 |
| `src/views/ProjectPage/_archived_wave04_consumer/consumer/ProjectConsumerShell.tsx` | 3 |
| `src/views/ProjectPage/v3/ProjectPageV3Shell.tsx` | 3 |
| `src/views/ProjectPage/v4/ProjectPageV4Shell.tsx` | 3 |
| `src/views/ProjectsStudio/components/ProjectsMachinePanel.tsx` | 3 |
| `src/views/RadarStudio/radarRuntime/useRadarIntelligenceRuntime.ts` | 3 |
| `src/components/SearchModal/__tests__/walletTokenBalanceRegression.test.ts` | 2 |
| `src/hooks/__tests__/avalancheDeploymentRuntimeCrash.test.ts` | 2 |
| `src/hooks/__tests__/runtimeDeploymentFatalCrash.test.ts` | 2 |
| `src/hooks/__tests__/usePairs.test.ts` | 2 |
| `src/hooks/__tests__/walletChainDetection.test.ts` | 2 |
| `src/lib/civilization-runtime/buildCivilizationFabric.ts` | 2 |
| `src/lib/data-truth/__tests__/masterChefEmission.test.ts` | 2 |
| `src/lib/deployment-orchestrator/__tests__/avalancheWrongChainGate.test.ts` | 2 |
| `src/lib/deployment-orchestrator/__tests__/ctMainnetExecution.test.ts` | 2 |
| `src/lib/deployment-orchestrator/__tests__/ctMainnetReady.test.ts` | 2 |
| `src/lib/deployment-orchestrator/__tests__/executionControls.test.ts` | 2 |
| `src/lib/deployment-orchestrator/__tests__/founderDeploy.test.ts` | 2 |
| `src/lib/deployment-orchestrator/__tests__/lbMainnetReady.test.ts` | 2 |
| `src/lib/deployment-orchestrator/__tests__/lbStep4Sequential.test.ts` | 2 |
| `src/lib/deployment-orchestrator/__tests__/lbStep5Sequential.test.ts` | 2 |
| `src/lib/deployment-orchestrator/__tests__/lbStep6Sequential.test.ts` | 2 |
| `src/lib/deployment-orchestrator/__tests__/pffMainnetExecution.test.ts` | 2 |
| `src/lib/deployment-orchestrator/__tests__/pffMainnetPrep.test.ts` | 2 |
| `src/lib/deployment-orchestrator/__tests__/pffMainnetReady.test.ts` | 2 |
| `src/lib/deployment-orchestrator/__tests__/walletConnectCrashRepair.test.ts` | 2 |
| `src/lib/dex-gravity/index.ts` | 2 |
| `src/lib/execution-handoff-consumer/certified-handshake.ts` | 2 |
| `src/lib/execution-handoff-consumer/consume.ts` | 2 |
| `src/lib/execution-modes/__tests__/testnet-arming.test.ts` | 2 |
| `src/lib/marco-bridge/__tests__/marcoBridgeApiPath.test.ts` | 2 |
| `src/lib/marco-bridge/__tests__/remediation.test.ts` | 2 |
| `src/lib/melega-smart-router/__tests__/execution-adapter.test.ts` | 2 |
| `src/lib/monetization/__tests__/paymentWalletChain.test.ts` | 2 |
| `src/lib/performance/__tests__/p0TechnicalPerformance.test.ts` | 2 |
| `src/lib/smartswap-universal-engine/uniswapShadowQuoteReadiness.ts` | 2 |
| `src/pages/api/liquidity-program/[address].ts` | 2 |
| `src/views/BuildStudio/components/buildStudioPrimitives.tsx` | 2 |
| `src/views/CollectiblesStudio/components/FeaturedCollectionPanel.tsx` | 2 |
| `src/views/CommandCenter/components/MachineSummaryCard.tsx` | 2 |
| `src/views/FarmsStudio/__tests__/createFarmUxSimplification.test.ts` | 2 |
| `src/views/FarmsStudio/__tests__/publicFarmFactory.uiLock.test.ts` | 2 |
| `src/views/Home/components/WinSection/LotteryCardContent.tsx` | 2 |
| `src/views/ImportExistingToken/components/ContractInputHero.tsx` | 2 |
| `src/views/ImportExistingToken/components/importTokenPrimitives.tsx` | 2 |
| `src/views/ImportExistingToken/ImportExistingTokenGlobalStyle.tsx` | 2 |
| `src/views/Pools/components/LockedPool/Common/LockedActions.tsx` | 2 |
| `src/views/Pools/components/PoolsTable/Cells/StakedCell.tsx` | 2 |
| `src/views/RadarStudio/components/RadarEventCard.tsx` | 2 |
| `src/views/SmartSwapStudio/modules/SmartSwapExecutionPreview/__tests__/resolveExecutionSourceLabel.test.ts` | 2 |
| `src/views/Trade/__tests__/tradeSwapHeroMobileGeometry.test.ts` | 2 |
| `src/views/Trade/tradeRuntime/__tests__/tradeHistory.test.ts` | 2 |
| `src/app-shell/SidebarExpandableSection.tsx` | 1 |
| `src/lib/d87-pricing/__tests__/d87-pricing.test.ts` | 1 |
| `src/lib/deployment-orchestrator/__tests__/orchestrator.test.ts` | 1 |
| `src/lib/deployment-orchestrator/founderLbSession.ts` | 1 |
| `src/lib/economic-orchestrator/orchestrator-analysis.ts` | 1 |
| `src/lib/economic-runtime/__tests__/runtime.test.ts` | 1 |
| `src/lib/economic-submission/submission-validation.ts` | 1 |
| `src/lib/execution-boundary/__tests__/execution-boundary.test.ts` | 1 |
| `src/lib/execution-gateway/dry-run.ts` | 1 |
| `src/lib/execution-handoff-consumer/validate-handoff.ts` | 1 |
| `src/lib/execution-ingress/__tests__/kap-006c-canonical-ingress.test.ts` | 1 |
| `src/lib/execution-tracker/__tests__/execution-tracker.test.ts` | 1 |
| `src/lib/holder-count/__tests__/resolveHolderMetric.test.ts` | 1 |
| `src/lib/kerl-constitutional/__tests__/kerl-constitutional.test.ts` | 1 |
| `src/lib/liquidity-building-runtime/__tests__/activation-gates.test.ts` | 1 |
| `src/lib/real-event-intake/event-intake-validation.ts` | 1 |
| `src/lib/smart-swap-execution-preview/__tests__/smartSwapModule003.executionPreview.test.ts` | 1 |
| `src/lib/smartswap-universal-engine/__tests__/m8VenueReadiness.test.ts` | 1 |
| `src/pages/api/holder-count.ts` | 1 |
| `src/pages/api/liquidity-programs/[wallet].ts` | 1 |
| `src/pages/claim-project.tsx` | 1 |
| `src/pages/passport/index.tsx` | 1 |
| `src/state/farms/getFarmsAprs.ts` | 1 |
| `src/views/__tests__/melegaDexV1.postRecoveryTruthRepair.test.ts` | 1 |
| `src/views/Assets/components/AssetCapabilityMatrix.tsx` | 1 |
| `src/views/Bridge/BridgeForm/index.tsx` | 1 |
| `src/views/BuildStudio/buildRuntime/buildImportAnalysis.ts` | 1 |
| `src/views/BuildStudio/buildRuntime/buildPoolsFarmsPreview.ts` | 1 |
| `src/views/BuildStudio/components/AIManifestPanel.tsx` | 1 |
| `src/views/BuildStudio/components/AIValidationEngine.tsx` | 1 |
| `src/views/BuildStudio/components/BuildKpiRow.tsx` | 1 |
| `src/views/BuildStudio/components/BuildStudioPageHeader.tsx` | 1 |
| `src/views/Collectibles/CollectibleDetail.tsx` | 1 |
| `src/views/CollectiblesStudio/collectiblesRuntime/formatCommandCenterCollectibles.ts` | 1 |
| `src/views/CommandCenter/commandCenterRuntime/__tests__/commandCenterPortfolioAssistantUI.test.tsx` | 1 |
| `src/views/CommandCenter/components/CommandQuickActions.tsx` | 1 |
| `src/views/EconomicOrchestrator/EconomicOrchestratorConsole.tsx` | 1 |
| `src/views/EconomicSubmission/EconomicSubmissionConsole.tsx` | 1 |
| `src/views/FarmsStudio/__tests__/farmsModule003.myFarms.test.ts` | 1 |
| `src/views/FarmsStudio/__tests__/farmsModule004.exploreFarms.test.ts` | 1 |
| `src/views/FarmsStudio/components/FarmGridCard.tsx` | 1 |
| `src/views/Graph/components/GraphRelationshipList.tsx` | 1 |
| `src/views/Graph/index.tsx` | 1 |
| `src/views/Home/components/FarmsPoolsRow/index.tsx` | 1 |
| `src/views/HomeTrade/components/HomeMachinePanel.tsx` | 1 |
| `src/views/HomeTrade/HomeQuickActions.tsx` | 1 |
| `src/views/HomeTrade/TopMoversSnapshotRuntime.tsx` | 1 |
| `src/views/ImportExistingToken/components/AIManifestSection.tsx` | 1 |
| `src/views/ImportExistingToken/components/InfrastructureSuggestions.tsx` | 1 |
| `src/views/ImportExistingToken/importExistingTokenRuntime/useImportExistingTokenRuntime.ts` | 1 |
| `src/views/PassportStudio/buildPassportPortfolioOverviewViewModel.ts` | 1 |
| `src/views/Pools/components/CakeVaultCard/VaultCardActions/VaultApprovalAction.tsx` | 1 |
| `src/views/Pools/components/PoolsTable/ActionPanel/AutoHarvest.tsx` | 1 |
| `src/views/Pools/components/PoolStatsInfo.tsx` | 1 |
| `src/views/PoolsStudio/components/PoolListCard.tsx` | 1 |
| `src/views/PoolsStudio/components/PoolsActivityTable.tsx` | 1 |
| `src/views/PoolsStudio/poolsRuntime/__tests__/fundedRemainingRewards.test.ts` | 1 |
| `src/views/PoolsStudio/poolsRuntime/__tests__/poolsViewActions.test.ts` | 1 |
| `src/views/ProjectPage/_archived_wave04_consumer/consumer/ProjectChartPanel.tsx` | 1 |
| `src/views/ProjectPage/_archived_wave04_consumer/consumer/ProjectMarketSnapshot.tsx` | 1 |
| `src/views/ProjectPage/_archived_wave04_consumer/consumer/ProjectMoreSection.tsx` | 1 |
| `src/views/ProjectPage/_archived_wave04_consumer/consumer/ProjectSwapCard.tsx` | 1 |
| `src/views/ProjectPage/_archived_wave04_consumer/consumer/ProjectTokenomicsSection.tsx` | 1 |
| `src/views/ProjectPage/_archived_wave04_consumer/consumer/ProjectUpdatesPreview.tsx` | 1 |
| `src/views/ProjectPage/_archived_wave04_consumer/consumer/ProjectUtilitiesSection.tsx` | 1 |
| `src/views/ProjectPage/_archived_wave04_consumer/consumer/ProjectWalletConsumer.tsx` | 1 |
| `src/views/ProjectPage/v2/ProjectPageV2Shell.tsx` | 1 |
| `src/views/Projects/components/ProjectCapabilityMatrix.tsx` | 1 |
| `src/views/ProjectsStudio/components/FeaturedProjectPanel.tsx` | 1 |
| `src/views/RadarStudio/components/RadarKpiRow.tsx` | 1 |
| `src/views/RadarStudio/components/RadarOpsLeftColumn.tsx` | 1 |
| `src/views/SmartSwapStudio/modules/SmartSwapHistory/useSmartSwapHistory.ts` | 1 |
| `src/views/TestnetWrapperValidate/FounderWrapperValidateRuntime.tsx` | 1 |
| `src/views/Trade/TradeMarketPanel.tsx` | 1 |
| `src/views/TrendingStudio/components/AIHeatmapTable.tsx` | 1 |
| `src/views/TrendingStudio/components/TrendingMachinePanel.tsx` | 1 |
| `src/views/TrendingStudio/trendingRuntime/formatTrendingRuntime.ts` | 1 |
| `src/views/Venues/components/VenueCapabilityMatrix.tsx` | 1 |
