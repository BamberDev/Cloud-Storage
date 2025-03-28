import Link from "next/link";
import { Models } from "node-appwrite";
import { memo } from "react";
import Thumbnail from "./Thumbnail";
import { convertFileSize } from "@/lib/utils";
import FormattedDateTime from "./FormattedDateTime";
import ActionDropdown from "./ActionDropdown";

const FileCard = memo(function FileCard({
  file,
  currentUser,
}: {
  file: Models.Document;
  currentUser: { $id: string };
}) {
  return (
    <Link href={file.url} target="_blank" className="file-card">
      <div className="flex justify-between">
        <Thumbnail
          type={file.type}
          extension={file.extension}
          url={file.url}
          className="!size-20"
          imageClassName="!size-11"
        />
        <div className="flex flex-col items-end justify-between">
          <ActionDropdown file={file} currentUser={currentUser} />
          <p className="body-1">{convertFileSize(file.size)}</p>
        </div>
      </div>

      <div className="file-card-details">
        <p className="subtitle-1 line-clamp-1">{file.name}</p>
        <FormattedDateTime date={file.$createdAt} />
        <p className="caption truncate text-light-200">
          By: {file.owner.username}
        </p>
      </div>
    </Link>
  );
});

export default FileCard;
