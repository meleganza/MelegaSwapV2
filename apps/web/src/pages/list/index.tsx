import { NextPage } from 'next'
import { SUPPORT_MULTI_CHAINS } from 'config/constants/supportChains'
import ListContractFirstScreen from 'views/ListStudio/ListContractFirstScreen'

const ListPage: NextPage = () => <ListContractFirstScreen />

ListPage.chains = SUPPORT_MULTI_CHAINS

export default ListPage
