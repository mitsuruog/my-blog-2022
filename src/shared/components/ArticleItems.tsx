import Link from "next/link";

import { CoverImage, TagCloud } from "@/shared/components";
import { Article } from "@/shared/models";
import { formatDate } from "@/shared/services/DateService";

export type ArticleItemProps = {
  article: Article;
};

export function ArticleItem(props: ArticleItemProps) {
  const { article } = props;

  return (
    <div className="flex gap-4">
      <div className="w-1/3">
        <div className="relative h-40">
          <CoverImage
            title={article.title}
            src={article.thumbnail}
            year={article.year}
            month={article.month}
            slug={article.slug}
          />
        </div>
      </div>
      <div className="w-2/3 flex flex-col gap-2">
        <div>
          <Link
            as={`/${article.year}/${article.month}/${article.slug}`}
            href="/[year]/[month]/[slug]"
          >
            <h4 className="text-xl font-medium">
              <a>{article.title}</a>
            </h4>
          </Link>
        </div>
        <div className="flex gap-4 text-slate-900">
          <p>{formatDate(article.date, "MMMM DD, YYYY")}</p>
          <p>{article.timeReading}</p>
        </div>
        <TagCloud tags={article.tags} />
      </div>
    </div>
  );
}
