import { PipelineRequiredInput, PipelineStageId } from './pipeline-types'

export const PIPELINE_REQUIREMENTS: Record<PipelineStageId, PipelineRequiredInput[]> = {
  narrative: [
    {
      id: 'project_narrative',
      label: 'Project narrative draft',
      required: true,
      indexed: false,
      notes: 'Labs narrative surface not indexed in DEX — preview only',
    },
    {
      id: 'creator_identity',
      label: 'Creator identity context',
      required: false,
      indexed: false,
      notes: 'Economic identity read model optional at /identity',
    },
  ],
  validation: [
    {
      id: 'constitutional_fit',
      label: 'Constitutional economy fit review',
      required: true,
      indexed: false,
      notes: 'MARCO on BNB Chain remains canonical — presence targets are separate',
    },
    {
      id: 'risk_disclosure',
      label: 'Risk and capability disclosure',
      required: true,
      indexed: false,
    },
  ],
  project: [
    {
      id: 'project_slug',
      label: 'Project slug (UPI)',
      required: true,
      indexed: true,
      notes: 'Indexed example: melega-dex at /projects/melega-dex',
    },
    {
      id: 'project_manifest',
      label: 'Project registry manifest',
      required: true,
      indexed: true,
      notes: '/registry/projects/index.json',
    },
  ],
  asset: [
    {
      id: 'asset_slug',
      label: 'Asset slug (UAI)',
      required: true,
      indexed: true,
      notes: 'Indexed example: marco at /assets/marco',
    },
    {
      id: 'canonical_binding',
      label: 'Canonical economy binding',
      required: true,
      indexed: true,
      notes: 'MARCO on BNB Chain — LIVE, immutable',
    },
  ],
  metadata: [
    {
      id: 'token_list_entry',
      label: 'Token list metadata',
      required: true,
      indexed: false,
      notes: 'New narrative metadata not auto-indexed — governance pipeline planned',
    },
    {
      id: 'brand_logo',
      label: 'Brand logo asset',
      required: false,
      indexed: false,
    },
  ],
  liquidity: [
    {
      id: 'wallet_connection',
      label: 'Connected wallet',
      required: true,
      indexed: false,
      notes: 'Required for on-chain add liquidity — not automated from Labs',
    },
    {
      id: 'token_pair',
      label: 'Token pair selection',
      required: true,
      indexed: false,
      notes: 'Uses existing /add flow — no fake liquidity claims',
    },
  ],
  registry: [
    {
      id: 'registry_manifests',
      label: 'Registry manifest graph',
      required: true,
      indexed: true,
      notes: 'Projects, assets, venues, events indexed in constitutional stack',
    },
  ],
  presence: [
    {
      id: 'presence_targets',
      label: 'Economic presence targets',
      required: true,
      indexed: true,
      notes: 'Presence is NOT canonical economy replacement',
    },
  ],
  execution: [
    {
      id: 'execution_context',
      label: 'Execution decision context',
      required: false,
      indexed: true,
      notes: '/execution is illustrative — live swaps route to /swap',
    },
  ],
  workspace: [
    {
      id: 'operator_context',
      label: 'Operator workspace context',
      required: false,
      indexed: true,
      notes: 'Aggregate read model — no fake balances',
    },
  ],
}
