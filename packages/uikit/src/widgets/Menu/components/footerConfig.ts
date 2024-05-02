import { ContextApi } from "@pancakeswap/localization";
import { FooterLinkType } from "../../../components/Footer/types";

export const footerLinks: (t: ContextApi["t"]) => FooterLinkType[] = (t) => [
  {
    label: t("About"),
    items: [
      {
        label: t("Docs"),
        href: "https://docs.cyberglow.finance/",
        isHighlighted: true,
        blank: true,
      },
      {
        label: t("Swap"),
        href: "/swap",
      },
      {
        label: t("Liquidity"),
        href: "/liquidity",
      },
      {
        label: t("Farm"),
        href: "/farms",
      },
      {
        label: t("Earn"),
        href: "/pools",
      },
      {
        label: t("Presale"),
        href: "https://www.pinksale.finance/launchpad/0xfF99F5d8d6a723907AC4d8c4bec298573b848c24?chain=Arbitrum",
        blank: true,
      },
      {
        label: t("NFT"),
        href: "/nft",
      },
      {
        label: t("Terms of Service"),
        href: "/",
        blank: true,
      },
    ],
  },
  // {
  //   label: t("Help"),
  //   items: [
  //     {
  //       label: t("Customer Support"),
  //       href: "https://docs.pancakeswap.finance/contact-us/customer-support",
  //     },
  //     {
  //       label: t("Troubleshooting"),
  //       href: "https://docs.pancakeswap.finance/help/troubleshooting",
  //     },
  //     {
  //       label: t("Guides"),
  //       href: "https://docs.pancakeswap.finance/get-started",
  //     },
  //   ],
  // },
  // {
  //   label: t("Developers"),
  //   items: [
  //     {
  //       label: "Github",
  //       href: "https://github.com/pancakeswap",
  //     },
  //     {
  //       label: t("Documentation"),
  //       href: "https://docs.pancakeswap.finance",
  //     },
  //     {
  //       label: t("Bug Bounty"),
  //       href: "https://docs.pancakeswap.finance/code/bug-bounty",
  //     },
  //     {
  //       label: t("Audits"),
  //       href: "https://docs.pancakeswap.finance/help/faq#is-pancakeswap-safe-has-pancakeswap-been-audited",
  //     },
  //     {
  //       label: t("Careers"),
  //       href: "https://docs.pancakeswap.finance/hiring/become-a-chef",
  //     },
  //   ],
  // },
];
