import { CHAIN_IDS } from 'utils/wagmi'
import CivilizationDryRunConsole from 'views/CivilizationDryRun/CivilizationDryRunConsole'

const DryRunPage = () => <CivilizationDryRunConsole />

DryRunPage.chains = CHAIN_IDS
DryRunPage.pure = true
DryRunPage.isShowScrollToTopButton = false

export default DryRunPage
