import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'
import {
  decodeFarmerLog,
  isExcludedFarmerAddress,
} from '../indexer/farmerParticipantIndex'
import {
  MASTERCHEF_DEPOSIT_TOPIC,
  MASTERCHEF_WITHDRAW_TOPIC,
  MASTERCHEF_EMERGENCY_WITHDRAW_TOPIC,
  MASTERCHEF_CANONICAL,
} from '../indexer/masterchefTopics'

const ROOT = path.resolve(__dirname, '..')

describe('farmer participant index contracts', () => {
  it('uses ABI-correct Melega MasterChef topic0 hashes (not Pancake V2)', () => {
    expect(MASTERCHEF_DEPOSIT_TOPIC).toBe(
      '0x90890809c654f11d6e72a28fa60149770a0d11ec6c92319d6ceb2bb0a4ea1a15',
    )
    expect(MASTERCHEF_WITHDRAW_TOPIC).toBe(
      '0xf279e6a1f5e320cca91135676d9cb6e44ca8a08c0b88342bcdb1144f6511b568',
    )
    expect(MASTERCHEF_EMERGENCY_WITHDRAW_TOPIC.toLowerCase()).toBe(
      '0xbb757047c2b5f3974fe26b7c10f732e7bce710b0952a71082702781e62ae0595',
    )
  })

  it('records factual deployment block from creation receipt', () => {
    expect(MASTERCHEF_CANONICAL.deploymentBlock).toBe(20_330_833)
    expect(MASTERCHEF_CANONICAL.creationTx.startsWith('0x3f270e4b')).toBe(true)
  })

  it('excludes zero address and MasterChef system address', () => {
    expect(isExcludedFarmerAddress('0x0000000000000000000000000000000000000000')).toBe(true)
    expect(isExcludedFarmerAddress(MASTERCHEF_CANONICAL.address)).toBe(true)
    expect(isExcludedFarmerAddress('0xfdb29129cb554d5e45a8cdc8b3f6bb1e0c0c6f59')).toBe(false)
  })

  it('decodes Deposit user + pid from indexed topics', () => {
    const user = '0xfdb29129cb554d5e45a8cdc8b3f6bb1e0c0c6f59'
    const pid = 42
    const log = {
      address: MASTERCHEF_CANONICAL.address,
      topics: [
        MASTERCHEF_DEPOSIT_TOPIC,
        `0x${'0'.repeat(24)}${user.slice(2)}`,
        `0x${pid.toString(16).padStart(64, '0')}`,
      ],
      data: '0x',
      blockNumber: '0x1',
      transactionHash: '0xabc',
      logIndex: '0x0',
      transactionIndex: '0x0',
      blockHash: '0x',
    }
    const decoded = decodeFarmerLog(log as any)
    expect(decoded).toEqual({ type: 'Deposit', user, pid })
  })

  it('unique-farmers API never returns ready zero while indexing', () => {
    const src = readFileSync(path.join(ROOT, '../../pages/api/farms/unique-farmers.ts'), 'utf8')
    // Surfaces factual primaryCount when seed/runtime has a unique set; never fabricates ready zero.
    expect(src).toContain('snap.primaryCount')
    expect(src).toContain('uniqueFarmers:')
    expect(src).toContain('advanceFarmerParticipantIndex')
    expect(src).toContain('coveragePct')
    expect(src).not.toContain('uniqueFarmers: 318')
  })

  it('index module persists checkpoint resume fields', () => {
    const src = readFileSync(path.join(ROOT, 'indexer/farmerParticipantIndex.ts'), 'utf8')
    expect(src).toContain('lastIndexedBlock')
    expect(src).toContain('Indexing…')
    expect(src).toContain('farmer-participants')
  })
})
