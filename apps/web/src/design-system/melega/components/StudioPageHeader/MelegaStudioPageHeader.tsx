import React from 'react'
import styled, { keyframes } from 'styled-components'
import {
  STUDIO_FONT_BODY,
  STUDIO_FONT_DISPLAY,
  studioConstitutionColors,
  studioConstitutionLayout,
} from '../../tokens/studioConstitution'

const livePulse = keyframes`
  0%, 100% { opacity: 0.45; }
  50% { opacity: 1; }
`

const Shell = styled.header<{ $withMedia?: boolean }>`
  display: grid;
  grid-template-columns: ${({ $withMedia }) =>
    $withMedia ? 'minmax(0, 1fr) minmax(260px, 40%)' : 'minmax(0, 1fr) auto'};
  align-items: start;
  gap: ${studioConstitutionLayout.heroRowGap};
  min-height: ${studioConstitutionLayout.heroMinHeight};
  margin-bottom: ${studioConstitutionLayout.heroMarginBottom};
  min-width: 0;
  box-sizing: border-box;

  @media (max-width: ${studioConstitutionLayout.mobileBreakpoint}) {
    grid-template-columns: 1fr;
    min-height: 0;
  }
`

const Left = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${studioConstitutionLayout.heroInnerGap};
  min-width: 0;
  justify-content: center;
`

const Title = styled.h1`
  margin: 0;
  font-family: ${STUDIO_FONT_DISPLAY};
  font-size: ${studioConstitutionLayout.heroTitleSize};
  font-weight: 700;
  line-height: ${studioConstitutionLayout.heroTitleLineHeight};
  letter-spacing: -0.02em;
  color: ${studioConstitutionColors.text};
  text-transform: none;

  @media (max-width: ${studioConstitutionLayout.mobileBreakpoint}) {
    font-size: ${studioConstitutionLayout.heroTitleSizeMobile};
  }
`

const Subtitle = styled.div`
  margin: 0;
  max-width: ${studioConstitutionLayout.heroSubtitleMaxWidth};
  font-family: ${STUDIO_FONT_BODY};
  font-size: ${studioConstitutionLayout.heroSubtitleSize};
  font-weight: 400;
  line-height: ${studioConstitutionLayout.heroSubtitleLineHeight};
  color: ${studioConstitutionColors.subtitle};
`

const Right = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  gap: ${studioConstitutionLayout.heroActionsGap};
  flex-shrink: 0;
  flex-wrap: wrap;

  @media (max-width: ${studioConstitutionLayout.mobileBreakpoint}) {
    justify-content: flex-start;
    width: 100%;
  }
`

const Media = styled.div`
  min-width: 0;
  align-self: stretch;

  @media (max-width: ${studioConstitutionLayout.mobileBreakpoint}) {
    width: 100%;
  }
`

const Footer = styled.div`
  grid-column: 1 / -1;
  min-width: 0;
`

export const MelegaStudioLiveBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: ${studioConstitutionLayout.badgeHeight};
  padding: 0 14px;
  border-radius: ${studioConstitutionLayout.badgeRadius};
  border: 1px solid ${studioConstitutionColors.green};
  background: rgba(27, 231, 122, 0.08);
  color: ${studioConstitutionColors.green};
  font-family: ${STUDIO_FONT_BODY};
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  white-space: nowrap;
  gap: 6px;
  flex-shrink: 0;
`

export const MelegaStudioLiveDot = styled.span`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: ${studioConstitutionColors.green};
  animation: ${livePulse} 4s linear infinite;
`

export interface MelegaStudioPageHeaderProps {
  title: string
  subtitle?: React.ReactNode
  belowSubtitle?: React.ReactNode
  actions?: React.ReactNode
  badge?: React.ReactNode
  media?: React.ReactNode
  footer?: React.ReactNode
  'data-studio-header'?: string
}

export const MelegaStudioPageHeader: React.FC<MelegaStudioPageHeaderProps> = ({
  title,
  subtitle,
  belowSubtitle,
  actions,
  badge,
  media,
  footer,
  'data-studio-header': dataAttr,
}) => (
  <Shell data-studio-page-header={dataAttr ?? true} $withMedia={Boolean(media)}>
    <Left>
      <Title>{title}</Title>
      {subtitle ? <Subtitle>{subtitle}</Subtitle> : null}
      {belowSubtitle}
    </Left>
    {media ? <Media>{media}</Media> : null}
    {(actions || badge) && !media ? (
      <Right>
        {badge}
        {actions}
      </Right>
    ) : null}
    {(actions || badge) && media ? (
      <Right>
        {badge}
        {actions}
      </Right>
    ) : null}
    {footer ? <Footer>{footer}</Footer> : null}
  </Shell>
)

export default MelegaStudioPageHeader
