"use client";

import FileCard from "@/components/FileCard";
import Sort from "@/components/Sort";
import type { Models } from "node-appwrite";
import { convertFileSize, getUsageSummary } from "@/lib/utils";
import { useMemo } from "react";
import { usePageErrorToast } from "@/hooks/usePageErrorToast";

export default function FileTypePageContent({
  type = "",
  files,
  totalSpace,
  currentUser,
  hasFileError,
  hasSpaceError,
}: PageContentProps) {
  usePageErrorToast(hasFileError, hasSpaceError);
  const usageSummary = useMemo(() => getUsageSummary(totalSpace), [totalSpace]);

  const currentTypeSummary = useMemo(
    () =>
      usageSummary.find(
        (item) => item.title.toLowerCase() === type.toLowerCase()
      ),
    [usageSummary, type]
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
            <p className="body-1 hidden sm:block">Sort by:</p>
            <Sort />
          </div>
        </div>
      </section>
      {files.documents.length > 0 ? (
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
