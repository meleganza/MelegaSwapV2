import React from 'react'
import styled from 'styled-components'
import { PageMeta } from 'components/Layout/Page'
import { uxRebuildColors, uxRebuildFont } from 'design-system/melega/tokens/uxRebuild'
import { ListWorkspace } from './ListWorkspace'
import { listOne } from './listTokens'
import { useListIntent } from './useListIntent'
import { ListContractFirstFunnel } from './ListContractFirstFunnel'

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
  padding: 24px 0 52px;

  @media (max-width: 767px) {
    width: 100%;
    padding: 0 4px 40px;
  }
`

const ModalBackdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 10020;
  display: grid;
  place-items: center;
  padding: 18px;
  background: rgba(0, 0, 0, 0.76);
  backdrop-filter: blur(12px);
`

const ModalSurface = styled.div`
  width: min(1120px, 100%);
  max-height: min(860px, calc(100vh - 36px));
  overflow: auto;
  border-radius: 18px;
  box-shadow: 0 30px 110px rgba(0, 0, 0, 0.7);

  & [data-testid='list-workspace'] {
    width: 100%;
    max-width: none;
    min-height: min(720px, calc(100vh - 36px));
    margin: 0;
  }
`

export const ListStudioScreen: React.FC = () => {
  const { listIntent } = useListIntent()
  return (
    <Root data-list-studio-screen data-ux-rebuild-list data-list-concept="list-your-project">
      <PageMeta />
      <Content data-testid="list-one-content">
        <ListContractFirstFunnel />
      </Content>
      {listIntent ? (
        <ModalBackdrop data-testid="list-adaptive-modal" role="presentation">
          <ModalSurface role="dialog" aria-modal="true" aria-label="Melega DEX listing flow">
            <ListWorkspace />
          </ModalSurface>
        </ModalBackdrop>
      ) : null}
    </Root>
  )
}

export default ListStudioScreen
