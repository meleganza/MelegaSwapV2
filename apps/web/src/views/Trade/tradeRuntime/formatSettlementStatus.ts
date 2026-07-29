import type { TradeSettlementMachineMetadata } from 'lib/treasury-handoff'

export type SettlementUserLabel =
  | 'Settlement Pending'
  | 'Settled'
  | 'Duplicate Settlement'
  | 'Settlement Not Required'
  | 'Settlement Rejected'
  | 'No settlement data'

export function formatSettlementUserLabel(meta: TradeSettlementMachineMetadata): SettlementUserLabel {
  const { settlementStatus, treasuryRuntimeEndpointStatus } = meta

  if (settlementStatus === 'SETTLEMENT_ACCEPTED') return 'Settled'
  if (settlementStatus === 'SETTLEMENT_DUPLICATE') return 'Duplicate Settlement'
  if (settlementStatus === 'SETTLEMENT_REJECTED') return 'Settlement Rejected'
  if (
    treasuryRuntimeEndpointStatus === 'decommissioned' ||
    treasuryRuntimeEndpointStatus === 'not_configured' ||
    treasuryRuntimeEndpointStatus === 'unavailable'
  ) {
    return 'Settlement Not Required'
  }
  if (settlementStatus === 'SETTLEMENT_PENDING') return 'Settlement Pending'
  return 'No settlement data'
}

export function settlementLabelTone(label: SettlementUserLabel): 'ok' | 'warn' | 'error' | 'muted' {
  if (label === 'Settled') return 'ok'
  if (label === 'Settlement Not Required') return 'muted'
  if (label === 'Settlement Pending') return 'warn'
  if (label === 'Duplicate Settlement') return 'warn'
  if (label === 'Settlement Rejected') return 'error'
  return 'muted'
}
