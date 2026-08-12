import { MarcoBridgeError } from './errors'
import type { MarcoBridgeIntent, MarcoBridgeRoute } from './types'
import {
  explainUnsupportedRoute,
  getMarcoBridgeNetwork,
  getMarcoBridgeRoute,
  isMarcoBridgeExecutionEnabled,
} from './wave1Registry'

export function resolveCertifiedDirectRoute(intent: Pick<MarcoBridgeIntent, 'from' | 'to'>): MarcoBridgeRoute {
  const route = getMarcoBridgeRoute(intent.from, intent.to)
  if (!route) {
    throw new MarcoBridgeError('UNSUPPORTED_ROUTE', explainUnsupportedRoute(intent.from, intent.to))
  }
  if (!route.certified) throw new MarcoBridgeError('UNSUPPORTED_ROUTE', 'This MARCO route is not certified.')
  return route
}

export function requirePublicExecution(route: MarcoBridgeRoute): void {
  if (isMarcoBridgeExecutionEnabled(route)) return
  const destination = getMarcoBridgeNetwork(route.to)
  const paused = destination.protectivePaused
    ? ` ${destination.name} remains protective-paused after certification.`
    : ''
  throw new MarcoBridgeError('ROUTE_NOT_ACTIVE', `This certified route is not publicly active yet.${paused}`)
}
