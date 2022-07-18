import { useRouter } from "next/router";

import { CoverImage, Avatar, Tag } from "@/shared/components";
import { Article } from "@/shared/models";
import { formatDate } from "@/shared/services/DateService";

export type ArticleHeaderProps = {
  article: Article;
};

export const ArticleHeader = ({ article }: ArticleHeaderProps) => {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-4">
      <div className="relative max-w-3xl mx-auto">
        <CoverImage src={article.thumbnail} title={article.title} />
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

      <h1 className="text-3xl font-bold">{article.title}</h1>
      <div className="flex justify-between">
        <div className="text-slate-700">
          <p>{formatDate(article.date, "MMMM DD, YYYY")}</p>
          <p>{article.timeReading}</p>
        </div>
        <div className="flex gap-2 items-center">
          <Avatar
            src="https://avatars.githubusercontent.com/u/1703219"
            title="mitsuruog"
          />
          mitsuruog
        </div>
      </div>
    </div>
  );
};
