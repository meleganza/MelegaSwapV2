import { describe, expect, it } from 'vitest'
import { Interface } from '@ethersproject/abi'
import { id } from '@ethersproject/hash'
import {
  LB_EVENT_SIGNATURES,
  LB_EVENT_TOPICS,
  topicToLbEventName,
} from '../topics'
import { applyLbEventToPrograms, emptyProgram, parseLbLog, rebuildProgramsFromEvents } from '../parseEvents'

const FACTORY = '0xB9f3e3020141157C215902acC1fDF65e49bE4e82'
const OWNER = '0xB6eEb3ab9695979F5b2Ef6Df4112e63212E33EE0'
const PROGRAM = '0xA15aDa28A9b7d4d9f6Ac781407bAf1A2CFB802EB'
const TOKEN = '0x963556de0eb8138E97A85F0A86eE0acD159D210b'
const WBNB = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'
const PAIR = '0x7286c16c3c05d4c17B689bE7948Ec4Fa4e861d1E'

describe('LB event topics', () => {
  it('topic0 matches keccak of canonical signatures', () => {
    expect(LB_EVENT_TOPICS.ProgramCreated).toBe(id(LB_EVENT_SIGNATURES.ProgramCreated))
    expect(LB_EVENT_TOPICS.ProgramActivated).toBe(id(LB_EVENT_SIGNATURES.ProgramActivated))
    expect(LB_EVENT_TOPICS.ProgramPaused).toBe(id(LB_EVENT_SIGNATURES.ProgramPaused))
    expect(LB_EVENT_TOPICS.ProgramStopped).toBe(id(LB_EVENT_SIGNATURES.ProgramStopped))
    expect(LB_EVENT_TOPICS.ExecutionCompleted).toBe(id(LB_EVENT_SIGNATURES.ExecutionCompleted))
    expect(LB_EVENT_TOPICS.LiquidityBuildingFeeSettled).toBe(
      id(LB_EVENT_SIGNATURES.LiquidityBuildingFeeSettled),
    )
    expect(topicToLbEventName(LB_EVENT_TOPICS.ProgramCreated)).toBe('ProgramCreated')
  })
})

const CREATED_IFACE = new Interface([
  'event ProgramCreated(bytes32 indexed programId, address indexed owner, address indexed program, address projectToken, address quoteAsset, address pair, uint64 generation, bytes32 factoryVersion)',
])

