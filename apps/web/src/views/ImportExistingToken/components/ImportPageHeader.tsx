import React from 'react'
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

export const ImportPageHeader: React.FC = () => (
  <Wrap data-iet-page-header>
    <Title>IMPORT EXISTING TOKEN</Title>
    <Subtitle>
      Bring your existing project into the Melega Civilization.
      <br />
      AI will discover, verify and prepare your economic infrastructure.
    </Subtitle>
  </Wrap>
)

export default ImportPageHeader
