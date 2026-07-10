import { TradeType } from '@pancakeswap/sdk'
import { describe, expect, it } from 'vitest'
import { assertDexConsumesExecutionRequestOnly } from '../consumer'
import { buildKrmpAuthorityMatrix, isKerlRoutingAuthorityEnforced, isKrmpAuthorityCompliant } from '../authority'
import { produceKerlExecutionRequest } from '../producer'
import { buildKerlSettlementReceipt } from '../settlement'
import { buildKerlConstitutionalSwapHandoffContext } from '../tradeFacade'
import { EXECUTION_REQUEST_SCHEMA, KERL_SETTLEMENT_RECEIPT_SCHEMA } from '../types'
import { KRMP_TESTNET_REGISTRY } from '../registry'

describe('kerl-constitutional R754', () => {
  it('enforces KERL routing authority on chain 97 only', () => {
    expect(isKerlRoutingAuthorityEnforced(97)).toBe(true)
    expect(isKerlRoutingAuthorityEnforced(56)).toBe(false)
  })

  it('KERL produces ExecutionRequest for certified BUY_MARCO route', () => {
    const result = produceKerlExecutionRequest({
      chainId: 97,
      inputAddress: null,
      outputAddress: KRMP_TESTNET_REGISTRY.marco,
      inputIsNative: true,
      amountRaw: '10000000000000000',
      slippageBps: 50,
      recipient: null,
      tradeType: TradeType.EXACT_INPUT,
    })

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.request.schema).toBe(EXECUTION_REQUEST_SCHEMA)
    expect(result.request.authority).toBe('kerl')
    expect(result.request.wrapperAddress).toBe(KRMP_TESTNET_REGISTRY.wrapperAddress)
    expect(result.request.path).toHaveLength(2)
    expect(assertDexConsumesExecutionRequestOnly(result.request).ok).toBe(true)
  })

  it('rejects uncertified token pairs', () => {
    const result = produceKerlExecutionRequest({
      chainId: 97,
      inputAddress: KRMP_TESTNET_REGISTRY.usdt,
      outputAddress: KRMP_TESTNET_REGISTRY.marco,
      inputIsNative: false,
      amountRaw: '1000000',
      slippageBps: 50,
      recipient: null,
    })

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.code).toBe('KERL_ROUTE_NOT_CERTIFIED')
  })

  it('builds KERL Settlement Receipt from constitutional handoff', () => {
    const produced = produceKerlExecutionRequest({
      chainId: 97,
      inputAddress: null,
      outputAddress: KRMP_TESTNET_REGISTRY.marco,
      inputIsNative: true,
      amountRaw: '10000000000000000',
      slippageBps: 50,
      recipient: null,
    })
    expect(produced.ok).toBe(true)
    if (!produced.ok) return

    const context = buildKerlConstitutionalSwapHandoffContext(produced.request, {
      isNative: true,
      symbol: 'BNB',
      decimals: 18,
      chainId: 97,
      wrapped: { address: KRMP_TESTNET_REGISTRY.wbnb },
    } as never)

    const executionReceipt = {
      schema: 'melega.dex-execution-receipt.v1' as const,
      transactionHash: '0xabc',
      wallet: '0xuser',
      chain: 97,
      timestamp: new Date().toISOString(),
      status: 'confirmed' as const,
      asset: context.asset,
      amount: context.amount,
      fee: context.fee,
      operation: 'swap' as const,
      explorerUrl: 'https://testnet.bscscan.com/tx/0xabc',
      originModule: 'trade' as const,
    }

    const kerlReceipt = buildKerlSettlementReceipt({ executionReceipt, context })
    expect(kerlReceipt).not.toBeNull()
    expect(kerlReceipt?.schema).toBe(KERL_SETTLEMENT_RECEIPT_SCHEMA)
    expect(kerlReceipt?.authority).toBe('kerl')
    expect(kerlReceipt?.executionRequestRef).toBe(produced.request.requestId)
  })

  it('authority matrix is compliant on chain 97', () => {
    expect(isKrmpAuthorityCompliant(97)).toBe(true)
    const matrix = buildKrmpAuthorityMatrix(97)
    expect(matrix.every((row) => row.compliant)).toBe(true)
  })
})
