import fs from 'node:fs'
import path from 'node:path'
import { ChainId } from '@pancakeswap/sdk'
import { getPoolsConfigForChain } from 'config/constants/pools'

const WEB = path.resolve(__dirname, '../../../..')

describe('wallet position visibility regression', () => {
  const liveChains = [ChainId.BSC, ChainId.BASE, ChainId.POLYGON, ChainId.ETHEREUM, ChainId.ARBITRUM, ChainId.AVAX]

  it('binds wallet LP discovery to the canonical factory on every LIVE chain', () => {
    const api = fs.readFileSync(path.join(WEB, 'src/pages/api/indexer/liquidity-positions.ts'), 'utf8')
    for (const chainId of liveChains) {
      expect(api).toContain(`${chainId}:`)
    }
    expect(api).toContain("isMelegaCapabilityEnabled(chainId, 'swap')")
    expect(api).toContain('chain.contracts.factory')
    expect(api).toContain('chain.contracts.multicall')
  })

  it('does not fall back to BNB staking-pool contracts on another chain', () => {
    expect(getPoolsConfigForChain(42161)).toEqual([])
    expect(getPoolsConfigForChain(43114)).toEqual([])
    expect(getPoolsConfigForChain(10)).toEqual([])
    expect(getPoolsConfigForChain(56).length).toBeGreaterThan(0)
  })

  it('enables farm wallet reads for every LIVE chain, including Arbitrum and Avalanche', () => {
    const source = fs.readFileSync(path.resolve(WEB, '../../packages/farms/src/index.ts'), 'utf8')
    expect(source).toContain('ChainId.ARBITRUM')
    expect(source).toContain('ChainId.AVAX')
    expect(source).toContain('!supportedChainId.includes(chainId)')
  })

  it('keeps pid-0 ownership in My Farms while leaving Explore presentation unchanged', () => {
    const source = fs.readFileSync(
      path.join(WEB, 'src/views/FarmsStudio/farmsRuntime/useFarmsStakingRuntime.ts'),
      'utf8',
    )
    expect(source).toContain('portfolioPreviewCards.filter')
    expect(source).toContain('portfolioFarms: portfolioPreviewCards')
    expect(source).not.toContain('farmsLP.filter((farm) => farm.pid !== 0')
  })

  it('uses real indexed LP addresses and hydrated reserves instead of SDK-only addresses', () => {
    const hook = fs.readFileSync(
      path.join(WEB, 'src/views/LiquidityStudio/liquidityRuntime/useLiquidityPositions.ts'),
      'utf8',
    )
    const api = fs.readFileSync(path.join(WEB, 'src/pages/api/indexer/liquidity-positions.ts'), 'utf8')
    expect(hook).toContain('factoryPairEntries')
    expect(hook).toContain('factoryPairsByAddress')
    expect(api).toContain("pairContract.encodeFunctionData('getReserves')")
    expect(api).toContain("pairContract.encodeFunctionData('totalSupply')")
    expect(api).toContain('reserve0Raw')
    expect(api).toContain('totalSupplyRaw')
    expect(api).toContain('chainId,')
  })

  it('derives remove approval and outputs from the exact wallet-owned position', () => {
    const runtime = fs.readFileSync(
      path.join(WEB, 'src/views/LiquidityStudio/liquidityRuntime/useLiquidityMintRuntime.tsx'),
      'utf8',
    )
    expect(runtime).toContain('computeProRataAmountRaw')
    expect(runtime).toContain('[BurnField.LIQUIDITY]: multiplyByPercent(selectedPosition.lpBalance)')
    expect(runtime).toContain('[BurnField.CURRENCY_A]: multiplyByPercent(positionDetails.token0Deposited)')
    expect(runtime).toContain('removeParsedAmounts[BurnField.LIQUIDITY]')
    expect(runtime).toContain("return 'Checking LP approval…'")
    expect(runtime).toContain('unknownAllowanceTimeoutMs: 5_000')
    expect(runtime).toContain('pendingAllowancePollMs: 2_500')
    expect(runtime).toContain('pendingApprovalTimeoutMs: 30_000')
  })

  it('never leaves LP approval dependent only on the legacy multicall feed', () => {
    const allowance = fs.readFileSync(path.join(WEB, 'src/hooks/useTokenAllowance.ts'), 'utf8')
    const approval = fs.readFileSync(path.join(WEB, 'src/hooks/useApproveCallback.ts'), 'utf8')
    expect(allowance).toContain('contract')
    expect(allowance).toContain('.allowance(owner, spender)')
    expect(allowance).toContain('window.setInterval(readDirectAllowance, options.pollIntervalMs)')
    expect(allowance).toContain('directAllowance?.key === allowanceRequestKey')
    expect(approval).toContain('unknownAllowanceTimedOut')
    expect(approval).toContain('effectivePendingApproval')
    expect(approval).toContain('setPendingApprovalCycle((cycle) => cycle + 1)')
  })
})
