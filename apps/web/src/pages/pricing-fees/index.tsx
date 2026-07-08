import { CHAIN_IDS } from 'utils/wagmi'
import PricingFeesScreen from 'views/PricingFees/PricingFeesScreen'

const PricingFeesPage = () => <PricingFeesScreen />

PricingFeesPage.chains = CHAIN_IDS

export default PricingFeesPage
