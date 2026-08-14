import type { AppProps } from 'next/app'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import type { NextPageWithLayout } from 'app-runtime/appTypes'

// Render the approved shell on the server so the first response is useful HTML.
// Wallet and polling effects remain client-only inside the runtime tree.
const FullMyApp = dynamic(() => import('app-runtime/FullMyApp'), { ssr: true })

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

  return <FullMyApp {...props} />
}
