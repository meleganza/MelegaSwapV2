import React from 'react'
import { Flex, Text, Button, Link, Heading } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import CompositeImage, { CompositeImageProps } from '../CompositeImage'
import PurpleWordHeading from '../PurpleWordHeading'

interface SalesSectionButton {
  to: string
  text: string
  external: boolean
}

export interface SalesSectionProps {
  headingText: string
  bodyText: string
  reverse: boolean
  primaryButton: SalesSectionButton
  images: CompositeImageProps
}

const SalesSection: React.FC<SalesSectionProps> = (props) => {
  const { t } = useTranslation()

  const { headingText, bodyText, reverse, primaryButton, images } = props

  const headingTranslatedText = t(headingText)
  const bodyTranslatedText = t(bodyText)

  return (
    <Flex style={{ marginLeft: '1.5rem', marginRight: '1.5rem' }} flexDirection="column">
      <Flex
        flexDirection={['column-reverse', null, null, reverse ? 'row-reverse' : 'row']}
        alignItems={['flex-end', null, null, 'center']}
        justifyContent="center"
      >
        <Flex
          flexDirection="column"
          flex="1"
          ml={[null, null, null, reverse && '64px']}
          mr={[null, null, null, !reverse && '64px']}
          alignSelf={['flex-start', null, null, 'center']}
        >
          <PurpleWordHeading text={headingTranslatedText} />
          <br />
          <Text color="#fff" mb="24px">
            {bodyTranslatedText}
          </Text>
          <Flex>
            <Link mr="16px" external={primaryButton.external} href={primaryButton.to}>
              <Button>
                <Text color="#000" bold fontSize="16px">
                  {t(primaryButton.text)}
                </Text>
              </Button>
            </Link>
          </Flex>
        </Flex>
        <Flex
          height={['192px', null, null, '100%']}
          width={['192px', null, null, '100%']}
          flex={[null, null, null, '1']}
          mb={['24px', null, null, '0']}
        >
          <CompositeImage {...images} />
        </Flex>
      </Flex>
    </Flex>
  )
}

export default SalesSection
