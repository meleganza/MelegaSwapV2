import { describe, expect, it } from 'vitest'
import {
  UX_CONSTITUTION_BRAND,
  UX_CONSTITUTION_EARN_TABS,
  UX_CONSTITUTION_FORBIDDEN_PUBLIC_LABEL,
  UX_CONSTITUTION_HUMAN_NAV,
  UX_CONSTITUTION_LISTING_CTA,
  UX_CONSTITUTION_RECOMMENDED_STAKING_TEMPLATE,
  resolveUxConstitutionSummary,
} from '../ux-constitution-data'
import {
  UX_CONSTITUTION_AUTHORITY,
  UX_CONSTITUTION_MANIFEST_URI,
  UX_CONSTITUTION_STATUS,
  UX_CONSTITUTION_VERSION,
} from '../ux-constitution-types'

describe('ux constitution v1.2', () => {
  it('declares approved canonical design authority', () => {
    const summary = resolveUxConstitutionSummary()
    expect(summary.documentVersion).toBe(UX_CONSTITUTION_VERSION)
    expect(summary.status).toBe(UX_CONSTITUTION_STATUS)
    expect(summary.authority).toBe(UX_CONSTITUTION_AUTHORITY)
  })

  it('enforces Melega DEX brand and forbids MelegaSwap in public UI', () => {
    expect(UX_CONSTITUTION_BRAND).toBe('Melega DEX')
    expect(UX_CONSTITUTION_FORBIDDEN_PUBLIC_LABEL).toBe('MelegaSwap')
    expect(resolveUxConstitutionSummary().brand).toBe('Melega DEX')
  })

  it('defines human navigation without Trade duplication', () => {
    expect(UX_CONSTITUTION_HUMAN_NAV).toEqual([
      'Home',
      'Swap',
      'Earn',
      'Launch',
      'Discover',
      'Workspace',
    ])
    expect(UX_CONSTITUTION_HUMAN_NAV).not.toContain('Trade')
  })

  it('requires real data and rejects fake metrics', () => {
    const summary = resolveUxConstitutionSummary()
    expect(summary.realDataOnly).toBe(true)
    expect(summary.noFakeMetrics).toBe(true)
  })

  it('points to public manifest URI', () => {
    expect(UX_CONSTITUTION_MANIFEST_URI).toBe('/registry/design/melega-dex-ux-constitution-v1-2.json')
    expect(resolveUxConstitutionSummary().manifestUri).toBe(UX_CONSTITUTION_MANIFEST_URI)
  })

  it('defines listing CTA and MARCO staking template', () => {
    expect(UX_CONSTITUTION_LISTING_CTA).toBe('List your project on Melega DEX')
    expect(UX_CONSTITUTION_RECOMMENDED_STAKING_TEMPLATE).toBe('Stake MARCO -> Earn your token')
  })

  it('defines Earn dual tab model', () => {
    expect(UX_CONSTITUTION_EARN_TABS).toEqual(['Farms', 'Staking Pools'])
  })

  it('keeps AI mode separated from human nav', () => {
    expect(resolveUxConstitutionSummary().aiModeSeparated).toBe(true)
  })
})
