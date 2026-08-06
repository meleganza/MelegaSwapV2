import dynamic from 'next/dynamic'
import { NextPage } from 'next'
import { CHAIN_IDS } from 'utils/wagmi'

const PortfolioStudioScreen = dynamic(() => import('views/PortfolioStudio/PortfolioStudioScreen'), {
  ssr: false,
})

const PortfolioPage: NextPage = () => <PortfolioStudioScreen />

PortfolioPage.chains = CHAIN_IDS
PortfolioPage.isShowScrollToTopButton = false

export default PortfolioPage
