import { CHAIN_IDS } from 'utils/wagmi'
import EconomicReviewConsole from 'views/EconomicReview/EconomicReviewConsole'

const ReviewPage = () => <EconomicReviewConsole />

ReviewPage.chains = CHAIN_IDS
ReviewPage.pure = true
ReviewPage.isShowScrollToTopButton = false

export default ReviewPage
