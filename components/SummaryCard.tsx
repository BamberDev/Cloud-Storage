import { convertFileSize } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Separator } from "./ui/separator";
import FormattedDateTime from "./FormattedDateTime";
import { memo } from "react";

const SummaryCard = memo(function SummaryCard({ summary }: SummaryCardProps) {
  return (
    <Link
      href={summary.url}
      key={summary.title}
      className="dashboard-summary-card"
      aria-label={`View summary details for ${summary.title}`}
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
        <FormattedDateTime date={summary.latestDate} className="text-center" />
      </div>
    </Link>
  );
});

export default SummaryCard;
