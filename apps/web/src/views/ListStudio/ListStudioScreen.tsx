/**
 * List Studio — Wave 04A composition.
 * Hero → Action cards → Why → Workspace row (How compact + Completion surface).
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

  & > [data-testid='list-workflow-bridge'] {
    order: 4;
  }

  & > [data-testid='list-intent-placeholder'] {
    order: 5;
    display: none !important;
  }

  @media (max-width: 767px) {
    width: 100%;
    padding: 0 4px 40px;
  }
`

const WorkflowBridge = styled.div`
  order: 4;
  margin-top: 20px;
  display: grid;
  grid-template-columns: minmax(0, 0.42fr) minmax(0, 0.58fr);
  gap: 14px;
  align-items: stretch;
  min-width: 0;

  @media (max-width: 1023px) {
    grid-template-columns: 1fr;
  }
`

const WorkspaceCol = styled.div`
  min-width: 0;

  & [data-testid='list-workspace'] {
    margin-top: 0;
    max-width: none;
    width: 100%;
  }
`

export const ListStudioScreen: React.FC = () => {
  return (
    <Root data-list-studio-screen data-ux-rebuild-list data-list-module="005" data-list-wave="04a">
      <PageMeta />
      <Content data-testid="list-one-content">
        <ListPageHero />
        <ListActionCards />
        <ListWhyBuildRail />
        <WorkflowBridge data-testid="list-workflow-bridge" data-list-connect="actions-to-workspace">
          <ListHowItWorks />
          <WorkspaceCol>
            <ListWorkspace />
          </WorkspaceCol>
        </WorkflowBridge>
      </Content>
    </Root>
  )
}

export default ListStudioScreen
