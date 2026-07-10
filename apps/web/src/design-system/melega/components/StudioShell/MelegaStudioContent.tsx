import styled from 'styled-components'
import { STUDIO_FONT_BODY, studioConstitutionColors, studioConstitutionLayout } from '../../tokens/studioConstitution'

/** R758 — canonical studio content shell (Hero → KPIs → Content rhythm). */
export const MelegaStudioContent = styled.div`
  max-width: ${studioConstitutionLayout.contentMax};
  margin: 0 auto;
  padding: ${studioConstitutionLayout.contentPaddingTop} ${studioConstitutionLayout.contentPaddingX}
    ${studioConstitutionLayout.contentPaddingBottom};
  box-sizing: border-box;
  min-width: 0;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: ${studioConstitutionLayout.sectionGap};
  color: ${studioConstitutionColors.text};
  font-family: ${STUDIO_FONT_BODY};

  @media (max-width: ${studioConstitutionLayout.mobileBreakpoint}) {
    padding: 16px 16px ${studioConstitutionLayout.mobileBottomPad};
  }
`

export default MelegaStudioContent
