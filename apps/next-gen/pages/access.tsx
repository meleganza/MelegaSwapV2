import React from 'react'
import Head from 'next/head'
import type { GetServerSideProps } from 'next'
import { accessCss } from '../lib/accessCss'
import { configuredBetaToken } from '../lib/betaGate'

interface AccessProps {
  configured: boolean
  denied: boolean
}

export default function AccessPage({ configured, denied }: AccessProps) {
  return (
    <main className="access">
      <Head>
        <title>Beta access · Melega Next Gen</title>
      </Head>
      <style dangerouslySetInnerHTML={{ __html: accessCss() }} />
      <h1>Melega Next Gen beta</h1>
      {configured ? (
        <>
          <p>Enter the access token for this host. The product shell stays closed until it matches.</p>
          {denied ? (
            <p className="error" role="alert">
              That token was not accepted.
            </p>
          ) : null}
          <form method="post" action="/api/access">
            <label htmlFor="password">Access token</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              spellCheck={false}
              minLength={16}
              required
            />
            <button type="submit">Continue</button>
          </form>
        </>
      ) : (
        <p role="status">This beta host has no access secret configured, so the shell stays closed.</p>
      )}
    </main>
  )
}

export const getServerSideProps: GetServerSideProps<AccessProps> = async ({ query, res }) => {
  res.setHeader('Cache-Control', 'private, no-store')
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet')
  res.setHeader('X-Melega-Surface', 'next-gen-beta')
  return {
    props: {
      configured: configuredBetaToken(process.env.BETA_ACCESS_TOKEN) !== null,
      denied: query.denied === '1',
    },
  }
}
