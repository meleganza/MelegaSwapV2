/**
 * MELEGASWAP_V2_AVALANCHE_FIRST_MARKET_SEED_AND_SWAP_PROOF — unit gates.
 * Live Founder signatures are required for CERTIFIED; these tests prove readiness only.
 */
import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'fs'
import path from 'path'
import {
  AVAX_LIVE_SEED_FACTORY,
  AVAX_LIVE_SEED_MARCO,
  AVAX_LIVE_SEED_ROUTER,
  AVAX_LIVE_SEED_WAVAX,
  AVAX_SEED_DEFAULTS,
  avalancheLiveSeedTargets,
  decodeGetAmountsOutFinal,
  encodeFactoryGetPair,
  encodeGetAmountsOut,
  encodeSwapExactAvaxForMarco,
} from 'lib/deployment-orchestrator/founderAvalancheLiveSeed'
import {
  AVAX_CANARY_DEPLOYER,
  AVAX_CANARY_TREASURY,
  buildAvalancheCanaryFeePlan,
  encodeFactoryAllPairsLength,
} from 'lib/deployment-orchestrator/verifyAvalancheFirstMarket'
import { calculateSmartRouterGasProtocolFee } from 'lib/smart-swap-gas-protocol-fee'
import { Interface } from '@ethersproject/abi'

const WEB = path.resolve(__dirname, '../../..')
const EVIDENCE = path.join(
  WEB,
  'docs/runtime/melegaswap-v2-avalanche-first-market-seed-and-swap-proof',
)

describe('MELEGASWAP_V2_AVALANCHE_FIRST_MARKET_SEED_AND_SWAP_PROOF', () => {
  it('binds factual Avalanche Router/Factory/MARCO/WAVAX/Treasury/Deployer', () => {
    const t = avalancheLiveSeedTargets()
    expect(t.router).toBe('0x5A38b0B75C2E199fD8098710594115A35ABb6c7F')
    expect(t.factory).toBe('0xFF8EBf8edf1C533A02d066f852788773BdCD631C')
    expect(AVAX_LIVE_SEED_FACTORY).toBe(t.factory)
    expect(AVAX_LIVE_SEED_MARCO).toBe('0x8C880e839f3CAcf60F11612087BAbd3307A33720')
    expect(AVAX_LIVE_SEED_WAVAX).toBe('0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7')
    expect(AVAX_LIVE_SEED_ROUTER).toBe(t.router)
    expect(t.deployer).toBe(AVAX_CANARY_DEPLOYER)
    expect(t.treasury).toBe(AVAX_CANARY_TREASURY)
    expect(t.feeAsset).toBe('AVAX')
    expect(t.feePercent).toBe(25)
  })

  it('feeWei = floor(gasEstimate × gasPrice × 2500 / 10000) in AVAX', () => {
    const fee = buildAvalancheCanaryFeePlan({
      gasEstimateUnits: 180_000,
      gasPriceWei: 25_000_000_000,
    })
    const expected = (180_000n * 25_000_000_000n * 2500n) / 10_000n
    expect(fee.feeWei).toBe(expected.toString())
    expect(fee.feeAsset).toBe('AVAX')
    expect(fee.recipient.toLowerCase()).toBe(AVAX_CANARY_TREASURY.toLowerCase())
    expect(fee.chainId).toBe(43114)
  })

  it('seed defaults are small factual amounts (not fabricated TVL)', () => {
    expect(AVAX_SEED_DEFAULTS.liquidityAvaxWei).toBe(50_000_000_000_000_000n)
    expect(AVAX_SEED_DEFAULTS.liquidityMarcoWei).toBe(1_000_000_000_000_000_000_000n)
    expect(AVAX_SEED_DEFAULTS.swapAvaxWei).toBe(1_000_000_000_000_000n)
  })

  it('encodes factory getPair + Router swap with amountOutMin', () => {
    expect(encodeFactoryGetPair().startsWith('0xe6a43905')).toBe(true)
    expect(encodeFactoryAllPairsLength().startsWith('0x574f2ba3')).toBe(true)
    const swap = encodeSwapExactAvaxForMarco({
      avaxIn: 1n,
      to: AVAX_CANARY_DEPLOYER,
      deadline: 2_000_000_000,
      amountOutMin: 123n,
    })
    expect(swap.data.startsWith('0x7ff36ab5')).toBe(true)
    expect(swap.data.includes('000000000000000000000000000000000000000000000000000000000000007b')).toBe(
      true,
    )
  })

  it('decodes getAmountsOut final amount', () => {
    const iface = new Interface([
      'function getAmountsOut(uint256 amountIn, address[] path) view returns (uint256[] amounts)',
    ])
    const encoded = iface.encodeFunctionResult('getAmountsOut', [[10n, 42n]])
    expect(decodeGetAmountsOutFinal(encoded)).toBe(42n)
    expect(encodeGetAmountsOut(1n).startsWith('0xd06ca61f')).toBe(true)
  })

  it('canonical fee helper matches Smart Swap module', () => {
    const a = calculateSmartRouterGasProtocolFee({
      gasEstimateUnits: 100_000,
      gasPriceWei: 1_000_000_000,
      chainId: 43114,
    })
    const b = buildAvalancheCanaryFeePlan({
      gasEstimateUnits: 100_000,
      gasPriceWei: 1_000_000_000,
    })
    expect(a.feeWei).toBe(b.feeWei)
  })

  it('evidence pack exists with required artifacts', () => {
    const required = [
      'pair-creation.json',
      'liquidity-seed.json',
      'pair-state.json',
      'quote-proof.json',
      'swap-proof.json',
      'protocol-fee-proof.json',
      'treasury-receipt.json',
      'product-validation.json',
      'tests.json',
      'build.json',
      'MISSION_REPORT.md',
    ]
    for (const name of required) {
      expect(existsSync(path.join(EVIDENCE, name)), name).toBe(true)
    }
    const report = readFileSync(path.join(EVIDENCE, 'MISSION_REPORT.md'), 'utf8')
    expect(report).toMatch(
      /MELEGASWAP_V2_AVALANCHE_FIRST_MARKET_AND_SWAP_(CERTIFIED|BLOCKED)/,
    )
  })
})
