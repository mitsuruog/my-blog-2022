export type ArticleBodyProps = {
  content: string;
};

export const ArticleBody = ({ content }: ArticleBodyProps) => {
  return (
    <article
      className="prose prose-slate prose-lg sm:prose-base"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};
