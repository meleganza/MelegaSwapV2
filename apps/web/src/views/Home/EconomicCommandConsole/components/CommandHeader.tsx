import React from 'react'
import styled from 'styled-components'
import Image from 'next/image'
import Link from 'next/link'
import { NetworkSwitcher } from 'components/NetworkSwitcher'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { useCommandTranslation } from '../useCommandTranslation'
import { cmd } from '../tokens'
import { LiveDot } from '../styles'

const Bar = styled.header`
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 24px;
  border-bottom: 1px solid ${cmd.border};
  background: rgba(0, 0, 0, 0.92);
  backdrop-filter: blur(10px);
`

const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
`

const BrandCopy = styled.div`
  h1 {
    margin: 0;
    font-family: ${cmd.fontDisplay};
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.16em;
    color: ${cmd.text};
  }

  p {
    margin: 2px 0 0;
    font-size: 9px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: ${cmd.textSecondary};
  }
`

const Nav = styled.nav`
  display: none;
  gap: 28px;

  @media (min-width: 1025px) {
    display: flex;
  }

  a {
    font-family: ${cmd.fontDisplay};
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.14em;
    color: ${cmd.textSecondary};
    text-decoration: none;
    transition: color ${cmd.transition};

    &:hover {
      color: ${cmd.gold};
    }
  }
`

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
`

const ChainLive = styled.div`
  display: none;
  align-items: center;
  gap: 8px;
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: ${cmd.textSecondary};

  @media (min-width: 768px) {
    display: flex;
  }
`

const WalletBtnWrap = styled.div`
  button {
    background: linear-gradient(180deg, ${cmd.goldHighlight}, ${cmd.gold}) !important;
    color: #000 !important;
    border: none !important;
    border-radius: 10px !important;
    font-family: ${cmd.fontDisplay} !important;
    font-size: 10px !important;
    font-weight: 700 !important;
    letter-spacing: 0.1em !important;
    min-height: 38px !important;
  }
`

const REGISTRY_LINKS = [
  { href: '/projects', key: 'Projects' },
  { href: '/assets', key: 'Assets' },
  { href: '/venues', key: 'Venues' },
  { href: '/events', key: 'Events' },
  { href: '/graph', key: 'Graph' },
  { href: '/query', key: 'Query' },
] as const

const CommandHeader: React.FC = () => {
  const { t } = useCommandTranslation()

  return (
    <Bar>
      <Brand>
        <Image src="/images/melega/melega-logo.png" alt="Melega" width={40} height={40} priority />
        <BrandCopy>
          <h1>{t('CMD brand title')}</h1>
          <p>{t('CMD brand subtitle')}</p>
        </BrandCopy>
      </Brand>

      <Nav>
        {REGISTRY_LINKS.map(({ href, key }) => (
          <Link key={href} href={href}>
            {t(key)}
          </Link>
        ))}
      </Nav>

      <Controls>
        <ChainLive>
          BNB CHAIN <span style={{ opacity: 0.4 }}>•</span> <LiveDot>LIVE</LiveDot>
        </ChainLive>
        <NetworkSwitcher />
        <WalletBtnWrap>
          <ConnectWalletButton scale="sm">{t('CMD connect wallet')}</ConnectWalletButton>
        </WalletBtnWrap>
      </Controls>
    </Bar>
  )
}

export default CommandHeader
