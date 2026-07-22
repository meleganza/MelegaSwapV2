import React from 'react'
import styled from 'styled-components'
import Link from 'next/link'
import { PageMeta } from 'components/Layout/Page'
import {
  uxRebuildColors,
  uxRebuildFont,
  uxRebuildLayout,
  uxRebuildRadius,
  uxRebuildShadow,
} from 'design-system/melega/tokens/uxRebuild'

const Root = styled.div`
  color: ${uxRebuildColors.text};
  font-family: ${uxRebuildFont};
  background: ${uxRebuildColors.pageBg};
  min-width: 0;
  overflow-x: hidden;
`

const Content = styled.div`
  width: calc(100% - 64px);
  max-width: ${uxRebuildLayout.contentMax};
  margin: 0 auto;
  padding: 24px 0 48px;
  box-sizing: border-box;

  @media (max-width: 767px) {
    width: 100%;
    padding: 16px 16px 40px;
  }
`

const Eyebrow = styled.div`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: ${uxRebuildColors.gold};
`

const Title = styled.h1`
  margin: 10px 0 0;
  font-size: 40px;
  line-height: 46px;
  font-weight: 750;
  color: ${uxRebuildColors.text};

  @media (max-width: 767px) {
    font-size: 30px;
    line-height: 36px;
  }
`

const Subtitle = styled.p`
  margin: 10px 0 0;
  max-width: 640px;
  font-size: 15px;
  line-height: 23px;
  color: ${uxRebuildColors.secondary};
`

const Grid = styled.div`
  margin-top: 28px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;

  @media (max-width: 1023px) {
    grid-template-columns: 1fr;
  }
`

const Card = styled.section`
  min-height: 220px;
  padding: 22px;
  border-radius: ${uxRebuildRadius.card};
  background: ${uxRebuildColors.card};
  border: 1px solid ${uxRebuildColors.border};
  box-shadow: ${uxRebuildShadow.card};
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
`

const CardTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: ${uxRebuildColors.text};
`

const CardBody = styled.p`
  margin: 10px 0 0;
  flex: 1;
  font-size: 14px;
  line-height: 21px;
  color: ${uxRebuildColors.secondary};
`

const Cta = styled(Link)<{ $disabled?: boolean }>`
  margin-top: 18px;
  height: 42px;
  padding: 0 18px;
  border-radius: 10px;
  background: ${({ $disabled }) => ($disabled ? '#333' : uxRebuildColors.gold)};
  color: ${({ $disabled }) => ($disabled ? '#888' : '#080808')};
  font-size: 14px;
  font-weight: 650;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  pointer-events: ${({ $disabled }) => ($disabled ? 'none' : 'auto')};
`

const Note = styled.p`
  margin: 10px 0 0;
  font-size: 12px;
  color: ${uxRebuildColors.muted};
`

export const ListStudioScreen: React.FC = () => {
  return (
    <Root data-list-studio-screen data-ux-rebuild-list>
      <PageMeta />
      <Content>
        <Eyebrow>BUILD ON MELEGA</Eyebrow>
        <Title>List your project.</Title>
        <Subtitle>
          Import an existing token, create a project page, or launch a new token.
        </Subtitle>

        <Grid>
          <Card>
            <CardTitle>Import Existing Token</CardTitle>
            <CardBody>
              Add a token already deployed on a supported blockchain.
            </CardBody>
            <Cta href="/import-existing-token" data-testid="list-import-contract">
              Import Contract
            </Cta>
          </Card>

          <Card>
            <CardTitle>Create Project Page</CardTitle>
            <CardBody>
              Build a Melega project identity and connect verified project information.
            </CardBody>
            <Cta href="/new-project" data-testid="list-create-project">
              Create Project Page
            </Cta>
          </Card>

          <Card>
            <CardTitle>Create New Token</CardTitle>
            <CardBody>
              Launch a token, then create its project page and markets.
            </CardBody>
            <Cta href="/list" $disabled data-testid="list-create-token" aria-disabled="true">
              Create Token
            </Cta>
            <Note>Not yet available — Import and Project Page remain functional.</Note>
          </Card>
        </Grid>
      </Content>
    </Root>
  )
}

export default ListStudioScreen
