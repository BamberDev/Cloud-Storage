import { render, screen } from "@testing-library/react";
import FileCard from "../FileCard";
import { Models } from "node-appwrite";

jest.mock("@/context/UserContext", () => ({
  useUser: jest.fn(() => ({
    currentUser: { $id: "user-1", email: "test@example.com" },
  })),
}));

jest.mock("@/components/FormattedDateTime", () => {
  return function MockFormattedDateTime() {
    return <div data-testid="mock-date">2 am, 23 Apr</div>;
  };
});

jest.mock("@/components/Thumbnail", () => {
  return function MockThumbnail({ alt }: { alt: string }) {
    return (
      <div data-testid="mock-thumbnail" data-alt={alt}>
        Thumbnail
      </div>
    );
  };
});

jest.mock("@/lib/actions/file.actions", () => ({
  deleteFile: jest.fn(),
  renameFile: jest.fn(),
  updateFileUsers: jest.fn(),
}));

describe("FileCard component", () => {
  const mockFile: Models.Document = {
    $id: "file-123",
    $collectionId: "files",
    $databaseId: "main",
    $createdAt: new Date().toISOString(),
    $updatedAt: new Date().toISOString(),
    $permissions: [],
    name: "test-document.pdf",
    size: 1024 * 1024,
    type: "pdf",
    extension: "pdf",
    url: "https://example.com/test-document.pdf",
    owner: { username: "user1", $id: "user-1" },
  } as Models.Document;

  it("renders file information correctly", () => {
    render(<FileCard file={mockFile} />);
    expect(screen.getByText(mockFile.name)).toBeInTheDocument();
    expect(screen.getByText(/\.pdf$/i)).toBeInTheDocument();
    expect(screen.getByText(/By: user1/i)).toBeInTheDocument();
  });

  it("renders as a link element", () => {
    render(<FileCard file={mockFile} />);
    const link = screen.getByRole("link");
    expect(link).toBeInTheDocument();
  });

  it("renders file link with correct URL and opens in new tab", () => {
    render(<FileCard file={mockFile} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", mockFile.url);
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("renders thumbnail component with correct props", () => {
    render(<FileCard file={mockFile} />);
    const thumbnail = screen.getByTestId("mock-thumbnail");
    expect(thumbnail).toBeInTheDocument();
    expect(thumbnail).toHaveAttribute(
      "data-alt",
      `Thumbnail for ${mockFile.name}`,
    );
  });

  it("handles files with special characters in names", () => {
    const specialFile = {
      ...mockFile,
      name: "file@#$%.pdf",
    } as Models.Document;
    render(<FileCard file={specialFile} />);
    expect(screen.getByText(/file@#\$%\.pdf/)).toBeInTheDocument();
  });

  it("handles very long file names", () => {
    const longFileName = "a".repeat(100) + ".pdf";
    const longNameFile = {
      ...mockFile,
      name: longFileName,
    } as Models.Document;
    render(<FileCard file={longNameFile} />);
    expect(screen.getByText(longFileName)).toBeInTheDocument();
  });

  it("renders formatted date component", () => {
    render(<FileCard file={mockFile} />);
    expect(screen.getByTestId("mock-date")).toBeInTheDocument();
  });

  it("has proper accessibility with aria-label", () => {
    render(<FileCard file={mockFile} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("aria-label");
  });
});
