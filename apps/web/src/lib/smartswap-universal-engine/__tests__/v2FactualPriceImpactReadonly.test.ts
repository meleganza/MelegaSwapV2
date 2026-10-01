// Opt-in read-only validation: SMARTSWAP_READONLY_RPC=http://127.0.0.1:8547. No signing or transaction methods.
import { writeFileSync } from 'fs'
import { parseUnits } from '@ethersproject/units'
import { getAddress } from '@ethersproject/address'
import { Native, Token } from '@pancakeswap/sdk'
import { expect, it } from 'vitest'
import { Interface } from '@ethersproject/abi'
import {
  computeV2MidOutputRaw,
  createFactualV2QuoteSource,
  readV2PathReserves,
  resolveCertifiedV2Venue,
} from '../evmV2Quote'
import { createMelegaDexAdapter } from '../melegaDexAdapter'
import { createPancakeSwapVenueAdapter } from '../pancakeSwapAdapter'
import { runEvmShadowCompetition } from '../shadowCompetition'
import { buildV2UserExecutionPlan, currentRequestKeyOf, resolveSmartSwapCtaDecision } from '../v2UserExecutionPlan'
import { isProductionCutoverAllowed } from '../operatingMode'
import { buildShadowRuntimeRequest } from '../../../views/SmartSwapStudio/modules/SmartSwapExecutionPreview/useShadowRuntimePreflight'
import { buildV2ExecutionPreviewView } from '../../../views/SmartSwapStudio/modules/SmartSwapExecutionPreview/v2PreviewTruth'
import {
  pinV2Confirmation,
  resolveSmartSwapExecutionDisplay,
} from '../../../views/Swap/SmartSwap/utils/v2ExecutionDisplay'

