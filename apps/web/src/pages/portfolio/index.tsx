import { CHAIN_IDS } from 'utils/wagmi'
import UserWorkspaceConsole from 'views/UserWorkspace/UserWorkspaceConsole'

const PortfolioPage = () => <UserWorkspaceConsole />

PortfolioPage.chains = CHAIN_IDS
PortfolioPage.pure = true
PortfolioPage.isShowScrollToTopButton = false

export default PortfolioPage
