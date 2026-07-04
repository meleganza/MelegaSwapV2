import { describe, expect, it } from 'vitest'
import { formatSettlementUserLabel, settlementLabelTone } from '../formatSettlementStatus'

describe('settlement status display', () => {
  it('maps SETTLEMENT_ACCEPTED to Settled', () => {
    const label = formatSettlementUserLabel({
      settlementStatus: 'SETTLEMENT_ACCEPTED',
      treasuryRuntimeEndpointStatus: 'available',
      settlementId: 'stl_1',
    })
    expect(label).toBe('Settled')
    expect(settlementLabelTone(label)).toBe('ok')
  })

  it('maps pending + unavailable treasury to Treasury Unavailable', () => {
    const label = formatSettlementUserLabel({
      settlementStatus: 'SETTLEMENT_PENDING',
      treasuryRuntimeEndpointStatus: 'unavailable',
    })
    expect(label).toBe('Treasury Unavailable')
  })

  it('maps duplicate and rejected honestly', () => {
    expect(
      formatSettlementUserLabel({
        settlementStatus: 'SETTLEMENT_DUPLICATE',
        treasuryRuntimeEndpointStatus: 'available',
      }),
    ).toBe('Duplicate Settlement')
    expect(
      formatSettlementUserLabel({
        settlementStatus: 'SETTLEMENT_REJECTED',
        treasuryRuntimeEndpointStatus: 'available',
        machineCode: 'REJECTED',
      }),
    ).toBe('Settlement Rejected')
  })

  it('defaults to No settlement data', () => {
    expect(
      formatSettlementUserLabel({
        settlementStatus: 'none',
        treasuryRuntimeEndpointStatus: 'not_configured',
      }),
    ).toBe('No settlement data')
  })
})
