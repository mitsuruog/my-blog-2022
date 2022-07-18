import classnames from "classnames";
import Link from "next/link";

export type CoverImageProps = {
  title: string;
  src: string;
  year?: string;
  month?: string;
  slug?: string;
};

export const CoverImage = ({
  title,
  src,
  year,
  month,
  slug,
}: CoverImageProps) => {
  const image = (
    <img
      src={src}
      alt={`Cover image for ${title}`}
      className={classnames("shadow-sm object-cover", {
        "hover:shadow-lg transition-shadow duration-200": slug,
      })}
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
