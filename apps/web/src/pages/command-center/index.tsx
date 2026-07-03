import { CHAIN_IDS } from 'utils/wagmi'
import CommandCenterScreen from 'views/CommandCenter/CommandCenterScreen'

const CommandCenterPage = () => <CommandCenterScreen />

CommandCenterPage.chains = CHAIN_IDS

export default CommandCenterPage
