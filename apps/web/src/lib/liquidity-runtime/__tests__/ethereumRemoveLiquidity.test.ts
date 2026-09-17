/**
 * P0 Ethereum remove-liquidity — construction only, no broadcast / approve / sign.
 */
import { describe, expect, it } from 'vitest'
import { ChainId, WNATIVE } from '@pancakeswap/sdk'
import {
  MELEGA_BNB_FACTORY,
  MELEGA_BNB_ROUTER,
  MELEGA_ETH_FACTORY,
  MELEGA_ETH_ROUTER,
} from 'config/melegaChainRegistry'
import {
  applySlippageMin,
  buildRemoveLiquidityCall,
  ETHEREUM_CHAIN_ID,
  ETHEREUM_WETH,
  resolveRemoveLiquidityCta,
  resolveRemoveLiquidityMethod,
} from '../removeLiquidityCall'

const ACCOUNT = '0xA08f3D3Ea8b268AAB9A5b4854D7800DAFa6F4513'
const ETH_MARCO = '0x5911Dc98a9E1A4FfFD802C3A57cdA6bbd26Cdb76'
const ETH_USDC = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
const ETH_MARCO_WETH_LP = '0x7f0183D7C1B0365A3580ecBdB2f0D8DB2D693c5E'
const ETH_USDC_WETH_LP = '0x15F6b6B609Cc2e3d8E4a355c76C99B3956954664'
const E18 = '1000000000000000000'
const DEADLINE = 1_800_000_000

const ethBase = {
  chainId: ETHEREUM_CHAIN_ID,
  walletChainId: ETHEREUM_CHAIN_ID,
  account: ACCOUNT,
  recipient: ACCOUNT,
  allowedSlippageBips: 50,
  deadlineUnix: DEADLINE,
  liquidityRaw: E18,
  amountARaw: '2000000000000000000',
  amountBRaw: '3000000000000000000',
  lpAllowanceRaw: E18,
}

