import FileCard from "@/components/FileCard";
import Sort from "@/components/Sort";
import { getFiles, getTotalSpaceUsed } from "@/lib/actions/file.actions";
import { Models } from "node-appwrite";
import {
  convertFileSize,
  getFileTypesParams,
  getUsageSummary,
} from "@/lib/utils";
import { getCurrentUser } from "@/lib/actions/user.actions";

export default async function FileTypePage({
  searchParams,
  params,
}: SearchParamProps) {
  const type = ((await params)?.type as string) || "";
  const searchText = ((await searchParams)?.query as string) || "";
  const sort = ((await searchParams)?.sort as string) || "";
  const currentUser = await getCurrentUser();

  if (!currentUser) return null;

  const types = getFileTypesParams(type) as FileType[];
  const [files, totalSpace] = await Promise.all([
    getFiles({ types, searchText, sort }),
    getTotalSpaceUsed(),
  ]);
  const usageSummary = getUsageSummary(totalSpace);

  const currentTypeSummary = usageSummary.find(
    (item) => item.title.toLowerCase() === type.toLowerCase()
  );

  const currentTypeSize = currentTypeSummary
    ? convertFileSize(currentTypeSummary.size)
    : "0";

  return (
    <div className="page-container">
      <section className="w-full">
        <h1 className="h1 capitalize">{type}</h1>
        <div className="total-size-section">
          <p className="body-1">
            Total: <span className="h5">{currentTypeSize}</span>
          </p>
          <div className="sort-container">
            <p className="body-1 hidden sm:block text-light-100">Sort by:</p>
            <Sort />
          </div>
        </div>
      </section>
      {files.total > 0 ? (
        <section className="file-list">
          {files.documents.map((file: Models.Document) => (
            <FileCard key={file.$id} file={file} currentUser={currentUser} />
          ))}
        </section>
      ) : (
        <p className="empty-list">No files found</p>
      )}
    </div>
  );
}
