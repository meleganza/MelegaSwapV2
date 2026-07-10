import { CHAIN_IDS } from 'utils/wagmi'
import EconomicIdentityConsole from 'views/EconomicIdentity/EconomicIdentityConsole'

const IdentityPage = () => <EconomicIdentityConsole />

IdentityPage.chains = CHAIN_IDS
IdentityPage.isShowScrollToTopButton = false

export default IdentityPage
