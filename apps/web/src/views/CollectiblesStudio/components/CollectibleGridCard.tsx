import React, { useState } from 'react'
import styled from 'styled-components'
import type { CollectionCard, IdentityBinding } from '../collectiblesStudioData'
import { BADGE_COLORS, BADGE_LABELS, BINDING_LABELS } from '../collectiblesStudioData'
import {
  CS_FONT_BODY,
  CS_FONT_DISPLAY,
  collectiblesStudioColors,
  collectiblesStudioLayout,
} from '../collectiblesStudioTokens'
import { IconBookmark, IconHeart } from './collectiblesStudioIcons'
import { CsArtwork, ScoreRingDisplay } from './collectiblesStudioPrimitives'

const Card = styled.article`
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: ${collectiblesStudioLayout.cardHeight};
  min-height: ${collectiblesStudioLayout.cardHeight};
  padding: 14px;
  border-radius: ${collectiblesStudioLayout.cardRadius};
  background: ${collectiblesStudioColors.panel};
  border: 1px solid ${collectiblesStudioColors.border};
  box-sizing: border-box;
  min-width: 0;
  overflow: hidden;
  transition: transform 150ms ease, border-color 150ms ease, box-shadow 150ms ease;

  &:hover {
    border-color: ${collectiblesStudioColors.gold};
    transform: translateY(-3px);
    box-shadow: ${collectiblesStudioColors.shadow};
  }

  &:hover [data-cs-artwork] {
    transform: scale(1.03);
  }

  @media (max-width: 767px) {
    height: 400px;
    min-height: 400px;
    width: 100%;
  }
`

const CardBody = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`

const ArtWrap = styled.div`
  position: relative;
  flex-shrink: 0;
`

const Badges = styled.div`
  position: absolute;
  top: 12px;
  left: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  z-index: 2;
  max-width: calc(100% - 80px);
`

const Badge = styled.span<{ $bg: string; $border: string; $color: string }>`
  height: 22px;
  padding: 0 8px;
  border-radius: 7px;
  border: 1px solid ${({ $border }) => $border};
  background: ${({ $bg }) => $bg};
  color: ${({ $color }) => $color};
  font-family: ${CS_FONT_BODY};
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  display: inline-flex;
  align-items: center;
`

const AgentBadge = styled.span`
  height: 22px;
  padding: 0 8px;
  border-radius: 7px;
  border: 1px solid ${collectiblesStudioColors.green};
  color: ${collectiblesStudioColors.green};
  background: rgba(27, 231, 122, 0.08);
  font-family: ${CS_FONT_BODY};
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  display: inline-flex;
  align-items: center;
`

const ScorePos = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;
`

const Title = styled.h4`
  margin: 12px 0 0;
  font-family: ${CS_FONT_DISPLAY};
  font-size: 19px;
  line-height: 23px;
  font-weight: 700;
  color: ${collectiblesStudioColors.white};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const IdentityLine = styled.div`
  font-family: ${CS_FONT_DISPLAY};
  font-size: 14px;
  line-height: 18px;
  color: ${collectiblesStudioColors.gold};
  margin-top: 4px;
  white-space: normal;
  word-break: break-word;
`

const Creator = styled.div`
  font-family: ${CS_FONT_BODY};
  font-size: 13px;
  color: ${collectiblesStudioColors.secondary};
  margin-top: 4px;
`

const UtilityRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
  max-width: 100%;
  overflow: hidden;
`

const UtilChip = styled.span`
  height: 20px;
  padding: 0 7px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid ${collectiblesStudioColors.border};
  font-family: ${CS_FONT_BODY};
  font-size: 10px;
  color: ${collectiblesStudioColors.secondary};
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
`

const Metrics = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px 10px;
  margin-top: 10px;
`

const Metric = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`

const MetricLabel = styled.span`
  font-family: ${CS_FONT_BODY};
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${collectiblesStudioColors.label};
`

const MetricValue = styled.span`
  font-family: ${CS_FONT_BODY};
  font-size: 15px;
  font-weight: 800;
  color: ${collectiblesStudioColors.white};
`

const BindingGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px 10px;
  margin-top: 8px;
`

const BindingRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 6px;
  min-width: 0;
`

