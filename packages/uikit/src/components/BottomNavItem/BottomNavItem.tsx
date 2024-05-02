import React, { useContext } from "react";
import { MenuContext } from "../../widgets/Menu/context";
import { Flex } from "../Box";
import AnimatedIconComponent from "../Svg/AnimatedIconComponent";
import { StyledBottomNavItem, StyledBottomNavText } from "./styles";
import { BottomNavItemProps } from "./types";

const BottomNavItem: React.FC<React.PropsWithChildren<BottomNavItemProps>> = ({
  label,
  icon,
  fillIcon,
  href,
  showItemsOnMobile = false,
  isActive = false,
  disabled = false,
  ...props
}) => {
  const { linkComponent } = useContext(MenuContext);
  const bottomNavItemContent = (
    <Flex flexDirection="column" justifyContent="center" alignItems="center" height="100%">
      {icon && (
        <AnimatedIconComponent
          icon={icon}
          fillIcon={fillIcon}
          height="22px"
          width="21px"
          color={isActive ? "secondary" : "textSubtle"}
          isActive={isActive}
          activeBackgroundColor="backgroundAlt"
        />
      )}
      <StyledBottomNavText
        color={isActive ? "text" : "textSubtle"}
        fontWeight={isActive ? "600" : "400"}
        fontSize="10px"
      >
        {label}
      </StyledBottomNavText>
    </Flex>
  );

  const link = href === "/docs" ? "https://docs.cyberglow.finance/" : (href === "/ifo" ? "https://www.pinksale.finance/launchpad/0xfF99F5d8d6a723907AC4d8c4bec298573b848c24?chain=Arbitrum" : href);
  const target = href === "/docs"? "_blank" : (href === "/ifo"? "_blank" : "");

  return showItemsOnMobile ? (
    <StyledBottomNavItem style={{ opacity: disabled ? 0.5 : 1 }} type="button" {...props}>
      {bottomNavItemContent}
    </StyledBottomNavItem>
  ) : (
    <StyledBottomNavItem style={{ opacity: disabled ? 0.5 : 1 }} as={linkComponent} href={link} target={target} {...props}>
      {bottomNavItemContent}
    </StyledBottomNavItem>
  );
};

export default BottomNavItem;
