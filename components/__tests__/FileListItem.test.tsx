import { render, screen } from "@testing-library/react";
import FileListItem from "../FileListItem";
import { Models } from "node-appwrite";

jest.mock("@/components/Thumbnail", () => {
  return function MockThumbnail({ alt }: { alt: string }) {
    return <div data-testid="mock-thumbnail">{alt}</div>;
  };
});

jest.mock("@/components/FormattedDateTime", () => {
  return function MockFormattedDateTime() {
    return <div data-testid="mock-date">2 am, 23 Apr</div>;
  };
});

jest.mock("@/components/ActionDropdown", () => {
  return function MockActionDropdown() {
    return <div data-testid="mock-action-dropdown">actions</div>;
  };
});

describe("FileListItem component", () => {
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

  it("renders file list item with link", () => {
    render(<FileListItem file={mockFile} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", mockFile.url);
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("displays file name", () => {
    render(<FileListItem file={mockFile} />);
    expect(screen.getByText(mockFile.name)).toBeInTheDocument();
  });

  it("renders thumbnail component", () => {
    render(<FileListItem file={mockFile} />);
    expect(screen.getByTestId("mock-thumbnail")).toBeInTheDocument();
  });

  it("renders formatted date component", () => {
    render(<FileListItem file={mockFile} />);
    expect(screen.getByTestId("mock-date")).toBeInTheDocument();
  });

  it("renders action dropdown component", () => {
    render(<FileListItem file={mockFile} />);
    expect(screen.getByTestId("mock-action-dropdown")).toBeInTheDocument();
  });

  it("has proper aria-label for accessibility", () => {
    render(<FileListItem file={mockFile} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute(
      "aria-label",
      `Open file ${mockFile.name} in a new tab`,
    );
  });
});
