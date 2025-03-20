"use client";

import Chart from "@/components/Chart";
import { getUsageSummary } from "@/lib/utils";
import { Models } from "node-appwrite";
import SummaryCard from "./SummaryCard";
import FileListItem from "./FileListItem";
import { useErrorToast } from "@/hooks/useErrorToast";
import { useMemo } from "react";

export default function DashboardPageContent({
  currentUser,
  files,
  totalSpace,
  hasFileError,
  hasSpaceError,
}: PageContentProps) {
  useErrorToast(hasFileError, hasSpaceError);
  const usageSummary = useMemo(() => getUsageSummary(totalSpace), [totalSpace]);
  const recentFiles = useMemo(
    () => files.documents.slice(0, 9),
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
