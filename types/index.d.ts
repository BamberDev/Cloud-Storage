// declared types

type FileType = "document" | "image" | "video" | "audio" | "other";

type ActionType = {
  label: string;
  icon: string;
  value: string;
};

type SearchParamProps = {
  params?: Promise<SegmentParams>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

type UploadFileProps = {
  file: File;
  ownerId: string;
  accountId: string;
  path: string;
};
type GetFilesProps = {
  types: FileType[];
  searchText?: string;
  sort?: string;
  limit?: number;
};
type RenameFileProps = {
  fileId: string;
  name: string;
  extension: string;
  path: string;
};
type UpdateFileUsersProps = {
  fileId: string;
  emails: string[];
  path: string;
};
type DeleteFileProps = {
  fileId: string;
  bucketFileId: string;
  path: string;
};

type FileUploaderProps = {
  ownerId: string;
  accountId: string;
  className?: string;
};

type MobileNavigationProps = {
  ownerId: string;
  accountId: string;
  fullName: string;
  avatar: string;
  email: string;
};
type SidebarProps = {
  fullName: string;
  avatar: string;
  email: string;
};

type ThumbnailProps = {
  type: string;
  extension: string;
  url: string;
  className?: string;
  imageClassName?: string;
};

type ShareInputProps = {
  file: Models.Document;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: (email: string) => void;
};
