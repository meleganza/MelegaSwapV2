import type { AppProps } from 'next/app'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import type { NextPageWithLayout } from './_app-types'

// The current wallet/theme tree is not hydration-deterministic yet. Keep the
// product runtime client-only until those providers can be server-rendered
// without React replacing the page during hydration.
const FullMyApp = dynamic(() => import('./_app-full'), { ssr: false })

export default function App(props: AppProps) {
  const Component = props.Component as NextPageWithLayout

  if (Component.barePage) {
    return (
      <>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="theme-color" content="#0f0f0f" />
          <title>Testnet Liquidity — Melega</title>
        </Head>
        <Component {...props.pageProps} />
      </>
    )
  }

  // data-melega-app-boot-shell lives outside the React root in _document.
  // Keep it visible until _app-full has actually mounted instead of hiding it
  // one render earlier and presenting a blank page while the main chunk loads.
  return <FullMyApp {...props} />
}
