import styled from "styled-components";
import { NextSeo } from "next-seo";
import { Button, Heading, Text, LogoIcon } from "@pancakeswap/uikit";
import { useTranslation } from "@pancakeswap/localization";
import Link from "next/link";

const StyledComing = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 64px);
  justify-content: center;
`;

const Coming = ({ text = "Available after Launchpad", mt = 0 }: { text?: string, mt?: number }) => {
  const { t } = useTranslation();

  return (
    <>
      <NextSeo title="Coming" />
      <StyledComing>
        {/* <LogoIcon width="64px" mb="8px" /> */}
        <img src="/images/knb.png" width="96px" />
        <Heading scale="xl" mb="8px">{text}</Heading>
        {/* <Text mb="16px">{t("Oops, page not found.")}</Text> */}
        <Link href="/" passHref>
          <Button as="a" scale="sm">
            {t("Back Home")}
          </Button>
        </Link>
      </StyledComing>
    </>
  );
};

export default Coming;
