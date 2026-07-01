import { CHAIN_IDS } from 'utils/wagmi'
import Projects from 'views/Projects'

const TrendingPage = () => <Projects />

TrendingPage.chains = CHAIN_IDS

export default TrendingPage
