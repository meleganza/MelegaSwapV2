import { ConstitutionalCanonicalEconomy } from 'lib/economic-activation'

export type LaunchCapabilityStatus =
  | 'LIVE'
  | 'AVAILABLE_EXISTING_FLOW'
  | 'PLANNED'
  | 'BLOCKED'
  | 'DEPRECATED'
  | 'NOT_SUPPORTED'

export type LaunchAvailability = 'available' | 'planned' | 'blocked' | 'deprecated' | 'not_supported'

export type WalletRequirement = 'required' | 'optional' | 'none'

export interface LaunchRequiredInput {
  id: string
  label: string
  required: boolean
  notes?: string
}

export interface LaunchChainSupport {
  chains: string[]
  canonicalChain: string
  notes: string
}

export interface LaunchDependency {
  kind: 'contract' | 'execution' | 'registry' | 'manifest'
  label: string
  reference: string
  status: LaunchCapabilityStatus | 'indexed'
}

export interface LaunchCapability {
  id: string
  label: string
  description: string
  status: LaunchCapabilityStatus
  availability: LaunchAvailability
  requiredInputs: LaunchRequiredInput[]
  walletRequirement: WalletRequirement
  chainSupport: LaunchChainSupport
  contractDependency: LaunchDependency
  executionDependency: LaunchDependency
  warnings: string[]
  existingFlowHref?: string
  registryHref?: string
  machineManifest: string
}

export interface LaunchReadModel {
  asOf: string
  disclaimer: string
  readOnly: true
  executionEnabled: false
  constitutional: ConstitutionalCanonicalEconomy
  capabilities: LaunchCapability[]
  summary: {
    total: number
    live: number
    availableExistingFlow: number
    planned: number
    blocked: number
    notSupported: number
  }
}

export interface LaunchManifest {
  manifest: string
  api_version: string
  phase: string
  read_only: true
  execution_enabled: false
  as_of: string
  disclaimer: string
  constitutional: ConstitutionalCanonicalEconomy
  summary: LaunchReadModel['summary']
  capabilities: {
    capability_id: string
    label: string
    status: LaunchCapabilityStatus
    availability: LaunchAvailability
    wallet_requirement: WalletRequirement
    existing_flow_href?: string
    registry_href?: string
    machine_manifest: string
    warnings: string[]
  }[]
}
