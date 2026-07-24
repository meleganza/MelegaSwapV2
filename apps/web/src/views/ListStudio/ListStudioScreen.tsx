/**
 * List Studio — MODULE_001–005 introductory rails + unified workspace.
 * Workflow content stays inside ListWorkspace (no separate routes).
 */
import React from 'react'
import styled from 'styled-components'
import { PageMeta } from 'components/Layout/Page'
import { uxRebuildColors, uxRebuildFont } from 'design-system/melega/tokens/uxRebuild'
import { ListPageHero } from './ListPageHero'
import { ListActionCards } from './ListActionCards'
import { ListWhyBuildRail } from './ListWhyBuildRail'
import { ListHowItWorks } from './ListHowItWorks'
import { ListWorkspace } from './ListWorkspace'
import { listOne } from './listTokens'

const Root = styled.div`
  color: ${uxRebuildColors.text};
  font-family: ${uxRebuildFont};
  background: ${listOne.pageBg};
  padding: 0;
  min-width: 0;
  overflow-x: hidden;
`

const Content = styled.div`
  /*
   * App shell <main> already supplies horizontal page padding (32px @ ≥1024).
   * Fill to 1376 — required for Hero 1376×360 with 32px side margins.
   *
   * Flex order: Hero → Cards → Why → How → Workspace
   * Module 002 placeholder is visually retired (display:none) so MODULE_005
   * owns the workspace surface without editing ListActionCards.tsx.
   */
  max-width: ${listOne.contentMax};
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
  min-width: 0;
  overflow-x: hidden;
  padding-bottom: 48px;
  display: flex;
  flex-direction: column;

  & > [data-testid='list-one-page-header'] {
    order: 1;
  }

  & > [data-testid='list-action-cards'] {
    order: 2;
  }

  & > [data-testid='list-why-build'] {
    order: 3;
  }

  & > [data-testid='list-how-it-works'] {
    order: 4;
  }

  & > [data-testid='list-workspace'] {
    order: 5;
  }

  & > [data-testid='list-intent-placeholder'] {
    order: 6;
    display: none !important;
  }

  @media (max-width: 767px) {
    width: 100%;
    /* Shell pads ~12px; add 4px → ~16px page inset (358 @ 390) */
    padding: 0 4px 40px;
  }
`

export const ListStudioScreen: React.FC = () => {
  return (
    <Root data-list-studio-screen data-ux-rebuild-list data-list-module="005">
      <PageMeta />
      <Content data-testid="list-one-content">
        <ListPageHero />
        <ListActionCards />
        <ListWhyBuildRail />
        <ListHowItWorks />
        <ListWorkspace />
      </Content>
    </Root>
  )
}

export default ListStudioScreen