describe('P0 Ethereum remove-liquidity construction', () => {
  it('binds verified canonical Ethereum router / factory / WETH', () => {
    expect(MELEGA_ETH_ROUTER).toBe('0xFF8EBf8edf1C533A02d066f852788773BdCD631C')
    expect(MELEGA_ETH_FACTORY).toBe('0x149EE9245E5eD52a89Ea777d19AD3A5D87873680')
    expect(ETHEREUM_WETH.toLowerCase()).toBe('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'.toLowerCase())
    expect(WNATIVE[ChainId.ETHEREUM].address.toLowerCase()).toBe(ETHEREUM_WETH.toLowerCase())
    expect(MELEGA_ETH_ROUTER).not.toBe(MELEGA_BNB_ROUTER)
    expect(MELEGA_ETH_FACTORY).not.toBe(MELEGA_BNB_FACTORY)
  })

  it('constructs Ethereum ERC20/ERC20 removeLiquidity without broadcasting', () => {
    const call = buildRemoveLiquidityCall({
      ...ethBase,
      tokenA: { address: ETH_MARCO },
      tokenB: { address: ETH_USDC },
      lpTokenAddress: ETH_MARCO_WETH_LP,
      receiveNative: false,
    })
    expect(call.status).toBe('ready')
    expect(call.method).toBe('removeLiquidity')
    expect(call.router).toBe(MELEGA_ETH_ROUTER)
    expect(call.factory).toBe(MELEGA_ETH_FACTORY)
    expect(call.spender).toBe(MELEGA_ETH_ROUTER)
    expect(call.value).toBe('0')
    expect(call.recipient).toBe(ACCOUNT)
    expect(call.deadline).toBe(String(DEADLINE))
    expect(call.args).toEqual([
      ETH_MARCO,
      ETH_USDC,
      E18,
      applySlippageMin('2000000000000000000', 50),
      applySlippageMin('3000000000000000000', 50),
      ACCOUNT,
      String(DEADLINE),
    ])
    expect(call.enableRemove).toBe(true)
    expect(JSON.stringify(call)).not.toContain('broadcast')
  })

  it('constructs Ethereum WETH/native ETH removeLiquidityETH with value 0', () => {
    const wrapped = buildRemoveLiquidityCall({
      ...ethBase,
      tokenA: { address: ETH_MARCO },
      tokenB: { address: ETHEREUM_WETH },
      lpTokenAddress: ETH_MARCO_WETH_LP,
      receiveNative: true,
    })
    expect(wrapped.status).toBe('ready')
    expect(wrapped.method).toBe('removeLiquidityETH')
    expect(wrapped.weth?.toLowerCase()).toBe(ETHEREUM_WETH.toLowerCase())
    expect(wrapped.value).toBe('0')
    expect(wrapped.args?.[0]).toBe(ETH_MARCO)
    expect(wrapped.args?.[1]).toBe(E18)
    expect(wrapped.args?.[2]).toBe(applySlippageMin('2000000000000000000', 50))
    expect(wrapped.args?.[3]).toBe(applySlippageMin('3000000000000000000', 50))
    expect(wrapped.args?.[4]).toBe(ACCOUNT)

    const native = buildRemoveLiquidityCall({
      ...ethBase,
      tokenA: { address: ETH_MARCO },
      tokenB: { address: ETHEREUM_WETH, isNative: true },
      lpTokenAddress: ETH_USDC_WETH_LP,
      receiveNative: false,
    })
    expect(native.method).toBe('removeLiquidityETH')
    expect(native.router).toBe(MELEGA_ETH_ROUTER)
  })

  it('keeps WETH/ERC20 on removeLiquidity when native output is not requested', () => {
    const call = buildRemoveLiquidityCall({
      ...ethBase,
      tokenA: { address: ETH_MARCO },
      tokenB: { address: ETHEREUM_WETH },
      lpTokenAddress: ETH_MARCO_WETH_LP,
      receiveNative: false,
    })
    expect(call.method).toBe('removeLiquidity')
    expect(call.args?.[0]).toBe(ETH_MARCO)
    expect(call.args?.[1].toLowerCase()).toBe(ETHEREUM_WETH.toLowerCase())
  })

  it('insufficient LP allowance => controlled approve requirement', () => {
    const call = buildRemoveLiquidityCall({
      ...ethBase,
      tokenA: { address: ETH_MARCO },
      tokenB: { address: ETH_USDC },
      lpTokenAddress: ETH_MARCO_WETH_LP,
      lpAllowanceRaw: '1',
    })
    expect(call.status).toBe('approval_required')
    expect(call.requireApprove).toBe(true)
    expect(call.enableRemove).toBe(false)
    expect(call.spender).toBe(MELEGA_ETH_ROUTER)
    expect(call.lpToken).toBe(ETH_MARCO_WETH_LP)
    expect(resolveRemoveLiquidityCta(call)).toEqual({
      label: 'Approve LP Token',
      disabled: false,
      enableRemove: false,
    })
  })

  it('sufficient allowance => Remove enabled', () => {
    const call = buildRemoveLiquidityCall({
      ...ethBase,
      tokenA: { address: ETH_MARCO },
      tokenB: { address: ETH_USDC },
      lpTokenAddress: ETH_MARCO_WETH_LP,
      lpAllowanceRaw: E18,
    })
    expect(call.status).toBe('ready')
    expect(call.enableRemove).toBe(true)
    expect(resolveRemoveLiquidityCta(call).label).toBe('Remove Liquidity')
    expect(resolveRemoveLiquidityCta(call).disabled).toBe(false)
  })

  it('wrong chain => switch-to-Ethereum requirement', () => {
    const call = buildRemoveLiquidityCall({
      ...ethBase,
      walletChainId: ChainId.BSC,
      tokenA: { address: ETH_MARCO },
      tokenB: { address: ETHEREUM_WETH },
      lpTokenAddress: ETH_MARCO_WETH_LP,
    })
    expect(call.status).toBe('wrong_chain')
    expect(call.requireSwitch).toBe(true)
    expect(call.requiredChainId).toBe(1)
    expect(call.requiredChainLabel).toBe('Ethereum')
    expect(call.router).toBe(MELEGA_ETH_ROUTER)
    expect(call.enableRemove).toBe(false)
    expect(resolveRemoveLiquidityCta(call).label).toBe('Switch to Ethereum')
    expect(resolveRemoveLiquidityCta(call).disabled).toBe(false)
  })

  it('slippage / min amounts / deadline / recipient are exact', () => {
    expect(applySlippageMin('10000', 50)).toBe('9950')
    const call = buildRemoveLiquidityCall({
      ...ethBase,
      tokenA: { address: ETH_MARCO },
      tokenB: { address: ETH_USDC },
      lpTokenAddress: ETH_MARCO_WETH_LP,
      allowedSlippageBips: 100,
      deadlineUnix: 1_714_000_000,
      recipient: ACCOUNT,
    })
    expect(call.amountAMin).toBe(applySlippageMin('2000000000000000000', 100))
    expect(call.amountBMin).toBe(applySlippageMin('3000000000000000000', 100))
    expect(call.deadline).toBe('1714000000')
    expect(call.recipient).toBe(ACCOUNT)
  })

  it('missing / unsupported pair stays controlled and does not throw', () => {
    expect(() =>
      buildRemoveLiquidityCall({
        ...ethBase,
        tokenA: { address: ETH_MARCO },
        tokenB: { address: undefined },
        lpTokenAddress: ETH_MARCO_WETH_LP,
      }),
    ).not.toThrow()
    const missing = buildRemoveLiquidityCall({
      ...ethBase,
      tokenA: { address: ETH_MARCO },
      tokenB: { address: 'not-an-address' },
      lpTokenAddress: ETH_MARCO_WETH_LP,
    })
    expect(missing.status).toBe('missing_pair')
    expect(missing.enableRemove).toBe(false)
    expect(resolveRemoveLiquidityCta(missing).disabled).toBe(true)

    const unsupported = buildRemoveLiquidityCall({
      ...ethBase,
      chainId: 10,
      walletChainId: 10,
      tokenA: { address: ETH_MARCO },
      tokenB: { address: ETH_USDC },
      lpTokenAddress: ETH_MARCO_WETH_LP,
    })
    expect(unsupported.status).toBe('unsupported_chain')
    expect(unsupported.enableRemove).toBe(false)
  })

  it('never uses BSC router / factory / WBNB on the Ethereum path', () => {
    const call = buildRemoveLiquidityCall({
      ...ethBase,
      tokenA: { address: ETH_MARCO },
      tokenB: { address: ETHEREUM_WETH },
      lpTokenAddress: ETH_MARCO_WETH_LP,
    })
    expect(call.router).not.toBe(MELEGA_BNB_ROUTER)
    expect(call.factory).not.toBe(MELEGA_BNB_FACTORY)
    expect(call.weth?.toLowerCase()).not.toBe(WNATIVE[ChainId.BSC].address.toLowerCase())
    expect(JSON.stringify(call.args)).not.toContain(MELEGA_BNB_ROUTER.slice(2).toLowerCase())
  })

  it('method helper matches ERC20 vs native ETH', () => {
    expect(resolveRemoveLiquidityMethod({ tokenAIsNative: false, tokenBIsNative: false })).toBe('removeLiquidity')
    expect(
      resolveRemoveLiquidityMethod({
        tokenAIsWrappedNative: true,
        receiveNative: true,
      }),
    ).toBe('removeLiquidityETH')
  })
})
