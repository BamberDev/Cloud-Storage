import { getFiles, getTotalSpaceUsed } from "@/lib/actions/file.actions";
import { getCurrentUser } from "@/lib/actions/user.actions";
import DashboardPageContent from "@/components/DashboardPageContent";
import { fallbackFiles, fallbackTotalSpace } from "@/lib/utils";

export function generateMetadata() {
  return {
    title: "Dashboard | Cloud Storage",
    description:
      "Welcome to your Cloud Storage dashboard. Here you can view your files, manage your storage, and access all features of your account.",
  };
}

export default async function DashboardPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) return null;

  const [filesResult, totalSpaceResult] = await Promise.allSettled([
    getFiles({
      types: [],
      limit: 10,
      userId: currentUser.$id,
      userEmail: currentUser.email,
    }),
    getTotalSpaceUsed({ userId: currentUser.$id }),
  ]);

  const files =
    filesResult.status === "fulfilled" ? filesResult.value : fallbackFiles;
  const totalSpace =
    totalSpaceResult.status === "fulfilled"
      ? totalSpaceResult.value
      : fallbackTotalSpace;

  const hasFileError = filesResult.status === "rejected";
  const hasSpaceError = totalSpaceResult.status === "rejected";

  return (
    <DashboardPageContent
      currentUser={currentUser}
      files={files}
      totalSpace={totalSpace}
      hasFileError={hasFileError}
      hasSpaceError={hasSpaceError}
    />
  );
}
