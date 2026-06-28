import { CHAIN_IDS } from 'utils/wagmi'
import UserLaunchConsole from 'views/UserLaunch/UserLaunchConsole'

const LaunchPage = () => <UserLaunchConsole />

LaunchPage.chains = CHAIN_IDS
LaunchPage.pure = true
LaunchPage.isShowScrollToTopButton = false

export default LaunchPage
