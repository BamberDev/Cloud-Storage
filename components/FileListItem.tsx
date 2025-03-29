import Link from "next/link";
import { Models } from "node-appwrite";
import Thumbnail from "./Thumbnail";
import FormattedDateTime from "./FormattedDateTime";
import ActionDropdown from "./ActionDropdown";
import { memo } from "react";

const FileListItem = memo(function FileListItem({
  file,
  currentUser,
}: {
  file: Models.Document;
  currentUser: { $id: string };
}) {
  return (
    <Link href={file.url} target="_blank" className="flex items-center gap-3">
      <Thumbnail type={file.type} extension={file.extension} url={file.url} />
      <div className="recent-file-details">
        <div className="flex flex-col gap-1 min-w-0">
          <p className="recent-file-name">{file.name}</p>
          <FormattedDateTime date={file.$createdAt} />
        </div>
        <div className="flex items-center min-w-[34px]">
          <ActionDropdown file={file} currentUser={currentUser} />
        </div>
      </div>
    </Link>
  );
});

export default FileListItem;
