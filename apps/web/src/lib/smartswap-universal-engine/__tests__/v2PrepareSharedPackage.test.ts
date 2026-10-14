import { execFileSync } from 'child_process'
import path from 'path'
import { Interface } from '@ethersproject/abi'
import { describe, expect, it } from 'vitest'
import { MELEGA_BNB_FACTORY as registryFactory } from 'config/melegaChainRegistry'
import {
  MELEGA_BNB_FACTORY,
  MELEGA_DEX_VENUE_ID,
} from '@melega/smartswap-v2-prepare/src/melegaAddresses'
import {
  assertSealedShadowCandidate,
  prepareV2UserTransactions as prepareFromPackage,
  RAW_QUOTE_NOT_SEALED_CANDIDATE,
} from '@melega/smartswap-v2-prepare'
import { CANONICAL_EXAMPLE_ASSETS } from '../assetIdentity'
import { PANCAKE_SWAP_VENUE } from '../certifiedVenues'
import { evmNetwork } from '../domain'
import { computeFeeAmountRaw, computeNetVenueInput } from '../evaluateRevenuePolicy'
import { CANONICAL_SMARTSWAP_FEE_BENEFICIARY } from '../feeEnforcement'
import { createPancakeSwapVenueAdapter } from '../pancakeSwapAdapter'
import type { SmartSwapRequest } from '../quote'
import { runEvmShadowCompetition } from '../shadowCompetition'
import { createSyntheticQuoteSource } from '../shadowQuoteSource'
import { SMARTSWAP_REVENUE_POLICY_V1 } from '../revenuePolicy'
import {
  EXECUTOR_V2_EXECUTE_FRAGMENT,
  prepareV2UserTransactions,
} from '../v2ExecutionBinding'
import { VENUE_STRUCTURAL_FEE_BPS } from '../venueFeeSemantics'

const REPO = path.resolve(__dirname, '../../../../../..')
const NOW = '2026-08-20T00:00:05.000Z'
const GROSS = '1000000'
const USER = '0x1111111111111111111111111111111111111111'
const EXECUTOR = '0x3333333333333333333333333333333333333333'
const WBNB = '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c'
const USDC = '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d'

describe('shared SmartSwap V2 preparer', () => {
  it('keeps one fee policy, one factory, and no Pancake SDK in the package', () => {
    expect(registryFactory).toBe(MELEGA_BNB_FACTORY)
    expect(MELEGA_BNB_FACTORY).toBe('0xb7E5848e1d0CB457f2026670fCb9BbdB7e9E039C')
    expect(MELEGA_DEX_VENUE_ID).toBe('melega-dex')
    expect(VENUE_STRUCTURAL_FEE_BPS).toEqual({ 'melega-dex': 25, pancakeswap: 25, uniswap: 30 })
    expect(SMARTSWAP_REVENUE_POLICY_V1.bands.map((band) => band.feeBps)).toEqual([25, 20, 15, 10, 5])
    expect(PANCAKE_SWAP_VENUE.routers[56]).toBe('0x10ED43C718714eb63d5aA57B78B54704E256024E')
    expect(prepareV2UserTransactions).toBe(prepareFromPackage)
    execFileSync(process.execPath, ['packages/smartswap-v2-prepare/scripts/assert-closure.mjs'], {
      cwd: REPO,
    })
  })

  it('prepares only a sealed shadow candidate, with the same fee and router bytes', async () => {
    const request: SmartSwapRequest = {
      requestId: 'shared-prepare-provenance',
      network: evmNetwork(56),
      inputAsset: CANONICAL_EXAMPLE_ASSETS.wbnb,
      outputAsset: CANONICAL_EXAMPLE_ASSETS.usdcBnb,
      inputAmountRaw: GROSS,
      exactOut: false,
      slippageBps: 50,
    }
    const rawQuote = {
      sell: 'WBNB',
      buy: 'USDC',
      amountInRaw: GROSS,
      amountOutRaw: '500000',
      router: PANCAKE_SWAP_VENUE.routers[56],
      venueId: 'pancakeswap',
      path: [WBNB, USDC],
    }
    expect(() => assertSealedShadowCandidate(rawQuote)).toThrow(RAW_QUOTE_NOT_SEALED_CANDIDATE)
    expect(() =>
      prepareV2UserTransactions({
        request,
        winner: rawQuote as never,
        user: USER,
        deadline: 1_893_456_000,
        nonce: 7,
        nowIso: NOW,
        currentChainId: 56,
        executorAddress: EXECUTOR,
      }),
    ).toThrow()

    const result = await runEvmShadowCompetition({
      request,
      productionQuote: null,
      adapters: [
        createPancakeSwapVenueAdapter(
          createSyntheticQuoteSource({ [`56:${WBNB}>${USDC}`]: { amountOutRaw: '500000' } }),
        ),
      ],
      nowIso: NOW,
    })
    const winner = result.shadowWinner
    expect(winner?.venueId).toBe('pancakeswap')
    assertSealedShadowCandidate(winner)
    const fee = computeFeeAmountRaw(GROSS, 20)
    expect(winner?.sealedFee?.feeAmountRaw).toBe(fee)
    expect(winner?.netVenueInputRaw).toBe(computeNetVenueInput(GROSS, 20).netVenueInputRaw)

    const prepared = prepareV2UserTransactions({
      request,
      winner,
      user: USER,
      deadline: 1_893_456_000,
      nonce: 7,
      nowIso: NOW,
      currentChainId: 56,
      executorAddress: EXECUTOR,
      observedAllowance: {
        chainId: 56,
        token: CANONICAL_EXAMPLE_ASSETS.wbnb.location.kind === 'contract'
          ? CANONICAL_EXAMPLE_ASSETS.wbnb.location.address
          : '',
        owner: USER,
        spender: EXECUTOR,
        amountRaw: '0',
      },
    })
    expect(prepared.approvalTransactions).toHaveLength(1)
    const approve = new Interface(['function approve(address spender, uint256 amount)']).decodeFunctionData(
      'approve',
      prepared.approvalTransactions[0].data,
    )
    expect(approve.spender).toBe(EXECUTOR)
    expect(approve.amount.toString()).toBe(GROSS)
    const decoded = new Interface(EXECUTOR_V2_EXECUTE_FRAGMENT).decodeFunctionData('execute', prepared.swapTransaction.data)
    expect(decoded.intent.router).toBe(PANCAKE_SWAP_VENUE.routers[56])
    expect(decoded.intent.feeBps.toString()).toBe('20')
    expect(decoded.intent.feeAmount.toString()).toBe(fee)
    expect(decoded.intent.beneficiary).toBe(CANONICAL_SMARTSWAP_FEE_BENEFICIARY)
    expect(decoded.intent.inputAmount.toString()).toBe(GROSS)
    expect(prepared.swapTransaction.value).toBe('0x0')
    expect(prepared.productionExecutionCapable).toBe(false)
  })
})
