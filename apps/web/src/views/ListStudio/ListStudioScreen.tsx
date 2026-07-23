/**
 * List Studio — MODULE_001 hero only.
 * Import / Create / Claim / AI / workflow modules are intentionally not mounted.
 */
import React from 'react'
import styled from 'styled-components'
import { PageMeta } from 'components/Layout/Page'
import { uxRebuildColors, uxRebuildFont } from 'design-system/melega/tokens/uxRebuild'
import { ListPageHero } from './ListPageHero'
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
   */
  max-width: ${listOne.contentMax};
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
  min-width: 0;
  overflow-x: hidden;
  padding-bottom: 48px;

  @media (max-width: 767px) {
    width: 100%;
    /* Shell pads ~12px; add 4px → ~16px page inset for Hero (358 @ 390) */
    padding: 0 4px 40px;
  }
`

export const ListStudioScreen: React.FC = () => {
  return (
    <Root data-list-studio-screen data-ux-rebuild-list data-list-module="001">
      <PageMeta />
      <Content data-testid="list-one-content">
        <ListPageHero />
      </Content>
    </Root>
  )
}

export default ListStudioScreen
