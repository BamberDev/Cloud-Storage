import { render, screen } from "@testing-library/react";
import FileTypePageContent from "../FileTypePageContent";
import { Models } from "node-appwrite";
import { convertFileSize, getUsageSummary } from "@/lib/utils";
import { usePageErrorToast } from "@/hooks/usePageErrorToast";

jest.mock("@/hooks/usePageErrorToast", () => ({
  usePageErrorToast: jest.fn(),
}));

jest.mock("@/components/FileCard", () => {
  return function MockFileCard({ file }: { file: Models.Document }) {
    return <div data-testid="mock-file-card">{file.name}</div>;
  };
});

jest.mock("@/components/Sort", () => {
  return function MockSort() {
    return <div data-testid="mock-sort">Sort</div>;
  };
});

const mockFiles: Models.Document[] = [
  {
    $id: "file-1",
    $collectionId: "files",
    $databaseId: "main",
    $createdAt: new Date().toISOString(),
    $updatedAt: new Date().toISOString(),
    $permissions: [],
    name: "image1.jpg",
    size: 2 * 1024 * 1024,
    type: "image",
    extension: "jpg",
    url: "https://example.com/image1.jpg",
    owner: { username: "user1", $id: "user-1" },
  } as Models.Document,
  {
    $id: "file-2",
    $collectionId: "files",
    $databaseId: "main",
    $createdAt: new Date().toISOString(),
    $updatedAt: new Date().toISOString(),
    $permissions: [],
    name: "image2.png",
    size: 3 * 1024 * 1024,
    type: "image",
    extension: "png",
    url: "https://example.com/image2.png",
    owner: { username: "user2", $id: "user-2" },
  } as Models.Document,
];

const mockTotalSpace = {
  image: { size: 5 * 1024 * 1024, latestDate: new Date().toISOString() },
  document: { size: 2 * 1024 * 1024, latestDate: new Date().toISOString() },
  video: { size: 1024 * 1024, latestDate: new Date().toISOString() },
  audio: { size: 512 * 1024, latestDate: new Date().toISOString() },
  other: { size: 256 * 1024, latestDate: new Date().toISOString() },
  used: 8 * 1024 * 1024,
  all: 100 * 1024 * 1024,
};

const defaultProps = {
  type: "image" as const,
  files: { documents: mockFiles },
  totalSpace: mockTotalSpace,
  hasFileError: false,
  hasSpaceError: false,
};

const renderComponent = (props = {}) => {
  return render(<FileTypePageContent {...defaultProps} {...props} />);
};

describe("FileTypePageContent component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Basic rendering", () => {
    it("renders heading with file type", () => {
      renderComponent();
      const heading = screen.getByRole("heading");
      expect(heading).toHaveTextContent(/image/i);
    });

    it("renders sort component", () => {
      renderComponent();
      expect(screen.getByTestId("mock-sort")).toBeInTheDocument();
    });

    it("renders file cards for each file", () => {
      renderComponent();
      const fileCards = screen.getAllByTestId("mock-file-card");
      expect(fileCards).toHaveLength(mockFiles.length);
    });

    it("displays formatted total size for type", () => {
      renderComponent({ type: "images" });
      const usage = getUsageSummary(mockTotalSpace);
      const imageSummary = usage.find((u) => u.title.toLowerCase() === "images");
      const expectedText = imageSummary
        ? convertFileSize(imageSummary.size)
        : "0";
      expect(screen.getByText(expectedText)).toBeInTheDocument();
    });
  });

  describe("Empty state", () => {
    it("displays empty state when no files", () => {
      renderComponent({ type: "document", files: { documents: [] } });
      expect(screen.getByText(/No files found/i)).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("renders section with aria-label", () => {
      renderComponent({ type: "video" });
      const section = screen.getByLabelText(/List of video files/i);
      expect(section).toBeInTheDocument();
    });
  });

  describe("Error handling", () => {
    it.each([
      [true, false],
      [false, true],
    ])("calls usePageErrorToast with hasFileError=%s, hasSpaceError=%s", (fileError, spaceError) => {
      (usePageErrorToast as jest.Mock).mockClear();
      renderComponent({ hasFileError: fileError, hasSpaceError: spaceError });
      expect(usePageErrorToast).toHaveBeenCalledWith(fileError, spaceError);
    });
  });
});
