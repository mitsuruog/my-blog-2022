export type ArticleBodyProps = {
  content: string;
};

export const ArticleBody = ({ content }: ArticleBodyProps) => {
  return (
    <article
      className="prose prose-slate"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};
