"use client";

import { useEffect, useMemo, useRef } from "react";
import FileCard from "@/components/FileCard";
import Sort from "@/components/Sort";
import type { Models } from "node-appwrite";
import { convertFileSize, getUsageSummary } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function FileTypePageContent({
  type = "",
  files,
  totalSpace,
  currentUser,
  hasFileError,
  hasSpaceError,
}: PageContentProps) {
  const { toast } = useToast();
  const usageSummary = useMemo(() => getUsageSummary(totalSpace), [totalSpace]);
  const toastsShown = useRef(false);

  useEffect(() => {
    if (!toastsShown.current) {
      const timer = setTimeout(() => {
        if (hasFileError) {
          toast({
            description: (
              <p className="body-2 text-white">
                Could not load your files. Please try again by refreshing the
                page.
              </p>
            ),
            className: "error-toast",
          });
        }

        if (hasSpaceError) {
          toast({
            description: (
              <p className="body-2 text-white">
                Could not load your storage information. Please try again by
                refreshing the page.
              </p>
            ),
            className: "error-toast",
          });
        }

        toastsShown.current = true;
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [hasFileError, hasSpaceError, toast, type]);

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
