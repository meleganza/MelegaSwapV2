import type { StaticProjectRecord } from '../../types'
import type { CanonicalProjectDocument } from '../types'
import { resolveProjectBySlug } from '../resolveProject'
import { normalizeProjectDocument } from '../normalizeProject'
import { fingerprint } from '../evidence/evidenceId'
import {
  CERTIFIED_LB_DEPLOYMENT_SNAPSHOT,
  CERTIFIED_LIQUIDITY_BUILDING_BINDINGS,
  LB_ORCHESTRATION_LIMITATIONS,
  LIQUIDITY_BUILDING_CAPABILITY_ID,
  LIQUIDITY_BUILDING_DESTINATION_HREF,
  LIQUIDITY_BUILDING_RESOLVER_REVISION,
  PROJECT_LIQUIDITY_BUILDING_SCHEMA_VERSION,
  PROJECT_PAGE_LIQUIDITY_BUILDING_SUMMARY_EXTENSION,
  type LbActivationState,
} from './schema'
import type {
  LiquidityBuildingDestination,
  LiquidityBuildingSummaryForProjectApi,
  LiquidityBuildingWarning,
  ProjectLiquidityBuildingDocument,
} from './types'

function revisionFromParts(parts: string[]): string {
  return fingerprint(parts.slice().sort().join('|'))
}

function readDeploymentActivation(): {
  activationState: LbActivationState
  runtimePresent: boolean
  readinessState: string | null
} {
  const doc = CERTIFIED_LB_DEPLOYMENT_SNAPSHOT
  if (doc.chainId !== 56) {
    return { activationState: 'BLOCKED', runtimePresent: true, readinessState: doc.deploymentReadinessState }
  }
  const state = doc.deploymentReadinessState
  if (state === 'DEPLOYED' || state === 'VALID') {
    // Production gates remain fail-closed in LB V1 — treat as activation pending/blocked, not ACTIVE.
    return {
      activationState: state === 'DEPLOYED' ? 'ACTIVATION_PENDING' : 'BLOCKED',
      runtimePresent: true,
      readinessState: state,
    }
  }
  return {
    activationState: 'BLOCKED',
    runtimePresent: true,
    readinessState: state,
  }
}

function isCertifiedDestination(href: string): boolean {
  return href === LIQUIDITY_BUILDING_DESTINATION_HREF
}

function makeDestination(href: string): LiquidityBuildingDestination | null {
  if (!isCertifiedDestination(href)) {
    return null
  }
  return {
    href: LIQUIDITY_BUILDING_DESTINATION_HREF,
    label: 'Open Liquidity Building',
    availability: 'AVAILABLE',
    reasonCode: null,
    limitations: [
      'Opens the existing Liquidity Studio Liquidity Building surface (LB024 deep link).',
      'No execution or activation authority is granted by this link.',
    ],
  }
}

/**
 * Shared Liquidity Building orchestration resolver — public API and Project Page must use this.
 * Does not import or duplicate Liquidity Building UI, simulation, or transaction flows.
 */
