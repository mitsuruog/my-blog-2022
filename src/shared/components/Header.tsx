import Link from "next/link";

import * as Constants from "@/lib/constants";

export const Header = () => {
  return (
    <header className="sticky top-0 flex justify-between items-center h-16 p-4 bg-white border-b shadow z-10">
      <div className="flex items-center gap-8 text-slate-900">
        <Link href="/">
          <a className="hover:underline">{Constants.BLOG_TITLE}</a>
        </Link>
        <Link as="/page/1" href="/page/[pageNo]">
          <a>Blog</a>
        </Link>
        <Link href="/me">
          <a>About Me</a>
        </Link>
      </div>
      <div>
        <input
          type="search"
          className="form-input rounded-full border-slate-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          placeholder="Search"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              window.open(
                `https://www.google.com/search?q=${e.currentTarget.value}&sitesearch=${Constants.BLOG_URL}`,
                "_blank",
                "noreferrer"
              );
            }
          }}
        />
      </div>
    </header>
  );
};
