import { CHAIN_IDS } from 'utils/wagmi'
import Events from 'views/Events'

const EventsPage = () => <Events />

EventsPage.chains = CHAIN_IDS

export default EventsPage
