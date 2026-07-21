import type {
  PROJECT_MACHINE_SCHEMA_VERSION,
  PROJECT_PAGE_MACHINE_SUMMARY_EXTENSION,
  MACHINE_INTERFACE_VERSION,
  MACHINE_RESOLVER_REVISION,
  MachineActionKind,
  MachineActionStatus,
  MachineAvailability,
  MachineCapability,
  MachineReasonCode,
  MachineRelationType,
  MachineResourceKind,
} from './schema'

export interface RegistryMachineCapabilityRecord {
  stableKey: string
  projectSlug: string
  capability: MachineCapability
  title: string
  summary: string
  availability: MachineAvailability
  relatedSectionIds: string[]
  relatedEndpointPaths: string[]
  machineTags: string[]
}

export interface RegistryMachineActionRecord {
  stableKey: string
  projectSlug: string
  capability: MachineCapability
  kind: MachineActionKind
  title: string
  summary: string
  route: string | null
  requiredContext: string[]
  walletRequired: boolean
  chainRequired: number | null
  availability: MachineAvailability
  status: MachineActionStatus
  limitations: string[]
  machineTags: string[]
}

export interface RegistryMachineResourceRecord {
  stableKey: string
  projectSlug: string
  kind: MachineResourceKind
  title: string
  summary: string
  route: string | null
  schemaVersion: string | null
  availability: MachineAvailability
  machineTags: string[]
}

export interface RegistryMachineRelationRecord {
  fromStableKey: string
  toStableKey: string
  relationType: MachineRelationType
}

export interface MachineCapabilityEntity {
  capabilityId: string
  projectId: string
  capability: MachineCapability
  title: string
  summary: string
  availability: MachineAvailability
  relatedSectionIds: string[]
  relatedEndpointIds: string[]
  machineTags: string[]
  revision: string
  stableKey: string
}

export interface MachineActionEntity {
  actionId: string
  projectId: string
  capability: MachineCapability
  kind: MachineActionKind
  title: string
  summary: string
  route: string | null
  requiredContext: string[]
  walletRequired: boolean
  chainRequired: number | null
  availability: MachineAvailability
  status: MachineActionStatus
  limitations: string[]
  machineTags: string[]
  revision: string
  stableKey: string
}

export interface MachineResourceEntity {
  resourceId: string
  projectId: string
  kind: MachineResourceKind
  title: string
  summary: string
  route: string | null
  schemaVersion: string | null
  availability: MachineAvailability
  machineTags: string[]
  revision: string
  stableKey: string
}

export interface MachineEndpointEntity {
  endpointId: string
  projectId: string
  path: string
  method: 'GET'
  title: string
  schemaVersion: string | null
  availability: MachineAvailability
  revision: string
}

export interface MachineSchemaEntity {
  schemaId: string
  schemaVersion: string
  title: string
  hub: string
}

export interface MachineRelation {
  relationId: string
  fromId: string
  toId: string
  relationType: MachineRelationType
}

export interface MachineInterfaceCore {
  interfaceId: string
  projectId: string
  version: typeof MACHINE_INTERFACE_VERSION
  generatedAt: string
  revision: string
  discoveryEndpoint: string
  machineEndpoint: string
  wellKnownPath: string
}

export interface MachineWarning {
  reasonCode: MachineReasonCode
  message: string
  entityId: string | null
}

export interface ProjectMachineDocument {
  schemaVersion: typeof PROJECT_MACHINE_SCHEMA_VERSION
  projectId: string
  slug: string
  canonicalUrl: string
  projectRevision: string
  revision: string
  resolverRevision: typeof MACHINE_RESOLVER_REVISION
  generatedAt: string
  machineInterface: MachineInterfaceCore
  capabilities: MachineCapabilityEntity[]
  actions: MachineActionEntity[]
  resources: MachineResourceEntity[]
  endpoints: MachineEndpointEntity[]
  schemas: MachineSchemaEntity[]
  relationships: MachineRelation[]
  summary: {
    interfaceVersion: typeof MACHINE_INTERFACE_VERSION
    capabilityCount: number
    actionCount: number
    endpointCount: number
    machineEndpoint: string
  }
  availability: MachineAvailability
  warnings: MachineWarning[]
  limitations: readonly string[]
}

export interface MachineSummaryForProjectApi {
  extension: typeof PROJECT_PAGE_MACHINE_SUMMARY_EXTENSION
  schemaVersion: typeof PROJECT_MACHINE_SCHEMA_VERSION
  interfaceVersion: typeof MACHINE_INTERFACE_VERSION
  capabilityCount: number
  endpoint: string
  revision: string
}
