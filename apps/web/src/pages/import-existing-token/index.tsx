import { CHAIN_IDS } from 'utils/wagmi'
import ImportExistingTokenScreen from 'views/ImportExistingToken/ImportExistingTokenScreen'

const ImportExistingTokenPage = () => <ImportExistingTokenScreen />

ImportExistingTokenPage.chains = CHAIN_IDS

export default ImportExistingTokenPage
