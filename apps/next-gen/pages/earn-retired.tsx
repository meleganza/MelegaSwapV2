import React from 'react'
import { BetaShell } from '../components/BetaShell'
import RetiredNativeEarn from '../modules/earn/RetiredNativeEarn'
import RetiredPositionLookup from '../modules/earn/RetiredPositionLookup'
import { getBetaPageProps } from '../lib/page'

export default function RetiredEarnPage() {
  return (
    <BetaShell section="earn">
      <section className="page-intro" aria-labelledby="section-title">
        <div>
          <h1 id="section-title">Retired native earn</h1>
          <p className="intro-copy">BNB remains the active native chain. External Beefy vaults stay on the Earn page.</p>
        </div>
        <p className="status" role="status" data-operational="false">
          <span className="sr-only">Not operational. </span>Beta — read-only
        </p>
      </section>
      <p className="muted-copy">
        <a href="/earn">Back to BNB Earn</a>
      </p>
      <RetiredPositionLookup />
      <RetiredNativeEarn />
    </BetaShell>
  )
}

export const getServerSideProps = getBetaPageProps
