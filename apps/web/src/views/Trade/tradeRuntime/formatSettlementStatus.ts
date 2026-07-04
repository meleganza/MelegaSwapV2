import type { TradeSettlementMachineMetadata } from 'lib/treasury-handoff'

export type SettlementUserLabel =
  | 'Settlement Pending'
  | 'Settled'
  | 'Duplicate Settlement'
  | 'Treasury Unavailable'
  | 'Settlement Rejected'
  | 'No settlement data'

export function formatSettlementUserLabel(meta: TradeSettlementMachineMetadata): SettlementUserLabel {
  const { settlementStatus, treasuryRuntimeEndpointStatus } = meta

  if (settlementStatus === 'SETTLEMENT_ACCEPTED') return 'Settled'
  if (settlementStatus === 'SETTLEMENT_DUPLICATE') return 'Duplicate Settlement'
  if (settlementStatus === 'SETTLEMENT_REJECTED') return 'Settlement Rejected'
  if (settlementStatus === 'SETTLEMENT_PENDING') {
    if (treasuryRuntimeEndpointStatus === 'unavailable' || treasuryRuntimeEndpointStatus === 'not_configured') {
      return 'Treasury Unavailable'
    }
    return 'Settlement Pending'
  }
  return 'No settlement data'
}

export function settlementLabelTone(label: SettlementUserLabel): 'ok' | 'warn' | 'error' | 'muted' {
  if (label === 'Settled') return 'ok'
  if (label === 'Settlement Pending') return 'warn'
  if (label === 'Duplicate Settlement') return 'warn'
  if (label === 'Settlement Rejected') return 'error'
  if (label === 'Treasury Unavailable') return 'warn'
  return 'muted'
}
