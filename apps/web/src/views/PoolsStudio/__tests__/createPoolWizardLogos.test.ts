import { existsSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { TOKEN_OPTIONS } from '../components/createPoolWizardState'
import { resolveCreatePoolWizardToken } from '../components/resolveCreatePoolWizardToken'
import { MARCO_BSC_ADDRESS, MARCO_LOGO_URI } from 'design-system/melega/constants/brand'
import { resolveTokenLogoSources } from 'lib/token-logo/resolveTokenLogoSources'
import { localBscTokenLogoPath } from 'lib/token-logo/localTokenLogoPath'

const PUBLIC = path.resolve(__dirname, '../../../../public')

const EXPECTED: Record<string, string> = {
  MARCO: MARCO_BSC_ADDRESS,
  BNB: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
  USDT: '0x55d398326f99059fF775485246999027B3197955',
  CAKE: '0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82',
  ETH: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
}

describe('Create Pool wizard canonical logos', () => {
  it.each(TOKEN_OPTIONS)('resolves %s through the canonical registry/token list, not a letter-only meta map', (symbol) => {
    const meta = resolveCreatePoolWizardToken(symbol)
    expect(meta).toBeTruthy()
    expect(meta!.address.toLowerCase()).toBe(EXPECTED[symbol].toLowerCase())
    expect(meta!.chainId).toBe(56)
    const sources = resolveTokenLogoSources({
      symbol,
      address: meta!.address,
      chainId: meta!.chainId,
      logoURI: meta!.logoURI,
    })
    expect(sources.length).toBeGreaterThan(0)
    if (symbol === 'MARCO') expect(sources[0]).toBe(MARCO_LOGO_URI)
    if (symbol === 'CAKE') expect(meta!.address.toLowerCase()).not.toBe(MARCO_BSC_ADDRESS.toLowerCase())
  })

  it('has local BSC logo files for the wizard tokens that use address paths', () => {
    for (const symbol of TOKEN_OPTIONS) {
      const meta = resolveCreatePoolWizardToken(symbol)!
      const local = localBscTokenLogoPath(meta.address)
      if (!local) continue
      expect(existsSync(path.join(PUBLIC, local))).toBe(true)
    }
  })
})
