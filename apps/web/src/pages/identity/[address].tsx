import { GetStaticPaths, GetStaticProps } from 'next'
import { CHAIN_IDS } from 'utils/wagmi'
import { PLACEHOLDER_ADDRESS_SLUG } from 'lib/economic-identity/identity-constants'
import EconomicIdentityConsole from 'views/EconomicIdentity/EconomicIdentityConsole'

interface IdentityAddressPageProps {
  address: string
}

const IdentityAddressPage = ({ address }: IdentityAddressPageProps) => (
  <EconomicIdentityConsole options={{ addressParam: address }} />
)

export const getStaticPaths: GetStaticPaths = () => ({
  paths: [{ params: { address: PLACEHOLDER_ADDRESS_SLUG } }],
  fallback: false,
})

export const getStaticProps: GetStaticProps<IdentityAddressPageProps> = async ({ params }) => {
  const address = params?.address as string

  return {
    props: { address },
  }
}

IdentityAddressPage.chains = CHAIN_IDS
IdentityAddressPage.pure = true
IdentityAddressPage.isShowScrollToTopButton = false

export default IdentityAddressPage
