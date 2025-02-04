import Search from "@/components/Search";

export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Search className="block pb-5 sm:hidden" />
      {children}
    </>
  );
}
