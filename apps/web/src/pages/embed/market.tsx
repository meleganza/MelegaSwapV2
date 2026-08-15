import React from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import styled from 'styled-components'
import { CHAIN_IDS } from 'utils/wagmi'

const Canvas = styled.main`
  min-height: 100vh;
  padding: 18px;
  display: grid;
  place-items: center;
  background: #070808;
  color: #f4f4f4;
  font-family: Inter, Arial, sans-serif;
  box-sizing: border-box;
`

const Card = styled.section`
  width: min(100%, 520px);
  padding: 22px;
  border: 1px solid rgba(221, 185, 47, 0.35);
  border-radius: 16px;
  background: radial-gradient(circle at 90% 0, rgba(221, 185, 47, 0.14), transparent 34%), #111313;
  box-sizing: border-box;
`

const MarketEmbed = () => {
  const router = useRouter()
  const kind = typeof router.query.kind === 'string' ? router.query.kind.toLowerCase() : 'liquidity'
  const target = typeof router.query.target === 'string' ? router.query.target : ''
  const title = kind === 'farm' ? 'Farm' : kind === 'pool' ? 'Pool' : 'Liquidity'
  const href = kind === 'farm' ? '/farms' : kind === 'pool' ? '/pools' : '/liquidity'

  return (
    <Canvas data-melega-widget={`market-${kind}`}>
      <Card>
        <div style={{ color: '#ddb92f', fontSize: 11, fontWeight: 800, letterSpacing: '.12em' }}>MELEGA DEX</div>
        <h1 style={{ margin: '12px 0 6px', fontSize: 28 }}>{title} widget</h1>
        <p style={{ margin: 0, color: '#999', lineHeight: 1.5 }}>
          {target ? `Configured target: ${target}` : `Choose a live ${title.toLowerCase()} target in the embed URL.`}
        </p>
        <Link
          href={target ? `${href}?target=${encodeURIComponent(target)}` : href}
          target="_blank"
          style={{ marginTop: 18, minHeight: 42, padding: '0 16px', borderRadius: 9, background: '#ddb92f', color: '#080808', display: 'inline-flex', alignItems: 'center', textDecoration: 'none', fontWeight: 750 }}
        >
          Open {title}
        </Link>
      </Card>
    </Canvas>
  )
}

MarketEmbed.hideMenu = true
MarketEmbed.chains = CHAIN_IDS

export default MarketEmbed
