import Header from "@/components/Header";
import MobileNavigation from "@/components/MobileNavigation";
import Sidebar from "@/components/Sidebar";
import { getCurrentUser } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";
import { Toaster } from "@/components/ui/toaster";
import Search from "@/components/Search";
import { UserProvider } from "@/context/UserContext";

export const dynamic = "force-dynamic";

export default async function layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = await getCurrentUser();

  if (!currentUser) return redirect("/sign-in");

  return (
    <UserProvider currentUser={currentUser}>
      <main className="flex h-screen">
        <Sidebar {...currentUser} />
        <section className="flex h-full flex-1 flex-col">
          <MobileNavigation {...currentUser} />
          <Header />
          <div className="main-content">
            <Search className="block pb-5 sm:hidden" />
            {children}
          </div>
        </section>
        <Toaster />
      </main>
    </UserProvider>
  );
}
