/**
 * BSC remove-liquidity regression — construction only, no broadcast.
 * Ethereum repair must not change BNB router / WBNB / method semantics.
 */
import { describe, expect, it } from 'vitest'
import { ChainId, WNATIVE } from '@pancakeswap/sdk'
import { MELEGA_BNB_FACTORY, MELEGA_BNB_ROUTER, MELEGA_ETH_ROUTER } from 'config/melegaChainRegistry'
import { applySlippageMin, buildRemoveLiquidityCall } from '../removeLiquidityCall'

const ACCOUNT = '0xA08f3D3Ea8b268AAB9A5b4854D7800DAFa6F4513'
const MARCO = '0x963556de0eb8138E97A85F0A86eE0acD159D210b'
const USDT = '0x55d398326f99059fF775485246999027B3197955'
const PAIR = '0x01dB17c476ad6a4c119f559eAb2d1AC9e340278E'
const WBNB = WNATIVE[ChainId.BSC].address
const E18 = '1000000000000000000'

const bscBase = {
  chainId: ChainId.BSC,
  walletChainId: ChainId.BSC,
  account: ACCOUNT,
  recipient: ACCOUNT,
  allowedSlippageBips: 50,
  deadlineUnix: 1_800_000_000,
  liquidityRaw: E18,
  amountARaw: '4000000000000000000',
  amountBRaw: '5000000000000000000',
  lpAllowanceRaw: E18,
}

describe('BSC remove-liquidity regression', () => {
  it('keeps BNB ERC20/ERC20 removal on the BNB router', () => {
    const call = buildRemoveLiquidityCall({
      ...bscBase,
      tokenA: { address: MARCO },
      tokenB: { address: USDT },
      lpTokenAddress: PAIR,
    })
    expect(call.status).toBe('ready')
    expect(call.method).toBe('removeLiquidity')
    expect(call.router).toBe(MELEGA_BNB_ROUTER)
    expect(call.factory).toBe(MELEGA_BNB_FACTORY)
    expect(call.router).not.toBe(MELEGA_ETH_ROUTER)
    expect(call.args).toEqual([
      MARCO,
      USDT,
      E18,
      applySlippageMin('4000000000000000000', 50),
      applySlippageMin('5000000000000000000', 50),
      ACCOUNT,
      '1800000000',
    ])
  })

  it('keeps BNB native removal on removeLiquidityETH + WBNB', () => {
    const call = buildRemoveLiquidityCall({
      ...bscBase,
      tokenA: { address: MARCO },
      tokenB: { address: WBNB },
      lpTokenAddress: PAIR,
      receiveNative: true,
    })
    expect(call.method).toBe('removeLiquidityETH')
    expect(call.weth?.toLowerCase()).toBe(WBNB.toLowerCase())
    expect(call.value).toBe('0')
    expect(call.router).toBe(MELEGA_BNB_ROUTER)
  })

  it('BSC insufficient allowance still requires LP approve against the BNB router', () => {
    const call = buildRemoveLiquidityCall({
      ...bscBase,
      tokenA: { address: MARCO },
      tokenB: { address: USDT },
      lpTokenAddress: PAIR,
      lpAllowanceRaw: '0',
    })
    expect(call.status).toBe('approval_required')
    expect(call.spender).toBe(MELEGA_BNB_ROUTER)
  })
})
