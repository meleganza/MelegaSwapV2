import { CHAIN_IDS } from 'utils/wagmi'
import EconomicSubmissionConsole from 'views/EconomicSubmission/EconomicSubmissionConsole'

const SubmitPage = () => <EconomicSubmissionConsole />

SubmitPage.chains = CHAIN_IDS
SubmitPage.pure = true
SubmitPage.isShowScrollToTopButton = false

export default SubmitPage
