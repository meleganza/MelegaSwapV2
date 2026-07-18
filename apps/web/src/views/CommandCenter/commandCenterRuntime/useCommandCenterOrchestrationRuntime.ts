import { useEffect, useMemo } from 'react'
import { useAccount } from 'wagmi'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { emitCivilizationEvent } from 'lib/civilization-runtime/event-bus'
import { useCivilizationRuntimeSync } from 'lib/civilization-runtime/useCivilizationRuntimeSync'
import { useAllTransactions } from 'state/transactions/hooks'
import { useTradeSwapRuntime } from 'views/Trade/tradeRuntime/useTradeSwapRuntime'
import { useTradeSettlementMetadata } from 'views/Trade/tradeRuntime/useTradeSettlementMetadata'
import {
  formatSettlementUserLabel,
  settlementLabelTone,
} from 'views/Trade/tradeRuntime/formatSettlementStatus'
import { useLiquidityPositions } from 'views/LiquidityStudio/liquidityRuntime/useLiquidityPositions'
import { usePoolsStakingRuntime } from 'views/PoolsStudio/poolsRuntime/usePoolsStakingRuntime'
import { useFarmsStakingRuntime } from 'views/FarmsStudio/farmsRuntime/useFarmsStakingRuntime'
import { useProjectsIntelligenceRuntime } from 'views/ProjectsStudio/projectsRuntime/useProjectsIntelligenceRuntime'
import { useRadarIntelligenceRuntime } from 'views/RadarStudio/radarRuntime/useRadarIntelligenceRuntime'
import { useBuildOrchestrationRuntime } from 'views/BuildStudio/buildRuntime/useBuildOrchestrationRuntime'
import { buildInfrastructureScore } from 'views/BuildStudio/buildRuntime/buildInfrastructureScore'
import { buildAiBriefing } from './buildAiBriefing'
import { buildActivityTimeline } from './buildActivityTimeline'
import { buildMachineSummary } from './buildMachineSummary'
import {
  buildNotifications,
  buildReportsFromExtensions,
  mapRecommendations,
} from './buildNotifications'
import {
  countPendingActions,
  formatAssetRows,
  formatFarmPositionRows,
  formatLiquidityRows,
  formatPoolPositionRows,
  safePortfolioSection,
  sumPendingRewardsUsd,
  type PortfolioSectionStatus,
} from './formatCommandCenterRuntime'
import { createCommandCenterError, type CommandCenterRuntimeError } from './commandCenterRuntimeErrors'
import {
  commandCenterIdentitySummary,
  formatCommandCenterCollectibles,
} from 'views/CollectiblesStudio/collectiblesRuntime/formatCommandCenterCollectibles'
import { useTrendingIntelligenceRuntime } from 'views/TrendingStudio/trendingRuntime/useTrendingIntelligenceRuntime'
import { useWalletCollectibleOwnership } from 'views/CollectiblesStudio/collectiblesRuntime/useWalletCollectibleOwnership'

export type CommandCenterSectionKey =
  | 'assets'
  | 'liquidity'
  | 'pools'
  | 'farms'
  | 'rewards'
  | 'activity'

export type CommandCenterSectionStatuses = Record<CommandCenterSectionKey, PortfolioSectionStatus>

const EMPTY_SECTION_STATUSES: CommandCenterSectionStatuses = {
  assets: 'empty',
  liquidity: 'empty',
  pools: 'empty',
  farms: 'empty',
  rewards: 'empty',
  activity: 'empty',
}

function runIsolated<T>(fallback: T, run: () => T): T {
  try {
    return run()
  } catch {
    return fallback
  }
}

