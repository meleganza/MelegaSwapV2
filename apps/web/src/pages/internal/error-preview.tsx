import { useEffect, useState } from 'react'
import { SUPPORT_MULTI_CHAINS } from 'config/constants/supportChains'

function Boom() {
  throw new Error('Injected route failure for friendly error-page acceptance')
}

/** Unlinked acceptance route — throws after mount so the global boundary can render. */
const ErrorPreviewPage = () => {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    setReady(true)
  }, [])
  if (!ready) return null
  return <Boom />
}

ErrorPreviewPage.chains = SUPPORT_MULTI_CHAINS

export default ErrorPreviewPage
