import Link from "next/link";

import { CoverImage, TagCloud, Author } from "@/shared/components";
import { Article } from "@/shared/models";

import { formatDate } from "../services/DateService";

export type HeroArticleProps = {
  article: Article;
};

export const HeroArticle = ({ article }: HeroArticleProps) => {
  const { title, year, month, slug, timeReading, date, content, thumbnail } =
    article;

  return (
    <div className="flex flex-col gap-8">
      <div className="relative flex justify-center h-72">
        <CoverImage title={title} src={thumbnail} />
      </div>
      <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-4">
          <TagCloud tags={article.tags} />
          <Link as={`/${year}/${month}/${slug}`} href="/[year]/[month]/[slug]">
            <h2 className="text-3xl font-bold">
              <a>{title}</a>
            </h2>
          </Link>
          <div className="flex justify-between text-slate-900">
            <div>
              <p>{formatDate(date, "MMMM DD, YYYY")}</p>
              <p>{timeReading}</p>
            </div>
            <Author />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="line-clamp-4">{article.excerpt}</div>
          <div>
            <Link
              as={`/${year}/${month}/${slug}`}
              href="/[year]/[month]/[slug]"
            >
              <a className="font-semibold underline">Read More</a>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
