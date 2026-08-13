import fs from 'fs'
import path from 'path'
import { ROUTER_ADDRESS } from 'config/constants/exchange'

const WEB = path.resolve(__dirname, '../../..')
const LIVE_LIQUIDITY_CHAIN_IDS = [56, 8453, 137, 1, 42161, 43114] as const

describe('Remove Liquidity public access', () => {
  it('exposes Remove Liquidity in the single Liquidity surface', () => {
    const shell = fs.readFileSync(path.join(WEB, 'views/LiquidityStudio/v3/LiquidityStudioV3Shell.tsx'), 'utf8')

    expect(shell).toContain('data-testid="liquidity-v3-tab-remove"')
    expect(shell).toContain("setMode('Remove Liquidity', { syncUrl: false })")
    expect(shell).toContain('<LiquidityRemovePanel />')
  })

  it.each(LIVE_LIQUIDITY_CHAIN_IDS)('has a canonical router for burn execution on chain %s', (chainId) => {
    expect(ROUTER_ADDRESS[chainId]).toMatch(/^0x[a-fA-F0-9]{40}$/)
  })

  it('keeps approve, burn estimation and wallet submission in the canonical runtime', () => {
    const runtime = fs.readFileSync(
      path.join(WEB, 'views/LiquidityStudio/liquidityRuntime/useLiquidityMintRuntime.tsx'),
      'utf8',
    )

    expect(runtime).toContain('approveLiquidityCallback')
    expect(runtime).toContain("import { calculateGasMargin } from 'utils'")
    expect(runtime).not.toContain(
      "calculateGasMargin, calculateSlippageAmount, useRouterContract } from 'utils/exchange'",
    )
    expect(runtime).toContain('estimateGas.removeLiquidityETH')
    expect(runtime).toContain('estimateGas.removeLiquidity')
    expect(runtime).toContain("type: 'remove-liquidity'")
  })
})
