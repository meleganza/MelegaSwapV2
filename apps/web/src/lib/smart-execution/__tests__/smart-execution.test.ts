import { describe, expect, it } from 'vitest'
import {
  resolveSmartExecutionReadModel,
  serializeSmartExecutionManifest,
  computeExecutionQualityScore,
  computeCivilizationBenefitScore,
  getSampleCandidates,
  MATERIAL_QUALITY_GAP,
  MINIMUM_VENUE_HEALTH,
} from '../index'

describe('smart economic execution read model', () => {
  it('exposes constitutional canonical economy', () => {
    const model = resolveSmartExecutionReadModel()
    expect(model.constitutional.canonicalChain).toBe('BNB Chain')
    expect(model.constitutional.canonicalAsset).toBe('MARCO')
    expect(model.constitutional.status).toBe('LIVE')
    expect(model.illustrative).toBe(true)
  })

  it('uses static illustrative candidates only', () => {
    const model = resolveSmartExecutionReadModel()
    expect(model.candidates.length).toBeGreaterThanOrEqual(3)
    expect(model.candidates.every((candidate) => candidate.illustrative)).toBe(true)
    expect(model.disclaimer).toContain('Illustrative')
    expect(model.disclaimer).toContain('no live routing')
  })

  it('scores all seven evaluation dimensions per candidate', () => {
    const candidate = getSampleCandidates()[0]
    expect(candidate.dimensions).toHaveLength(7)
    expect(candidate.dimensions.map((dimension) => dimension.id)).toEqual([
      'price_quality',
      'slippage_risk',
      'gas_efficiency',
      'liquidity_confidence',
      'venue_health',
      'canonical_alignment',
      'civilization_benefit',
    ])
  })

  it('recommends highest execution quality candidate', () => {
    const model = resolveSmartExecutionReadModel()
    const best = model.candidates.reduce((leader, candidate) => {
      const score = computeExecutionQualityScore(candidate)
      return score > leader.score ? { id: candidate.id, score } : leader
    }, { id: '', score: -1 })

    expect(model.recommendation.candidateId).toBe(best.id)
    expect(model.recommendation.executionQualityScore).toBe(best.score)
  })

  it('never lets civilization benefit override material quality gap', () => {
    const model = resolveSmartExecutionReadModel()
    const treasuryRejected = model.rejections.find(
      (rejection) => rejection.candidateId === 'ecosystem-treasury-route',
    )

    expect(treasuryRejected).toBeDefined()
    expect(
      treasuryRejected?.reasons.some((reason) =>
        reason.message.includes('Civilization benefit'),
      ),
    ).toBe(true)
    expect(
      treasuryRejected?.reasons.some((reason) =>
        reason.message.includes('materially worse'),
      ),
    ).toBe(true)
  })

  it('rejects candidates below venue health floor', () => {
    const model = resolveSmartExecutionReadModel()
    const bridgeRejected = model.rejections.find(
      (rejection) => rejection.candidateId === 'presence-bridge-sample',
    )

    expect(bridgeRejected).toBeDefined()
    expect(
      bridgeRejected?.reasons.some((reason) =>
        reason.message.includes(`below floor ${MINIMUM_VENUE_HEALTH}`),
      ),
    ).toBe(true)
  })

  it('lists alternatives within quality gap threshold', () => {
    const model = resolveSmartExecutionReadModel()
    model.alternatives.forEach((alternative) => {
      expect(alternative.gapFromRecommended).toBeLessThan(MATERIAL_QUALITY_GAP)
    })
  })

  it('separates civilization benefit from execution quality scoring', () => {
    const treasury = getSampleCandidates().find(
      (candidate) => candidate.id === 'ecosystem-treasury-route',
    )!
    const quality = computeExecutionQualityScore(treasury)
    const civilization = computeCivilizationBenefitScore(treasury)

    expect(civilization).toBeGreaterThan(quality)
    expect(quality).toBeLessThan(
      computeExecutionQualityScore(
        getSampleCandidates().find((candidate) => candidate.id === 'melega-v2-canonical')!,
      ),
    )
  })

  it('serializes machine-readable manifest as read-only', () => {
    const manifest = serializeSmartExecutionManifest(resolveSmartExecutionReadModel())
    expect(manifest.manifest).toContain('smart-execution')
    expect(manifest.read_only).toBe(true)
    expect(manifest.execution_enabled).toBe(false)
    expect(manifest.illustrative).toBe(true)
    expect(manifest.candidates.length).toBeGreaterThanOrEqual(3)
  })
})
