import React from 'react'
import { Heading, TextProps } from '@pancakeswap/uikit'
import useTheme from 'hooks/useTheme'

interface HeadingProps extends TextProps {
  text: string
}

const PurpleWordHeading: React.FC<HeadingProps> = ({ text, ...props }) => {
  const { theme } = useTheme()
 
  const firstWord = text.substring(0,6)
  const remainingWords = text.substring(6)
  return (
    <Heading scale="xl" mb="10px" {...props}>
      {firstWord}<span style={{ color: "#ddd" }}>{remainingWords}</span>
      
    </Heading>
  )
}

export default PurpleWordHeading
