import React from "react";
import styled from 'styled-components'
import { Image, Box } from "@pancakeswap/uikit";
import { SpinnerProps } from "./types";

const StyledImage = styled.img`
  width: 120px;
  height: 120px;
  animation: rotateImage 5s linear infinite;
  @keyframes rotateImage {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}
`

const Spinner: React.FC<React.PropsWithChildren<SpinnerProps>> = ({ size = 128 }) => {
  return (
    <Box width={size} height={size * 1.197} position="relative">
      {/* <Image
        width={size}
        height={size * 1.197}
        src="https://pancakeswap.finance/images/pancake-3d-spinner-v2.gif"
        alt="pancake-3d-spinner"
      /> */}
      <StyledImage src="/images/melega.png" alt='spinner' />
    </Box>
  );
};

export default Spinner;
