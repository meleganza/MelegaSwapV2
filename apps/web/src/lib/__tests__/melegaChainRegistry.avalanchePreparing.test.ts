/**
 * Avalanche final execution — PREPARING until coherent V2 Router is supplied.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync, existsSync } from 'fs'
import path from 'path'
import {
  MELEGA_AVAX_FACTORY,
  MELEGA_AVAX_MARCO,
  MELEGA_AVAX_MASTER_BUILDER,
  MELEGA_AVAX_VAULT,
  MELEGA_CHAIN_REGISTRY,
  getMelegaPreparingChains,
  getMelegaLiveSwitcherChainIds,
  getMelegaRouterAddress,
  isMelegaChainLive,
} from 'config/melegaChainRegistry'
import { MELEGA_VISIBLE_SWITCHER_CHAIN_IDS } from 'config/constants/supportChains'

const WEB = path.resolve(__dirname, '../../..')
const EV = path.join(WEB, 'docs/runtime/melegaswap-v2-ethereum-arbitrum-avalanche-final-execution')

describe('Avalanche final execution (PREPARING)', () => {
  it('Avalanche is PREPARING with recovered contracts; router null', () => {
    const avax = MELEGA_CHAIN_REGISTRY.find((c) => c.chainId === 43114)!
    expect(avax.status).toBe('PREPARING')
    expect(isMelegaChainLive(43114)).toBe(false)
    expect(getMelegaRouterAddress(43114)).toBeNull()
    expect(avax.contracts.factory).toBe(MELEGA_AVAX_FACTORY)
    expect(avax.contracts.masterBuilder).toBe(MELEGA_AVAX_MASTER_BUILDER)
    expect(avax.contracts.vault).toBe(MELEGA_AVAX_VAULT)
    expect(avax.nativeCurrency.symbol).toBe('AVAX')
    expect(avax.notes?.join(' ')).toMatch(/AVALANCHE_ROUTER_ADDRESS_REQUIRED/)
  })

  it('switcher excludes Avalanche; ETH+Arb remain LIVE', () => {
    expect(getMelegaPreparingChains().map((c) => c.chainId)).toEqual([43114])
    expect([...getMelegaLiveSwitcherChainIds()].sort((a, b) => a - b)).toEqual([1, 56, 137, 8453, 42161])
    expect([...MELEGA_VISIBLE_SWITCHER_CHAIN_IDS]).not.toContain(43114)
    expect(isMelegaChainLive(1)).toBe(true)
    expect(isMelegaChainLive(42161)).toBe(true)
  })

  it('Founder MARCO bound factually on Avalanche', () => {
    const tokensSrc = readFileSync(path.join(WEB, '../../packages/tokens/src/43114.ts'), 'utf8')
    expect(tokensSrc.toLowerCase()).toContain(MELEGA_AVAX_MARCO.toLowerCase())
    expect(tokensSrc).toContain("'MARCO'")
    expect(
      existsSync(
        path.join(WEB, 'public/images/43114/tokens/0x8C880e839f3CAcf60F11612087BAbd3307A33720.png'),
      ),
    ).toBe(true)
  })

  it('evidence records Router blocker — not missing Factory suite', () => {
    const proof = JSON.parse(readFileSync(path.join(EV, 'avalanche-live-proof.json'), 'utf8'))
    expect(proof.blocker).toBe('AVALANCHE_ROUTER_ADDRESS_REQUIRED')
    expect(proof.verdict).not.toBe('MELEGASWAP_V2_AVALANCHE_LIVE')
  })
})