describe('LB event parsing', () => {
  it('parses ProgramCreated into owner inventory fields', () => {
    const programId = '0x' + '11'.repeat(32)
    const factoryVersion = '0x' + '22'.repeat(32)
    const encoded = CREATED_IFACE.encodeEventLog(CREATED_IFACE.getEvent('ProgramCreated'), [
      programId,
      OWNER,
      PROGRAM,
      TOKEN,
      WBNB,
      PAIR,
      1,
      factoryVersion,
    ])

    const ev = parseLbLog({
      address: FACTORY,
      topics: encoded.topics,
      data: encoded.data,
      transactionHash: '0xabc',
      logIndex: 0,
      blockNumber: 100,
      blockTimestamp: 1_700_000_000,
    })

    expect(ev).not.toBeNull()
    expect(ev!.eventType).toBe('ProgramCreated')
    expect(ev!.owner?.toLowerCase()).toBe(OWNER.toLowerCase())
    expect(ev!.programAddress?.toLowerCase()).toBe(PROGRAM.toLowerCase())
    expect(ev!.raw.projectToken).toBe(TOKEN.toLowerCase())
    expect(ev!.raw.quoteAsset).toBe(WBNB.toLowerCase())
    expect(ev!.raw.pair).toBe(PAIR.toLowerCase())
  })

  it('applies lifecycle transitions activate → pause → stop', () => {
    const created = parseLbLog({
      address: FACTORY,
      ...(() => {
        const encoded = CREATED_IFACE.encodeEventLog(CREATED_IFACE.getEvent('ProgramCreated'), [
          '0x' + '11'.repeat(32),
          OWNER,
          PROGRAM,
          TOKEN,
          WBNB,
          PAIR,
          1,
          '0x' + '22'.repeat(32),
        ])
        return { topics: encoded.topics, data: encoded.data }
      })(),
      transactionHash: '0x1',
      logIndex: 0,
      blockNumber: 1,
      blockTimestamp: 10,
    })!

    const progIface = new Interface([
      'event ProgramActivated(bytes32 indexed programId, uint64 configNonce)',
      'event ProgramPaused(bytes32 indexed programId, uint64 configNonce)',
      'event ProgramStopped(bytes32 indexed programId, uint64 configNonce)',
      'event BudgetDeposited(bytes32 indexed programId, uint256 amount, uint256 totalDeposited, uint64 configNonce)',
    ])

    const deposit = parseLbLog({
      address: PROGRAM,
      ...(() => {
        const encoded = progIface.encodeEventLog(progIface.getEvent('BudgetDeposited'), [
          '0x' + '11'.repeat(32),
          '1000000000000000000',
          '1000000000000000000',
          1,
        ])
        return { topics: encoded.topics, data: encoded.data }
      })(),
      transactionHash: '0x2',
      logIndex: 0,
      blockNumber: 2,
      blockTimestamp: 20,
    })!

    const activated = parseLbLog({
      address: PROGRAM,
      ...(() => {
        const encoded = progIface.encodeEventLog(progIface.getEvent('ProgramActivated'), [
          '0x' + '11'.repeat(32),
          1,
        ])
        return { topics: encoded.topics, data: encoded.data }
      })(),
      transactionHash: '0x3',
      logIndex: 0,
      blockNumber: 3,
      blockTimestamp: 30,
    })!

    const paused = parseLbLog({
      address: PROGRAM,
      ...(() => {
        const encoded = progIface.encodeEventLog(progIface.getEvent('ProgramPaused'), [
          '0x' + '11'.repeat(32),
          2,
        ])
        return { topics: encoded.topics, data: encoded.data }
      })(),
      transactionHash: '0x4',
      logIndex: 0,
      blockNumber: 4,
      blockTimestamp: 40,
    })!

    const stopped = parseLbLog({
      address: PROGRAM,
      ...(() => {
        const encoded = progIface.encodeEventLog(progIface.getEvent('ProgramStopped'), [
          '0x' + '11'.repeat(32),
          3,
        ])
        return { topics: encoded.topics, data: encoded.data }
      })(),
      transactionHash: '0x5',
      logIndex: 0,
      blockNumber: 5,
      blockTimestamp: 50,
    })!

    const programs = rebuildProgramsFromEvents([created, deposit, activated, paused, stopped])
    expect(programs).toHaveLength(1)
    expect(programs[0].status).toBe('Stopped')
    expect(programs[0].reserveWei).toBe('1000000000000000000')
    expect(programs[0].activatedAt).toBe(30)
    expect(programs[0].stoppedAt).toBe(50)
  })

  it('tracks execution count and fee paid', () => {
    const map = new Map([[PROGRAM.toLowerCase(), emptyProgram({ programAddress: PROGRAM, owner: OWNER })]])
    const iface = new Interface([
      'event ExecutionCompleted(bytes32 indexed executionId, uint256 indexed epochId, address indexed relayer, uint256 executionNonce, uint256 effectiveStrategyRateBps, uint256 eligibleNetBuyFlow, uint256 projectTokenSold, uint256 grossQuoteAcquired, uint256 melegaFeePaid, uint256 projectTokenMatched, uint256 quoteAssetAdded, uint256 quoteResidualAfter, uint256 lpMinted, address lpRecipient, bytes32 settlementReceipt)',
    ])
    const encoded = iface.encodeEventLog(iface.getEvent('ExecutionCompleted'), [
      '0x' + 'aa'.repeat(32),
      1,
      OWNER,
      1,
      100,
      0,
      10,
      20,
      5,
      10,
      20,
      0,
      1,
      OWNER,
      '0x' + 'bb'.repeat(32),
    ])
    const ev = parseLbLog({
      address: PROGRAM,
      topics: encoded.topics,
      data: encoded.data,
      transactionHash: '0xexec',
      logIndex: 0,
      blockNumber: 9,
      blockTimestamp: 90,
    })!
    expect(ev.eventType).toBe('ExecutionCompleted')
    expect(ev.raw.melegaFeePaid).toBe('5')
    applyLbEventToPrograms(map, ev)
    expect(map.get(PROGRAM.toLowerCase())!.executionCount).toBe(1)
    expect(map.get(PROGRAM.toLowerCase())!.totalFeePaidWei).toBe('5')
  })
})
