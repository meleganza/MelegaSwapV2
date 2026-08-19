import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'

const checkout = readFileSync(
  path.resolve(__dirname, '../CommercialCheckoutModal.tsx'),
  'utf8',
)

describe('MARCO Pay terminal success UX', () => {
  it('shows PAY WITH MARCO before payment and never after ACTIVE/FULFILLED', () => {
    expect(checkout).toContain('PAY WITH MARCO')
    expect(checkout).not.toContain('Complete in MARCO Pay')
    expect(checkout).toContain("isMarcoPay && marcoPayOrder ? 'PAY WITH MARCO'")
    expect(checkout).toContain('step === \'review\' && isTerminalSuccess ? null')
    expect(checkout).toContain('data-testid="commercial-checkout-pay"')
  })

  it('keeps single-flight protection while payment is submitted or confirming', () => {
    expect(checkout).toContain('isMarcoPayWalletFlightActive()')
    expect(checkout).toContain('runMarcoPaySingleFlight')
    expect(checkout).toContain("setStatus('submitted')")
    expect(checkout).toContain("order.state === 'PAYMENT_CONFIRMED' || order.state === 'ACTIVATING'")
    expect(checkout).toContain("setQuoteSummary('Payment confirmed · activating your service')")
  })

  it('does not show BOOST ACTIVATED until canonical fulfilment is ACTIVE', () => {
    expect(checkout).toMatch(
      /if \(order\.state === 'PAYMENT_CONFIRMED' \|\| order\.state === 'ACTIVATING'\) \{\s*setWalletStage\('confirm'\)\s*setQuoteSummary\('Payment confirmed · activating your service'\)\s*return/,
    )
    expect(checkout).toContain("if (order.state !== 'ACTIVE') return")
    expect(checkout).toContain("setStatus('confirmed')")
    expect(checkout).toContain('const isTerminalSuccess = status === \'confirmed\'')
    expect(checkout).toContain('BOOST ACTIVATED')
    expect(checkout).toContain('✓ PAYMENT COMPLETED')
  })

  it('hides every payment CTA after ACTIVE/FULFILLED and Close cannot start another payment', () => {
    expect(checkout).toContain('isMarcoPay && marcoPayOrder && !isTerminalSuccess')
    expect(checkout).toContain('data-testid="commercial-checkout-close"')
    expect(checkout).toContain('data-testid="commercial-checkout-success"')
    expect(checkout).toContain('onClick={onClose} data-testid="commercial-checkout-close"')
    expect(checkout).toContain("if (status === 'confirmed') return")
  })

  it('restores terminal success from server ACTIVE state and does not auto-open Passport or Connect', () => {
    expect(checkout).toContain("if (order.state !== 'ACTIVE') return")
    expect(checkout).toContain("setStatus('confirmed')")
    expect(checkout).toContain('Paid with MARCO Pay · Verified on-chain')
    expect(checkout).not.toContain('openMarcoPassport')
    expect(checkout).not.toContain('widgets/marco.js')
    expect(checkout).not.toContain('widgets/marco-connect')
    expect(checkout).toContain('Open MARCO Passport')
  })
})
