import { ROUTE_ID_BY_PAIR } from './constants'
import type {
  DerivedRouteStatus,
  MarcoBridgeAuthoritySnapshot,
  MarcoBridgeNetwork,
  MarcoBridgeRoute,
  MarcoBridgeRouteStateResponse,
  RouteAvailabilityStatus,
} from './types'

function networkPaused(networks: MarcoBridgeNetwork[], id: string): boolean {
  return networks.find((n) => n.id === id)?.paused === true
}

function deriveStatus(args: {
  globalExecutionEnabled: boolean
  route: MarcoBridgeRoute
  fromPaused: boolean
  toPaused: boolean
}): { executable: boolean; status: RouteAvailabilityStatus } {
  const { globalExecutionEnabled, route, fromPaused, toPaused } = args
  const paused = route.paused || fromPaused || toPaused

  if (paused) {
    return { executable: false, status: 'paused' }
  }

  const executable =
    globalExecutionEnabled === true &&
    route.execution_enabled === true &&
    route.publicly_active === true &&
    route.paused === false &&
    !fromPaused &&
    !toPaused

  if (executable) {
    return { executable: true, status: 'executable' }
  }

  if (route.certified && !route.publicly_active && !route.execution_enabled) {
    return { executable: false, status: 'prepared_inactive' }
  }

  return { executable: false, status: 'inactive' }
}

/** Derive route availability solely from validated canonical response. */
export function deriveAuthoritySnapshot(
  response: MarcoBridgeRouteStateResponse,
  fetchedAt = Date.now(),
): MarcoBridgeAuthoritySnapshot {
  const { data } = response
  const routes: DerivedRouteStatus[] = data.routes.map((route) => {
    const id = ROUTE_ID_BY_PAIR[`${route.from}>${route.to}`]
    const fromPaused = networkPaused(data.networks, route.from)
    const toPaused = networkPaused(data.networks, route.to)
    const { executable, status } = deriveStatus({
      globalExecutionEnabled: data.global_execution_enabled,
      route,
      fromPaused,
      toPaused,
    })
    return {
      id,
      from: route.from,
      to: route.to,
      certified: route.certified,
      publiclyActive: route.publicly_active,
      executionEnabled: route.execution_enabled,
      paused: route.paused || fromPaused || toPaused,
      reason: route.reason,
      executable,
      status,
    }
  })

  return {
    ok: true,
    fetchedAt,
    globalExecutionEnabled: data.global_execution_enabled,
    networks: data.networks,
    routes,
    executableRouteCount: routes.filter((r) => r.executable).length,
    bindingVersion: data.binding_version,
    updatedAt: data.updated_at,
    source: response.source,
  }
}

export function isAnyRouteExecutable(snapshot: MarcoBridgeAuthoritySnapshot): boolean {
  return snapshot.globalExecutionEnabled === true && snapshot.executableRouteCount > 0
}
