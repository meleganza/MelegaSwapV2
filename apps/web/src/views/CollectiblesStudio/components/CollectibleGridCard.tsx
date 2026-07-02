import React, { useState } from 'react'
import styled from 'styled-components'
import type { CollectionCard } from '../collectiblesStudioData'
import { BADGE_COLORS, BADGE_LABELS } from '../collectiblesStudioData'
import {
  CS_FONT_BODY,
  CS_FONT_DISPLAY,
  collectiblesStudioColors,
  collectiblesStudioLayout,
} from '../collectiblesStudioTokens'
import { IconCheck, IconHeart } from './collectiblesStudioIcons'
import {
  CsArtwork,
  CsMetricLabel,
  CsMetricValue,
  CsOutlineBtn,
  CsPrimaryBtn,
  ScoreRingDisplay,
} from './collectiblesStudioPrimitives'

const Card = styled.article`
  width: 100%;
  height: ${collectiblesStudioLayout.cardHeight};
  min-height: ${collectiblesStudioLayout.cardHeight};
  padding: 12px;
  border-radius: ${collectiblesStudioLayout.cardRadius};
  background: ${collectiblesStudioColors.panel};
  border: 1px solid ${collectiblesStudioColors.border};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
  overflow: hidden;

  @media (max-width: 767px) {
    height: auto;
    min-height: ${collectiblesStudioLayout.cardHeight};
  }
`

const ArtWrap = styled.div`
  position: relative;
  flex-shrink: 0;
`

const Badges = styled.div`
  position: absolute;
  top: 8px;
  left: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  z-index: 2;
  max-width: calc(100% - 56px);
`

const Badge = styled.span<{ $bg: string; $border: string; $color: string }>`
  height: 20px;
  padding: 0 8px;
  border-radius: 6px;
  border: 1px solid ${({ $border }) => $border};
  background: ${({ $bg }) => $bg};
  color: ${({ $color }) => $color};
  font-family: ${CS_FONT_BODY};
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  display: inline-flex;
  align-items: center;
`

const ScorePos = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 2;
`

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
`

const Title = styled.h4`
  margin: 0;
  font-family: ${CS_FONT_DISPLAY};
  font-size: 15px;
  font-weight: 700;
  color: ${collectiblesStudioColors.white};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Creator = styled.div`
  font-family: ${CS_FONT_BODY};
  font-size: 12px;
  color: ${collectiblesStudioColors.label};
`

const Metrics = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px 10px;
`

const Metric = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`

const Utilities = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
`

const UtilTag = styled.span`
  height: 20px;
  padding: 0 8px;
  border-radius: 6px;
  border: 1px solid rgba(214, 180, 69, 0.25);
  font-family: ${CS_FONT_BODY};
  font-size: 9px;
  font-weight: 600;
  color: ${collectiblesStudioColors.gold};
  display: inline-flex;
  align-items: center;
`

const BtnRow = styled.div`
  display: flex;
  gap: 8px;
  margin-top: auto;
`

const FavBtn = styled.button<{ $active?: boolean }>`
  width: ${collectiblesStudioLayout.btnFavorite};
  height: ${collectiblesStudioLayout.btnFavorite};
  min-width: ${collectiblesStudioLayout.btnFavorite};
  border-radius: 10px;
  border: 1px solid ${collectiblesStudioColors.border};
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 150ms ease;

  &:hover {
    border-color: ${collectiblesStudioColors.gold};
  }
`

interface Props {
  collection: CollectionCard
}

export const CollectibleGridCard: React.FC<Props> = ({ collection }) => {
  const [fav, setFav] = useState(false)

  return (
    <Card data-cs-collection-card>
      <ArtWrap>
        <CsArtwork data-cs-artwork $theme={collection.artTheme} />
        <Badges>
          {collection.badges.slice(0, 2).map((b) => {
            const c = BADGE_COLORS[b]
            return (
              <Badge key={b} $bg={c.bg} $border={c.border} $color={c.color}>
                {BADGE_LABELS[b]}
              </Badge>
            )
          })}
        </Badges>
        <ScorePos>
          <ScoreRingDisplay score={collection.aiScore} />
        </ScorePos>
      </ArtWrap>

      <TitleRow>
        <Title>{collection.title}</Title>
        {collection.badges.includes('verified') ? <IconCheck size={12} /> : null}
      </TitleRow>
      <Creator>{collection.creator}</Creator>

      <Metrics>
        <Metric>
          <CsMetricLabel>Floor</CsMetricLabel>
          <CsMetricValue>{collection.floorPrice}</CsMetricValue>
        </Metric>
        <Metric>
          <CsMetricLabel>24h Vol</CsMetricLabel>
          <CsMetricValue>{collection.volume24h}</CsMetricValue>
        </Metric>
        <Metric>
          <CsMetricLabel>Items</CsMetricLabel>
          <CsMetricValue>{collection.items}</CsMetricValue>
        </Metric>
      </Metrics>

      <Utilities>
        {collection.utilities.slice(0, 2).map((u) => (
          <UtilTag key={u}>{u}</UtilTag>
        ))}
      </Utilities>

      <BtnRow>
        <CsPrimaryBtn
          as="a"
          href={`/collectibles/${collection.slug}`}
          $width={collectiblesStudioLayout.btnViewW}
          $height={collectiblesStudioLayout.btnViewH}
          style={{ flex: 1 }}
        >
          View
        </CsPrimaryBtn>
        <FavBtn type="button" $active={fav} onClick={() => setFav(!fav)} aria-label="Favorite">
          <IconHeart filled={fav} />
        </FavBtn>
      </BtnRow>
    </Card>
  )
}

export default CollectibleGridCard
