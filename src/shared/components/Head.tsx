import NextHead from "next/head";

import * as Constants from "@/lib/constants";

export type HeadProps = {
  title?: string;
  description?: string;
  path?: string;
  thumbnail?: string;
};

export const Head = ({
  title,
  description,
  thumbnail = Constants.BLOG_BANNER_URL,
  path = "",
}: HeadProps) => {
  const realTitle = title
    ? `${Constants.BLOG_TITLE} | ${title}`
    : Constants.BLOG_TITLE;
  const url = path ? `${Constants.BLOG_URL}/${path}` : Constants.BLOG_URL;

  return (
    <NextHead>
      <meta name="viewport" content="initial-scale=1, width=device-width" />
      <title>{realTitle}</title>
      <link rel="icon" href="/assets/images/favicon.svg" />
      <meta property="og:title" content={realTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={path} />
      <meta property="og:image" content={thumbnail} />
      <meta property="og:site_name" content={Constants.BLOG_TITLE} />
      <meta property="og:type" content="blog" />
    </NextHead>
  );
};
