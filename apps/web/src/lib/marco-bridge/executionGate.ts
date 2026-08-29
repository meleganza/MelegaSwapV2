import type { CanonicalMmnRouteState } from './routeAuthority'
import { MarcoBridgeError, type MarcoBridgeNetworkId } from './types'

export function assertMarcoRouteExecutable(
  authority: CanonicalMmnRouteState,
  from: MarcoBridgeNetworkId,
  to: MarcoBridgeNetworkId,
) {
  const route = authority.routes.find((candidate) => candidate.from === from && candidate.to === to)
  if (!route?.certified) {
    throw new MarcoBridgeError('UNSUPPORTED_ROUTE', `Canonical route ${from}->${to} is not certified.`)
  }
  if (!authority.global_execution_enabled || !route.publicly_active || !route.execution_enabled || route.paused) {
    throw new MarcoBridgeError(
      'PUBLIC_ACTIVATION_REQUIRED',
      `Canonical route ${from}->${to} is not open for production execution.`,
    )
  }
  return route
}
