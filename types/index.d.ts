// declared types

type FileType = "document" | "image" | "video" | "audio" | "other";

type FormType = "sign-in" | "sign-up" | "test-account";

type ActionTypeProps = {
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
  $id: string;
  accountId: string;
  username: string;
  avatar: string;
  email: string;
};

type SidebarProps = {
  username: string;
  avatar: string;
  email: string;
};

type ThumbnailProps = {
  type: string;
  extension: string;
  url?: string;
  className?: string;
  imageClassName?: string;
};

type ShareFileProps = {
  file: Models.Document;
  email: string;
  onEmailChange: (email: string) => void;
  onRemove: (email: string) => void;
};

type LogoutDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: React.ReactNode;
};

type PageContentProps = {
  type?: string;
  currentUser: Models.User<Models.Preferences>;
  files: { documents: Models.Document[] };
  totalSpace: {
    image: { size: number; latestDate: string };
    document: { size: number; latestDate: string };
    video: { size: number; latestDate: string };
    audio: { size: number; latestDate: string };
    other: { size: number; latestDate: string };
    used: number;
    all: number;
  };
  hasFileError: boolean;
  hasSpaceError: boolean;
};
