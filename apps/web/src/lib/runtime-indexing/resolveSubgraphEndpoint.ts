import { LEGACY_INFO_CLIENT, MELEGA_SUBGRAPH_URL } from 'config/constants/endpoints'

/** Documented Melega subgraph identity — not an HTTP endpoint. */
export const MELEGA_SUBGRAPH_SCHEMA_URI = 'subgraph://melega/bsc-v2'

export const BLOCKED_SUBGRAPH_NOT_DEPLOYED = 'BLOCKED_SUBGRAPH_NOT_DEPLOYED'

/** @deprecated use BLOCKED_SUBGRAPH_NOT_DEPLOYED */
export const BLOCKED_SUBGRAPH_ENDPOINT_MISSING = BLOCKED_SUBGRAPH_NOT_DEPLOYED

export interface SubgraphEndpointReport {
  configuredEndpoint: string | null
  melegaNativeConfigured: boolean
  legacyFallbackEndpoint: string
  blockerCode: typeof BLOCKED_SUBGRAPH_NOT_DEPLOYED | null
  deploymentInstruction: string
  documentedSchemaUri: string
}

export function resolveSubgraphEndpointReport(): SubgraphEndpointReport {
  const melegaNativeConfigured = Boolean(MELEGA_SUBGRAPH_URL)

  return {
    configuredEndpoint: melegaNativeConfigured ? MELEGA_SUBGRAPH_URL : null,
    melegaNativeConfigured,
    legacyFallbackEndpoint: LEGACY_INFO_CLIENT,
    blockerCode: melegaNativeConfigured ? null : BLOCKED_SUBGRAPH_NOT_DEPLOYED,
    deploymentInstruction: melegaNativeConfigured
      ? ''
      : 'Deploy Melega BSC v2 subgraph per docs/runtime/R731_MELEGA_SUBGRAPH_DEPLOYMENT_SPEC.md, then set NEXT_PUBLIC_MELEGA_SUBGRAPH_URL in Vercel (project: melega-swap-v2-web, Production + Preview) and apps/web/.env.local.',
    documentedSchemaUri: MELEGA_SUBGRAPH_SCHEMA_URI,
  }
}

export function formatSubgraphBlockerReason(report: SubgraphEndpointReport): string {
  if (!report.blockerCode) return ''
  return `${report.blockerCode} — Melega BSC subgraph not deployed (legacy Pancake proxy ${report.legacyFallbackEndpoint} is dead — not used). ${report.deploymentInstruction}`
}