export function useCommandCenterOrchestrationRuntime() {
  const { address: account } = useAccount()
  const { chainId } = useActiveChainId()
  const allTransactions = useAllTransactions()

  const trade = useTradeSwapRuntime()
  const settlementMeta = useTradeSettlementMetadata()
  const liquidity = useLiquidityPositions()
  const pools = usePoolsStakingRuntime()
  const farms = useFarmsStakingRuntime()
  const projects = useProjectsIntelligenceRuntime()
  const radar = useRadarIntelligenceRuntime()
  const build = useBuildOrchestrationRuntime()
  const collectiblesWallet = useWalletCollectibleOwnership()
  const trending = useTrendingIntelligenceRuntime()
  const civilizationRuntime = useCivilizationRuntimeSync()

  // Each portfolio section formats in isolation — one source throw must not reject the page.
  const assetsSection = useMemo(
    () => safePortfolioSection(() => formatAssetRows(trade.assets, account)),
    [trade.assets, account],
  )
  const liquiditySection = useMemo(
    () => safePortfolioSection(() => formatLiquidityRows(liquidity.positions)),
    [liquidity.positions],
  )
  const poolsSection = useMemo(
    () => safePortfolioSection(() => formatPoolPositionRows(pools.pools)),
    [pools.pools],
  )
  const farmsSection = useMemo(
    () => safePortfolioSection(() => formatFarmPositionRows(farms.farms)),
    [farms.farms],
  )

  const assets = assetsSection.rows
  const liquidityRows = liquiditySection.rows
  const poolRows = poolsSection.rows
  const farmRows = farmsSection.rows

  const infrastructureScore = useMemo(
    () =>
      runIsolated(undefined as number | undefined, () => {
        const project = build.activeProject ?? projects.allProjects[0]
        return project ? buildInfrastructureScore(project).score : undefined
      }),
    [build.activeProject, projects.allProjects],
  )

  const recommendations = useMemo(
    () =>
      runIsolated([], () =>
        mapRecommendations(
          projects.recommendations.map((r) => ({
            title: r.text.split('—')[0]?.trim() || r.text,
            description: r.text,
          })),
          radar.aiRecommendation
            ? { title: radar.aiRecommendation.title, description: radar.aiRecommendation.detail }
            : undefined,
          build.suggestions.map((s) => ({
            title: s.title,
            description: `${s.estimatedImpact} · ${s.dependencies}`,
          })),
        ),
      ),
    [projects.recommendations, radar.aiRecommendation, build.suggestions],
  )

  const briefing = useMemo(
    () =>
      runIsolated(
        {
          greeting: 'Welcome to Command Center.',
          bullets: account
            ? ['Portfolio sections are loading independently.']
            : ['Connect your wallet to load personal operational data.'],
          estimatedActions: '—',
        },
        () =>
          buildAiBriefing({
            account,
            liquidityCount: liquidityRows.length,
            poolPending: poolRows.filter((p) => p.pending !== 'Unavailable').length,
            farmPending: farmRows.filter((f) => f.pending !== 'Unavailable').length,
            radarAlerts: radar.warnings?.length ?? 0,
            infrastructureScore,
            projectCount: projects.allProjects.length,
            recommendations,
          }),
      ),
    [
      account,
      liquidityRows.length,
      poolRows,
      farmRows,
      radar.warnings,
      infrastructureScore,
      projects.allProjects.length,
      recommendations,
    ],
  )

  const tradeTxs = useMemo(() => {
    return runIsolated([], () => {
      if (!account || !chainId) return []
      const chainTxs = allTransactions[chainId] ?? {}
      return Object.values(chainTxs)
        .filter((tx) => {
          const s = (tx.summary || '').toLowerCase()
          return s.includes('swap') || s.includes('trade') || s.includes('exchange')
        })
        .slice(0, 4)
        .map((tx) => ({
          label: tx.summary || 'Swap',
          time: String(tx.addedTime),
          title: `Trade confirmed — ${tx.summary || 'Swap'}`,
        }))
    })
  }, [account, chainId, allTransactions])

  const notifications = useMemo(
    () =>
      runIsolated([], () =>
        buildNotifications({
          tradeTxs: tradeTxs.map((t) => ({ title: t.title, time: t.time })),
          poolClaims: (pools.terminal?.activityRows ?? [])
            .filter((r) => r.action === 'Claim')
            .slice(0, 2)
            .map((r) => ({ name: r.pool, time: r.time })),
          farmClaims: (farms.terminal?.activityRows ?? [])
            .filter((r) => r.action === 'Harvest')
            .slice(0, 2)
            .map((r) => ({ name: r.pair, time: r.time })),
          radarEvents: (radar.recentDiscoveries ?? []).slice(0, 2).map((d) => ({
            title: d.project,
            time: d.time,
          })),
          buildEvents: (build.recentBuilds ?? []).slice(0, 2).map((b) => ({
            title: b.action,
            time: b.time,
          })),
          collectibleUnlocked:
            collectiblesWallet.totalOwned > 0
              ? { title: `${collectiblesWallet.totalOwned} civilization identity(ies)`, time: new Date().toISOString() }
              : undefined,
          civilizationEvents: (civilizationRuntime.events?.journal ?? []).slice(0, 6).map((e) => ({
            title: e.type.replace(/_/g, ' '),
            time: e.emittedAt,
            source: e.source,
          })),
        }),
      ),
    [
      tradeTxs,
      pools.terminal?.activityRows,
      farms.terminal?.activityRows,
      radar.recentDiscoveries,
      build.recentBuilds,
      collectiblesWallet.totalOwned,
      civilizationRuntime.events?.journal,
    ],
  )

  useEffect(() => {
    try {
      emitCivilizationEvent('command_center_synced', 'command_center', {
        projectCount: projects.allProjects.length,
        notificationCount: notifications.length,
        coverage: civilizationRuntime.runtimeGraph.coveragePercentage,
      })
    } catch {
      // Civilization fabric must never take down Command Center.
    }
  }, [projects.allProjects.length, notifications.length, civilizationRuntime.runtimeGraph.coveragePercentage])

  const recentActivity = useMemo(
    () =>
      runIsolated([], () =>
        buildActivityTimeline({
          tradeTxs: tradeTxs.map((t) => ({ label: t.label, time: t.time })),
          poolActivity: (pools.terminal?.activityRows ?? []).slice(0, 3).map((r) => ({
            label: `${r.action} — ${r.pool}`,
            time: r.time,
          })),
          farmActivity: (farms.terminal?.activityRows ?? []).slice(0, 3).map((r) => ({
            label: `${r.action} — ${r.pair}`,
            time: r.time,
          })),
          buildActivity: (build.recentBuilds ?? []).slice(0, 3).map((b) => ({
            label: b.action,
            time: b.time,
          })),
          liquidityActivity: [],
        }),
      ),
    [tradeTxs, pools.terminal?.activityRows, farms.terminal?.activityRows, build.recentBuilds],
  )

  const activitySection = useMemo(
    () => ({
      rows: recentActivity,
      status: (recentActivity.length > 0 ? 'ok' : 'empty') as PortfolioSectionStatus,
    }),
    [recentActivity],
  )

  const identitySummary = useMemo(
    () =>
      runIsolated(
        {
          identities: 0,
          owned: 0,
          builderLevel: 0,
          validatorStatus: 'Unavailable',
          aiPassport: 'Unavailable',
          memberships: [] as ReturnType<typeof commandCenterIdentitySummary>['memberships'],
        },
        () =>
          commandCenterIdentitySummary(
            collectiblesWallet.records,
            collectiblesWallet.ownershipBySlug,
            collectiblesWallet.totalOwned,
          ),
      ),
    [collectiblesWallet],
  )

  const collectibles = useMemo(
    () =>
      runIsolated([], () =>
        formatCommandCenterCollectibles(
          collectiblesWallet.records,
          collectiblesWallet.ownershipBySlug,
          account,
        ),
      ),
    [collectiblesWallet.records, collectiblesWallet.ownershipBySlug, account],
  )

  const reports = useMemo(
    () =>
      runIsolated([], () =>
        buildReportsFromExtensions((build.extensions ?? []).map((e) => ({ title: e.title, available: e.available }))),
      ),
    [build.extensions],
  )

  const infrastructureSummary = useMemo(
    () =>
      runIsolated(
        { tokens: 0, pools: 0, farms: 0, smartdrop: 0, score: 0 },
        () => ({
          tokens: projects.allProjects.length,
          pools: pools.pools.filter((p) => p.status === 'live').length,
          farms: farms.farms.filter((f) => f.status === 'live').length,
          smartdrop: build.extensions.find((e) => e.id === 'smartdrop')?.available ? 1 : 0,
          score: infrastructureScore ?? 0,
        }),
      ),
    [projects.allProjects, pools.pools, farms.farms, build.extensions, infrastructureScore],
  )

  const rewardsValue = useMemo(
    () =>
      runIsolated('Unavailable', () => sumPendingRewardsUsd(pools.pools, farms.farms)),
    [pools.pools, farms.farms],
  )

  const rewardsSectionStatus: PortfolioSectionStatus =
    rewardsValue === 'Unavailable' ? (account ? 'empty' : 'empty') : 'ok'

  const builderStatus = useMemo(
    () =>
      runIsolated(
        { level: 1, progress: 0, projects: 0, pools: 0, farms: 0, tvlManaged: 'Unavailable' },
        () => ({
          level: Math.min(5, Math.max(1, projects.allProjects.length)),
          progress: infrastructureScore ?? 0,
          projects: projects.allProjects.length,
          pools: poolRows.length,
          farms: farmRows.length,
          tvlManaged: rewardsValue,
        }),
      ),
    [projects.allProjects, infrastructureScore, poolRows, farmRows, rewardsValue],
  )

  const kpis = useMemo(
    () =>
      runIsolated(
        {
          netWorth: { value: 'Unavailable', delta: '—', deltaPositive: true, sparkline: [0, 0] },
          actions: { value: '0', label: 'Pending actions' },
          radar: { value: '0', label: 'Operational alerts' },
          rewards: { value: 'Unavailable', label: 'Rewards pending' },
          infrastructure: { value: '0', label: 'Active components' },
          aiScore: { value: 0, label: 'Operational score' },
        },
        () => ({
          netWorth: {
            value: account ? (assets.length > 0 ? `${assets.length} assets` : 'Unavailable') : 'Unavailable',
            delta: '—',
            deltaPositive: true,
            sparkline: [0, 0],
          },
          actions: {
            value: countPendingActions(pools.pools, farms.farms, recommendations),
            label: 'Pending actions',
          },
          radar: {
            value: String(radar.kpis?.find((k) => k.id === 'risk')?.value ?? radar.warnings?.length ?? 0),
            label: 'Operational alerts',
          },
          rewards: {
            value: rewardsValue,
            label: 'Rewards pending',
          },
          infrastructure: {
            value: String(
              build.extensions.filter((e) => e.available).length ||
                infrastructureSummary.pools + infrastructureSummary.farms,
            ),
            label: 'Active components',
          },
          aiScore: {
            value: projects.indexCoverage?.score ?? infrastructureScore ?? 0,
            label: projects.indexCoverage?.label ?? 'Operational score',
          },
        }),
      ),
    [
      account,
      assets,
      pools.pools,
      farms.farms,
      recommendations,
      radar.kpis,
      radar.warnings,
      build.extensions,
      infrastructureSummary,
      projects.indexCoverage,
      infrastructureScore,
      rewardsValue,
    ],
  )

  const machine = useMemo(
    () =>
      runIsolated(
        {
          schema: 'melega.command-center.v2',
          generatedAt: new Date().toISOString(),
          operator: null,
          wallet: null,
          status: 'degraded',
          trade: {},
          liquidity: { positions: 0 },
          pools: { stakedPositions: 0 },
          farms: { stakedPositions: 0 },
          projects: {},
          radar: {},
          infrastructure: { score: null },
          identity: {},
          notifications: { count: 0 },
          positions: { assets: 0, liquidity: 0, pools: 0, farms: 0 },
        },
        () =>
          buildMachineSummary({
            account,
            chainId,
            tradeMachine: trade.machine as unknown as Record<string, unknown>,
            liquidityCount: liquidityRows.length,
            poolCount: poolRows.length,
            farmCount: farmRows.length,
            assetCount: assets.length,
            projectsMachine: projects.machine as unknown as Record<string, unknown>,
            radarMachine: radar.machine as unknown as Record<string, unknown>,
            buildMachine: build.machine as unknown as Record<string, unknown>,
            infrastructureScore,
            notificationCount: notifications.length,
            collectibleCount: collectiblesWallet.records.length,
            identitySummary,
          }),
      ),
    [
      account,
      chainId,
      trade.machine,
      liquidityRows.length,
      poolRows.length,
      farmRows.length,
      assets.length,
      projects.machine,
      radar.machine,
      build.machine,
      infrastructureScore,
      notifications.length,
      collectiblesWallet.records.length,
      identitySummary,
    ],
  )

  const sectionStatuses: CommandCenterSectionStatuses = useMemo(
    () => ({
      assets: assetsSection.status,
      liquidity: liquiditySection.status,
      pools: poolsSection.status,
      farms: farmsSection.status,
      rewards: rewardsSectionStatus,
      activity: activitySection.status,
    }),
    [
      assetsSection.status,
      liquiditySection.status,
      poolsSection.status,
      farmsSection.status,
      rewardsSectionStatus,
      activitySection.status,
    ],
  )

  const runtimeErrors: CommandCenterRuntimeError[] = useMemo(() => {
    const errs: CommandCenterRuntimeError[] = []
    if (!account) errs.push(createCommandCenterError('NO_WALLET'))
    if (!chainId) errs.push(createCommandCenterError('NO_RUNTIME'))
    if (assetsSection.status === 'unavailable') errs.push(createCommandCenterError('UNKNOWN'))
    else if (account && assets.length === 0) errs.push(createCommandCenterError('NO_ASSETS'))
    if (liquiditySection.status === 'unavailable') errs.push(createCommandCenterError('UNKNOWN'))
    else if (account && liquidityRows.length === 0) errs.push(createCommandCenterError('NO_LIQUIDITY'))
    if (poolsSection.status === 'unavailable') errs.push(createCommandCenterError('UNKNOWN'))
    else if (account && poolRows.length === 0) errs.push(createCommandCenterError('NO_POOLS'))
    if (farmsSection.status === 'unavailable') errs.push(createCommandCenterError('UNKNOWN'))
    else if (account && farmRows.length === 0) errs.push(createCommandCenterError('NO_FARMS'))
    if (projects.allProjects.length === 0) errs.push(createCommandCenterError('NO_PROJECTS'))
    return errs
  }, [
    account,
    chainId,
    assets,
    liquidityRows,
    poolRows,
    farmRows,
    projects.allProjects,
    assetsSection.status,
    liquiditySection.status,
    poolsSection.status,
    farmsSection.status,
  ])

  const settlement = useMemo(() => {
    return runIsolated(
      {
        label: 'No settlement data',
        tone: 'muted' as const,
        txHash: undefined as string | undefined,
        settlementId: undefined as string | undefined,
        settlementTime: undefined as string | undefined,
        treasuryStatus: 'Treasury Runtime unavailable',
        machineCode: undefined as string | undefined,
      },
      () => {
        const label = formatSettlementUserLabel(settlementMeta)
        const treasuryStatus =
          settlementMeta.treasuryRuntimeEndpointStatus === 'available'
            ? 'Treasury Runtime available'
            : settlementMeta.treasuryRuntimeEndpointStatus === 'unavailable'
              ? 'Treasury Runtime unavailable'
              : 'Treasury Runtime not configured'
        return {
          label,
          tone: settlementLabelTone(label),
          txHash: settlementMeta.txHash,
          settlementId: settlementMeta.settlementId,
          settlementTime: 'settlementTime' in settlementMeta ? settlementMeta.settlementTime : undefined,
          treasuryStatus,
          machineCode: settlementMeta.machineCode,
        }
      },
    )
  }, [settlementMeta])

  return {
    account,
    chainId,
    assets,
    liquidity: liquidityRows,
    pools: poolRows,
    farms: farmRows,
    collectibles,
    infrastructureSummary,
    builderStatus,
    briefing,
    recommendations,
    notifications,
    reports,
    recentActivity,
    kpis,
    machine,
    civilizationRuntime,
    trendingMachine: trending.machine,
    settlement,
    runtimeErrors,
    sectionStatuses: sectionStatuses ?? EMPTY_SECTION_STATUSES,
    sectionErrors: {
      assets: assetsSection.error,
      liquidity: liquiditySection.error,
      pools: poolsSection.error,
      farms: farmsSection.error,
    },
  }
}

export type CommandCenterOrchestrationRuntime = ReturnType<typeof useCommandCenterOrchestrationRuntime>
