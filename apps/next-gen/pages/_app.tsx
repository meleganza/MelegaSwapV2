import React from 'react'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import '../styles/globals.css'
import { WagmiProvider } from '@pancakeswap/wagmi'
import { client } from '../../web/src/utils/wagmi'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex, nofollow, noarchive, nosnippet" />
      </Head>
      <WagmiProvider client={client}>
        <Component {...pageProps} />
      </WagmiProvider>
    </>
  )
}
