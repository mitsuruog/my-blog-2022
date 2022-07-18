import { getArchives, getArticlesByYearMonth } from "@/lib/api";
import { ArticleItem, Layout, Head } from "@/shared/components";
import { Article } from "@/shared/models";
import { formatDate } from "@/shared/services/DateService";

export type ArchivePageProps = {
  articles: Article[];
  year: string;
  month: string;
};

export type ArchivePageParams = {
  params: {
    year: string;
    month: string;
  };
};

const ArchivePage = ({ articles, year, month }: ArchivePageProps) => {
  const date = formatDate(`${year}${month}`, "MMMM, YYYY");

  return (
    <Layout>
      <Head title={date} path={`archives/${year}/${month}`} />
      <h1 className="text-3xl font-bold">{date}</h1>
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

export const getStaticProps = async ({ params }: ArchivePageParams) => {
  const { year, month } = params;
  const articles = getArticlesByYearMonth(year, month, [
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
      year,
      month,
    },
  };
};

export const getStaticPaths = async () => {
  const archives = getArchives();

  return {
    paths: Object.keys(archives).map((key) => ({
      params: {
        year: archives[key].year,
        month: archives[key].month,
      },
    })),
    fallback: false,
  };
};

export default ArchivePage;
