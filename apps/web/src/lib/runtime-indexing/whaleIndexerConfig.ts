export const WHALE_INDEXER_NOT_DEPLOYED = 'WHALE_INDEXER_NOT_DEPLOYED'

/** @deprecated use WHALE_INDEXER_NOT_DEPLOYED */
export const WHALE_INDEXER_NOT_CONFIGURED = WHALE_INDEXER_NOT_DEPLOYED

export const WHALE_FEED_EXPECTED_SCHEMA = {
  events: [
    {
      wallet: '0x…',
      token: '0x…',
      symbol: 'MARCO',
      amountUSD: 0,
      txHash: '0x…',
      timestamp: 'ISO-8601',
      signalType: 'whale | smart_money',
      confidence: 0,
    },
  ],
} as const

export interface WhaleFeedMachinePayload {
  status: 'not_configured'
  code: typeof WHALE_INDEXER_NOT_DEPLOYED
  required_source: string
  expected_schema: typeof WHALE_FEED_EXPECTED_SCHEMA
  recommended_endpoint_env: 'NEXT_PUBLIC_WHALE_INDEXER_URL'
  diagnostic: string
}

export function buildWhaleFeedMachinePayload(): WhaleFeedMachinePayload {
  return {
    status: 'not_configured',
    code: WHALE_INDEXER_NOT_DEPLOYED,
    required_source:
      'On-chain wallet intelligence indexer (whale / smart-money activity feed) — no deployed source in repo or env',
    expected_schema: WHALE_FEED_EXPECTED_SCHEMA,
    recommended_endpoint_env: 'NEXT_PUBLIC_WHALE_INDEXER_URL',
    diagnostic:
      'Whale activity indexer not deployed — feed remains explicit until NEXT_PUBLIC_WHALE_INDEXER_URL is configured',
  }
}
