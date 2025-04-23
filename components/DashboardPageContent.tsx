"use client";

import Chart from "@/components/Chart";
import { getUsageSummary } from "@/lib/utils";
import { Models } from "node-appwrite";
import SummaryCard from "./SummaryCard";
import FileListItem from "./FileListItem";
import { useMemo } from "react";
import { usePageErrorToast } from "@/hooks/usePageErrorToast";

export default function DashboardPageContent({
  files,
  totalSpace,
  hasFileError,
  hasSpaceError,
}: PageContentProps) {
  usePageErrorToast(hasFileError, hasSpaceError);
  const usageSummary = useMemo(() => getUsageSummary(totalSpace), [totalSpace]);
  const recentFiles = useMemo(
    () => files.documents.slice(0, 14),
    [files.documents]
  );

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

      <section
        className="dashboard-recent-files"
        aria-label="List of recently uploaded files"
      >
        <h2 className="h3 xl:h2">Recently uploaded</h2>
        <div className="overflow-y-auto xl:max-h-[630px]">
          {recentFiles.length > 0 ? (
            <ul className="mt-5 flex flex-col gap-5">
              {recentFiles.map((file: Models.Document) => (
                <FileListItem key={file.$id} file={file} />
              ))}
            </ul>
          ) : (
            <p className="empty-list" role="status" aria-live="polite">
              No files uploaded
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
