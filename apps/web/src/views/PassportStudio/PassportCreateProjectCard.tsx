import React from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import { passportOne } from './passportTokens'

const Card = styled.div`
  width: ${passportOne.projectsCardW};
  height: ${passportOne.projectsCardH};
  box-sizing: border-box;
  border-radius: 12px;
  border: 1px dashed rgba(221, 185, 47, 0.45);
  background: rgba(221, 185, 47, 0.04);
  padding: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-width: 0;
  flex-shrink: 0;
  text-align: center;

  @media (max-width: 1199px) {
    width: 100%;
    max-width: none;
    height: auto;
    min-height: 144px;
  }
`

const Plus = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1px dashed rgba(221, 185, 47, 0.5);
  color: ${passportOne.gold};
  font-size: 22px;
  line-height: 34px;
  font-weight: 400;
`

const Title = styled.div`
  font-size: 13px;
  line-height: 18px;
  font-weight: 750;
  color: ${passportOne.text};
`

const Cta = styled(Link)`
  height: 36px;
  min-width: 140px;
  padding: 0 14px;
  border-radius: 9px;
  border: 1px solid rgba(221, 185, 47, 0.55);
  background: linear-gradient(180deg, #e8ca57 0%, #ddb92f 100%);
  color: #090909;
  font-size: 12px;
  line-height: 16px;
  font-weight: 750;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;

  &:focus-visible {
    outline: 2px solid ${passportOne.gold};
    outline-offset: 2px;
  }
`

export const PassportCreateProjectCard: React.FC = () => (
  <Card data-testid="passport-create-project-card">
    <Plus aria-hidden="true">+</Plus>
    <Title>Create New Project</Title>
    <Cta href="/list?intent=create-project" data-testid="passport-create-project-cta">
      Create Project
    </Cta>
  </Card>
)

export default PassportCreateProjectCard
