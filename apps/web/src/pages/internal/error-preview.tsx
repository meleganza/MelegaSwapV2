import { useEffect, useState } from 'react'
import { SUPPORT_MULTI_CHAINS } from 'config/constants/supportChains'

/** Unlinked acceptance route — throws after mount so the global boundary can render. */
const ErrorPreviewPage = () => {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    setReady(true)
  }, [])
  if (ready) {
    throw new Error('Injected route failure for friendly error-page acceptance')
  }
  return null
}

ErrorPreviewPage.chains = SUPPORT_MULTI_CHAINS

export default ErrorPreviewPage
