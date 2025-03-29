import { cn, formatDateTime } from "@/lib/utils";

export default function FormattedDateTime({
  date,
  className,
}: {
  date: string;
  className?: string;
}) {
  return (
    <p className={cn("caption text-light-200", className)}>
      {formatDateTime(date)}
    </p>
  );
}
