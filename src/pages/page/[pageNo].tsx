import { getArticlesByPageNo, getTotalPageCount } from "@/lib/api";
import { ArticleItem, Layout, Pagination, Head } from "@/shared/components";
import { Article } from "@/shared/models";

export type PageProps = {
  articles: Article[];
  pageNo: number;
  pageCount: number;
};

export type PageParams = {
  params: {
    pageNo: string;
  };
};

const Page = ({ articles, pageNo, pageCount }: PageProps) => {
  return (
    <Layout>
      <Head title={`Page ${pageNo}`} path={`page/${pageNo}`} />
      <h1 className="text-3xl font-bold">{`Page: ${pageNo}`}</h1>
      <ul className="flex flex-col gap-8">
        {articles.map((article) => (
          <li key={article.slug}>
            <ArticleItem article={article} />
          </li>
        ))}
      </ul>
      <div className="flex flex-col items-center">
        <Pagination currentPage={pageNo} pageCount={pageCount} />
      </div>
    </Layout>
  );
};

export const getStaticProps = async ({ params }: PageParams) => {
  const { pageNo: pageNoString } = params;
  const pageNo = Number(pageNoString);
  const pageCount = getTotalPageCount();
  const articles = getArticlesByPageNo(pageNo, [
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
      pageNo,
      pageCount,
    },
  };
};

export const getStaticPaths = async () => {
  const pageCount = getTotalPageCount();

  return {
    paths: [...Array(pageCount).keys()].map((pageNo) => ({
      params: { pageNo: String(pageNo + 1) },
    })),
    fallback: false,
  };
};

export default Page;
