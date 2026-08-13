import { MARCO_WAVE1_DIRECT_ROUTES } from './wave1Registry'
import type { MarcoBridgeNetworkId } from './types'

export type MarcoRoutePlan =
  | { kind: 'direct'; legs: [MarcoBridgeNetworkId, MarcoBridgeNetworkId]; enabled: boolean }
  | { kind: 'via-bnb'; legs: [MarcoBridgeNetworkId, 'bnb', MarcoBridgeNetworkId]; enabled: false }
  | { kind: 'same-network'; legs: [] }

export function planMarcoBridgeRoute(from: MarcoBridgeNetworkId, to: MarcoBridgeNetworkId): MarcoRoutePlan {
  if (from === to) return { kind: 'same-network', legs: [] }
  const direct = MARCO_WAVE1_DIRECT_ROUTES.find((route) => route.from === from && route.to === to)
  if (direct) return { kind: 'direct', legs: [from, to], enabled: direct.enabled }
  return { kind: 'via-bnb', legs: [from, 'bnb', to], enabled: false }
}
