import { NextSeo } from 'next-seo'
import { useTranslation } from '@pancakeswap/localization'
import { useRouter } from 'next/router'
import { getCustomMeta } from 'config/constants/meta'

const formatTitle = (pageMetaTitle: string) => `${pageMetaTitle} | Melega DEX`

export interface PageMetaProps {
  title?: string
  description?: string
  image?: string
}

/**
 * Route metadata must stay deterministic and network-free. Fetching a live
 * token price for the browser title pulled farms, pools, ABIs and the BSC token
 * inventory into every route before the user could interact with the page.
 */
export const PageMeta: React.FC<PageMetaProps> = ({ title, description, image }) => {
  const {
    t,
    currentLanguage: { locale },
  } = useTranslation()
  const { pathname } = useRouter()
  const routeMeta = getCustomMeta(pathname, t, locale)
  const resolvedTitle = title ?? routeMeta?.title
  const resolvedDescription = description ?? routeMeta?.description
  const resolvedImage = image ?? routeMeta?.image

  if (!resolvedTitle) return null

  return (
    <NextSeo
      title={formatTitle(resolvedTitle)}
      description={resolvedDescription}
      openGraph={
        resolvedImage
          ? {
              images: [{ url: resolvedImage, alt: resolvedTitle, type: 'image/jpeg' }],
            }
          : undefined
      }
    />
  )
}

export default PageMeta
