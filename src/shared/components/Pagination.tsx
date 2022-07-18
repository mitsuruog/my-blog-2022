import { useRouter } from "next/router";
import ReactPaginate from "react-paginate";

export type PaginationProps = {
  currentPage: number;
  pageCount: number;
};

export const Pagination = ({ currentPage, pageCount }: PaginationProps) => {
  const router = useRouter();

  return (
    <ReactPaginate
      forcePage={currentPage - 1}
      pageCount={pageCount}
      pageRangeDisplayed={3}
      marginPagesDisplayed={3}
      containerClassName="flex rounded text-blue-700"
      pageClassName="relative leading-tight bg-white border border-r-0 hover:bg-slate-200"
      pageLinkClassName="block py-2 px-3"
      breakClassName="relative block py-2 px-3 leading-tight bg-white border border-r-0"
      previousClassName="relative leading-tight bg-white border text-teal-900 border-r-0 hover:bg-slate-200 rounded-l"
      previousLinkClassName="block py-2 px-3"
      nextClassName="relative leading-tight bg-white border text-teal-900 hover:bg-slate-200 rounded-r"
      nextLinkClassName="block py-2 px-3"
      activeClassName="bg-teal-700 text-white hover:bg-teal-900"
      onPageChange={({ selected }) => router.push(`/page/${selected + 1}`)}
    />
  );
};
