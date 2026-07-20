import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { SUPPORT_MULTI_CHAINS } from 'config/constants/supportChains'
import Liquidity from 'views/Pool'

/**
 * Canonical Pool / positions route.
 * LB024 — `/liquidity?view=building` deep-links into Liquidity Studio Liquidity Building.
 */
const LiquidityPage = () => {
  const router = useRouter()

  useEffect(() => {
    if (!router.isReady) return
    const view = Array.isArray(router.query.view) ? router.query.view[0] : router.query.view
    if (typeof view === 'string' && ['building', 'liquidity-building'].includes(view.toLowerCase())) {
      router.replace({ pathname: '/liquidity-studio', query: { view: 'building' } }).catch(() => undefined)
    }
  }, [router])

  return <Liquidity />
}

LiquidityPage.chains = SUPPORT_MULTI_CHAINS

export default LiquidityPage
