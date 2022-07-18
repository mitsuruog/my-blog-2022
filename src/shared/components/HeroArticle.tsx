import Link from "next/link";
import { useRouter } from "next/router";

import { CoverImage, Tag, Avatar } from "@/shared/components";
import { Article } from "@/shared/models";

import { formatDate } from "../services/DateService";

export type HeroArticleProps = {
  article: Article;
};

export const HeroArticle = ({ article }: HeroArticleProps) => {
  const { title, year, month, slug, timeReading, date, content, thumbnail } =
    article;

  const router = useRouter();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-center">
        <CoverImage title={title} src={thumbnail} />
      </div>
      <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-4">
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
            <div className="flex gap-2 items-center">
              <Avatar
                src="https://avatars.githubusercontent.com/u/1703219"
                title="mitsuruog"
              />
              mitsuruog
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div
            className="line-clamp-4"
            dangerouslySetInnerHTML={{ __html: content }}
          />
          <div>
            <Link
              as={`/${year}/${month}/${slug}`}
              href="/[year]/[month]/[slug]"
            >
              <a>Read More</a>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
