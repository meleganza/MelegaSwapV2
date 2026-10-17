import React from 'react'
import Document, { Head, Html, Main, NextScript } from 'next/document'

export default class BetaDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <meta name="robots" content="noindex, nofollow, noarchive, nosnippet" />
          <meta name="theme-color" content="#171816" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
