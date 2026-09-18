import { existsSync, readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it, vi } from 'vitest'
import { render } from '@testing-library/react'
import { ARC_CHAIN_ID } from 'lib/marco-bridge/arcChain'
import { ROBINHOOD_CHAIN_ID } from 'lib/marco-bridge/robinhoodChain'
import { ChainLogo, resolveChainLogoSrc } from '../ChainLogo'

vi.mock('next/image', () => ({
  default: ({ alt, src, width, height }: { alt: string; src: string; width: number; height: number }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} src={src} width={width} height={height} />
  ),
}))

const WEB = path.resolve(__dirname, '../../..')
const CHAINS = path.join(WEB, '../public/images/chains')
const HELP_ICON_PATH = 'M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22'

const EXISTING_LOGO_SRC: Record<number, string> = {
  1: '/images/chains/1.png',
  56: '/images/chains/56.png',
  97: '/images/chains/56.png',
  137: '/images/chains/137.png',
  8453: '/images/chains/8453-1.png',
  43114: '/images/chains/43114.png',
  42161: '/images/chains/42161-1.png',
  10: '/images/chains/10-1.png',
  324: '/images/chains/324-1.png',
}

function pngAt(chainId: number) {
  return path.join(CHAINS, `${chainId}.png`)
}

describe('ChainLogo Robinhood + Arc resolution', () => {
  it('resolves official logo files for Robinhood 4663 and Arc 5042', () => {
    expect(ROBINHOOD_CHAIN_ID).toBe(4663)
    expect(ARC_CHAIN_ID).toBe(5042)
    expect(resolveChainLogoSrc(4663)).toBe('/images/chains/4663.png')
    expect(resolveChainLogoSrc(5042)).toBe('/images/chains/5042.png')
    expect(existsSync(pngAt(4663))).toBe(true)
    expect(existsSync(pngAt(5042))).toBe(true)
    const robinhood = readFileSync(pngAt(4663))
    const arc = readFileSync(pngAt(5042))
    expect(robinhood.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))).toBe(true)
    expect(arc.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))).toBe(true)
    expect(robinhood.equals(arc)).toBe(false)
  })

  it('keeps existing chain logo paths unchanged', () => {
    for (const [chainId, src] of Object.entries(EXISTING_LOGO_SRC)) {
      expect(resolveChainLogoSrc(Number(chainId))).toBe(src)
    }
    expect(resolveChainLogoSrc(999999)).toBeNull()
  })

  it('renders real logos for 4663 and 5042 instead of HelpIcon', () => {
    const robinhood = render(<ChainLogo chainId={4663} width={22} height={22} />)
    const robinhoodImg = robinhood.container.querySelector('img[alt="chain-4663"]') as HTMLImageElement | null
    expect(robinhoodImg).toBeTruthy()
    expect(robinhoodImg?.getAttribute('src')).toBe('/images/chains/4663.png')
    expect(robinhood.container.innerHTML).not.toContain(HELP_ICON_PATH)

    const arc = render(<ChainLogo chainId={5042} width={22} height={22} />)
    const arcImg = arc.container.querySelector('img[alt="chain-5042"]') as HTMLImageElement | null
    expect(arcImg).toBeTruthy()
    expect(arcImg?.getAttribute('src')).toBe('/images/chains/5042.png')
    expect(arc.container.innerHTML).not.toContain(HELP_ICON_PATH)

    const bnb = render(<ChainLogo chainId={56} width={22} height={22} />)
    expect((bnb.container.querySelector('img[alt="chain-56"]') as HTMLImageElement).getAttribute('src')).toBe(
      '/images/chains/56.png',
    )

    const unknown = render(<ChainLogo chainId={999999} width={22} height={22} />)
    expect(unknown.container.querySelector('img')).toBeNull()
    expect(unknown.container.innerHTML).toContain(HELP_ICON_PATH)
  })

  it('NetworkSwitchModal still passes 4663/5042 to ChainLogo and opens /bridge without switchNetwork', () => {
    const modal = readFileSync(path.join(WEB, 'components/Menu/UserMenu/NetworkSwitchModal.tsx'), 'utf8')
    expect(modal).toContain('<ChainLogo chainId={chainIdValue} width={22} height={22} />')
    expect(modal).toContain('onClick={openMarcoBridge}')
    const openBridge = modal.slice(modal.indexOf('const openMarcoBridge'), modal.indexOf('return ('))
    expect(openBridge).toContain('router.push(MARCO_BRIDGE_PUBLIC_PATH)')
    expect(openBridge).not.toContain('switchNetwork')
    expect(openBridge).not.toContain('safePick')
  })
})
