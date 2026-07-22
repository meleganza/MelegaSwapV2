import dynamic from 'next/dynamic'
import { NextPage } from 'next'

const PassportScreen = dynamic(() => import('views/Passport/PassportScreen'), { ssr: false })

const PassportPage: NextPage = () => <PassportScreen />

PassportPage.chains = []

export default PassportPage
