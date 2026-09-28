import { useEffect } from 'react'
import { useRouter } from 'next/router'
import {
  MARCO_REFERRAL_CHANGE_EVENT,
  captureMarcoReferral,
  getBrowserMarcoReferralStorage,
  verifyMarcoReferral,
} from 'lib/marco-referral/client'

/** Silent global capture. It renders nothing and never delays native DEX UX. */
export function MarcoReferralCapture() {
  const router = useRouter()

  useEffect(() => {
    const storage = getBrowserMarcoReferralStorage()
    if (!storage) return
    const captured = captureMarcoReferral(window.location.href, storage)
    if (!captured) return
    if (captured.status === 'VERIFIED') {
      window.dispatchEvent(
        new CustomEvent(MARCO_REFERRAL_CHANGE_EVENT, {
          detail: { code: captured.code, status: captured.status },
        }),
      )
      return
    }
    void verifyMarcoReferral(captured, storage).then((verified) => {
      window.dispatchEvent(
        new CustomEvent(MARCO_REFERRAL_CHANGE_EVENT, {
          detail: verified ? { code: verified.code, status: verified.status } : null,
        }),
      )
    })
  }, [router.asPath])

  return null
}
