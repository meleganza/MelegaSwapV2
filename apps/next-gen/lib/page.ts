import type { GetServerSideProps } from 'next'

export const getBetaPageProps: GetServerSideProps = async ({ res }) => {
  res.setHeader('Cache-Control', 'private, no-store')
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet')
  res.setHeader('X-Melega-Surface', 'next-gen-beta')
  return { props: {} }
}
