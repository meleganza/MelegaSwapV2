import { Box, BoxProps } from '@pancakeswap/uikit'

const Container: React.FC<React.PropsWithChildren<BoxProps>> = ({ children, ...props }) => (
  <Box px={['16px', '24px', '32px']} mx="auto" maxWidth="1400px" {...props}>
    {children}
  </Box>
)

export default Container