const RPC = process.env.SMARTSWAP_READONLY_RPC
const fetchImpl = ((url: any, init: any) => {
  const { method } = JSON.parse(init.body)
  if (!['eth_call', 'eth_chainId', 'eth_blockNumber'].includes(method)) throw new Error(`Forbidden RPC: ${method}`)
  // jsdom AbortSignal is not accepted by the Node fetch transport; timeout behavior has separate unit coverage.
  return fetch(url, { ...init, signal: undefined })
}) as typeof fetch
async function rpc(method: string, params: unknown[] = []) {
  const response = await fetchImpl(RPC!, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  })
  const payload = await response.json()
  if (payload.error) throw new Error(payload.error.message)
  return payload.result
}
const USER = '0x1111111111111111111111111111111111111111'
const EXECUTOR = '0x7c07082839edd5797737640bba6af47992b9861e'
const T = {
  USDC: { a: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', d: 18 },
  BLION: { a: '0xd1ff6de8297db3839dfc3356f020d63a2e72bbd2', d: 18 },
  EYED: { a: '0xeDd9f422bC4D8E55c93a4E2fE64615f8dAb27223', d: 18 },
  MARCO: { a: '0x963556de0eb8138E97A85F0A86eE0acD159D210b', d: 18 },
}
const CASES = [
  { id: 'usdc_bnb_5', i: 'USDC', o: 'BNB', amt: '5' },
  { id: 'usdc_bnb_50', i: 'USDC', o: 'BNB', amt: '50' },
  { id: 'usdc_bnb_500', i: 'USDC', o: 'BNB', amt: '500' },
  { id: 'blion_marco_1', i: 'BLION', o: 'MARCO', amt: '1' },
  { id: 'blion_marco_1000', i: 'BLION', o: 'MARCO', amt: '1000' },
  { id: 'eyed_marco_100', i: 'EYED', o: 'MARCO', amt: '100' },
]
const raw = (amt: string, d: number) => parseUnits(amt, d).toString()

it.skipIf(!RPC)(
  'factual impact read-only validation',
  async () => {
    expect(Number(BigInt(await rpc('eth_chainId')))).toBe(56)
    const block = Number(BigInt(await rpc('eth_blockNumber')))
    const routerAbi = new Interface(['function factory() view returns (address)'])
    for (const router of ['0x10ED43C718714eb63d5aA57B78B54704E256024E', '0xc25033218D181b27D4a2944Fbb04FC055da4EAB3']) {
      const result = await rpc('eth_call', [{ to: router, data: routerAbi.encodeFunctionData('factory') }, 'latest'])
      expect(routerAbi.decodeFunctionResult('factory', result)[0].toLowerCase()).toBe(
        resolveCertifiedV2Venue(56, router)!.v2Factories![56]!.toLowerCase(),
      )
    }
    const out: any[] = []
    for (const c of CASES) {
      const inT = (T as any)[c.i]
      const outT = c.o === 'BNB' ? null : (T as any)[c.o]
      const request = buildShadowRuntimeRequest({
        chainId: 56,
        inputCurrency: { isNative: false, address: getAddress(inT.a), decimals: inT.d, symbol: c.i, chainId: 56 },
        outputCurrency: outT
          ? { isNative: false, address: getAddress(outT.a), decimals: outT.d, symbol: c.o, chainId: 56 }
          : { isNative: true, decimals: 18, symbol: 'BNB', chainId: 56 },
        inputAmountRaw: raw(c.amt, inT.d),
        exactOut: false,
        slippageBps: 50,
      }).request!
      const source = createFactualV2QuoteSource({ rpcUrlByChain: { 56: RPC! }, fetchImpl })
      const result = await runEvmShadowCompetition({
        request,
        productionQuote: null,
        adapters: [createMelegaDexAdapter(null, { quoteSource: source }), createPancakeSwapVenueAdapter(source)],
        nowIso: new Date().toISOString(),
        budget: {
          initialResponseMs: 20000,
          quoteTimeoutMs: 20000,
          staleQuoteMs: 60000,
          comparisonMs: 50,
          fallbackWaitMs: 20000,
          overallBudgetMs: 40000,
        },
      })
      const venues: any = {}
      for (const cand of [result.melega, result.pancake]) {
        if (!cand) continue
        const q = cand.quote
        const router =
          cand.venueId === 'pancakeswap'
            ? '0x10ED43C718714eb63d5aA57B78B54704E256024E'
            : '0xc25033218D181b27D4a2944Fbb04FC055da4EAB3'
        const path = q ? q.quoteId.split(':')[2].split('>') : null
        const hops = path ? await readV2PathReserves({ fetchImpl, rpc: RPC!, chainId: 56, router, path }) : null
        const mid = hops && q ? computeV2MidOutputRaw(BigInt(q.inputAmountRaw), hops) : null
        venues[cand.venueId] = {
          status: cand.status,
          error: (cand as any).error ?? null,
          router,
          factory: resolveCertifiedV2Venue(56, router)?.v2Factories?.[56],
          path,
          amountInRaw: q?.inputAmountRaw ?? null,
          getAmountsOutRaw: q?.grossOutputRaw ?? null,
          netUserOutputRaw: q?.netUserOutputRaw ?? null,
          reserves:
            hops?.map((h) => ({
              reserveIn: h.reserveIn.toString(),
              reserveOut: h.reserveOut.toString(),
              lpFeeBps: h.lpFeeBps,
            })) ?? null,
          midOutputRaw: mid?.toString() ?? null,
          priceImpactPercent: q?.priceImpactPercent ?? null,
        }
      }
      const winner = result.shadowWinner
      let previewImpact: string | null = null
      let pinnedImpact: string | null = null
      let planReason: string | null = null
      let winnerPriceImpactPercent: number | null = null
      if (winner) {
        const plan = buildV2UserExecutionPlan({
          user: USER,
          walletChainId: 56,
          request,
          requestKey: currentRequestKeyOf(request),
          shadow: { status: 'ready', requestKey: currentRequestKeyOf(request), winner, v2Available: true },
          observedAllowance: {
            chainId: 56,
            token: getAddress(inT.a),
            owner: USER,
            spender: getAddress(EXECUTOR),
            amountRaw: '0',
          },
          allowanceReadStatus: 'ok',
          nowIso: new Date().toISOString(),
          deadline: Math.floor(Date.now() / 1000) + 1200,
          bscPublicCutoverEnabled: true,
        })
        planReason = plan.reason
        winnerPriceImpactPercent = plan.winnerPriceImpactPercent ?? null
        const decision = resolveSmartSwapCtaDecision({
          planOk: plan.ok,
          cutoverAllowed: isProductionCutoverAllowed(56, true) && plan.productionCutoverAllowed,
          testOnlyExecutionGate: false,
          planReason: plan.reason,
        })
        const inC = new Token(56, getAddress(inT.a), inT.d, c.i)
        const outC = outT ? new Token(56, getAddress(outT.a), outT.d, c.o) : Native.onChain(56)
        const display = resolveSmartSwapExecutionDisplay({
          decision,
          plan,
          v2Pending: false,
          inputCurrency: inC,
          outputCurrency: outC,
        })
        const view = buildV2ExecutionPreviewView(display)
        previewImpact = view?.metrics.find((m) => m.label === 'Price impact')?.value ?? null
        pinnedImpact = (display as any).priceImpact
          ? pinV2Confirmation(plan, display as any)?.display.priceImpact?.toFixed(2) ?? null
          : null
      }
      expect(winner).not.toBeNull()
      expect(winnerPriceImpactPercent).not.toBeNull()
      expect(previewImpact).toMatch(/%/)
      expect(pinnedImpact).not.toBeNull()
      out.push({
        case: c.id,
        input: `${c.amt} ${c.i}`,
        output: c.o,
        grossInputRaw: request.inputAmountRaw,
        winnerVenue: winner?.venueId ?? null,
        netVenueInputRaw: winner?.netVenueInputRaw ?? null,
        venues,
        planReason,
        winnerPriceImpactPercent,
        previewPriceImpact: previewImpact,
        confirmPinnedPriceImpact: pinnedImpact,
      })
    }
    const report = { block, chainId: 56, realSwapExecuted: false, realApprovalExecuted: false, cases: out }
    if (process.env.SMARTSWAP_READONLY_REPORT)
      writeFileSync(process.env.SMARTSWAP_READONLY_REPORT, JSON.stringify(report, null, 2))
    console.log(
      JSON.stringify(
        out.map((c) => ({
          case: c.case,
          venue: c.winnerVenue,
          impact: c.winnerPriceImpactPercent,
          preview: c.previewPriceImpact,
        })),
      ),
    )
  },
  300000,
)
