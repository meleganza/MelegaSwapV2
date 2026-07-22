import Link from 'next/link'
import { NextSeo } from 'next-seo'
import styled from 'styled-components'

const Wrap = styled.div`
  min-height: 100vh;
  background: #000000;
  color: #f5f5f5;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 24px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
`

const Code = styled.h1`
  margin: 0;
  font-size: 48px;
  font-weight: 700;
  line-height: 1.1;
`

const Message = styled.p`
  margin: 0;
  font-size: 16px;
  color: #9e9e9e;
`

const Brand = styled.span`
  color: #F4C430;
`

const HomeLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0 20px;
  border-radius: 10px;
  background: #F4C430;
  color: #000000;
  font-weight: 700;
  text-decoration: none;
`

const NotFoundPage = () => (
  <>
    <NextSeo title="Page not found | Melega DEX" />
    <Wrap>
      <Code>404</Code>
      <Message>
        Page not found on <Brand>Melega DEX</Brand>.
      </Message>
      <HomeLink href="/">Back to Trade</HomeLink>
    </Wrap>
  </>
)

NotFoundPage.hideMenu = true
NotFoundPage.chains = []

export default NotFoundPage