export function buildProjectLiquidityBuildingDocument(input: {
  project: StaticProjectRecord
  document: CanonicalProjectDocument
  generatedAt?: string
}): ProjectLiquidityBuildingDocument {
  const generatedAt = input.generatedAt ?? new Date().toISOString()
  const warnings: LiquidityBuildingWarning[] = []
  const binding = CERTIFIED_LIQUIDITY_BUILDING_BINDINGS.find((b) => b.projectSlug === input.document.slug)

  const liquidityCap = input.document.declaredCapabilities.find((c) => c.key === 'liquidity')
  const registryLiquidityLive = liquidityCap?.state === 'AVAILABLE'

  if (!binding) {
    const revision = revisionFromParts([input.document.revision, 'unsupported'])
    return {
      schemaVersion: PROJECT_LIQUIDITY_BUILDING_SCHEMA_VERSION,
      projectId: input.document.projectId,
      slug: input.document.slug,
      canonicalUrl: input.document.canonicalUrl,
      projectRevision: input.document.revision,
      liquidityBuildingRevision: revision,
      resolverRevision: LIQUIDITY_BUILDING_RESOLVER_REVISION,
      generatedAt,
      capability: {
        capabilityId: LIQUIDITY_BUILDING_CAPABILITY_ID,
        projectId: input.document.projectId,
        chainId: null,
        availability: 'NOT_APPLICABLE',
        status: 'UNSUPPORTED',
        source: null,
        destination: null,
        runtimeVersion: null,
        activationState: 'UNSUPPORTED',
        limitations: [...LB_ORCHESTRATION_LIMITATIONS],
      },
      supportedChains: [],
      destination: null,
      activationState: 'UNSUPPORTED',
      availability: 'NOT_APPLICABLE',
      warnings: [
        {
          reasonCode: 'PROJECT_DOES_NOT_SUPPORT_LIQUIDITY_BUILDING',
          message: 'No certified Liquidity Building binding exists for this project.',
          chainId: null,
        },
      ],
      limitations: LB_ORCHESTRATION_LIMITATIONS,
      heroActionAllowed: false,
    }
  }

  if (!registryLiquidityLive) {
    warnings.push({
      reasonCode: 'PARTIAL_RUNTIME_COVERAGE',
      message: 'Certified LB binding exists but project liquidity capability is not AVAILABLE in registry.',
      chainId: binding.chainIds[0],
    })
  }

  const deployment = readDeploymentActivation()
  if (!deployment.runtimePresent) {
    warnings.push({
      reasonCode: 'RUNTIME_CONFIGURATION_MISSING',
      message: 'Liquidity Building V1 certified deployment snapshot is missing.',
      chainId: binding.chainIds[0],
    })
  } else if (deployment.activationState === 'BLOCKED') {
    warnings.push({
      reasonCode: 'ACTIVATION_BLOCKED',
      message: `Liquidity Building activation is blocked (deploymentReadinessState=${
        deployment.readinessState ?? 'unknown'
      }).`,
      chainId: binding.chainIds[0],
    })
  } else if (deployment.activationState === 'ACTIVATION_PENDING') {
    warnings.push({
      reasonCode: 'ACTIVATION_PENDING',
      message: 'Liquidity Building surface is reachable; production activation remains pending.',
      chainId: binding.chainIds[0],
    })
  }

  const activationState = deployment.runtimePresent ? deployment.activationState : 'UNAVAILABLE'
  const destination = makeDestination(binding.destinationHref)
  if (!destination) {
    warnings.push({
      reasonCode: 'DESTINATION_UNAVAILABLE',
      message: 'Certified Liquidity Building destination failed validation.',
      chainId: binding.chainIds[0],
    })
  }

  // Destination remains available for discovery even when activation gates are blocked (LB024 Setup path).
  const capabilityAvailable =
    Boolean(destination) &&
    (activationState === 'ACTIVE' ||
      activationState === 'ACTIVATION_PENDING' ||
      activationState === 'BLOCKED')
  const availability = capabilityAvailable ? 'AVAILABLE' : 'UNAVAILABLE'
  const status =
    activationState === 'ACTIVE'
      ? ('AVAILABLE' as const)
      : activationState === 'UNSUPPORTED'
        ? ('UNSUPPORTED' as const)
        : activationState === 'UNAVAILABLE'
          ? ('UNAVAILABLE' as const)
          : ('PAUSED' as const)

  const revision = revisionFromParts([
    input.document.revision,
    binding.runtimeVersion,
    activationState,
    deployment.readinessState ?? 'none',
  ])

  // Swap remains the canonical primary hero action for melega-dex unless LB is ACTIVE and swap is absent.
  const heroActionAllowed = activationState === 'ACTIVE'

  return {
    schemaVersion: PROJECT_LIQUIDITY_BUILDING_SCHEMA_VERSION,
    projectId: input.document.projectId,
    slug: input.document.slug,
    canonicalUrl: input.document.canonicalUrl,
    projectRevision: input.document.revision,
    liquidityBuildingRevision: revision,
    resolverRevision: LIQUIDITY_BUILDING_RESOLVER_REVISION,
    generatedAt,
    capability: {
      capabilityId: LIQUIDITY_BUILDING_CAPABILITY_ID,
      projectId: input.document.projectId,
      chainId: binding.chainIds[0],
      availability,
      status,
      source: binding.source,
      destination,
      runtimeVersion: binding.runtimeVersion,
      activationState,
      limitations: [...LB_ORCHESTRATION_LIMITATIONS],
    },
    supportedChains: [...binding.chainIds],
    destination,
    activationState,
    availability,
    warnings: warnings.sort((a, b) => a.reasonCode.localeCompare(b.reasonCode)),
    limitations: LB_ORCHESTRATION_LIMITATIONS,
    heroActionAllowed,
  }
}

export function toLiquidityBuildingSummaryForProjectApi(
  doc: ProjectLiquidityBuildingDocument,
): LiquidityBuildingSummaryForProjectApi {
  return {
    extension: PROJECT_PAGE_LIQUIDITY_BUILDING_SUMMARY_EXTENSION,
    schemaVersion: doc.schemaVersion,
    supported: doc.availability === 'AVAILABLE',
    activationState: doc.activationState,
    endpoint: `/api/public/projects/${doc.slug}/liquidity-building/`,
    revision: doc.liquidityBuildingRevision,
  }
}

export function loadProjectLiquidityBuildingDocument(
  slug: string,
  generatedAt?: string,
): ProjectLiquidityBuildingDocument | null {
  const resolved = resolveProjectBySlug(slug)
  if (!resolved.ok) return null
  const at = generatedAt ?? new Date().toISOString()
  const document = normalizeProjectDocument(resolved.project, { generatedAt: at })
  return buildProjectLiquidityBuildingDocument({
    project: resolved.project,
    document,
    generatedAt: at,
  })
}
