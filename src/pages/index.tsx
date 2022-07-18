import Link from "next/link";

import { getAllArticles, getAllTags, getArchives } from "@/lib/api";
import * as Constants from "@/lib/constants";
import { markdownToHtml, markdownToText } from "@/lib/markdownToHtml";
import { ArticleItem, Layout, HeroArticle, Head } from "@/shared/components";
import { Article } from "@/shared/models";
import { formatDate } from "@/shared/services/DateService";

export type HomeProps = {
  heroArticle: Article;
  articles: Article[];
  tags: string[];
  archives: { [key: string]: { count: number; year: string; month: string } };
};

const Home = ({ articles, heroArticle, tags, archives }: HomeProps) => {
  return (
    <Layout>
      <Head />
      <HeroArticle article={heroArticle} />
      <ul className="flex flex-col gap-8">
        <li>
          <h2 className="text-2xl font-bold">Recent Posts</h2>
        </li>
        {articles.map((article) => (
          <li key={article.slug}>
            <ArticleItem article={article}></ArticleItem>
          </li>
        ))}
        <li>
          <Link href="/page/1">
            <a className="font-semibold underline">Read More</a>
          </Link>
        </li>
      </ul>
      <div className="flex flex-col gap-8 sm:flex-row">
        <div className="flex flex-col gap-4 sm:w-2/3">
          <h4 className="text-xl font-bold">Tags</h4>
          <div className="flex flex-wrap gap-x-2 gap-y-1 text-sm text-slate-900">
            {tags.map((tag, index) => (
              <Link
                key={`tag${index}`}
                as={`/tags/${tag}`}
                href="tags/[tagName]"
              >
                <a>{tag}</a>
              </Link>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:w-1/3">
          <h4 className="text-xl font-bold">Archives</h4>
          <div className="flex flex-col gap-1 text-sm text-slate-900">
            {Object.keys(archives)
              .sort((a, b) => (a > b ? -1 : 1))
              .map((key) => {
                const { year, month, count } = archives[key];
                return (
                  <Link
                    key={key}
                    as={`/archives/${year}/${month}`}
                    href="/archives/[year]/[month]"
                  >
                    <a>{`${formatDate(key, "MMMM, YYYY")} (${count})`}</a>
                  </Link>
                );
              })}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export const getStaticProps = async () => {
  const articles = getAllArticles([
    "slug",
    "title",
    "date",
    "thumbnail",
    "timeReading",
    "content",
    "tags",
  ]);

  const tags = getAllTags();
  const archives = getArchives();

  const heroArticle = { ...articles[0] };
  const content = await markdownToHtml(heroArticle.content ?? "");
  const excerpt = await markdownToText(heroArticle.content ?? "");

  return {
    props: {
      articles: [...articles.slice(1, 5)],
      heroArticle: {
        ...heroArticle,
        content,
        excerpt: excerpt.substring(0, 256),
      },
      tags,
      archives,
    },
  };
};

export default Home;
