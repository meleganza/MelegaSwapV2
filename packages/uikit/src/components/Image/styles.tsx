import styled from "styled-components";
import { variant as StyledSystemVariant } from "styled-system";
import { ImageProps, Variant, variants } from "./types";
import TokenImage from "./TokenImage";

interface StyledImageProps extends ImageProps {
  variant: Variant;
}

export const StyledPrimaryImage = styled(TokenImage)<StyledImageProps>`
  position: absolute;
  width: ${({ variant }) =>
    variant === variants.DEFAULT ? "90%" : "80%"}; // 92, 82 are arbitrary numbers to fit the variant

  ${StyledSystemVariant({
    variants: {
      [variants.DEFAULT]: {
        bottom: "auto",
        left: 0,
        right: "auto",
        top: 0,
        zIndex: 5,
      },
      [variants.INVERTED]: {
        bottom: "-16px",
        left: "auto",
        right: 0,
        top: "auto",
        zIndex: 6,
      },
    },
  })}
`;

export const StyledSecondaryImage = styled(TokenImage)<StyledImageProps>`
  position: absolute;
  width: 60%;

  ${StyledSystemVariant({
    variants: {
      [variants.DEFAULT]: {
        bottom: "-50%",
        left: "auto",
        right: 0,
        top: "auto",
        zIndex: 6,
      },
      [variants.INVERTED]: {
        bottom: "auto",
        left: 0,
        right: "auto",
        top: 0,
        zIndex: 5,
      },
    },
  })}
`;
