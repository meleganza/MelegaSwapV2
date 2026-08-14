/**
 * This page is loaded by Nextjs:
 *  - on the server, when data-fetching methods throw or reject
 *  - on the client, when `getInitialProps` throws or rejects
 *  - on the client, when a React lifecycle method throws or rejects, and it's
 *    caught by the built-in Nextjs error boundary
 *
 * See:
 *  - https://nextjs.org/docs/basic-features/data-fetching/overview
 *  - https://nextjs.org/docs/api-reference/data-fetching/get-initial-props
 *  - https://reactjs.org/docs/error-boundaries.html
 */

import { captureUnderscoreErrorException } from '@sentry/nextjs'
import NextErrorComponent, { ErrorProps } from 'next/error'
import PremiumErrorScreen from 'components/ErrorBoundary/PremiumErrorScreen'

const CustomErrorComponent = (props: ErrorProps) => (
  <PremiumErrorScreen
    code={props.statusCode ? `Error ${props.statusCode}` : 'Route interrupted'}
    title="Melega DEX could not complete this route."
    message="The request stopped before the page was ready. Return home and continue from a live destination."
  />
)

CustomErrorComponent.getInitialProps = async (contextData) => {
  // In case this is running in a serverless function, await this in order to give Sentry
  // time to send the error before the lambda exits
  await captureUnderscoreErrorException(contextData)

  // This will contain the status code of the response
  return NextErrorComponent.getInitialProps(contextData)
}

CustomErrorComponent.chains = []

export default CustomErrorComponent
