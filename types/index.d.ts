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
  userId: string;
  userEmail: string;
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

type UseFileUploaderProps = {
  ownerId: string;
  accountId: string;
  path: string;
  onFileProcessed: (fileName: string) => void;
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
  alt: string;
  url?: string;
  className?: string;
  imageClassName?: string;
};

type ShareFileProps = {
  file: Models.Document;
  email: string;
  onEmailChange: (email: string) => void;
  onRemove: (email: string) => void;
  handleAction: () => void;
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

type ChartLabelProps = {
  viewBox?: { cx?: number; cy?: number; width?: number; height?: number };
  used: number;
  percentageUsed: number;
};

type SummaryCardProps = {
  summary: {
    title: string;
    url: string;
    icon: string;
    size: number;
    latestDate: string;
  };
};

type AuthFormFieldProps<T extends FieldValues> = {
  form: UseFormReturn<T>;
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  customComponent?: React.ReactNode;
  onInputChange?: () => void;
};

type ActionDialogContentProps = {
  action: ActionTypeProps | null;
  file: Models.Document;
  name: string;
  setName: (value: string) => void;
  setError: (value: string | null) => void;
  emailInput: string;
  error: string | null;
  isLoading: boolean;
  handleAction: () => void;
  closeAllModals: () => void;
  handleEmailChange: (email: string) => void;
  handleRemoveUser: (email: string) => void;
};

type NavItemsProps = {
  className?: string;
  onItemClick?: () => void;
  variant: "mobile" | "sidebar";
  showLabels?: boolean;
};
