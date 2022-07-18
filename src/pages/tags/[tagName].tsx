import { getAllTags, getArticlesByTag } from "@/lib/api";
import { ArticleItem, Layout, Head } from "@/shared/components";
import { Article } from "@/shared/models";

export type TagPageProps = {
  articles: Article[];
  tagName: string;
};

export type TagPageParams = {
  params: {
    tagName: string;
  };
};

const TagPage = ({ articles, tagName }: TagPageProps) => {
  return (
    <Layout>
      <Head title={tagName} path={`tags/${tagName}`} />
      <h1 className="text-3xl font-bold">{`Tag: ${tagName}`}</h1>
      <ul className="flex flex-col gap-8">
        {articles.map((article) => (
          <li key={article.slug}>
            <ArticleItem article={article} />
          </li>
        ))}
      </ul>
    </Layout>
  );
};

export const getStaticProps = async ({ params }: TagPageParams) => {
  const articles = getArticlesByTag(params.tagName, [
    "title",
    "date",
    "slug",
    "thumbnail",
    "timeReading",
    "content",
    "tags",
  ]);

  return {
    props: {
      articles,
      tagName: params.tagName,
    },
  };
};

export const getStaticPaths = async () => {
  const tags = getAllTags();

  return {
    paths: tags.map((tagName) => ({
      params: { tagName },
    })),
    fallback: false,
  };
};

export default TagPage;
