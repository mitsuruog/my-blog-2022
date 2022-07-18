import { ArticleBody, ArticleHeader, Layout } from "@/shared/components";
import { Article } from "@/shared/models";
import {
  getArticleBySlug,
  getAllArticles,
} from "@/shared/services/ArticleService";
import { markdownToHtml } from "@/shared/services/MarkdownService";

export type PostProps = {
  article: Article;
};

export type PostParams = {
  params: {
    year: string;
    month: string;
    slug: string;
  };
};

const Post = ({ article }: PostProps) => {
  return (
    <Layout>
      <ArticleHeader article={article} />
      <ArticleBody content={article.content} />
    </Layout>
  );
};

export const getStaticProps = async ({ params }: PostParams) => {
  const { year, month, slug } = params;
  const article = getArticleBySlug(`${year}/${month}/${slug}`, [
    "title",
    "date",
    "slug",
    "content",
    "thumbnail",
    "timeReading",
    "tags",
  ]);
  const content = await markdownToHtml(article.content ?? "");

  return {
    props: {
      article: {
        ...article,
        content,
      },
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
