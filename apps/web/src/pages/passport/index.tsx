import dynamic from 'next/dynamic'
import { NextPage } from 'next'

const PassportV1Shell = dynamic(() => import('views/Passport/v1/PassportV1Shell'), { ssr: false })

const PassportPage: NextPage = () => <PassportV1Shell />

PassportPage.chains = []

export default PassportPage
