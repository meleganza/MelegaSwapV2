#!/usr/bin/env node
/**
 * Read-only Polygon MELEGA/MARCO OFT preflight printer.
 * Does not broadcast. Does not require keys.
 */
const SAFE = '0x840410fef54ca6a922eb248c8a12011144e17508'
const ENDPOINT = '0x1a44076050125825900e736c501f859c50fe728c'
const ADAPTER = '0xC92B49ddF9312cbfc01Ad397963dF915C7a2399E'
const STALE = '0xD3e28c74177B812d1543A406aD1A97ee3C398AC2'

const report = {
  POLYGON_CHAIN_ID: 137,
  POLYGON_LZ_EID: 30109,
  POLYGON_ENDPOINT: ENDPOINT,
  POLYGON_OFT_ADDRESS: null,
  IDENTITY: { name: 'MELEGA', symbol: 'MARCO', decimals: 18, sharedDecimals: 6, initialSupply: 0 },
  OWNER_DELEGATE: SAFE,
  REJECT: { marcoMarco: true, staleErc20: STALE },
  BNB_PEER_AFTER_DEPLOY: { eid: 30102, peer: `0x${'00'.repeat(12)}${ADAPTER.slice(2).toLowerCase()}` },
  ENFORCED_OPTIONS: '0x00030100110100000000000000000000000000030d40',
  OPERATOR_ACTION_REQUIRED: [
    'Safe{Wallet}: add Polygon to existing Safe 0x840410fe… (CREATE2, same address).',
    'Fund Safe with ≥ 3 POL.',
    'Safe deploys LayerZero V2 OFT (MELEGA/MARCO/18/shared6, endpoint above, owner=Safe, supply 0).',
    'Safe setPeer/setConfig/setEnforcedOptions both directions vs BNB adapter only.',
    'Canary 0.000001 MARCO BNB↔Polygon. No public DEX activation until both DELIVERED.',
  ],
}

console.log(JSON.stringify(report, null, 2))
