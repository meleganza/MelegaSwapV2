import { stripUndefinedDeep } from 'registry/venues/manifest'
import { resolveMainnetReadinessGate } from './mainnet-readiness-data'
import { MainnetReadinessGate } from './mainnet-readiness-types'

export const serializeMainnetReadinessManifest = (): MainnetReadinessGate => {
  const gate = resolveMainnetReadinessGate()
  return stripUndefinedDeep(gate) as MainnetReadinessGate
}
