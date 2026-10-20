import React from 'react'
import {
  LIVE_FARM_EXIT,
  LIVE_LIQUIDITY_EXIT,
  LIVE_POOL_EXIT,
  terminatedNativeChains,
} from '../../lib/nativeEarnChains'

export default function RetiredNativeEarn() {
  const chains = terminatedNativeChains()
  return (
    <section className="quote-panel" aria-labelledby="retired-native-title" data-deposit="false" data-onchain-terminated="false">
      <h2 id="retired-native-title">Terminated native farms and pools</h2>
      <p className="muted-copy">
        Polygon, Base, and Ethereum are closed to new native deposits, stakes, added liquidity, and farm creation.
        This does not mean your tokens were withdrawn. It does not mean those contracts were paused or destroyed on-chain.
        Positions on these chains are not read here, so their status is unknown.
      </p>
      <p className="muted-copy">
        Beefy vaults on BNB are a separate external catalog. They are not these native farms.
      </p>
      <ul className="result-links">
        <li>
          <a href="/earn-retired">Read retired farm positions</a>
        </li>
      </ul>
      {chains.map((chain) => (
        <article key={chain.chainId} data-chain={chain.chainId} data-status="terminated" data-positions="unknown">
          <h3>
            {chain.name} · chain {chain.chainId} · Terminated
          </h3>
          <ul className="facts">
            <li>New native deposit, stake, and create actions are not offered.</li>
            <li>This page does not read the position. Use the retired position read. An incomplete read stays unknown.</li>
            <li>The live DEX does not accept a chain in these links. Switch the wallet to {chain.name} after you leave this beta.</li>
          </ul>
          <ul className="result-links">
            <li>
              <a href={LIVE_FARM_EXIT} rel="noreferrer noopener" referrerPolicy="no-referrer">
                Farm positions on the live DEX
              </a>
            </li>
            <li>
              <a href={LIVE_POOL_EXIT} rel="noreferrer noopener" referrerPolicy="no-referrer">
                Pool positions on the live DEX
              </a>
            </li>
            <li>
              <a href={LIVE_LIQUIDITY_EXIT} rel="noreferrer noopener" referrerPolicy="no-referrer">
                Remove liquidity on the live DEX
              </a>
            </li>
            {chain.explorer ? (
              <li>
                <a href={chain.explorer} rel="noreferrer noopener" referrerPolicy="no-referrer">
                  View the {chain.name} farm contract
                </a>
              </li>
            ) : (
              <li>Farm contract view is unavailable.</li>
            )}
          </ul>
        </article>
      ))}
    </section>
  )
}
