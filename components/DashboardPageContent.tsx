"use client";

import { useEffect, useMemo, useRef } from "react";
import Chart from "@/components/Chart";
import { getUsageSummary } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Models } from "node-appwrite";
import SummaryCard from "./SummaryCard";
import FileListItem from "./FileListItem";

export default function DashboardPageContent({
  currentUser,
  files,
  totalSpace,
  hasFileError,
  hasSpaceError,
}: PageContentProps) {
  const { toast } = useToast();
  const usageSummary = useMemo(() => getUsageSummary(totalSpace), [totalSpace]);
  const recentFiles = useMemo(
    () => files.documents.slice(0, 9),
    [files.documents]
  );
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
  }, [hasFileError, hasSpaceError, toast]);

  return (
    <div className="dashboard-container">
      <section>
        <Chart used={totalSpace.used} />

        <ul className="dashboard-summary-list">
          {usageSummary.map((summary) => (
            <SummaryCard key={summary.title} summary={summary} />
          ))}
        </ul>
      </section>

      <section className="dashboard-recent-files">
        <h2 className="h3 xl:h2 text-light-100">Recently uploaded</h2>
        {recentFiles.length > 0 ? (
          <ul className="mt-5 flex flex-col gap-5">
            {recentFiles.map((file: Models.Document) => (
              <FileListItem
                key={file.$id}
                file={file}
                currentUser={currentUser}
              />
            ))}
          </ul>
        ) : (
          <p className="empty-list">No files uploaded</p>
        )}
      </section>
    </div>
  );
}
