import { Interface } from '@ethersproject/abi'
import { parseUnits } from '@ethersproject/units'
import { expect, it } from 'vitest'
import {
  computeV2MidOutputRaw,
  computeV2PriceImpactPercent,
  diagnoseV2PathReserves,
  resolveCertifiedV2Venue,
} from '../evmV2Quote'

const RPC = process.env.SMARTSWAP_READONLY_RPC
const ROUTER = new Interface(['function factory() view returns (address)', 'function getAmountsOut(uint256,address[]) view returns (uint256[])'])
const fetchImpl = ((url: string, init: RequestInit) => fetch(url, { ...init, signal: undefined })) as typeof fetch
const WBNB = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'
const USDC = '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d'
const BLION = '0xd1ff6de8297db3839dfc3356f020d63a2e72bbd2'
const EYED = '0xeDd9f422bC4D8E55c93a4E2fE64615f8dAb27223'
const MARCO = '0x963556de0eb8138E97A85F0A86eE0acD159D210b'
const PANCAKE = '0x10ED43C718714eb63d5aA57B78B54704E256024E'
const MELEGA = '0xc25033218D181b27D4a2944Fbb04FC055da4EAB3'

async function ethCall(to: string, data: string): Promise<string> {
  const response = await fetchImpl(RPC!, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_call', params: [{ to, data }, 'latest'] }),
  })
  const payload = await response.json()
  if (!response.ok || payload.error || typeof payload.result !== 'string') throw new Error(payload.error?.message || 'RPC_RESPONSE_MALFORMED')
  return payload.result
}

it.skipIf(!RPC)('records exact live V2 reserve truth for both BSC venues', async () => {
  const cases = [
    { id: 'pancake-usdc-wbnb', router: PANCAKE, path: [USDC, WBNB], amountIn: parseUnits('5', 18).toString() },
    { id: 'pancake-blion-wbnb-marco', router: PANCAKE, path: [BLION, WBNB, MARCO], amountIn: parseUnits('1', 18).toString() },
    { id: 'pancake-eyed-wbnb-marco', router: PANCAKE, path: [EYED, WBNB, MARCO], amountIn: parseUnits('1', 18).toString() },
    { id: 'melega-usdc-wbnb', router: MELEGA, path: [USDC, WBNB], amountIn: parseUnits('5', 18).toString() },
    { id: 'melega-blion-wbnb-marco', router: MELEGA, path: [BLION, WBNB, MARCO], amountIn: parseUnits('1', 18).toString() },
    { id: 'melega-eyed-wbnb-marco', router: MELEGA, path: [EYED, WBNB, MARCO], amountIn: parseUnits('1', 18).toString() },
  ]
  const report = []
  for (const current of cases) {
    const venue = resolveCertifiedV2Venue(56, current.router)!
    const factoryResult = await ethCall(current.router, ROUTER.encodeFunctionData('factory'))
    const routerFactory = (ROUTER.decodeFunctionResult('factory', factoryResult)[0] as string).toLowerCase()
    expect(routerFactory).toBe(venue.v2Factories![56]!.toLowerCase())
    const diagnostics = await diagnoseV2PathReserves({ fetchImpl, rpc: RPC!, chainId: 56, router: current.router, path: current.path })
    let amountOutRaw: string | null = null
    let midOutputRaw: string | null = null
    let priceImpactPercent: number | null = null
    let quoteFailure: string | null = null
    try {
      const raw = await ethCall(current.router, ROUTER.encodeFunctionData('getAmountsOut', [current.amountIn, current.path]))
      const amounts = ROUTER.decodeFunctionResult('getAmountsOut', raw)[0] as Array<{ toString(): string }>
      amountOutRaw = amounts[amounts.length - 1].toString()
      if (!diagnostics.failureCode) {
        const hops = diagnostics.hops.map((hop) => ({
          reserveIn: BigInt(hop.reserveIn!),
          reserveOut: BigInt(hop.reserveOut!),
          lpFeeBps: venue.v2LpFeeBps,
        }))
        midOutputRaw = computeV2MidOutputRaw(BigInt(current.amountIn), hops)?.toString() ?? null
        priceImpactPercent = computeV2PriceImpactPercent({
          amountInRaw: BigInt(current.amountIn),
          amountOutRaw: BigInt(amountOutRaw),
          hops,
        })
      }
    } catch (error) {
      quoteFailure = error instanceof Error ? error.message : String(error)
    }
    report.push({ ...current, venue: venue.venueId, factory: routerFactory, diagnostics, amountOutRaw, midOutputRaw, priceImpactPercent, quoteFailure })
  }
  console.log(`V2_LIVE_DIAGNOSTICS=${JSON.stringify(report)}`)
  expect(report.some((row) => row.venue === 'pancakeswap' && row.priceImpactPercent != null)).toBe(true)
  expect(report.some((row) => row.venue === 'melega-dex' && row.priceImpactPercent != null)).toBe(true)
  expect(report.some((row) => row.diagnostics.hops.length === 2 && row.priceImpactPercent != null)).toBe(true)
}, 300_000)
