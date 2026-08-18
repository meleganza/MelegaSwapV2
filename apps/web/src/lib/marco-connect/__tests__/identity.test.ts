import { readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { evaluateMarcoConnectIdentityClaim, publicMarcoConnectStatus } from '../identity'

const WEB = path.resolve(__dirname, '../../../')

describe('MARCO Connect identity association', () => {
  it('keeps payment independent from Passport authentication', () => {
    const status = publicMarcoConnectStatus()
    expect(status.payment_requires_passport).toBe(false)
    expect(status.client_supplied_passport_id_accepted).toBe(false)
    const checkout = readFileSync(path.join(WEB, 'views/shared/monetization/CommercialCheckoutModal.tsx'), 'utf8')
    expect(checkout).toContain("pay === 'MARCO_PAY'")
    expect(checkout).toContain("pay === 'M_CREDITS'")
    expect(checkout).not.toContain("pay === 'MARCO_PAY' || pay === 'M_CREDITS'")
    expect(checkout).not.toContain('marco_passport_id')
  })

  it('rejects client-supplied Passport ids so identities cannot be duplicated or spoofed', () => {
    expect(
      evaluateMarcoConnectIdentityClaim({ marco_passport_id: 'passport_forged' }).error,
    ).toBe('CLIENT_PASSPORT_ID_REJECTED')
    expect(evaluateMarcoConnectIdentityClaim({ passport_id: 'abc' }).error).toBe('CLIENT_PASSPORT_ID_REJECTED')
    expect(evaluateMarcoConnectIdentityClaim({ wallet: '0xabc' }).error).toBe('SIGNED_MARCO_IDENTITY_REQUIRED')
    expect(publicMarcoConnectStatus().linked).toBe(false)
    expect(publicMarcoConnectStatus().marco_passport_id).toBeNull()
  })

  it('leaves the official MARCO Connect widget as the identity surface', () => {
    const connect = readFileSync(path.join(WEB, 'components/MarcoWidgets/MarcoConnect.tsx'), 'utf8')
    expect(connect).toContain('https://marco.melega.ai/widgets/marco-connect.v2.1.js')
    expect(connect).toContain('aria-label="MARCO Connect"')
  })
})
