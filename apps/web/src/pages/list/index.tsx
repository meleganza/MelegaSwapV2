import { NextPage } from 'next'
import ListScreen from 'views/ListStudio/ListStudioScreen'

const ListPage: NextPage = () => <ListScreen />

ListPage.chains = []
ListPage.disablePageSuspense = true

export default ListPage
