import Link from "next/link";

export const Header = () => {
  return (
    <header className="sticky top-0 flex item-center h-16 p-4 bg-white border-b shadow z-10">
      <div className="flex items-center text-cyan-900">
        <Link href="/">
          <a className="hover:underline">I am mitsuruog</a>
        </Link>
      </div>
    </header>
  );
};
