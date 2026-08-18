import { describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'
import {
  assignMarcoPayHandoff,
  marcoPayApprovalUrl,
  marcoPayRewardNotice,
  openMarcoPayHandoffWindow,
  readMarcoPayHandoffSession,
} from '../approval'

describe('MARCO Pay approval handoff', () => {
  it('requires payment_id and approval_url then opens the canonical MARCO page', () => {
    expect(readMarcoPayHandoffSession({})).toBeNull()
    expect(readMarcoPayHandoffSession({ payment_id: 'pay_1' })).toBeNull()
    expect(
      readMarcoPayHandoffSession({
        payment_id: '19703979-3386-429c-af9a-8376cb3f3845',
        approval_url: 'https://marco.melega.ai/pay/19703979-3386-429c-af9a-8376cb3f3845',
      }),
    ).toEqual({
      paymentId: '19703979-3386-429c-af9a-8376cb3f3845',
      approvalUrl: 'https://marco.melega.ai/pay/19703979-3386-429c-af9a-8376cb3f3845',
    })
    expect(marcoPayApprovalUrl('19703979-3386-429c-af9a-8376cb3f3845')).toBe(
      'https://marco.melega.ai/pay/19703979-3386-429c-af9a-8376cb3f3845',
    )
    expect(marcoPayRewardNotice(500)).toBe('+5% M-Credits received')
    expect(marcoPayRewardNotice(null)).toBeNull()
  })

  it('reads payment_id and approval_url from the DEX order API contract', () => {
    const api = readFileSync(path.join(__dirname, '../../../pages/api/marco-pay/orders.ts'), 'utf8')
    expect(api).toContain('payment_id:')
    expect(api).toContain('approval_url:')
    expect(api).toContain('createMarcoPayPaymentSession')
    expect(api).toContain('assertMarcoPaySettlementWallet')
    expect(api).toContain('getMarcoPayMerchantApiKey')
  })

  it('opens a blank window from the checkout click before assigning approval_url', () => {
    const checkout = readFileSync(
      path.join(__dirname, '../../../views/shared/monetization/CommercialCheckoutModal.tsx'),
      'utf8',
    )
    const launcher = readFileSync(path.join(__dirname, '../../../components/MarcoWidgets/MarcoPay.tsx'), 'utf8')
    const helper = readFileSync(path.join(__dirname, '../approval.ts'), 'utf8')
    expect(checkout).toContain('Complete in MARCO Pay')
    expect(checkout).toContain('runMarcoPaySingleFlight')
    expect(checkout).toContain('beginMarcoPayIsolation')
    expect(launcher).toContain('openMarcoPayHandoffWindow')
    expect(helper).toContain("window.open('about:blank', MARCO_PAY_APPROVAL_WINDOW_NAME")
    expect(launcher).not.toContain('widgets/marco.js')
    expect(launcher).not.toContain('passportResolved')
    expect(checkout).not.toContain('no funds moved')
    expect(checkout).not.toContain('onPassportResolved')
    expect(checkout).toContain('Open MARCO Passport')
  })

  it('assigns https://marco.melega.ai/pay/{payment_id} and fails closed without approval_url', () => {
    const replace = vi.fn()
    const close = vi.fn()
    const popup = { location: { replace }, close } as unknown as Window
    expect(
      assignMarcoPayHandoff(popup, {
        paymentId: '19703979-3386-429c-af9a-8376cb3f3845',
        approvalUrl: 'https://marco.melega.ai/pay/19703979-3386-429c-af9a-8376cb3f3845',
      }),
    ).toBe(true)
    expect(replace).toHaveBeenCalledWith('https://marco.melega.ai/pay/19703979-3386-429c-af9a-8376cb3f3845')
    expect(assignMarcoPayHandoff(popup, null)).toBe(false)
    expect(close).toHaveBeenCalled()
  })

  it('opens about:blank from the user click before any redirect', () => {
    const popup = { opener: {}, location: { replace: vi.fn() }, close: vi.fn() }
    const open = vi.fn(() => popup)
    vi.stubGlobal('window', { open })
    expect(openMarcoPayHandoffWindow()).toBe(popup)
    expect(open).toHaveBeenCalledWith('about:blank', 'marco-pay', 'width=460,height=760')
    vi.unstubAllGlobals()
  })
})
