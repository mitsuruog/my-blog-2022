import Link from "next/link";
import { useRouter } from "next/router";

import { CoverImage, Tag } from "@/shared/components";
import { Article } from "@/shared/models";
import { formatDate } from "@/shared/services/DateService";

export type ArticleItemProps = {
  article: Article;
};

export function ArticleItem(props: ArticleItemProps) {
  const router = useRouter();
  const { article } = props;

  return (
    <div className="flex gap-4">
      <div className="relative w-1/3">
        <CoverImage
          title={article.title}
          src={article.thumbnail}
          year={article.year}
          month={article.month}
          slug={article.slug}
        />
      </div>
      <div className="w-2/3 flex flex-col gap-2">
        <div>
          <Link
            as={`/${article.year}/${article.month}/${article.slug}`}
            href="/[year]/[month]/[slug]"
          >
            <h4 className="text-xl font-bold cursor-pointer hover:underline">
              <a>{article.title}</a>
            </h4>
          </Link>
        </div>
        <div className="text-slate-900">
          {formatDate(article.date, "MMMM DD, YYYY")}
        </div>
        {article.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {article.tags.map((tag, index) => (
              <Tag
                key={`tag${index}`}
                onClick={() => router.push(`/tags/${tag}`)}
              >
                {tag}
              </Tag>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
