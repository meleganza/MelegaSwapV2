import React, { ReactNode, createElement, useState } from "react";
import styled from "styled-components";
import { MENU_HEIGHT } from "../config";
import { LinkLabel, MenuEntry } from "./MenuEntry";
import { PushedProps } from "../types";
import { ArrowDropDownIcon, ArrowDropUpIcon, LanguageCurrencyIcon, OpenNewIcon } from "../../../components/Svg";
import MenuItem from "../../../components/MenuItem";
import { Colors } from "../../../theme";
import { Box } from "../../../components";

interface Props extends PushedProps {
  label: string;
  href: string;
  statusColor: keyof Colors | undefined;
  isDisabled?: boolean;
  icon: React.ElementType | undefined;
  initialOpenState?: boolean;
  className?: string;
  children: ReactNode;
  isActive?: boolean;
  hasSubItems: boolean;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  // Safari fix
  flex-shrink: 0;
`;

const AccordionContent = styled.div<{ isOpen: boolean; isPushed: boolean; maxHeight: number }>`
  max-height: ${({ isOpen, maxHeight }) => (isOpen ? `${maxHeight}px` : 0)};
  transition: max-height 0.3s ease-out;
  overflow: hidden;
  // border-color: ${({ isOpen, isPushed }) => (isOpen && isPushed ? "rgba(133, 133, 133, 0.1)" : "transparent")};
  // border-style: solid;
  border-width: 1px 0;
`;

const Accordion: React.FC<Props> = ({
  label,
  href,
  statusColor,
  isDisabled,
  icon,
  isPushed,
  pushNav,
  children,
  className,
  isActive,
  hasSubItems,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    if (isPushed) {
      setIsOpen((prevState) => !prevState);
    } else {
      pushNav(true);
      setIsOpen(true);
    }
  };

  let iconWidth = "20px"
  let mRight = "20px"

  switch (href) {
    case '/funds':
      iconWidth = "24px"
      mRight = "24px"
      break
    case '/multisender':
      iconWidth = "24px"
      mRight = "24px"
      break
    case '/token':
      iconWidth = "24px"
      mRight = "24px"
      break
    case '/launchpad':
      iconWidth = "24px"
      mRight = "24px"
      break
    // case '/tumbler':
    //   iconWidth = "16px"
    //   break
    default:
      iconWidth = "24px"
      mRight = "24px"
      break
  }

  return (
    <Container>
      <MenuEntry onClick={handleClick} className={className} isActive={isActive}>
        {(icon && createElement(icon as any, { color: isActive ? "primaryBright" : "textSubtle", marginRight: mRight, width: iconWidth }))}
        {hasSubItems ? <LinkLabel isActive={isActive}>{label}</LinkLabel>
         : 
         <MenuItem href={href} variant="default" isActive={isActive} statusColor={statusColor} isDisabled={isDisabled}>
          {label}
        </MenuItem>}
        {hasSubItems && (isOpen ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />)}
        {/* {href === "/home" && <Box display="flex" style={{ alignItems: "center" }} ml="4px">
          <OpenNewIcon color="text" width="16px" />
        </Box>} */}
        {href === "/bridge" && <Box display="flex" style={{ alignItems: "center" }} ml="4px">
          <OpenNewIcon color="text" width="16px" />
        </Box>}
      </MenuEntry>
      <AccordionContent
        isOpen={isOpen}
        isPushed={isPushed}
        maxHeight={React.Children.count(children) * MENU_HEIGHT}
      >
        {children}
      </AccordionContent>
    </Container>
  );
};

export default Accordion;
