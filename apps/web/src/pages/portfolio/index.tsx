import dynamic from 'next/dynamic'
import type { NextPageWithLayout } from 'app-runtime/appTypes'
import ClientOnlyMount from 'components/ClientOnlyMount'
import { CHAIN_IDS } from 'utils/wagmi'

// Browser-only screen (wallet readers). Loaded lazily and mounted after hydration — see ClientOnlyMount.
const PortfolioStudioScreen = dynamic(() => import('views/PortfolioStudio/PortfolioStudioScreen'))

const PortfolioPage: NextPageWithLayout = () => (
  <ClientOnlyMount>
    <PortfolioStudioScreen />
  </ClientOnlyMount>
)

PortfolioPage.chains = CHAIN_IDS
PortfolioPage.isShowScrollToTopButton = false
PortfolioPage.disablePageSuspense = true

export default PortfolioPage
