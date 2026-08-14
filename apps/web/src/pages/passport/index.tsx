import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { NextPage } from 'next'

/** Legacy /passport → Portfolio Studio at /portfolio. */
const PassportRedirectPage: NextPage = () => {
  const router = useRouter()
  useEffect(() => {
    router.replace('/portfolio')
  }, [router])
  return null
}

PassportRedirectPage.chains = []

export default PassportRedirectPage
