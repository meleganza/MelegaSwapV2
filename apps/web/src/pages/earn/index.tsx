import SimpleEarn from 'views/Earn/SimpleEarn'
import { CHAIN_IDS } from 'utils/wagmi'

const EarnPage = () => <SimpleEarn />

EarnPage.chains = CHAIN_IDS

export default EarnPage
