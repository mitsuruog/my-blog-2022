import { Header, Footer } from "@/shared/components";

export type LayoutProps = {
  children: React.ReactNode;
};

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex flex-col flex-grow">
      <Header />
      <main className="max-w-3xl mx-auto min-h-screen px-8 py-16 flex flex-col gap-16 bg-white">
        {children}
      </main>
      <Footer />
    </div>
  );
};
