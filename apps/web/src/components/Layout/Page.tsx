import styled from 'styled-components'
import { melegaOperational as tokens } from 'ui/tokens'
import Container from './Container'
import PageMeta from './PageMeta'

export { PageMeta } from './PageMeta'

const PageRoot = styled.div`
  width: 100%;
  min-height: calc(100vh - 64px);
  background: ${tokens.bg};
  color: ${tokens.text};
`

const StyledPage = styled(Container)`
  width: 100%;
  padding-top: 20px;
  padding-bottom: 48px;

  ${({ theme }) => theme.mediaQueries.sm} {
    padding-top: 28px;
    padding-bottom: 56px;
  }

  ${({ theme }) => theme.mediaQueries.lg} {
    padding-top: 36px;
    padding-bottom: 64px;
  }
`

const Page: React.FC<React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>> = ({ children, ...props }) => {
  return (
    <PageRoot>
      <PageMeta />
      <StyledPage {...props}>{children}</StyledPage>
    </PageRoot>
  )
}

export default Page
