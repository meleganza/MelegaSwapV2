import styled from "styled-components";
import { AtomBox, AtomBoxProps } from "@pancakeswap/ui";
import { ReactNode } from "react";
import { SwapFooter } from "./Footer";
import { pageVariants } from "./SwapWidget.css";

type SwapPageProps = AtomBoxProps & {
  removePadding?: boolean;
  hideFooterOnDesktop?: boolean;
  noMinHeight?: boolean;
  helpUrl?: string;
  helpImage?: ReactNode;
  externalText?: string;
  externalLinkUrl?: string;
};

const StyleAtomBox3 = styled(AtomBox)`
  position: absolute;
  left: 0%;
  right: 88.08%;
  top: 32.67%;
  bottom: 46.45%;

  opacity: 0.5;
`;

const StyleAtomBox4 = styled(AtomBox)`
  /* Group */

  position: absolute;
  left: 59.44%;
  top: 95.76%;

  opacity: 0.5;
`;

const StyleAtomBox5 = styled(AtomBox)`
  /* Group */

  position: absolute;
  left: 91.39%;
  right: 0%;
  top: 26.26%;
  bottom: 58.64%;

  opacity: 0.5;

`;

const StyleAtomBox6 = styled(AtomBox)`
  /* Group */

  position: absolute;
  left: 73.81%;
  top: 59.12%;
`;

const StyleAtomBox7 = styled(AtomBox)`
/* Group */

position: absolute;
left: 15.36%;
top: 0%;
`;

const StyleAtomBox8 = styled(AtomBox)`
/* Frame */

position: absolute;
left: 20%;
top: 60%;
`;

const StyleAtomBox9 = styled(AtomBox)`
/* Frame */

position: absolute;
left: 85%;
top: 35%;
`;

const StyleAtomBox1 = styled(AtomBox)`
  position: absolute;
  left: 43.97%;
  right: 8.69%;
  top: 1.35%;
  bottom: 48%;
  background: radial-gradient(50% 50% at 50% 50%, #00FFEE 0%, rgba(7, 219, 218, 0.86) 10%, rgba(21, 154, 182, 0.6) 29%, rgba(33, 100, 153, 0.39) 47%, rgba(42, 58, 130, 0.22) 63%, rgba(49, 28, 113, 0.1) 78%, rgba(53, 10, 103, 0.03) 91%, rgba(55, 4, 100, 0) 100%);
  background-blend-mode: screen;
  mix-blend-mode: screen;
  opacity: 0.5;
`;

const StyleAtomBox2 = styled(AtomBox)`
  position: absolute;
  left: 3.82%;
  right: 69.8%;
  top: 57.21%;
  bottom: -13.76%;

  background: radial-gradient(35.36% 35.36% at 50% 50%, #00D0FF 0%, rgba(10, 178, 232, 0.86) 10%, rgba(29, 126, 193, 0.6) 29%, rgba(45, 82, 159, 0.39) 47%, rgba(57, 48, 133, 0.22) 63%, rgba(66, 24, 115, 0.1) 78%, rgba(72, 9, 104, 0.03) 91%, rgba(74, 4, 100, 0) 100%) /* warning: gradient uses a rotation that is not supported by CSS and may not behave as expected */;
  background-blend-mode: screen;
  mix-blend-mode: screen;
  opacity: 0.5;
  transform: rotate(-45deg);
`;

export const SwapPage = ({
  removePadding,
  noMinHeight,
  children,
  hideFooterOnDesktop,
  helpUrl,
  helpImage,
  externalText,
  externalLinkUrl,
  ...props
}: SwapPageProps) => (
  <AtomBox className={pageVariants({ removePadding, noMinHeight })} {...props}>
    {children}
    {/* <AtomBox display="flex" flexGrow={1} /> */}
    {/* <StyleAtomBox1 />
    <StyleAtomBox2 /> */}
    {/* <StyleAtomBox3>
      <img src="/images/page/1.svg" alt="cyberglow" />
    </StyleAtomBox3>
    <StyleAtomBox4>
      <img src="/images/page/2.svg" alt="cyberglow" />
    </StyleAtomBox4>
    <StyleAtomBox5>
      <img src="/images/page/3.svg" alt="cyberglow" />
    </StyleAtomBox5>
    <StyleAtomBox6>
      <img src="/images/page/4.svg" alt="cyberglow" />
    </StyleAtomBox6>
    <StyleAtomBox7>
      <img src="/images/page/5.svg" alt="cyberglow" />
    </StyleAtomBox7> */}
    {/* <StyleAtomBox8>
      <img src="/images/page/star1.svg" alt="cyberglow" />
    </StyleAtomBox8>
    <StyleAtomBox9>
      <img src="/images/page/star2.svg" alt="cyberglow" />
    </StyleAtomBox9> */}
    {/* <AtomBox display={["block", null, null, hideFooterOnDesktop ? "none" : "block"]} width="100%"> */}
      {/* <SwapFooter
        externalText={externalText}
        externalLinkUrl={externalLinkUrl}
        helpUrl={helpUrl}
        helpImage={helpImage}
      /> */}
    {/* </AtomBox> */}
  </AtomBox>
);
