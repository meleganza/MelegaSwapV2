import { CHAIN_IDS } from 'utils/wagmi'
import QueryExplorer from 'views/Query'

const QueryPage = () => <QueryExplorer />

QueryPage.chains = CHAIN_IDS

export default QueryPage
