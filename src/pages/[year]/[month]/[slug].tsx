import Link from "next/link";

import {
  getArticleBySlug,
  getAllArticles,
  getPrevNextArticleBySlug,
} from "@/lib/api";
import { markdownToHtml, markdownToText } from "@/lib/markdownToHtml";
import { ArticleBody, ArticleHeader, Layout, Head } from "@/shared/components";
import { Article } from "@/shared/models";

export type PostProps = {
  article: Article;
  prev: Article | null;
  next: Article | null;
};

export type PostParams = {
  params: {
    year: string;
    month: string;
    slug: string;
  };
};

const Post = ({ article, prev, next }: PostProps) => {
  return (
    <Layout>
      <Head
        title={article.title}
        description={article.excerpt}
        thumbnail={article.thumbnail}
        path={`${article.year}/${article.month}/${article.slug}`}
      />
      <ArticleHeader article={article} />
      <ArticleBody content={article.content} />
      <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
        <div className="flex flex-grow sm:w-1/2">
          {prev && (
            <div className="flex flex-grow flex-col gap-1">
              <p className="text-slate-900">Next</p>
              <Link
                as={`/${prev.year}/${prev.month}/${prev.slug}`}
                href="/[year]/[month]/[slug]"
              >
                <a aria-label={prev.title}>{prev.title}</a>
              </Link>
            </div>
          )}
        </div>
        <div className="flex flex-grow sm:w-1/2">
          {next && (
            <div className="flex flex-grow flex-col gap-1">
              <p className="text-slate-900">Prev</p>
              <Link
                as={`/${next.year}/${next.month}/${next.slug}`}
                href="/[year]/[month]/[slug]"
              >
                <a aria-label={next.title}>{next.title}</a>
              </Link>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export const getStaticProps = async ({ params }: PostParams) => {
  const { year, month, slug } = params;
  const rawSlug = `${year}/${month}/${slug}`;

  const article = getArticleBySlug(rawSlug, [
    "title",
    "date",
    "slug",
    "content",
    "thumbnail",
    "timeReading",
    "tags",
  ]);
  const { next, prev } = getPrevNextArticleBySlug(year, month, slug, [
    "title",
    "date",
    "slug",
    "content",
    "thumbnail",
    "timeReading",
    "tags",
  ]);
  const content = await markdownToHtml(article.content ?? "");
  const excerpt = await markdownToText(article.content ?? "");

  return {
    props: {
      article: {
        ...article,
        content,
        excerpt: excerpt.substring(0, 256),
      },
      prev,
      next,
    },
  };
};

export const getStaticPaths = async () => {
  const articles = getAllArticles(["slug"]);

  return {
    paths: articles.map((article) => ({
      params: {
        year: article.year,
        month: article.month,
        slug: article.slug,
      },
    })),
    fallback: false,
  };
};

export default Post;
