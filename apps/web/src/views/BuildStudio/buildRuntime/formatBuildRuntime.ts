import type { EnrichedProjectRecord } from 'registry/projects/discovery'
import type { RecentBuildRow } from '../buildStudioData'
import { buildLiveEvents } from 'views/RadarStudio/radarRuntime/buildLiveEvents'

export function buildRecentBuilds(projects: EnrichedProjectRecord[]): RecentBuildRow[] {
  const rows: RecentBuildRow[] = []

  projects.forEach((project) => {
    const sym = project.resources.tokens[0]?.symbol ?? project.displayName
    rows.push({
      id: `import-${project.slug}`,
      time: project.asOf,
      action: 'Import Token',
      project: sym,
      builder: 'Registry',
      status: 'Validated',
      infrastructure: 'Profile + Manifest',
      executionStatus: 'Suppressed',
      executionStatusTone: 'gray',
      aiVerified: true,
    })

    if (project.capabilities.pool.status === 'live') {
      rows.push({
        id: `pool-${project.slug}`,
        time: project.asOf,
        action: 'Infrastructure Updated',
        project: sym,
        builder: 'Pools Runtime',
        status: 'Ready',
        infrastructure: 'Staking pools live',
        executionStatus: 'Dry Run',
        executionStatusTone: 'green',
        aiVerified: true,
      })
    }

    if (project.capabilities.farm.status === 'live') {
      rows.push({
        id: `farm-${project.slug}`,
        time: project.asOf,
        action: 'Farm Created',
        project: sym,
        builder: 'Farms Runtime',
        status: 'Ready',
        infrastructure: 'Farm infrastructure',
        executionStatus: 'Dry Run',
        executionStatusTone: 'green',
        aiVerified: true,
      })
    }
  })

  const events = buildLiveEvents(projects)
  events.slice(0, 2).forEach((e, i) => {
    rows.push({
      id: `evt-${i}`,
      time: e.timestamp,
      action: 'Manifest Generated',
      project: e.project,
      builder: 'Melega AI',
      status: 'Validated',
      infrastructure: e.event,
      executionStatus: 'Suppressed',
      executionStatusTone: 'gray',
      aiVerified: true,
    })
  })

  return rows.slice(0, 8)
}

export function aggregateBuildKpis(
  projectCount: number,
  poolCount: number,
  farmCount: number,
  manifestReady: number,
) {
  return [
    {
      id: 'projects',
      label: 'Projects Onboarded',
      value: String(projectCount),
      delta: '',
      deltaPositive: true,
      sparkline: [projectCount],
    },
    {
      id: 'tokens',
      label: 'Tokens Created',
      value: '0',
      delta: 'Preparation only',
      deltaPositive: true,
      sparkline: [0],
    },
    {
      id: 'pools',
      label: 'Active Staking Pools',
      value: String(poolCount),
      delta: '',
      deltaPositive: true,
      sparkline: [poolCount],
    },
    {
      id: 'farms',
      label: 'Active Farms',
      value: String(farmCount),
      delta: '',
      deltaPositive: true,
      sparkline: [farmCount],
    },
    {
      id: 'manifests',
      label: 'AI Ready Manifests',
      value: String(manifestReady),
      delta: manifestReady > 0 ? 'Registry' : '—',
      deltaPositive: true,
      sparkline: [manifestReady],
    },
  ]
}
