import type { CanonicalMmnRouteState } from './routeAuthority'
import { MarcoBridgeError, type MarcoBridgeNetworkId } from './types'
import { localRouteActivationEnabled } from './wave1Registry'

export const MARCO_BRIDGE_ACTIVATION_ROUTES = [
  ['bnb', 'robinhood'],
  ['robinhood', 'bnb'],
  ['bnb', 'solana'],
  ['solana', 'bnb'],
] as const

export type MarcoBridgeActivationRoute = (typeof MARCO_BRIDGE_ACTIVATION_ROUTES)[number]

export const routeKey = (from: MarcoBridgeNetworkId, to: MarcoBridgeNetworkId) => `${from}:${to}` as const

export function isActivationRoute(from: MarcoBridgeNetworkId, to: MarcoBridgeNetworkId): boolean {
  return MARCO_BRIDGE_ACTIVATION_ROUTES.some((route) => route[0] === from && route[1] === to)
}

export { localRouteActivationEnabled }

export function findCanonicalRoute(authority: CanonicalMmnRouteState, from: MarcoBridgeNetworkId, to: MarcoBridgeNetworkId) {
  return authority.routes.find((route) => route.from === from && route.to === to)
}

export function routeExecutionBlockers(
  from: MarcoBridgeNetworkId,
  to: MarcoBridgeNetworkId,
  authority: CanonicalMmnRouteState,
): string[] {
  const blockers: string[] = []
  if (!isActivationRoute(from, to)) blockers.push('Route is outside BNB↔Robinhood and BNB↔Solana activation.')
  if (!localRouteActivationEnabled(from, to)) blockers.push('Local public activation is off for this route.')
  const route = findCanonicalRoute(authority, from, to)
  if (!route?.certified) blockers.push('Canonical MMN has not certified this route.')
  if (route?.paused) blockers.push('Canonical MMN marks this route paused.')
  const source = authority.networks.find((network) => network.id === from)
  const destination = authority.networks.find((network) => network.id === to)
  if (!source || !destination) blockers.push('Canonical source or destination binding is missing.')
  if (source?.paused) blockers.push(`${source.name} is paused.`)
  if (destination?.paused) blockers.push(`${destination.name} is paused.`)
  if (from === 'solana' || to === 'solana') {
    if (source?.id === 'solana' && source.paused) blockers.push('Solana OFT store is paused.')
    if (destination?.id === 'solana' && destination.paused) blockers.push('Solana OFT store is paused.')
  }
  return blockers
}

export function isRouteExecutable(
  from: MarcoBridgeNetworkId,
  to: MarcoBridgeNetworkId,
  authority: CanonicalMmnRouteState,
): boolean {
  return routeExecutionBlockers(from, to, authority).length === 0
}

export function assertRouteExecutable(
  from: MarcoBridgeNetworkId,
  to: MarcoBridgeNetworkId,
  authority: CanonicalMmnRouteState,
): true {
  const blockers = routeExecutionBlockers(from, to, authority)
  if (blockers.length === 0) return true
  const paused = blockers.some((blocker) => /paused/i.test(blocker))
  throw new MarcoBridgeError(
    paused ? 'SOLANA_PAUSED' : 'PUBLIC_ACTIVATION_REQUIRED',
    blockers[0] ?? 'This bridge route is not executable.',
  )
}
