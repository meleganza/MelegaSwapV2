import { resolveDexCapabilityAudit } from './audit-read-model'
import { DexCapabilityAuditManifest } from './audit-types'

export const serializeDexCapabilityAudit = (): DexCapabilityAuditManifest =>
  resolveDexCapabilityAudit()
