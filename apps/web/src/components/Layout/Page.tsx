import styled from 'styled-components'
import { NextSeo } from 'next-seo'
import { useTranslation } from '@pancakeswap/localization'
import { useRouter } from 'next/router'
import { getCustomMeta } from 'config/constants/meta'
import { usePriceCakeBusd } from 'state/farms/hooks'
import { melegaOperational as tokens } from 'ui/tokens'
import Container from './Container'

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

const formatTitle = (pageMetaTitle: string, cakePriceBusd?: number) =>
  `${pageMetaTitle} | Melega DEX${cakePriceBusd ? ` | $${cakePriceBusd.toFixed(4)}` : ''}`

export const PageMeta: React.FC<React.PropsWithChildren> = () => {
  const {
    t,
    currentLanguage: { locale },
  } = useTranslation()
  const { pathname } = useRouter()
  const cakePriceBusd = usePriceCakeBusd()

  const pageMeta = getCustomMeta(pathname, t, locale)

  if (!pageMeta) {
    return null
  }

  const title = formatTitle(pageMeta.title, cakePriceBusd?.toNumber())

  return (
    <NextSeo
      title={title}
      description={pageMeta.description}
      openGraph={
        pageMeta.image
          ? {
              images: [{ url: pageMeta.image, alt: pageMeta?.title, type: 'image/jpeg' }],
            }
          : undefined
      }
    />
  )
}

const Page: React.FC<React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>> = ({ children, ...props }) => {
  return (
    <PageRoot>
      <PageMeta />
      <StyledPage {...props}>{children}</StyledPage>
    </PageRoot>
  )
}

export default Page
