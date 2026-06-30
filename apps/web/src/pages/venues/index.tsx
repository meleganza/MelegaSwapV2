import { CHAIN_IDS } from 'utils/wagmi'
import Venues from 'views/Venues'

const VenuesPage = () => <Venues />

VenuesPage.chains = CHAIN_IDS

export default VenuesPage
