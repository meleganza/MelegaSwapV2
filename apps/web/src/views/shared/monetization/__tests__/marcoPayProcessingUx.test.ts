import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'

const checkout = readFileSync(
  path.resolve(__dirname, '../CommercialCheckoutModal.tsx'),
  'utf8',
)

describe('MARCO Pay intermediate processing UX', () => {
  it('maps tx submitted and canonical pending states to a non-interactive processing UI', () => {
    expect(checkout).toContain("status === 'submitted' ||")
    expect(checkout).toContain("status === 'submitted_pending_receipt'")
    expect(checkout).toContain("status === 'marco_pay_pending_verification'")
    expect(checkout).toContain('const hidePaymentAction = isTerminalSuccess || isPaymentProcessing')
    expect(checkout).toContain('data-testid="commercial-checkout-processing"')
    expect(checkout).toContain('TRANSACTION SUBMITTED')
    expect(checkout).toContain('Your MARCO payment is being confirmed on-chain.')
    expect(checkout).toContain('Please wait while we verify your payment and activate your service.')
    expect(checkout).toContain('This may take a few moments.')
  })

  it('removes PAY WITH MARCO immediately after wallet submission', () => {
    expect(checkout).toContain("setStatus('submitted')")
    expect(checkout).toContain('setSubmittedTxHash(transaction.hash)')
    expect(checkout).toContain("setWalletStage('idle')")
    expect(checkout).toContain("step === 'review' && hidePaymentAction ? null")
    expect(checkout).toContain('isMarcoPay && marcoPayOrder && !hidePaymentAction')
    expect(checkout).toContain('!hidePaymentAction && quoteSummary')
    expect(checkout).toContain('!hidePaymentAction && walletStage !== \'idle\'')
    expect(checkout).toMatch(
      /if \(status === 'confirmed' \|\| status === 'submitted' \|\| status === 'submitted_pending_receipt' \|\| status === 'marco_pay_pending_verification'\) return/,
    )
  })

  it('keeps Confirm in your wallet only until the wallet transaction is submitted', () => {
    expect(checkout).toContain("setQuoteSummary('Confirm the MARCO transfer in your wallet')")
    expect(checkout).toContain('const transaction = await signer.sendTransaction({')
    expect(checkout).toMatch(
      /const transaction = await signer\.sendTransaction\(\{[\s\S]*?setStatus\('submitted'\)\s*setWalletStage\('idle'\)/,
    )
  })

  it('presents ONCHAIN_PENDING / PAYMENT_CONFIRMED / ACTIVATING as processing, never BOOST ACTIVATED', () => {
    expect(checkout).toMatch(
      /if \(\s*order\.state === 'ONCHAIN_PENDING' \|\|\s*order\.state === 'PAYMENT_CONFIRMED' \|\|\s*order\.state === 'ACTIVATING'\s*\) \{\s*setStatus\('submitted'\)\s*setWalletStage\('idle'\)/,
    )
    expect(checkout).toContain("if (order.state !== 'ACTIVE') return")
    expect(checkout).toContain("setStatus('confirmed')")
    expect(checkout).toContain('const isTerminalSuccess = status === \'confirmed\'')
    expect(checkout).toContain('{isPaymentProcessing && !isTerminalSuccess ? (')
    expect(checkout).toContain('{isTerminalSuccess ? (')
    expect(checkout).toContain('BOOST ACTIVATED')
    expect(checkout).not.toContain("order.state === 'PAYMENT_CONFIRMED' || order.state === 'ACTIVATING'\n          setStatus('confirmed')")
  })

  it('does not open Passport or Connect during processing', () => {
    expect(checkout).not.toContain('openMarcoPassport')
    expect(checkout).not.toContain('widgets/marco.js')
    expect(checkout).not.toContain('widgets/marco-connect')
    expect(checkout).toContain('runMarcoPaySingleFlight')
    expect(checkout).toContain('isMarcoPayWalletFlightActive()')
  })
})
