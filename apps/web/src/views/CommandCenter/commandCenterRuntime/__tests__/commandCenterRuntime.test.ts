import { buildAiBriefing } from '../buildAiBriefing'
import { buildActivityTimeline } from '../buildActivityTimeline'
import { buildMachineSummary } from '../buildMachineSummary'
import { mapRecommendations } from '../buildNotifications'
import { createCommandCenterError } from '../commandCenterRuntimeErrors'

describe('commandCenterRuntime', () => {
  it('builds AI briefing for disconnected wallet', () => {
    const briefing = buildAiBriefing({
      account: undefined,
      liquidityCount: 0,
      poolPending: 0,
      farmPending: 0,
      radarAlerts: 0,
      projectCount: 1,
      recommendations: [],
    })
    expect(briefing.bullets[0]).toContain('Connect your wallet')
  })

  it('builds operational briefing when wallet connected', () => {
    const briefing = buildAiBriefing({
      account: '0xabc',
      liquidityCount: 2,
      poolPending: 1,
      farmPending: 0,
      radarAlerts: 3,
      infrastructureScore: 72,
      projectCount: 1,
      recommendations: [],
    })
    expect(briefing.bullets.length).toBeGreaterThan(0)
    expect(briefing.bullets.some((b) => b.includes('liquidity'))).toBe(true)
  })

  it('maps recommendations from runtime sources', () => {
    const recs = mapRecommendations(
      [{ title: 'Audit', description: 'Recommended' }],
      { title: 'Radar', description: 'Alert' },
      [{ title: 'Pool', description: 'Create pool' }],
    )
    expect(recs.length).toBeGreaterThan(0)
    expect(recs[0].icon).toBeDefined()
  })

  it('builds activity timeline chronologically', () => {
    const timeline = buildActivityTimeline({
      tradeTxs: [{ label: 'Swap MARCO', time: '2026-07-03T10:00:00Z' }],
      poolActivity: [{ label: 'Stake — MARCO', time: '2026-07-03T09:00:00Z' }],
      farmActivity: [],
      buildActivity: [],
      liquidityActivity: [],
    })
    expect(timeline.length).toBe(2)
    expect(timeline[0].label).toContain('Swap')
  })

  it('generates machine summary with runtime sections', () => {
    const summary = buildMachineSummary({
      account: '0xabc',
      chainId: 56,
      tradeMachine: { status: 'idle' },
      liquidityCount: 1,
      poolCount: 1,
      farmCount: 0,
      assetCount: 2,
      projectsMachine: { indexed: 1 },
      radarMachine: { signals: 3 },
      buildMachine: { score: 72 },
      infrastructureScore: 72,
      notificationCount: 2,
      collectibleCount: 4,
    })
    expect(summary.schema).toContain('command-center')
    expect(summary.trade).toBeDefined()
    expect(summary.radar).toBeDefined()
  })

  it('exposes error catalog', () => {
    const err = createCommandCenterError('NO_WALLET')
    expect(err.code).toBe('NO_WALLET')
  })
})
