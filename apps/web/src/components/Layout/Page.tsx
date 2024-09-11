import styled from 'styled-components'
import { NextSeo } from 'next-seo'
import { useTranslation } from '@pancakeswap/localization'
import { useRouter } from 'next/router'
import { DEFAULT_META, getCustomMeta } from 'config/constants/meta'
import { usePriceCakeBusd } from 'state/farms/hooks'
import Container from './Container'

const StyledPage = styled(Container)`
  width: 100%;
  min-height: calc(100vh - 64px);
  padding-top: 16px;
  padding-bottom: 16px;

  ${({ theme }) => theme.mediaQueries.sm} {
    padding-top: 24px;
    padding-bottom: 24px;
  }

  ${({ theme }) => theme.mediaQueries.lg} {
    padding-top: 32px;
    padding-bottom: 32px;
  }
`

const formatTitle = (pageMetaTitle: string, cakePriceBusd?: number) =>
  `${pageMetaTitle} | Melega${cakePriceBusd ? ` | $${cakePriceBusd.toFixed(4)}` : ''}`

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
    <>
      <PageMeta />
      <StyledPage {...props}>{children}</StyledPage>
    </>
  )
}

export default Page
