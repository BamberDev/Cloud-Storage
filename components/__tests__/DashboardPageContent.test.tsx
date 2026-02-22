import { render, screen } from "@testing-library/react";
import DashboardPageContent from "../DashboardPageContent";
import { Models } from "node-appwrite";

const mockUsePageErrorToast = jest.fn();

jest.mock("@/hooks/usePageErrorToast", () => ({
  usePageErrorToast: (...args: unknown[]) => mockUsePageErrorToast(...args),
}));

jest.mock("@/components/Chart", () => {
  return function MockChart({ used }: { used: number }) {
    return (
      <div data-testid="mock-chart" data-used={used}>
        Chart
      </div>
    );
  };
});

jest.mock("@/components/SummaryCard", () => {
  return function MockSummaryCard({ summary }: { summary: { title: string } }) {
    return <div data-testid="mock-summary-card">{summary.title}</div>;
  };
});

jest.mock("@/components/FileListItem", () => {
  return function MockFileListItem({ file }: { file: Models.Document }) {
    return <div data-testid="mock-file-list-item">{file.name}</div>;
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
    name: "document1.pdf",
    size: 1024 * 1024,
    type: "pdf",
    extension: "pdf",
    url: "https://example.com/document1.pdf",
    owner: { username: "user1", $id: "user-1" },
  } as Models.Document,
  {
    $id: "file-2",
    $collectionId: "files",
    $databaseId: "main",
    $createdAt: new Date().toISOString(),
    $updatedAt: new Date().toISOString(),
    $permissions: [],
    name: "document2.docx",
    size: 2 * 1024 * 1024,
    type: "document",
    extension: "docx",
    url: "https://example.com/document2.docx",
    owner: { username: "user2", $id: "user-2" },
  } as Models.Document,
];

const mockTotalSpace = {
  image: { size: 1024 * 1024, latestDate: new Date().toISOString() },
  document: { size: 2 * 1024 * 1024, latestDate: new Date().toISOString() },
  video: { size: 1024 * 1024, latestDate: new Date().toISOString() },
  audio: { size: 512 * 1024, latestDate: new Date().toISOString() },
  other: { size: 256 * 1024, latestDate: new Date().toISOString() },
  used: 5 * 1024 * 1024,
  all: 100 * 1024 * 1024,
};

const defaultProps = {
  files: { documents: mockFiles },
  totalSpace: mockTotalSpace,
  hasFileError: false,
  hasSpaceError: false,
};

const renderComponent = (props = {}) => {
  return render(<DashboardPageContent {...defaultProps} {...props} />);
};

describe("DashboardPageContent component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Chart and summary rendering", () => {
    it("renders chart with correct used value", () => {
      renderComponent();
      const chart = screen.getByTestId("mock-chart");
      expect(chart).toBeInTheDocument();
      expect(chart).toHaveAttribute("data-used", String(mockTotalSpace.used));
    });

    it("renders summary cards for each category", () => {
      renderComponent();
      const summaryCards = screen.getAllByTestId("mock-summary-card");
      expect(summaryCards).toHaveLength(4);
    });
  });

  describe("File list rendering", () => {
    it("renders all recent files", () => {
      renderComponent();
      expect(screen.getByText(/Recently uploaded/i)).toBeInTheDocument();
      const fileListItems = screen.getAllByTestId("mock-file-list-item");
      expect(fileListItems).toHaveLength(mockFiles.length);
      expect(fileListItems[0]).toHaveTextContent("document1.pdf");
      expect(fileListItems[1]).toHaveTextContent("document2.docx");
    });

    it("limits recent files to 14", () => {
      const manyFiles = Array.from({ length: 20 }, (_, i) => ({
        ...mockFiles[0],
        $id: `file-${i}`,
        name: `document${i}.pdf`,
      }));
      renderComponent({ files: { documents: manyFiles } });
      const fileListItems = screen.getAllByTestId("mock-file-list-item");
      expect(fileListItems).toHaveLength(14);
    });

    it("displays empty state when no files", () => {
      renderComponent({ files: { documents: [] } });
      expect(screen.getByText(/No files uploaded/i)).toBeInTheDocument();
      expect(screen.queryAllByTestId("mock-file-list-item")).toHaveLength(0);
    });
  });

  describe("Accessibility", () => {
    it("renders section with aria-label", () => {
      renderComponent();
      const section = screen.getByLabelText("List of recently uploaded files");
      expect(section).toBeInTheDocument();
    });
  });

  describe("Error handling", () => {
    it.each([
      [true, false],
      [false, true],
      [true, true],
    ])("calls usePageErrorToast with hasFileError=%s, hasSpaceError=%s", (fileError, spaceError) => {
      renderComponent({ hasFileError: fileError, hasSpaceError: spaceError });
      expect(mockUsePageErrorToast).toHaveBeenCalledWith(fileError, spaceError);
      expect(mockUsePageErrorToast).toHaveBeenCalledTimes(1);
    });
  });
});
