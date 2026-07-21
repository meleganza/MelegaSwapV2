import React from 'react'
import { useRouter } from 'next/router'
import styled from 'styled-components'
import { IT_FONT_BODY, IT_FONT_DISPLAY, importTokenColors } from '../importTokenTokens'

const Wrap = styled.header`
  margin-bottom: 4px;
`

const Title = styled.h1`
  margin: 0;
  font-family: ${IT_FONT_DISPLAY};
  font-size: 40px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: ${importTokenColors.white};
  line-height: 1.1;

  @media (max-width: 768px) {
    font-size: 32px;
  }
`

const Subtitle = styled.p`
  margin: 10px 0 0;
  max-width: 720px;
  font-family: ${IT_FONT_BODY};
  font-size: 16px;
  line-height: 26px;
  color: ${importTokenColors.subtitle};
`

const ClaimNote = styled.p`
  margin: 12px 0 0;
  max-width: 720px;
  font-family: ${IT_FONT_BODY};
  font-size: 14px;
  line-height: 1.5;
  color: ${importTokenColors.gold};
`

export const ImportPageHeader: React.FC = () => {
  const router = useRouter()
  const claimMode = router.query.mode === 'claim'

  return (
    <Wrap data-iet-page-header>
      <Title>{claimMode ? 'CLAIM EXISTING PROJECT' : 'IMPORT EXISTING TOKEN'}</Title>
      <Subtitle>
        {claimMode
          ? 'Import the project contract first, then open the Project Page and use Manage Project (authenticated owners).'
          : 'Bring your existing project into the Melega Civilization.'}
        <br />
        {claimMode
          ? 'Claim does not invent wallet ownership — Control Center verification remains the certified path.'
          : 'AI will discover, verify and prepare your economic infrastructure.'}
      </Subtitle>
      {claimMode ? (
        <ClaimNote>
          After discovery, open <a href="/@melega-dex/">/@melega-dex/</a> (or your project slug) and use Manage
          Project when you have operator access.
        </ClaimNote>
      ) : null}
    </Wrap>
  )
}

export default ImportPageHeader
