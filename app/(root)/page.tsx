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

async function DashboardData({
  userId,
  userEmail,
}: {
  userId: string;
  userEmail: string;
}) {
  const [filesResult, totalSpaceResult] = await Promise.allSettled([
    getFiles({
      types: [],
      limit: 14,
      userId,
      userEmail,
    }),
    getTotalSpaceUsed({ userId }),
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
      files={files}
      totalSpace={totalSpace}
      hasFileError={hasFileError}
      hasSpaceError={hasSpaceError}
    />
  );
}

export default async function DashboardPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) return null;

  return (
    <DashboardData userId={currentUser.$id} userEmail={currentUser.email} />
  );
}
