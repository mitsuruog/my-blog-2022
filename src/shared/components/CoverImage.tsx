import classnames from "classnames";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export type CoverImageProps = {
  title: string;
  src: string;
  year?: string;
  month?: string;
  slug?: string;
};

export const CoverImage = ({
  title,
  src = "/assets/images/no-image.png",
  year,
  month,
  slug,
}: CoverImageProps) => {
  const image = (
    <Image
      src={src}
      layout="fill"
      objectFit="cover"
      alt={`Cover image for ${title}`}
    />
  );
  return (
    <>
      {year && month && slug ? (
        <Link as={`/${year}/${month}/${slug}`} href="/[year]/[month]/[slug]">
          <a aria-label={title}>{image}</a>
        </Link>
      ) : (
        image
      )}
    </>
  );
};
