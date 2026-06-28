import { describe, expect, it } from 'vitest'
import {
  resolveDexCapabilityAudit,
  serializeDexCapabilityAudit,
  getDexCapabilityById,
  DEX_CAPABILITY_AUDIT_ENTRIES,
} from '../index'

describe('dex capability audit', () => {
  it('audits all 17 required capabilities', () => {
    expect(DEX_CAPABILITY_AUDIT_ENTRIES).toHaveLength(17)
  })

  it('marks add/remove liquidity and swap as LIVE', () => {
    expect(getDexCapabilityById('add_liquidity')?.status).toBe('LIVE')
    expect(getDexCapabilityById('remove_liquidity')?.status).toBe('LIVE')
    expect(getDexCapabilityById('swap_routing')?.status).toBe('LIVE')
  })

  it('marks farm and staking pool creation as MISSING', () => {
    expect(getDexCapabilityById('create_farm')?.status).toBe('MISSING')
    expect(getDexCapabilityById('create_staking_pool')?.status).toBe('MISSING')
  })

  it('is audit-only with no execution', () => {
    const audit = resolveDexCapabilityAudit()
    expect(audit.audit_only).toBe(true)
    expect(audit.mission).toBe('MISSION_13')
  })

  it('serializes machine-readable manifest', () => {
    const manifest = serializeDexCapabilityAudit()
    expect(manifest.manifest).toContain('dex-capability-audit')
    expect(manifest.capabilities).toHaveLength(17)
    expect(manifest.recommended_mission_14).toContain('Mission 14')
  })
})
