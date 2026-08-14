import React from "react";
import Text from "../Text/Text";
import Dropdown from "../Dropdown/Dropdown";
import Button from "../Button/Button";
import LanguageIcon from "../Svg/Icons/Language";
import MenuButton from "./MenuButton";
import { Colors } from "../../theme";
import { Language } from "./types";
import { Position } from "../Dropdown/types";
import { Scale } from "../Button/types";

interface Props {
  currentLang: string;
  langs: Language[];
  setLang: (lang: Language) => void;
  color: keyof Colors;
  dropdownPosition?: Position;
  buttonScale?: Scale;
  hideLanguage?: boolean;
}

const LangSelector: React.FC<React.PropsWithChildren<Props>> = ({
  currentLang,
  langs,
  color,
  setLang,
  dropdownPosition = "top",
  buttonScale = "md",
}) => {
  // The full language list is sizeable and this selector is present on every
  // route. Mount it only after the user shows intent to open the menu.
  const [menuMounted, setMenuMounted] = React.useState(false);

  return (
    <div
      onPointerEnter={() => setMenuMounted(true)}
      onFocusCapture={() => setMenuMounted(true)}
      onClick={() => setMenuMounted(true)}
    >
      <Dropdown
        position={dropdownPosition}
        target={
          <Button scale={buttonScale} variant="text" startIcon={<LanguageIcon color={color} width="24px" />}>
            {currentLang && <Text color={color}>{currentLang.toUpperCase()}</Text>}
          </Button>
        }
      >
        {menuMounted
          ? langs.map((lang) => (
              <MenuButton
                key={lang.locale}
                fullWidth
                onClick={() => setLang(lang)}
                // Safari fix
                style={{ minHeight: "32px", height: "auto" }}
              >
                {lang.language}
              </MenuButton>
            ))
          : null}
      </Dropdown>
    </div>
  );
};

export default React.memo(LangSelector, (prev, next) => prev.currentLang === next.currentLang);
