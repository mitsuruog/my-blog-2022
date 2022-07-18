import fs from "fs";
import glob from "glob";
import matter from "gray-matter";
import path from "path";
import readingTime from "reading-time";

import { Article, ArticleKey } from "@/shared/models";

import { markdownToText } from "./markdownToHtml";

export const COUNT_PER_PAGE = 20;

const articlesDirectory = path.join(process.cwd(), "articles");

export function getAllSlugs(): string[] {
  return glob.sync("**/*.md", { cwd: articlesDirectory });
}

export function getAllArticles(fields: ArticleKey[] = []): Article[] {
  return getAllSlugs()
    .map((rawSlug) => getArticleBySlug(rawSlug, fields))
    .sort((a, b) => (a.date > b.date ? -1 : 1));
}

export function getArticleBySlug(rawSlug: string, fields: ArticleKey[] = []) {
  const [year, mounth, slug] = rawSlug.replace(/\.md$/, "").split("/");
  const { data, content } = getRawArticleBySlug(year, mounth, slug);
  const timeReading = readingTime(content).text;
  const items: Article = {} as Article;

  fields.forEach((field) => {
    items.year = year;
    items.month = mounth;
    items.slug = slug;

    if (field === "content") {
      items.content = content;
    }
    if (field === "timeReading") {
      items.timeReading = timeReading;
    }
    if (field in data) {
      items[field] = data[field];
    }
  });

  return items;
}

export function getRawArticleBySlug(
  year: string,
  month: string,
  slug: string
): matter.GrayMatterFile<string> {
  const filePath = path.join(articlesDirectory, year, month, `${slug}.md`);
  const fileContents = fs.readFileSync(filePath, "utf8");
  return matter(fileContents);
}

export function getArticlesByPageNo(
  pageNo: number,
  fields: ArticleKey[] = []
): Article[] {
  const articles = getAllArticles(fields).filter(
    (_, index) => Math.ceil((index + 1) / COUNT_PER_PAGE) === pageNo
  );
  return articles;
}

export function getPrevNextArticleBySlug(
  year: string,
  month: string,
  slug: string,
  fields: ArticleKey[] = []
): {
  prev: Article | null;
  next: Article | null;
} {
  const articles = getAllArticles(fields);
  const index = articles.findIndex(
    (article) =>
      article.slug === slug && article.year === year && article.month === month
  );
  if (index === -1) {
    return { prev: null, next: null };
  }
  return {
    prev: articles[index - 1] ?? null,
    next: articles[index + 1] ?? null,
  };
}

export function getTotalPageCount(): number {
  const articles = getAllArticles();
  return Math.ceil(articles.length / COUNT_PER_PAGE);
}

export function getArticlesByTag(
  tag: string,
  fields: ArticleKey[] = []
): Article[] {
  return getAllArticles(fields).filter((article) =>
    (article.tags ?? []).includes(tag)
  );
}

export function getArticlesByYearMonth(
  year: string,
  month: string,
  fields: ArticleKey[] = []
): Article[] {
  return getAllArticles(fields).filter(
    (article) => article.year === year && article.month === month
  );
}

export function getAllTags(): string[] {
  const articles = getAllArticles(["tags"]);
  const allTags = new Set<string>();
  articles.forEach((article) => {
    (article.tags ?? []).forEach((tag) => allTags.add(tag));
  });
  return Array.from(allTags).sort();
}

export function getArchives(): {
  [key: string]: { count: number; year: string; month: string };
} {
  const archives = getAllArticles(["slug"]).reduce((result, article) => {
    const { year, month } = article;
    const key = `${year}${month}`;
    return result[key] === undefined
      ? { ...result, [key]: { count: 1, year, month } }
      : { ...result, [key]: { ...result[key], count: result[key].count + 1 } };
  }, {} as { [key: string]: { count: number; year: string; month: string } });

  return archives;
}
