import { getFiles, getTotalSpaceUsed } from "@/lib/actions/file.actions";
import { getCurrentUser } from "@/lib/actions/user.actions";
import {
  getFileTypesParams,
  fallbackFiles,
  fallbackTotalSpace,
} from "@/lib/utils";
import FileTypePageContent from "@/components/FileTypePageContent";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const resolvedParams = await params;
  const type = resolvedParams?.type || "Files";
  const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1);

  return {
    title: `${capitalizedType} | Cloud Storage`,
    description: `View and manage your ${type} files on Cloud Storage. Upload, sort, delete and organize your files with ease.`,
  };
}

async function FileTypeData({
  type,
  searchText,
  sort,
  userId,
  userEmail,
}: FileTypeDataProps) {
  const types = getFileTypesParams(type) as FileType[];
  const [filesResult, totalSpaceResult] = await Promise.allSettled([
    getFiles({
      types,
      searchText,
      sort,
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
    <FileTypePageContent
      type={type}
      files={files}
      totalSpace={totalSpace}
      hasFileError={hasFileError}
      hasSpaceError={hasSpaceError}
    />
  );
}

export default async function FileTypePage({
  searchParams,
  params,
}: SearchParamProps) {
  const type = ((await params)?.type as string) || "";
  const searchText = ((await searchParams)?.query as string) || "";
  const sort = ((await searchParams)?.sort as string) || "";
  const currentUser = await getCurrentUser();

  if (!currentUser) return null;

  return (
    <FileTypeData
      type={type}
      searchText={searchText}
      sort={sort}
      userId={currentUser.$id}
      userEmail={currentUser.email}
    />
  );
}
