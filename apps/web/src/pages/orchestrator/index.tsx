import { CHAIN_IDS } from 'utils/wagmi'
import EconomicOrchestratorConsole from 'views/EconomicOrchestrator/EconomicOrchestratorConsole'

const OrchestratorPage = () => <EconomicOrchestratorConsole />

OrchestratorPage.chains = CHAIN_IDS
OrchestratorPage.pure = true
OrchestratorPage.isShowScrollToTopButton = false

export default OrchestratorPage
