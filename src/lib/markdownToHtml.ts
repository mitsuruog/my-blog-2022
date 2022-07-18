import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import { remark } from "remark";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import remarkToc from "remark-toc";
import strip from "strip-markdown";
import { unified } from "unified";

export async function markdownToHtml(markdown: string): Promise<string> {
  const result = await unified()
    .use(remarkToc, { heading: "目次" })
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypeHighlight)
    .use(rehypeStringify)
    .use(rehypeSlug)
    .process(markdown);
  return result.toString();
}

export async function markdownToText(markdown: string): Promise<string> {
  const result = await remark().use(strip).process(markdown);
  return result.toString().replace(/(\r\n|\n|\r)/gm, "");
}
