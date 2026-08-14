import { NextSeo } from 'next-seo'
import PremiumErrorScreen from 'components/ErrorBoundary/PremiumErrorScreen'

const NotFoundPage = () => (
  <>
    <NextSeo title="Page not found | Melega DEX" />
    <PremiumErrorScreen
      code="404 · Route not found"
      title="This route went off course."
      message="The destination may have moved or may no longer be indexed. Return to Melega DEX and continue from a live route."
    />
  </>
)

NotFoundPage.hideMenu = true
NotFoundPage.chains = []

export default NotFoundPage
