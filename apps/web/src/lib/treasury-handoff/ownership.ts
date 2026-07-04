/**
 * D87-03 — DEX must not own settlement. Treasury Runtime owns settlement truth.
 */
export const DEX_HANDOFF_OWNERSHIP = {
  owns: [
    'verified execution receipt submission',
    'settlement reference storage (tx hash → treasury response)',
    'machine-readable settlement status exposure',
  ],
  mustNeverOwn: [
    'settlement normalization',
    'settlement_id generation',
    'treasury truth',
    'LP amount computation',
    'treasury amount computation',
    'buyback amount computation',
    'referral amount computation',
    'fee waterfall splits',
  ],
} as const

/** Fields DEX must never send to Treasury Runtime. */
export const FORBIDDEN_HANDOFF_PAYLOAD_FIELDS = [
  'settlement_id',
  'settlementId',
  'lp_amount',
  'lpAmount',
  'treasury_amount',
  'treasuryAmount',
  'buyback_amount',
  'buybackAmount',
  'referral_amount',
  'referralAmount',
  'waterfall',
  'amounts',
] as const

export function assertPayloadDoesNotOwnSettlement(payload: Record<string, unknown>): void {
  for (const key of FORBIDDEN_HANDOFF_PAYLOAD_FIELDS) {
    if (key in payload && payload[key] != null) {
      throw new Error(`DEX handoff must not include forbidden settlement field: ${key}`)
    }
  }
}
