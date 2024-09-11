/* eslint-disable @typescript-eslint/no-explicit-any */
import { createElement, memo } from "react";
import { Flex } from "../Box";
import isTouchDevice from "../../util/isTouchDevice";
import DropdownMenu from "../DropdownMenu/DropdownMenu";
import MenuItem from "../MenuItem/MenuItem";
import { MenuItemsProps } from "./types";
import { ChevronDownIcon } from "../Svg";

const MenuItems: React.FC<React.PropsWithChildren<MenuItemsProps>> = ({
  items = [],
  activeItem,
  activeSubItem,
  ...props
}) => {
  return (
    <Flex flexDirection="column" px="10px" {...props}>
      {items.map(({ label, items: menuItems = [], href, icon, disabled }) => {
        const statusColor = menuItems?.find((menuItem) => menuItem.status !== undefined)?.status?.color;
        const isActive = activeItem === href;
        const linkProps = isTouchDevice() && menuItems && menuItems.length > 0 ? {} : { href };
        const Icon = icon;
        return (
          <DropdownMenu
            key={`${label}#${href}`}
            items={menuItems}
            py={1}
            activeItem={activeSubItem}
            isDisabled={disabled}
          >
            <MenuItem {...linkProps} isActive={isActive} statusColor={statusColor} isDisabled={disabled}>
              {/* {label || (icon && createElement(Icon as any, { color: isActive ? "secondary" : "textSubtle" }))} */}
              <Flex justifyContent="space-between" alignItems="center">
                <Flex alignItems="center">
                  {(icon && createElement(Icon as any, { color: isActive ? "primaryBright" : "spec", marginRight: "20px" }))}
                  {label}
                </Flex>
                {menuItems.length > 0 ? <ChevronDownIcon /> : <></>}
              </Flex>
            </MenuItem>
          </DropdownMenu>
        );
      })}
    </Flex>
  );
};

export default memo(MenuItems);
