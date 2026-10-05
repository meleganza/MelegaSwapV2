import dynamic from 'next/dynamic'
import type { NextPageWithLayout } from 'app-runtime/appTypes'
import { CHAIN_IDS } from 'utils/wagmi'

const PortfolioStudioScreen = dynamic(() => import('views/PortfolioStudio/PortfolioStudioScreen'), {
  ssr: false,
})

const PortfolioPage: NextPageWithLayout = () => <PortfolioStudioScreen />

PortfolioPage.chains = CHAIN_IDS
PortfolioPage.isShowScrollToTopButton = false

export default PortfolioPage
