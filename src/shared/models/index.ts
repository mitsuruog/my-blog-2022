export type Author = {
  name: string;
  picture: string;
};

export type Article = {
  year: string;
  month: string;
  slug: string;
  title: string;
  date: string;
  timeReading: string;
  tags: string[];
  thumbnail: string;
  content: string;
  excerpt: string;
};

export type ArticleKey = keyof Article;
