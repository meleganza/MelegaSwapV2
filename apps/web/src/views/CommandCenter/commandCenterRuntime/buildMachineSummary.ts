import { buildSurfaceEnvelope, type MelegaSurfaceEnvelope } from 'lib/surface-envelope'

export type CommandMachineSummary = MelegaSurfaceEnvelope

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
  const status = input.account ? 'operational' : 'wallet_disconnected'
  return buildSurfaceEnvelope({
    module: 'commandCenter',
    runtime: {
      status,
      operator: input.account ? input.account.slice(0, 6) : null,
      wallet: input.account ?? null,
      chainId: input.chainId,
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
      identity: input.identitySummary ?? {},
      notifications: { count: input.notificationCount },
      positions: {
        assets: input.assetCount,
        liquidity: input.liquidityCount,
        pools: input.poolCount,
        farms: input.farmCount,
      },
    },
    sources: ['civilization-fabric', 'wallet', 'module-runtimes'],
    reasonCodes: status === 'wallet_disconnected' ? { wallet: 'WALLET_DISCONNECTED' } : {},
  })
}
