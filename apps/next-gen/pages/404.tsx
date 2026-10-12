import React from 'react'
import Head from 'next/head'

export default function NotFoundPage() {
  return (
    <main className="frame">
      <Head>
        <title>Not found · Melega Next Gen beta</title>
        <meta name="robots" content="noindex, nofollow, noarchive, nosnippet" />
      </Head>
      <div className="main">
        <h1>Not found</h1>
        <p className="footnote">That page is not part of this beta.</p>
      </div>
    </main>
  )
}
