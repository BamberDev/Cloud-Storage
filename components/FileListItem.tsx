import Link from "next/link";
import { Models } from "node-appwrite";
import Thumbnail from "./Thumbnail";
import FormattedDateTime from "./FormattedDateTime";
import ActionDropdown from "./ActionDropdown";
import { memo } from "react";

const FileListItem = memo(function FileListItem({
  file,
}: {
  file: Models.Document;
}) {
  return (
    <Link
      href={file.url}
      target="_blank"
      className="flex items-center gap-3"
      aria-label={`Open file ${file.name} in a new tab`}
    >
      <Thumbnail
        type={file.type}
        extension={file.extension}
        url={file.url}
        alt={`Thumbnail for ${file.name}`}
      />
      <div className="recent-file-details">
        <div className="flex flex-col gap-1 min-w-0">
          <p className="recent-file-name">{file.name}</p>
          <FormattedDateTime date={file.$createdAt} />
        </div>
        <div className="flex items-center min-w-[34px]">
          <ActionDropdown file={file} />
        </div>
      </div>
    </Link>
  );
});

export default FileListItem;
