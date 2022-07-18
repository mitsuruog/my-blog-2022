import { CoverImage, Author, TagCloud } from "@/shared/components";
import { Article } from "@/shared/models";
import { formatDate } from "@/shared/services/DateService";

export type ArticleHeaderProps = {
  article: Article;
};

export const ArticleHeader = ({ article }: ArticleHeaderProps) => {
  return (
    <div className="flex flex-col gap-4">
      {article.thumbnail && (
        <div className="relative h-72">
          <CoverImage src={article.thumbnail} title={article.title} />
        </div>
      )}
      <TagCloud tags={article.tags} />
      <h1 className="text-3xl font-bold">{article.title}</h1>
      <div className="flex justify-between">
        <div className="text-slate-700">
          <p>{formatDate(article.date, "MMMM DD, YYYY")}</p>
          <p>{article.timeReading}</p>
        </div>
        <Author />
      </div>
    </div>
  );
};
