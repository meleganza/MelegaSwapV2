import React, { useEffect, useRef } from 'react';
import styled from "styled-components";
import PanelBody from "./PanelBody";
import PanelFooter from "./PanelFooter";
import { SIDEBAR_WIDTH_REDUCED, SIDEBAR_WIDTH_FULL } from "../config";
import { PanelProps, PushedProps } from "../types";

interface Props extends PanelProps, PushedProps {
  showMenu: boolean;
  isMobile: boolean;
}

const StyledPanel = styled.div<{ isPushed: boolean; showMenu: boolean }>`
  position: fixed;
  // padding-top: ${({ showMenu }) => (showMenu ? "80px" : 0)};
  top: ${({ showMenu }) => (showMenu ? "85px" : "25px")};
  left: 0px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex-shrink: 0;
  padding-top: 10px;
  // background-color: ${({ theme }) => theme.nav.background};
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  // box-shadow: ${({ theme }) => theme.shadows.var};
  border-radius: 12px;
  width: ${({ isPushed }) => (isPushed ? `${SIDEBAR_WIDTH_FULL}px` : 0)};
  height: ${({ showMenu }) => (showMenu ? `calc(100vh - 110px)` : `calc(100vh - 50px)`)};
  transition: padding-top 0.2s, width 0.2s;
  border-right: ${({ isPushed }) => (isPushed ? "2px solid rgba(133, 133, 133, 0.1)" : 0)};
  z-index: 11;
  overflow: ${({ isPushed }) => (isPushed ? "initial" : "hidden")};
  transform: translate3d(0, 0, 0);

  ${({ theme }) => theme.mediaQueries.lg} {
    border-right: 2px solid rgba(133, 133, 133, 0.1);
    width: ${({ isPushed }) => `${isPushed ? SIDEBAR_WIDTH_FULL : SIDEBAR_WIDTH_REDUCED}px`};
  }
`;

const Panel: React.FC<Props> = (props) => {
  const { isPushed, showMenu, pushNav } = props;

  const [mobile, setMobile] = React.useState(false);

  useEffect(() => {
    const handleResize = () => {
     setMobile(window.innerWidth < 968)
    }
  
    handleResize();
  
    window.addEventListener('resize', handleResize);
  
    // Clean up the event listener on unmount
    return () => {
     window.removeEventListener('resize', handleResize);
    }
  }, []);

  return (
    <>
      {mobile ? ( // isMobile does not work for this purpose
        <StyledPanel isPushed={isPushed} showMenu={showMenu} onClick={() => pushNav(false)}>
          <PanelBody {...props} />
          <PanelFooter {...props} />
        </StyledPanel>
      ) : (
        <StyledPanel isPushed={isPushed} showMenu={showMenu} onClick={() => pushNav(true)}>
          <PanelBody {...props} />
          <PanelFooter {...props} />
        </StyledPanel>
      )}
    </>
  );
};

export default Panel;