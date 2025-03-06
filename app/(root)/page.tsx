import { getFiles, getTotalSpaceUsed } from "@/lib/actions/file.actions";
import { getCurrentUser } from "@/lib/actions/user.actions";
import DashboardContent from "@/components/DashboardContent";
import { fallbackFiles, fallbackTotalSpace } from "@/lib/utils";

export default async function Dashboard() {
  const currentUser = await getCurrentUser();

  if (!currentUser) return null;

  const filesPromise = getFiles({ types: [], limit: 10 });
  const totalSpacePromise = getTotalSpaceUsed();

  const [filesResult, totalSpaceResult] = await Promise.allSettled([
    filesPromise,
    totalSpacePromise,
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
    <DashboardContent
      currentUser={currentUser}
      files={files}
      totalSpace={totalSpace}
      hasFileError={hasFileError}
      hasSpaceError={hasSpaceError}
    />
  );
}
