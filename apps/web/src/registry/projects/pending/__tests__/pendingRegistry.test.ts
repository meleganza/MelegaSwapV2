import { describe, expect, it, beforeEach } from 'vitest'
import { getAllProjects } from '../../getAllProjects'
import {
  buildPendingProjectRecord,
  getCanonicalPromotionRule,
  getPendingProjectRegistry,
  resetPendingProjectRegistryForTests,
  resolveProjectRegistryLookup,
  serializePendingProjectProfile,
} from '../index'

const UNKNOWN = '0x0000000000000000000000000000000000000001'
const KNOWN = getAllProjects()[0]?.resources.tokens[0]?.address ?? ''

describe('pending project registry', () => {
  beforeEach(() => {
    resetPendingProjectRegistryForTests()
  })

  it('returns canonical project for known contract', () => {
    const result = resolveProjectRegistryLookup(KNOWN, 56)
    expect(result.tier).toBe('canonical')
    expect(result.canonical?.isCanonical).toBe(true)
    expect(result.pending).toBeUndefined()
  })

  it('creates pending project for unknown contract instead of dead end', () => {
    const first = resolveProjectRegistryLookup(UNKNOWN, 56, { name: 'Demo Token', symbol: 'DEMO' })
    expect(first.tier).toBe('pending')
    expect(first.pendingCreated).toBe(true)
    expect(first.pending?.status).toBe('discovered')
    expect(first.pending?.is_canonical).toBe(false)
    expect(first.pending?.chain).toBe(56)
    expect(first.pending?.name.value).toBe('Demo Token')
    expect(first.pending?.symbol.value).toBe('DEMO')
  })

  it('normalizes DEX-style chain number and nested asset via onboard hints', () => {
    const record = buildPendingProjectRecord({
      contract: UNKNOWN,
      chainId: 56,
      onChain: { name: 'MARCO Clone', symbol: 'MRC' },
    })
    expect(record.chain).toBe(56)
    expect(record.name.available).toBe(true)
    expect(record.symbol.available).toBe(true)
    expect(record.website.available).toBe(false)
    expect(record.logo.available).toBe(false)
  })

  it('never fabricates website, social, or logo', () => {
    const record = buildPendingProjectRecord({ contract: UNKNOWN, chainId: 56 })
    expect(record.website.available).toBe(false)
    expect(record.logo.available).toBe(false)
    expect(record.socials.twitter?.available).toBe(false)
    expect(record.socials.telegram?.available).toBe(false)
  })

  it('reuses existing pending profile on repeat lookup', () => {
    resolveProjectRegistryLookup(UNKNOWN, 56)
    const second = resolveProjectRegistryLookup(UNKNOWN, 56)
    expect(second.pendingCreated).toBe(false)
    expect(second.pending?.id).toBe(`pending:56:${UNKNOWN.toLowerCase()}`)
  })

  it('exposes machine JSON for pending profile', () => {
    const { pending } = resolveProjectRegistryLookup(UNKNOWN, 56, { symbol: 'TST' })
    const machine = serializePendingProjectProfile(pending!)
    expect(machine.schema).toBe('melega.project-profile.pending.v1')
    expect(machine.is_canonical).toBe(false)
    expect(machine.registry_tier).toBe('pending')
    expect(machine.promotion.requires_manual_registry_write).toBe(true)
  })

  it('pending project is not included in canonical getAllProjects', () => {
    resolveProjectRegistryLookup(UNKNOWN, 56)
    const canonical = getAllProjects()
    expect(canonical.every((p) => p.isCanonical)).toBe(true)
    expect(canonical.some((p) => p.resources.tokens.some((t) => t.address.toLowerCase() === UNKNOWN))).toBe(false)
  })

  it('supports review status transitions without auto-canonicalization', () => {
    const { pending } = resolveProjectRegistryLookup(UNKNOWN, 56)
    const registry = getPendingProjectRegistry()
    const reviewed = registry.updateStatus(pending!.id, 'pending_review', {
      reviewed_by: 'operator',
      review_notes: 'Awaiting owner confirmation',
    })
    expect(reviewed?.status).toBe('pending_review')
    expect(reviewed?.is_canonical).toBe(false)
  })

  it('documents canonical promotion rule', () => {
    const rule = getCanonicalPromotionRule()
    expect(rule.rule).toContain('manual')
    expect(rule.steps.length).toBeGreaterThan(2)
  })

  it('pending machine profile never includes settlement or waterfall ownership fields', () => {
    const forbidden = [
      'settlement_id',
      'lp_amount',
      'treasury_amount',
      'buyback_amount',
      'referral_amount',
      'waterfall',
    ]
    const { pending } = resolveProjectRegistryLookup(UNKNOWN, 56)
    const machine = serializePendingProjectProfile(pending!) as unknown as Record<string, unknown>
    for (const field of forbidden) {
      expect(machine).not.toHaveProperty(field)
    }
  })
})
