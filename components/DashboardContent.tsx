"use client";

import { useEffect, useMemo, useRef } from "react";
import ActionDropdown from "@/components/ActionDropdown";
import Chart from "@/components/Chart";
import FormattedDateTime from "@/components/FormattedDateTime";
import Thumbnail from "@/components/Thumbnail";
import { Separator } from "@/components/ui/separator";
import { convertFileSize, getUsageSummary } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { Models } from "node-appwrite";

export default function DashboardContent({
  currentUser,
  files,
  totalSpace,
  hasFileError,
  hasSpaceError,
}: DashboardContentProps) {
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
                Could not load your recent files. Please try again by refreshing
                the page.
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
            <Link
              href={summary.url}
              key={summary.title}
              className="dashboard-summary-card"
            >
              <div className="space-y-4">
                <div className="flex justify-between gap-3">
                  <Image
                    src={summary.icon}
                    width={100}
                    height={100}
                    alt={`${summary.title} icon`}
                    className="summary-type-icon"
                  />
                  <h4 className="summary-type-size">
                    {convertFileSize(summary.size) || 0}
                  </h4>
                </div>

                <h5 className="summary-type-title">{summary.title}</h5>
                <Separator className="bg-light-400" />
                <FormattedDateTime
                  date={summary.latestDate}
                  className="text-center caption"
                />
              </div>
            </Link>
          ))}
        </ul>
      </section>

      <section className="dashboard-recent-files">
        <h2 className="h3 xl:h2 text-light-100">Recently uploaded</h2>
        {files.documents.length > 0 ? (
          <ul className="mt-5 flex flex-col gap-5">
            {files.documents.slice(0, 9).map((file: Models.Document) => (
              <Link
                href={file.url}
                target="_blank"
                className="flex items-center gap-3"
                key={file.$id}
              >
                <Thumbnail
                  type={file.type}
                  extension={file.extension}
                  url={file.url}
                />

                <div className="recent-file-details">
                  <div className="flex flex-col gap-1 min-w-0">
                    <p className="recent-file-name">{file.name}</p>
                    <FormattedDateTime
                      date={file.$createdAt}
                      className="caption"
                    />
                  </div>
                  <div className="flex items-center min-w-[34px]">
                    <ActionDropdown file={file} currentUser={currentUser} />
                  </div>
                </div>
              </Link>
            ))}
          </ul>
        ) : (
          <p className="empty-list">No files uploaded</p>
        )}
      </section>
    </div>
  );
}
