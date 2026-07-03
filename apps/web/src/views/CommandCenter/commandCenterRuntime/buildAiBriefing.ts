import type { AIRecommendation } from '../commandCenterData'

export interface AiBriefingRuntime {
  greeting: string
  bullets: string[]
  estimatedActions: string
}

interface BriefingInput {
  account?: string
  liquidityCount: number
  poolPending: number
  farmPending: number
  radarAlerts: number
  infrastructureScore?: number
  projectCount: number
  recommendations: AIRecommendation[]
}

export function buildAiBriefing(input: BriefingInput): AiBriefingRuntime {
  const bullets: string[] = []

  if (!input.account) {
    return {
      greeting: 'Welcome to Command Center.',
      bullets: ['Connect your wallet to load personal operational data from Trade, Pools, Farms, and Radar runtimes.'],
      estimatedActions: '—',
    }
  }

  if (input.liquidityCount > 0) {
    bullets.push(`You have ${input.liquidityCount} active liquidity position${input.liquidityCount === 1 ? '' : 's'} from Liquidity runtime.`)
  }

  const pendingTotal = input.poolPending + input.farmPending
  if (pendingTotal > 0) {
    bullets.push(`Rewards available across ${pendingTotal} pool or farm position${pendingTotal === 1 ? '' : 's'}.`)
  }

  if (input.radarAlerts > 0) {
    bullets.push(`Radar runtime reports ${input.radarAlerts} operational alert${input.radarAlerts === 1 ? '' : 's'}.`)
  }

  if (input.infrastructureScore !== undefined && input.infrastructureScore > 0) {
    bullets.push(`Build Studio infrastructure score is ${input.infrastructureScore}/100.`)
  }

  if (input.projectCount > 0) {
    bullets.push(`Projects runtime tracks ${input.projectCount} indexed project${input.projectCount === 1 ? '' : 's'}.`)
  }

  input.recommendations.slice(0, 2).forEach((r) => {
    bullets.push(`${r.title}: ${r.description}`)
  })

  if (bullets.length === 0) {
    bullets.push('No pending operational actions detected across connected runtimes.')
  }

  const actionMinutes = Math.min(30, Math.max(5, pendingTotal * 3 + input.recommendations.length * 4))

  return {
    greeting: 'Operational briefing ready.',
    bullets: bullets.slice(0, 4),
    estimatedActions: `${actionMinutes} minutes`,
  }
}
