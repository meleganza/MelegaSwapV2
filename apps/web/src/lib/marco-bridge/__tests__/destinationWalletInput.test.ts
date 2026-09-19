import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { describe, expect, it } from 'vitest'
import { applyBridgeRouteSelection } from '../bridgeActionState'
import {
  DESTINATION_WALLET_TEXT_INPUT_ATTRS,
  destinationWalletInputReadOnly,
  isValidMarcoDestination,
  requiresExplicitDestination,
  resolveDisplayedMarcoDestination,
} from '../validation'

const WEB_ROOT = join(dirname(new URL(import.meta.url).pathname), '../../../..')
const workspace = readFileSync(join(WEB_ROOT, 'src/views/MarcoBridge/MarcoBridgeWorkspace.tsx'), 'utf8')
const destinationInput = readFileSync(join(WEB_ROOT, 'src/views/MarcoBridge/DestinationWalletInput.tsx'), 'utf8')
const evmSource = '0x1111111111111111111111111111111111111111'
const evmOther = '0x2222222222222222222222222222222222222222'
const solana = '6SWgjmuTyPAcYYU77Mzf1gE6QA7ZcZsbsfiThz2cW1VF'

describe('destination wallet input lock', () => {
  it('is not readOnly/disabled in an editable same-family autofill state', () => {
    const sameFamily = !requiresExplicitDestination('evm', 'evm')
    const displayed = resolveDisplayedMarcoDestination('', sameFamily, evmSource)
    expect(sameFamily).toBe(true)
    expect(displayed).toBe(evmSource)
    expect(destinationWalletInputReadOnly(false)).toBe(false)
    expect(destinationWalletInputReadOnly(true)).toBe(true)
  })

  it('never locks solely because the connected wallet is autofilled', () => {
    expect(destinationWalletInputReadOnly(false)).toBe(false)
    expect(workspace).toContain('readOnly={destinationWalletInputReadOnly(sourceLocked)}')
    expect(workspace).not.toContain('sameFamily && Boolean(sourceWallet) && !destination')
    expect(workspace).not.toMatch(/readOnly=\{sourceLocked \|\|/)
  })

  it('uses a text-capable address-safe input configuration', () => {
    expect(DESTINATION_WALLET_TEXT_INPUT_ATTRS).toMatchObject({
      type: 'text',
      inputMode: 'text',
      autoComplete: 'off',
      autoCorrect: 'off',
      autoCapitalize: 'none',
      spellCheck: false,
    })
    expect(destinationInput).toContain('DESTINATION_WALLET_TEXT_INPUT_ATTRS')
    expect(workspace).toContain('<DestinationWalletInput')
    expect(workspace).toContain('<span>Destination wallet</span>')
    expect(workspace).not.toMatch(/aria-label="Destination wallet"[\s\S]{0,400}inputMode="decimal"/)
  })
})

describe('destination value, validation, and route reset', () => {
  it('keeps the prefilled same-family wallet until the user replaces it', () => {
    const displayed = resolveDisplayedMarcoDestination('', true, evmSource)
    expect(isValidMarcoDestination(displayed, 'evm')).toBe(true)
    const edited = resolveDisplayedMarcoDestination(evmOther, true, evmSource)
    expect(edited).toBe(evmOther)
    expect(isValidMarcoDestination(edited, 'evm')).toBe(true)
  })

  it('does not autofill a cross-family destination', () => {
    const displayed = resolveDisplayedMarcoDestination('', false, evmSource)
    expect(displayed).toBe('')
    expect(isValidMarcoDestination(displayed, 'solana')).toBe(false)
    const typed = resolveDisplayedMarcoDestination(solana, false, evmSource)
    expect(typed).toBe(solana)
    expect(isValidMarcoDestination(typed, 'solana')).toBe(true)
  })

  it('clears typed destination on From/To change and re-applies family autofill rules', () => {
    const next = applyBridgeRouteSelection({
      tracking: { status: 'idle' },
      nextFrom: 'bnb',
      nextTo: 'solana',
    })
    expect(next.destination).toBe('')
    expect(requiresExplicitDestination('evm', 'solana')).toBe(true)
    expect(resolveDisplayedMarcoDestination(next.destination, false, evmSource)).toBe('')
    expect(isValidMarcoDestination('', 'solana')).toBe(false)

    const sameFamilyNext = applyBridgeRouteSelection({
      tracking: { status: 'idle' },
      nextFrom: 'bnb',
      nextTo: 'robinhood',
    })
    expect(sameFamilyNext.destination).toBe('')
    expect(resolveDisplayedMarcoDestination(sameFamilyNext.destination, true, evmSource)).toBe(evmSource)
    expect(isValidMarcoDestination(evmSource, 'evm')).toBe(true)
  })

  it('wires quote/submit to resolvedDestination without changing transaction builders', () => {
    expect(workspace).toContain('destinationWallet: resolvedDestination')
    expect(workspace).toContain('setDestination(next)')
    expect(workspace).toContain('resetQuote()')
    expect(workspace).toContain('applyBridgeRouteSelection')
    const quote = readFileSync(join(WEB_ROOT, 'src/pages/api/marco-bridge/quote.ts'), 'utf8')
    const build = readFileSync(join(WEB_ROOT, 'src/pages/api/marco-bridge/build.ts'), 'utf8')
    const builder = readFileSync(join(WEB_ROOT, 'src/lib/marco-bridge/transactionBuilder.ts'), 'utf8')
    expect(quote).toContain('destinationWallet')
    expect(build).toContain('destinationWallet')
    expect(builder).toContain('destinationWallet')
  })
})
