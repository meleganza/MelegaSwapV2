export interface CommandMachineSummary {
  schema: string
  generatedAt: string
  operator: string | null
  wallet: string | null
  chainId?: number
  status: string
  trade: Record<string, unknown>
  liquidity: Record<string, unknown>
  pools: Record<string, unknown>
  farms: Record<string, unknown>
  projects: Record<string, unknown>
  radar: Record<string, unknown>
  infrastructure: Record<string, unknown>
  identity: Record<string, unknown>
  notifications: { count: number }
  positions: {
    assets: number
    liquidity: number
    pools: number
    farms: number
  }
}

interface MachineInput {
  account?: string
  chainId?: number
  tradeMachine: Record<string, unknown>
  liquidityCount: number
  poolCount: number
  farmCount: number
  assetCount: number
  projectsMachine: Record<string, unknown>
  radarMachine: Record<string, unknown>
  buildMachine: Record<string, unknown>
  infrastructureScore?: number
  notificationCount: number
  collectibleCount: number
  identitySummary?: Record<string, unknown>
}

export function buildMachineSummary(input: MachineInput): CommandMachineSummary {
  return {
    schema: 'melega.command-center.v2',
    generatedAt: new Date().toISOString(),
    operator: input.account ? input.account.slice(0, 6) : null,
    wallet: input.account ?? null,
    chainId: input.chainId,
    status: input.account ? 'operational' : 'wallet_disconnected',
    trade: input.tradeMachine,
    liquidity: { positions: input.liquidityCount },
    pools: { stakedPositions: input.poolCount },
    farms: { stakedPositions: input.farmCount },
    projects: input.projectsMachine,
    radar: input.radarMachine,
    infrastructure: {
      score: input.infrastructureScore ?? null,
      ...input.buildMachine,
    },
    identity: input.identitySummary as unknown as Record<string, unknown>,
    notifications: { count: input.notificationCount },
    positions: {
      assets: input.assetCount,
      liquidity: input.liquidityCount,
      pools: input.poolCount,
      farms: input.farmCount,
    },
  }
}
