import React from "react";
import styled, { keyframes } from "styled-components";
import { layout, space, borderRadius } from "styled-system";
import { animation as ANIMATION, SkeletonProps, SkeletonV2Props, variant as VARIANT } from "./types";
import { appearAnimation } from "../../util/animationToolkit";

const waves = keyframes`
   from {
        left: -150px;
    }
    to   {
        left: 100%;
    }
`;

const pulse = keyframes`
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
  100% {
    opacity: 1;
  }
`;

const AnimationWrapper = styled.div`
  position: relative;
  will-change: opacity;
  opacity: 0;
  animation: ${appearAnimation} 0.3s ease-in-out forwards;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    opacity: 1;
  }
`;

const SkeletonWrapper = styled.div<SkeletonProps>`
  position: relative;
  ${layout}
  ${space}
  overflow: hidden;
`;

const Root = styled.div<SkeletonProps>`
  min-height: 20px;
  display: block;
  background-color: ${({ theme }) => theme.colors.backgroundDisabled};
  border-radius: ${({ variant, theme }) =>
    variant === VARIANT.CIRCLE
      ? theme.radii.circle
      : variant === VARIANT.ROUND
      ? theme.radii.default
      : theme.radii.small};
  ${layout}
  ${space}
  ${borderRadius}
`;

const Pulse = styled(Root)`
  animation: ${pulse} 2s infinite ease-out;
  transform: translate3d(0, 0, 0);
`;

const Waves = styled(Root)`
  overflow: hidden;
  transform: translate3d(0, 0, 0);
  &:before {
    content: "";
    position: absolute;
    background-image: linear-gradient(90deg, transparent, rgba(243, 243, 243, 0.5), transparent);
    top: 0;
    left: -150px;
    height: 100%;
    width: 150px;
    animation: ${waves} 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  }
`;

const Skeleton: React.FC<React.PropsWithChildren<SkeletonProps>> = ({
  variant = VARIANT.RECT,
  animation = ANIMATION.PULSE,
  ...props
}) => {
  if (animation === ANIMATION.WAVES) {
    return <Waves variant={variant} {...props} />;
  }

  return <Pulse variant={variant} {...props} />;
};

export const SkeletonV2: React.FC<React.PropsWithChildren<SkeletonV2Props>> = ({
  variant = VARIANT.RECT,
  animation = ANIMATION.PULSE,
  isDataReady = false,
  children,
  wrapperProps,
  skeletonTop = "0",
  skeletonLeft = "0",
  width,
  height,
  mr,
  ml,
  ...props
}) => {
  return (
    <SkeletonWrapper width={width} height={height} mr={mr} ml={ml} {...wrapperProps}>
      {isDataReady ? <AnimationWrapper key="content">{children}</AnimationWrapper> : null}
      {!isDataReady ? (
        <AnimationWrapper key="skeleton" style={{ position: "absolute", top: skeletonTop, left: skeletonLeft }}>
          {animation === ANIMATION.WAVES ? (
            <Waves variant={variant} {...props} width={width} height={height} />
          ) : (
            <Pulse variant={variant} {...props} width={width} height={height} />
          )}
        </AnimationWrapper>
      ) : null}
    </SkeletonWrapper>
  );
};

export default Skeleton;
