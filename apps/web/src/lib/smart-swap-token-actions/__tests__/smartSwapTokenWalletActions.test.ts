import { describe, expect, it } from 'vitest'
import { Token, ChainId } from '@pancakeswap/sdk'
import {
  buildWatchAssetPayload,
  isCanonicalWatchAssetImage,
  resolveCanonicalWatchAssetImage,
  toWatchAssetRequest,
} from 'lib/smart-swap-token-actions'
import { readFileSync } from 'node:fs'
import path from 'node:path'

const WEB = path.resolve(__dirname, '../../..')

describe('Smart Swap token wallet actions', () => {
  const marco = new Token(
    ChainId.BSC,
    '0x963556de0eb8138E97A85F0A86eE0acD159D210b',
    18,
    'MARCO',
    'Melega',
  )

  it('builds wallet_watchAsset payload with address, symbol, decimals, canonical logo', () => {
    const payload = buildWatchAssetPayload(marco)
    expect(payload).not.toBeNull()
    expect(payload!.address).toBe('0x963556de0eb8138E97A85F0A86eE0acD159D210b')
    expect(payload!.symbol).toBe('MARCO')
    expect(payload!.decimals).toBe(18)
    expect(payload!.image).toMatch(/^https:\/\/www\.melega\.finance\/images\/56\/tokens\//i)
    expect(isCanonicalWatchAssetImage(payload!.image)).toBe(true)

    const req = toWatchAssetRequest(payload!)
    expect(req.method).toBe('wallet_watchAsset')
    expect(req.params.type).toBe('ERC20')
    expect(req.params.options).toEqual({
      address: payload!.address,
      symbol: 'MARCO',
      decimals: 18,
      image: payload!.image,
    })
  })

  it('rejects native currency and non-canonical image hosts', () => {
    expect(buildWatchAssetPayload({ isNative: true } as any)).toBeNull()
    expect(isCanonicalWatchAssetImage('https://evil.example/x.png')).toBe(false)
    expect(isCanonicalWatchAssetImage('http://melega.finance/images/56/tokens/x.png')).toBe(false)
    expect(resolveCanonicalWatchAssetImage(marco)?.startsWith('https://www.melega.finance/images/')).toBe(true)
  })

  it('surfaces expose Add Token + Copy Address actions', () => {
    const actions = readFileSync(
      path.join(WEB, 'views/SmartSwapStudio/modules/SmartSwapTokenActions/SmartSwapTokenWalletActions.tsx'),
      'utf8',
    )
    expect(actions).toContain('smart-swap-add-token-metamask')
    expect(actions).toContain('smart-swap-copy-token-address')
    expect(actions).toContain('requestWatchAsset')
    expect(actions).toContain('Token address copied')

    const list = readFileSync(path.join(WEB, 'components/SearchModal/CurrencyList.tsx'), 'utf8')
    expect(list).toContain('SmartSwapTokenWalletActions')

    const header = readFileSync(path.join(WEB, 'views/Swap/components/SwapModalHeader.tsx'), 'utf8')
    expect(header).toContain('SmartSwapTokenWalletActions')

    const preview = readFileSync(
      path.join(WEB, 'views/SmartSwapStudio/modules/SmartSwapExecutionPreview/SmartSwapExecutionPreviewPanel.tsx'),
      'utf8',
    )
    expect(preview).toContain('SmartSwapTokenWalletActions')

    const panel = readFileSync(path.join(WEB, 'components/CurrencyInputPanel/index.tsx'), 'utf8')
    expect(panel).toContain('SmartSwapTokenWalletActions')

    const projects = readFileSync(path.join(WEB, 'views/Projects/components/ProjectTokenList.tsx'), 'utf8')
    expect(projects).toContain('SmartSwapTokenWalletActions')
  })

  it('does not alter swap callback / fee settlement / kerl modules', () => {
    const cb = readFileSync(path.join(WEB, 'views/Swap/SmartSwap/hooks/useSwapCallback.ts'), 'utf8')
    expect(cb).not.toContain('SmartSwapTokenWalletActions')
    expect(cb).toContain('settleGasProtocolFeeOnChain')
  })
})
