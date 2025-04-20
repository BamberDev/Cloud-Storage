import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";

const summary = [
  {
    title: "Documents",
    icon: "/assets/icons/file-document-light.svg",
  },
  {
    title: "Images",
    icon: "/assets/icons/file-image-light.svg",
  },
  {
    title: "Media",
    icon: "/assets/icons/file-video-light.svg",
  },
  {
    title: "Others",
    icon: "/assets/icons/file-other-light.svg",
  },
];

export default function DashboardLoading() {
  return (
    <div className="dashboard-container">
      <section>
        <Card className="chart">
          <CardContent className="flex-1 p-0">
            <div className="chart-container relative flex items-center justify-center">
              <div className="relative w-[170px] h-[170px] flex items-center justify-center">
                <Skeleton className="absolute inset-0 rounded-full opacity-15" />
                <Skeleton className="absolute inset-[7%] rounded-full opacity-20" />
                <div className="text-center mt-[6px]">
                  <Skeleton className="h-[36px] w-24 mx-auto" />
                  <p className="text-white/70 caption mt-1">Space used</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardHeader className="chart-details mb-1">
            <CardTitle className="chart-title mb-1">Space used</CardTitle>
            <Skeleton className="h-4 w-[100px] mx-auto" />
          </CardHeader>
        </Card>

        <ul className="dashboard-summary-list">
          {summary.map(({ title, icon }) => (
            <li key={title} className="dashboard-summary-card">
              <div className="space-y-4">
                <div className="flex justify-end gap-3">
                  <Image
                    src={icon}
                    width={100}
                    height={100}
                    alt={`${title} icon`}
                    className="summary-type-icon"
                  />
                  <Skeleton className="w-16 h-5" />
                </div>
                <h5 className="summary-type-title">{title}</h5>
                <Separator className="bg-light-400" />
                <Skeleton className="h-4 w-24 mx-auto" />
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="dashboard-recent-files">
        <h2 className="h3 xl:h2">Recently uploaded</h2>
        <ul className="mt-5 flex flex-col gap-5">
          {Array.from({ length: 9 }).map((_, i) => (
            <li key={i} className="flex items-center gap-3">
              <Skeleton className="h-[50px] w-[50px] rounded-full flex-shrink-0" />
              <div className="recent-file-details">
                <div className="flex flex-col gap-1 min-w-0 flex-grow">
                  <Skeleton className="h-4 w-full max-w-[200px]" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex items-center min-w-[34px] pl-3">
                  <Image
                    src="/assets/icons/dots.svg"
                    alt="Dots icon"
                    width={34}
                    height={34}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
