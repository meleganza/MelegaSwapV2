import React from 'react'
import styled from 'styled-components'
import { passportOne } from './passportTokens'

const Card = styled.article`
  width: ${passportOne.assetsCardW};
  height: ${passportOne.assetsCardH};
  box-sizing: border-box;
  border-radius: 12px;
  border: 1px solid ${passportOne.border};
  background: ${passportOne.card};
  padding: 14px 14px 12px;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
  flex-shrink: 0;

  @media (max-width: 1199px) {
    width: 100%;
    max-width: none;
    height: auto;
    min-height: 144px;
  }
`

const Title = styled.h3`
  margin: 0;
  font-size: 12px;
  line-height: 16px;
  font-weight: 750;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${passportOne.text};
`

const Body = styled.div`
  margin-top: 10px;
  flex: 1;
  min-height: 0;
  overflow: hidden;
`

const Status = styled.p`
  margin: 8px 0 0;
  font-size: 11px;
  line-height: 14px;
  color: ${passportOne.muted};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

export const PassportAssetCardShell: React.FC<{
  title: string
  status: string
  testId: string
  availability: string
  children: React.ReactNode
}> = ({ title, status, testId, availability, children }) => (
  <Card data-testid={testId} data-assets-availability={availability} aria-label={title}>
    <Title>{title}</Title>
    <Body>{children}</Body>
    <Status data-testid={`${testId}-status`}>{status}</Status>
  </Card>
)

export default PassportAssetCardShell
