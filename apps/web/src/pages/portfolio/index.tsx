import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { CHAIN_IDS } from 'utils/wagmi'

/** Legacy — canonical cockpit is Command Center. */
const PortfolioPage = () => {
  const router = useRouter()
  useEffect(() => {
    if (!router.isReady) return
    router.replace('/command-center')
  }, [router, router.isReady])
  return null
}

PortfolioPage.chains = CHAIN_IDS
PortfolioPage.pure = true
PortfolioPage.isShowScrollToTopButton = false

export default PortfolioPage
