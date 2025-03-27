import { Models } from "node-appwrite";
import Thumbnail from "./Thumbnail";
import FormattedDateTime from "./FormattedDateTime";
import { convertFileSize, formatDateTime } from "@/lib/utils";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import Image from "next/image";
import { memo } from "react";

const ImageThumbnail = ({ file }: { file: Models.Document }) => (
  <div className="file-details-thumbnail">
    <Thumbnail type={file.type} extension={file.extension} url={file.url} />
    <div className="flex flex-col">
      <p className="file-details-name">{file.name}</p>
      <FormattedDateTime date={file.$createdAt} className="caption" />
    </div>
  </div>
);

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex">
    <p className="file-details-label">{label}</p>
    <p className="subtitle-2 text-left">{value}</p>
  </div>
);

export const FileDetails = memo(function FileDetails({
  file,
}: {
  file: Models.Document;
}) {
  return (
    <>
      <ImageThumbnail file={file} />
      <div className="space-y-4 px-2 pt-2">
        <DetailRow label="Format:" value={file.extension} />
        <DetailRow label="Size:" value={convertFileSize(file.size)} />
        <DetailRow label="Owner:" value={file.owner.username} />
        <DetailRow label="Last edit:" value={formatDateTime(file.$updatedAt)} />
      </div>
    </>
  );
});

export const ShareFile = memo(function ShareFile({
  file,
  email,
  onEmailChange,
  onRemove,
}: ShareFileProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onEmailChange(e.target.value.trim());
  };

  return (
    <>
      <ImageThumbnail file={file} />
      <div className="space-y-2">
        <p className="subtitle-2 pl-1 text-light-100">
          Share file with other users
        </p>
        <Input
          type="email"
          placeholder="Enter email address"
          onChange={handleInputChange}
          value={email}
          className="share-input-field"
          autoComplete="email"
        />
        <div>
          <div className="flex justify-between">
            <p className="subtitle-2 text-light-100">Shared with</p>
            <p className="subtitle-2 text-light-200">
              {file.users.length} users
            </p>
          </div>

          {file.users.length === 0 ? (
            <p className="mt-3 text-center text-light-200">
              This file isn&apos;t shared with anyone yet
            </p>
          ) : (
            <ul className="mt-3">
              {file.users.map((userEmail: string) => (
                <li
                  key={userEmail}
                  className="flex items-center justify-between gap-2"
                >
                  <p className="subtitle-2">{userEmail}</p>
                  <Button
                    onClick={() => onRemove(userEmail)}
                    className="share-remove-user"
                  >
                    <Image
                      src="/assets/icons/remove.svg"
                      alt="Remove"
                      width={24}
                      height={24}
                      className="aspect-square rounded-full"
                    />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
});
