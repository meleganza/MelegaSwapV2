import type { NextApiHandler } from 'next'
import stringify from 'fast-json-stable-stringify'
import {
  buildProjectDeveloperDocument,
  buildProjectEcosystemDocument,
  buildProjectGovernanceDocument,
  buildProjectControlCenterDocument,
  buildProjectLiquidityBuildingDocument,
  buildProjectMarketsDocument,
  buildProjectParticipationDocument,
  buildProjectReadinessDocument,
  buildProjectUpdatesDocument,
  buildWalletRelationshipSupportMetadata,
  loadProjectEvidencePack,
  normalizeProjectSlugInput,
  resolveProjectBySlug,
  toDeveloperSummaryForProjectApi,
  toEcosystemSummaryForProjectApi,
  toEvidenceSummaryForProjectApi,
  toGovernanceSummaryForProjectApi,
  toControlCenterSummaryForProjectApi,
  toLiquidityBuildingSummaryForProjectApi,
  toMarketsSummaryForProjectApi,
  toParticipationSummaryForProjectApi,
  toPublicProjectJson,
  toReadinessSummaryForProjectApi,
  toTrustSnapshotSummaryForProjectApi,
  toUpdatesSummaryForProjectApi,
} from 'registry/projects/identity'

/**
 * GET /api/public/projects/{slug}
 * PP001 project document + PP002 evidenceSummary + PP003 readiness/trust summaries
 * (schema remains melega.project-page.v1).
 */
const handler: NextApiHandler = (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ ok: false, reason: 'METHOD_NOT_ALLOWED' })
  }

  const raw =
    typeof req.query.slug === 'string' ? req.query.slug : Array.isArray(req.query.slug) ? req.query.slug[0] : ''
  const slug = normalizeProjectSlugInput(raw)
  if (!slug) {
    res.setHeader('Cache-Control', 'public, max-age=60')
    return res.status(404).json({ ok: false, reason: 'NOT_FOUND', message: 'Malformed or unknown project slug' })
  }

  const generatedAt = new Date().toISOString()
  const resolved = resolveProjectBySlug(slug)
  if (!resolved.ok) {
    res.setHeader('Cache-Control', 'public, max-age=60')
    return res.status(404).json({ ok: false, reason: 'NOT_FOUND', message: 'Unknown project slug' })
  }

  const loaded = loadProjectEvidencePack(resolved.slug, { generatedAt })
  if (!loaded) {
    res.setHeader('Cache-Control', 'public, max-age=60')
    return res.status(404).json({ ok: false, reason: 'NOT_FOUND', message: 'Unknown project slug' })
  }

  const readinessDoc = buildProjectReadinessDocument({
    project: resolved.project,
    document: loaded.document,
    evidencePack: loaded.evidencePack,
    generatedAt,
  })

  const marketsDoc = buildProjectMarketsDocument({
    project: resolved.project,
    document: loaded.document,
    context: { generatedAt },
  })

  const participationDoc = buildProjectParticipationDocument({
    project: resolved.project,
    document: loaded.document,
    generatedAt,
  })

  const liquidityBuildingDoc = buildProjectLiquidityBuildingDocument({
    project: resolved.project,
    document: loaded.document,
    generatedAt,
  })

  const updatesDoc = buildProjectUpdatesDocument({
    project: resolved.project,
    document: loaded.document,
    evidencePack: loaded.evidencePack,
    generatedAt,
  })

  const ecosystemDoc = buildProjectEcosystemDocument({
    project: resolved.project,
    document: loaded.document,
    evidencePack: loaded.evidencePack,
    generatedAt,
  })

  const developerDoc = buildProjectDeveloperDocument({
    project: resolved.project,
    document: loaded.document,
    evidencePack: loaded.evidencePack,
    generatedAt,
  })

  const governanceDoc = buildProjectGovernanceDocument({
    project: resolved.project,
    document: loaded.document,
    evidencePack: loaded.evidencePack,
    generatedAt,
  })

  const controlCenterDoc = buildProjectControlCenterDocument({
    project: resolved.project,
    document: loaded.document,
    evidencePack: loaded.evidencePack,
    generatedAt,
  })

  const body = toPublicProjectJson(loaded.document, {
    evidenceSummary: toEvidenceSummaryForProjectApi(loaded.evidencePack),
    readinessSummary: toReadinessSummaryForProjectApi(readinessDoc) as unknown as Record<string, unknown>,
    trustSnapshotSummary: toTrustSnapshotSummaryForProjectApi(readinessDoc) as unknown as Record<string, unknown>,
    walletRelationshipSupport: buildWalletRelationshipSupportMetadata(loaded.document.slug) as unknown as Record<
      string,
      unknown
    >,
    marketsSummary: toMarketsSummaryForProjectApi(marketsDoc) as unknown as Record<string, unknown>,
    participationSummary: toParticipationSummaryForProjectApi(participationDoc) as unknown as Record<string, unknown>,
    liquidityBuildingSummary: toLiquidityBuildingSummaryForProjectApi(liquidityBuildingDoc) as unknown as Record<
      string,
      unknown
    >,
    ecosystemSummary: toEcosystemSummaryForProjectApi(ecosystemDoc) as unknown as Record<string, unknown>,
    updatesSummary: toUpdatesSummaryForProjectApi(updatesDoc) as unknown as Record<string, unknown>,
    developerSummary: toDeveloperSummaryForProjectApi(developerDoc) as unknown as Record<string, unknown>,
    governanceSummary: toGovernanceSummaryForProjectApi(governanceDoc) as unknown as Record<string, unknown>,
    controlCenterSummary: toControlCenterSummaryForProjectApi(controlCenterDoc) as unknown as Record<string, unknown>,
  })
  const payload = stringify(body)
  const etag = `"${loaded.document.revision}"`

  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
  res.setHeader('ETag', etag)

  if (req.headers['if-none-match'] === etag) {
    return res.status(304).end()
  }

  return res.status(200).send(payload)
}

export default handler
