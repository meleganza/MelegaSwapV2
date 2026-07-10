import styled from 'styled-components'
import {
  STUDIO_FONT_BODY,
  studioConstitutionColors,
  studioConstitutionLayout,
} from '../../tokens/studioConstitution'

/** R758 — canonical studio card/panel shell (radius, padding, border, hover). */
export const MelegaStudioPanel = styled.div<{ $height?: string; $padding?: string }>`
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  background: ${studioConstitutionColors.card};
  border: ${studioConstitutionLayout.cardBorder};
  border-radius: ${studioConstitutionLayout.cardRadius};
  padding: ${({ $padding }) => $padding || studioConstitutionLayout.cardPadding};
  overflow: hidden;
  box-shadow: ${studioConstitutionLayout.cardShadow};
  transition: border-color ${studioConstitutionLayout.hoverTransition} ease,
    box-shadow ${studioConstitutionLayout.hoverTransition} ease,
    transform ${studioConstitutionLayout.hoverTransition} ease;
  ${({ $height }) =>
    $height
      ? `
    height: ${$height};
    min-height: ${$height};
  `
      : ''}

  &:hover {
    border-color: ${studioConstitutionColors.cardBorderHover};
    box-shadow: ${studioConstitutionLayout.cardShadowHover};
    transform: ${studioConstitutionLayout.cardHoverLift};
  }
`

export const MelegaStudioPanelTitle = styled.h2`
  margin: 0 0 14px;
  font-family: ${STUDIO_FONT_BODY};
  font-size: 18px;
  font-weight: 800;
  line-height: 1.2;
  color: ${studioConstitutionColors.text};
`

export default MelegaStudioPanel
