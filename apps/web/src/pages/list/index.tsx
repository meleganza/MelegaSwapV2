import dynamic from 'next/dynamic'
import { NextPage } from 'next'

const ListScreen = dynamic(() => import('views/ListStudio/ListStudioScreen'), { ssr: false })

const ListPage: NextPage = () => <ListScreen />

ListPage.chains = []

export default ListPage
