import dynamic from 'next/dynamic'
import type { NextPageWithLayout } from 'app-runtime/appTypes'

const ListScreen = dynamic(() => import('views/ListStudio/ListStudioScreen'), { ssr: false })

const ListPage: NextPageWithLayout = () => <ListScreen />

ListPage.chains = []

export default ListPage