const BindingLabel = styled.span`
  font-family: ${CS_FONT_BODY};
  font-size: 10px;
  color: ${collectiblesStudioColors.label};
  white-space: nowrap;
`

const BindingValue = styled.span`
  font-family: ${CS_FONT_BODY};
  font-size: 10px;
  font-weight: 600;
  color: ${collectiblesStudioColors.secondary};
  text-align: right;
`

const BtnRow = styled.div`
  margin-top: auto;
  padding-top: 10px;
  height: 40px;
  display: flex;
  gap: 8px;
  flex-shrink: 0;
`

const ViewBtn = styled.a`
  flex: 1;
  height: 40px;
  border: none;
  border-radius: 11px;
  background: ${collectiblesStudioColors.gold};
  color: #050505;
  font-family: ${CS_FONT_BODY};
  font-size: 13px;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  cursor: pointer;
  white-space: nowrap;
  min-width: 0;
`

const IconBtn = styled.button<{ $active?: boolean }>`
  width: 40px;
  height: 40px;
  min-width: 40px;
  border-radius: 11px;
  border: 1px solid rgba(214, 180, 69, 0.65);
  background: transparent;
  color: ${collectiblesStudioColors.gold};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
`

function BindingRows({ binding }: { binding: IdentityBinding }) {
  const entries = (Object.keys(BINDING_LABELS) as Array<keyof IdentityBinding>).filter(
    (key) => binding[key] !== undefined,
  )

  if (entries.length === 0) return null

  return (
    <BindingGrid data-cs-binding-rows>
      {entries.map((key) => (
        <BindingRow key={key}>
          <BindingLabel>{BINDING_LABELS[key]}</BindingLabel>
          <BindingValue>{binding[key]}</BindingValue>
        </BindingRow>
      ))}
    </BindingGrid>
  )
}

interface Props {
  collection: CollectionCard
}

export const CollectibleGridCard: React.FC<Props> = ({ collection }) => {
  const [fav, setFav] = useState(false)
  const [reserved, setReserved] = useState(false)
  const visibleBadges = collection.badges.slice(0, 2)

  return (
    <Card data-cs-collection-card>
      <CardBody>
        <ArtWrap>
          <CsArtwork data-cs-artwork $theme={collection.artTheme} />
          <Badges>
            {visibleBadges.map((b) => {
              const c = BADGE_COLORS[b]
              return (
                <Badge key={b} $bg={c.bg} $border={c.border} $color={c.color}>
                  {BADGE_LABELS[b]}
                </Badge>
              )
            })}
            {collection.agentEnabled ? <AgentBadge>Agent Enabled</AgentBadge> : null}
          </Badges>
          <ScorePos>
            <ScoreRingDisplay score={collection.aiScore} $compact />
          </ScorePos>
        </ArtWrap>

        <Title>{collection.title}</Title>
        <IdentityLine>{collection.identityLine}</IdentityLine>
        <Creator>{collection.creator}</Creator>

        <UtilityRow>
          {collection.utilityChips.slice(0, 4).map((chip) => (
            <UtilChip key={chip}>{chip}</UtilChip>
          ))}
        </UtilityRow>

        <Metrics>
          <Metric>
            <MetricLabel>Floor</MetricLabel>
            <MetricValue>{collection.floorPrice}</MetricValue>
          </Metric>
          <Metric>
            <MetricLabel>24h Vol</MetricLabel>
            <MetricValue>{collection.volume24h}</MetricValue>
          </Metric>
          <Metric>
            <MetricLabel>Items</MetricLabel>
            <MetricValue>{collection.items}</MetricValue>
          </Metric>
        </Metrics>

        <BindingRows binding={collection.identityBinding} />
      </CardBody>

      <BtnRow>
        <ViewBtn href={`/collectibles/${collection.slug}`}>View Collection</ViewBtn>
        <IconBtn type="button" $active={fav} onClick={() => setFav(!fav)} aria-label="Favorite">
          <IconHeart filled={fav} />
        </IconBtn>
        <IconBtn type="button" $active={reserved} onClick={() => setReserved(!reserved)} aria-label="Reserve">
          <IconBookmark />
        </IconBtn>
      </BtnRow>
    </Card>
  )
}

export default CollectibleGridCard
