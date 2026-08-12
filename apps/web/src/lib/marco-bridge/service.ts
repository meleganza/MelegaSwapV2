import { BigNumber } from '@ethersproject/bignumber'
import { assertBridgePreflight, requiresMarcoApproval } from './preflight'
import { MarcoBridgeError, toMarcoBridgeError } from './errors'
import { requirePublicExecution } from './routePolicy'
import {
  buildEvmApprovalCall,
  buildEvmQuoteCall,
  buildEvmSendCall,
  buildSolanaInstructionPlan,
  decodeEvmQuoteResult,
  destinationWalletToBytes32,
} from './transactions'
import type {
  EvmTransactionRequest,
  MarcoBridgeIntent,
  MarcoBridgePreflight,
  MarcoBridgeQuote,
  MarcoBridgeSubmission,
  MarcoBridgeTracking,
  SolanaBridgeInstructionPlan,
} from './types'
import { validateMarcoBridgeIntent } from './validation'
import { getMarcoBridgeNetwork } from './wave1Registry'

export const MAX_BRIDGE_QUOTE_AGE_MS = 30_000

export function assertFreshBridgeQuote(quote: MarcoBridgeQuote, now: number): void {
  if (now - quote.quotedAt > MAX_BRIDGE_QUOTE_AGE_MS) {
    throw new MarcoBridgeError('QUOTE_STALE', 'Bridge quote expired. Review a fresh quote before signing.')
  }
}

export interface MarcoBridgeTransport {
  callEvm?(request: EvmTransactionRequest): Promise<string>
  sendEvm?(request: EvmTransactionRequest): Promise<{ transactionHash: string; guid?: string }>
  quoteSolana?(plan: Omit<SolanaBridgeInstructionPlan, 'nativeFee' | 'quoteId'>): Promise<BigNumber>
  sendSolana?(plan: SolanaBridgeInstructionPlan): Promise<MarcoBridgeSubmission>
  fetchTracking(guid: string): Promise<MarcoBridgeTracking>
}

export class MarcoBridgeService {
  private readonly transport: MarcoBridgeTransport
  private readonly now: () => number

  constructor(transport: MarcoBridgeTransport, now: () => number = Date.now) {
    this.transport = transport
    this.now = now
  }

  async quote(intent: MarcoBridgeIntent): Promise<MarcoBridgeQuote> {
    const validated = validateMarcoBridgeIntent(intent)
    requirePublicExecution(validated.route)
    const source = getMarcoBridgeNetwork(intent.from)
    const quoteId = `${intent.from}-${intent.to}-${this.now()}`
    try {
      if (source.walletFamily === 'evm') {
        if (!this.transport.callEvm)
          throw new MarcoBridgeError('TRANSPORT_NOT_BOUND', 'EVM bridge transport is not bound.')
        const encoded = buildEvmQuoteCall(intent.from, intent.to, validated.intent.destinationWallet, validated.amount)
        const result = await this.transport.callEvm(encoded)
        const fees = decodeEvmQuoteResult(result)
        return {
          intent: validated.intent,
          amount: validated.amount,
          ...fees,
          nativeFeeSymbol: source.nativeFeeSymbol,
          quotedAt: this.now(),
          quoteId,
        }
      }
      if (!this.transport.quoteSolana)
        throw new MarcoBridgeError('TRANSPORT_NOT_BOUND', 'Solana bridge transport is not bound.')
      const plan: Omit<SolanaBridgeInstructionPlan, 'nativeFee' | 'quoteId'> = {
        oftStore: source.identity.protocolContractOrStore,
        destinationEid: getMarcoBridgeNetwork(intent.to).layerZeroEid,
        destinationBytes32: destinationWalletToBytes32(intent.to, validated.intent.destinationWallet),
        amountLD: validated.amount.sendLD,
        minAmountLD: validated.amount.sendLD,
      }
      const nativeFee = await this.transport.quoteSolana(plan)
      return {
        intent: validated.intent,
        amount: validated.amount,
        nativeFee,
        lzTokenFee: BigNumber.from(0),
        nativeFeeSymbol: source.nativeFeeSymbol,
        quotedAt: this.now(),
        quoteId,
      }
    } catch (error) {
      throw toMarcoBridgeError(error, 'QUOTE_FAILED')
    }
  }

  async submit(quote: MarcoBridgeQuote, preflight: MarcoBridgePreflight): Promise<MarcoBridgeSubmission> {
    const validated = validateMarcoBridgeIntent(quote.intent)
    requirePublicExecution(validated.route)
    assertFreshBridgeQuote(quote, this.now())
    assertBridgePreflight(quote, preflight)
    const source = getMarcoBridgeNetwork(quote.intent.from)
    try {
      if (source.walletFamily === 'evm') {
        if (!this.transport.sendEvm)
          throw new MarcoBridgeError('TRANSPORT_NOT_BOUND', 'EVM bridge transport is not bound.')
        if (requiresMarcoApproval(quote, preflight)) {
          const approval = buildEvmApprovalCall(quote.intent.from, quote.amount.sendLD)
          if (approval) await this.transport.sendEvm(approval)
        }
        const receipt = await this.transport.sendEvm(buildEvmSendCall(quote))
        if (!receipt.guid) throw new MarcoBridgeError('SOURCE_FAILED', 'Source transaction returned no LayerZero GUID.')
        return { guid: receipt.guid, sourceTransactionHash: receipt.transactionHash }
      }
      if (!this.transport.sendSolana)
        throw new MarcoBridgeError('TRANSPORT_NOT_BOUND', 'Solana bridge transport is not bound.')
      return await this.transport.sendSolana(buildSolanaInstructionPlan(quote))
    } catch (error) {
      throw toMarcoBridgeError(error, 'SOURCE_FAILED')
    }
  }

  track(guid: string): Promise<MarcoBridgeTracking> {
    if (!guid.trim()) return Promise.reject(new MarcoBridgeError('SOURCE_FAILED', 'A bridge GUID is required.'))
    return this.transport.fetchTracking(guid)
  }
}

export const failClosedMarcoBridgeService = new MarcoBridgeService({
  fetchTracking: async () => {
    throw new MarcoBridgeError('TRANSPORT_NOT_BOUND', 'Bridge delivery tracker is not publicly bound.')
  },
})
