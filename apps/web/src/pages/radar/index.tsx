import { CHAIN_IDS } from 'utils/wagmi'
import QueryExplorer from 'views/Query'

const RadarPage = () => <QueryExplorer />

RadarPage.chains = CHAIN_IDS

export default RadarPage
