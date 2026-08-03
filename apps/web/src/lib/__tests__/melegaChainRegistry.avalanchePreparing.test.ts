/**
 * Avalanche Founder recovery — PREPARING until coherent V2 Router is supplied.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync, existsSync } from 'fs'
import path from 'path'
import {
  MELEGA_CHAIN_REGISTRY,
  getMelegaPreparingChains,
  getMelegaLiveSwitcherChainIds,
  isMelegaChainLive,
  getMelegaRouterAddress,
} from 'config/melegaChainRegistry'
import { MELEGA_VISIBLE_SWITCHER_CHAIN_IDS } from 'config/constants/supportChains'

const WEB = path.resolve(__dirname, '../../..')
const EV = path.join(WEB, 'docs/runtime/melegaswap-v2-arbitrum-avalanche-live-execution')

describe('Avalanche Founder recovery (PREPARING)', () => {
  it('Avalanche remains PREPARING — not LIVE without coherent Router', () => {
    const avax = MELEGA_CHAIN_REGISTRY.find((c) => c.chainId === 43114)!
    expect(avax.status).toBe('PREPARING')
    expect(isMelegaChainLive(43114)).toBe(false)
    expect(getMelegaRouterAddress(43114)).toBeNull()
    expect(avax.contracts.factory?.toLowerCase()).toBe(
      '0xff8ebf8edf1c533a02d066f852788773bdcd631c',
    )
    expect(avax.contracts.multicall?.toLowerCase()).toBe(
      '0xca11bde05977b3631167028862be2a173976ca11',
    )
    expect(avax.contracts.masterBuilder).toBe('0x2541DBEa199a22501D75EA141627776Bd4EefC80')
    expect(avax.contracts.vault).toBe('0x64935e2A3d8F3840445fB2DdF37FBBfc3b292EFe')
    expect(avax.nativeCurrency.symbol).toBe('AVAX')
    expect(avax.explorer).toContain('snowtrace')
  })

  it('switcher excludes Avalanche; Arbitrum stays LIVE', () => {
    expect(getMelegaPreparingChains().map((c) => c.chainId)).toEqual([43114])
    expect([...getMelegaLiveSwitcherChainIds()].sort((a, b) => a - b)).toEqual([1, 56, 137, 8453, 42161])
    expect([...MELEGA_VISIBLE_SWITCHER_CHAIN_IDS]).not.toContain(43114)
    expect(isMelegaChainLive(42161)).toBe(true)
  })

  it('Avalanche MARCO recovered and bound factually', () => {
    const tokensSrc = readFileSync(path.join(WEB, '../../packages/tokens/src/43114.ts'), 'utf8')
    expect(tokensSrc).toContain('0x8c880e839f3cacf60f11612087babd3307a33720')
    expect(tokensSrc).toContain("'MARCO'")
    expect(tokensSrc).toContain('ChainId.AVAX')
    expect(
      existsSync(
        path.join(WEB, 'public/images/43114/tokens/0x8c880e839f3cacf60f11612087babd3307a33720.png'),
      ),
    ).toBe(true)
    const list = JSON.parse(
      readFileSync(path.join(WEB, 'src/config/constants/tokenLists/pancake-default.tokenlist.json'), 'utf8'),
    )
    expect(
      list.tokens.some(
        (t: { chainId: number; address: string }) =>
          t.chainId === 43114 &&
          t.address.toLowerCase() === '0x8c880e839f3cacf60f11612087babd3307a33720',
      ),
    ).toBe(true)
  })

  it('evidence records narrow Router blocker', () => {
    const live = JSON.parse(readFileSync(path.join(EV, 'avalanche-live-proof.json'), 'utf8'))
    expect(live.blocker).toBe('AVALANCHE_ROUTER_ADDRESS_REQUIRED')
    const validation = JSON.parse(
      readFileSync(path.join(EV, 'avalanche-contract-validation.json'), 'utf8'),
    )
    expect(validation.gates.functionalV2RouterBoundToLiveFactory).toBe(false)
    expect(validation.router_label_identity.symbol).toBe('MRT')
  })
})
