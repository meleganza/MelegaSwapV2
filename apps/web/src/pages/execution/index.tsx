import { CHAIN_IDS } from 'utils/wagmi'
import SmartExecutionExplorer from 'views/SmartExecution/SmartExecutionExplorer'

const ExecutionPage = () => <SmartExecutionExplorer />

ExecutionPage.chains = CHAIN_IDS
ExecutionPage.pure = true
ExecutionPage.isShowScrollToTopButton = false

export default ExecutionPage
