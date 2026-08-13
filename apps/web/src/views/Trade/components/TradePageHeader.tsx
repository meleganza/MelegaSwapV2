import React from 'react'
import styled from 'styled-components'
import { MelegaTokenAvatar } from 'design-system/melega/components/MelegaTokenAvatar/MelegaTokenAvatar'
import { tradeColors } from '../tradeTokens'

export type TradePageHeaderProps = {
  inputSymbol: string
  outputSymbol: string
  projectName?: string
  projectHref?: string
  bridgeHref?: string
  featured?: boolean
  featuredRemaining?: string | null
  boosted?: boolean
  boostedRemaining?: string | null
}

const Shell = styled.header`
  min-height: 58px;
  padding: 12px 16px;
  border: 1px solid ${tradeColors.border};
  border-radius: 16px;
  background: linear-gradient(115deg, rgba(244, 196, 48, 0.055), rgba(18, 18, 18, 0.9) 32%, #101010);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  box-sizing: border-box;

  @media (max-width: 767px) {
    align-items: flex-start;
    flex-direction: column;
    gap: 12px;
  }
`

const Identity = styled.div`
  display: flex;
  align-items: center;
  gap: 11px;
  min-width: 0;
`

const NameStack = styled.div`
  min-width: 0;
`

const Pair = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  color: #fff;
  font-size: 19px;
  font-weight: 800;
  line-height: 1.2;
`

const Context = styled.div`
  margin-top: 3px;
  color: ${tradeColors.muted};
  font-size: 12px;
  font-weight: 500;
`

const Badges = styled.div`
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
`

const Badge = styled.span<{ $boosted?: boolean }>`
  display: inline-flex;
  align-items: center;
  min-height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  border: 1px solid ${({ $boosted }) => ($boosted ? 'rgba(0, 230, 118, 0.35)' : 'rgba(244, 196, 48, 0.42)')};
  background: ${({ $boosted }) => ($boosted ? 'rgba(0, 230, 118, 0.09)' : 'rgba(244, 196, 48, 0.09)')};
  color: ${({ $boosted }) => ($boosted ? tradeColors.green : tradeColors.goldBright)};
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  white-space: nowrap;
`

const ProjectLink = styled.a`
  min-height: 38px;
  padding: 0 15px;
  border: 1px solid rgba(244, 196, 48, 0.5);
  border-radius: 11px;
  color: ${tradeColors.goldBright};
  background: rgba(244, 196, 48, 0.05);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 750;
  text-decoration: none;
  white-space: nowrap;
  transition: background 150ms ease, border-color 150ms ease, transform 150ms ease;

  &:hover {
    background: rgba(244, 196, 48, 0.11);
    border-color: ${tradeColors.goldBright};
  }

  &:active {
    transform: scale(0.99);
  }

  @media (max-width: 767px) {
    width: 100%;
    box-sizing: border-box;
  }
`

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  @media (max-width: 767px) { width: 100%; flex-direction: column; }
`

/** Compact selected-pair context. Project CTA exists only for a canonical active project page. */
export const TradePageHeader: React.FC<TradePageHeaderProps> = ({
  inputSymbol,
  outputSymbol,
  projectName,
  projectHref,
  bridgeHref,
  featured,
  featuredRemaining,
  boosted,
  boostedRemaining,
}) => (
  <Shell data-trade-pair-header>
    <Identity>
      <MelegaTokenAvatar name={outputSymbol} symbol={outputSymbol} size={38} radius="circle" />
      <NameStack>
        <Pair>
          {outputSymbol} / {inputSymbol}
          <Badges>
            {featured ? <Badge>Featured{featuredRemaining ? ` · ${featuredRemaining}` : ''}</Badge> : null}
            {boosted ? <Badge $boosted>🚀 Boosted{boostedRemaining ? ` · ${boostedRemaining}` : ''}</Badge> : null}
          </Badges>
        </Pair>
        <Context>{projectName ? `${projectName} · ` : ''}Live market workspace</Context>
      </NameStack>
    </Identity>
    <HeaderActions>
      {bridgeHref ? <ProjectLink href={bridgeHref}>Bridge MARCO</ProjectLink> : null}
      {projectHref ? <ProjectLink href={projectHref}>Open project page ↗</ProjectLink> : null}
    </HeaderActions>
  </Shell>
)

export default TradePageHeader
