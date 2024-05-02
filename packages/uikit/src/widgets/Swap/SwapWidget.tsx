import { ButtonProps, IconButton } from "../../components/Button";
import { ArrowDownIcon, ArrowUpDownIcon } from "../../components/Svg";
import { switchButtonClass, iconDownClass, iconUpDownClass } from "./SwapWidget.css";
import { CurrencyInputPanel } from "./CurrencyInputPanel";
import { CurrencyInputHeader, CurrencyInputHeaderSubTitle, CurrencyInputHeaderTitle } from "./CurrencyInputHeader";
import { SwapPage } from "./Page";
import { SwapFooter } from "./Footer";
import { SwapInfo, SwapInfoLabel } from "./SwapInfo";
import { TradePrice } from "./TradePrice";

// type Variant = "text" | "success" | "danger" | "light" | "secondary" | "tertiary" | "primary" | "spec" | "spec1" | "subtle" | "bubblegum"

const SwapSwitchButton = (props: ButtonProps) => (
  <IconButton className={switchButtonClass} variant="text" scale="sm" {...props}>
    <ArrowDownIcon className={iconDownClass} color="primary" />
    <ArrowUpDownIcon className={iconUpDownClass} color="primary" />
  </IconButton>
);

const Swap = {
  SwitchButton: SwapSwitchButton,
  CurrencyInputHeaderTitle,
  CurrencyInputHeaderSubTitle,
  CurrencyInputHeader,
  CurrencyInputPanel,
  Page: SwapPage,
  Footer: SwapFooter,
  Info: SwapInfo,
  InfoLabel: SwapInfoLabel,
  TradePrice,
};

export { Swap };
