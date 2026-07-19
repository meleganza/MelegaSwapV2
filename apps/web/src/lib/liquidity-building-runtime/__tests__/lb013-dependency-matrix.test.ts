import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'

const REQUIRED_IDS = [
  'LB-G03B',
  'LB-G03C',
  'LB-G04B',
  'LB-G04C',
  'LB-G08',
  'LB-G09',
  'LB-G10',
  'LB-G11',
  'LB-G12',
]

const REQUIRED_FIELDS = [
  'id',
  'dependency',
  'requiredArtifact',
  'repository',
  'technicalOwner',
  'repositoryOwner',
  'requiredAction',
  'acceptanceEvidence',
  'verificationMethod',
  'activationImpact',
  'status',
  'gapType',
] as const

describe('LB013 external dependency closure matrix', () => {
  const doc = JSON.parse(
    readFileSync(
      path.resolve(
        __dirname,
        '../../../../../../deployments/liquidity-building/chain-56/external-dependency-closure-matrix.v1.json',
      ),
      'utf8',
    ),
  )

  it('covers every open blocker with executable ownership fields', () => {
    expect(doc.schemaVersion).toBe('melega.liquidity-building.external-dependency-closure-matrix.v1')
    expect(doc.mission).toBe('LB013')
    expect(doc.activationAuthorized).toBe(false)
    expect(doc.mainnetCycleExecuted).toBe(false)

    const ids = doc.blockers.map((b: { id: string }) => b.id)
    for (const id of REQUIRED_IDS) {
      expect(ids).toContain(id)
    }

    for (const b of doc.blockers) {
      for (const f of REQUIRED_FIELDS) {
        expect(b[f], `${b.id}.${f}`).toBeTruthy()
      }
      expect(b.status).toBe('OPEN')
      expect(String(b.repository).toLowerCase()).not.toContain('needs infrastructure')
      expect(b.dependency.length).toBeGreaterThan(10)
      expect(b.verificationMethod.length).toBeGreaterThan(10)
    }
  })

  it('does not invent a relay git repository name', () => {
    const relay = doc.blockers.find((b: { id: string }) => b.id === 'LB-G03C')
    expect(relay.repository).toContain('NOT_IDENTIFIED_AS_GIT_REPO')
  })

  it('separates G11 implementation from infrastructure verification', () => {
    const g11 = doc.blockers.find((b: { id: string }) => b.id === 'LB-G11')
    expect(g11.gapType).toBe('INFRASTRUCTURE_PLUS_VERIFICATION')
    expect(g11.implementationNote).toMatch(/already/i)
  })

  it('keeps security confirmations true', () => {
    expect(doc.securityConfirmations.NO_PRIVATE_KEY_FALLBACK).toBe(true)
    expect(doc.securityConfirmations.NO_MOCK_PRODUCTION_DEPENDENCY).toBe(true)
    expect(doc.securityConfirmations.NO_HUMAN_SIGNER).toBe(true)
  })

  it('blocked activation-gate-final still false after LB013 planning', () => {
    const gates = JSON.parse(
      readFileSync(
        path.resolve(
          __dirname,
          '../../../../../../deployments/liquidity-building/chain-56/activation-gate-final.v1.json',
        ),
        'utf8',
      ),
    )
    expect(gates.activationAuthorized).toBe(false)
  })
})
