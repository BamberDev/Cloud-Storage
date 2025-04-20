import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

export default function FileTypeLoading() {
  return (
    <div className="page-container">
      <section className="w-full">
        <Skeleton className="h-[42px] w-48" />
        <div className="total-size-section">
          <div className="flex items-center">
            <p className="body-1">Total:</p>
            <Skeleton className="h-4 w-11 ml-1" />
          </div>
          <div className="sort-container">
            <p className="body-1 hidden sm:block">Sort by:</p>
            <Skeleton className="h-11 w-full sm:w-[210px]" />
          </div>
        </div>
      </section>

      <section className="file-list">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="file-card !cursor-default hover:shadow-none">
            <div className="flex justify-between">
              <Skeleton className="size-20 rounded-full border border-gray-200" />
              <div className="flex flex-col items-end justify-between">
                <Image
                  src="/assets/icons/dots.svg"
                  alt="Dots icon"
                  width={34}
                  height={34}
                />
                <Skeleton className="h-5 w-11" />
              </div>
            </div>
            <div className="file-card-details">
              <Skeleton className="h-6 w-full max-w-[200px]" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
