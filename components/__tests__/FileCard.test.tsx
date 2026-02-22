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

const renderComponent = (file: Models.Document = mockFile) => {
  return render(<FileCard file={file} />);
};

describe("FileCard component", () => {
  describe("Basic rendering", () => {
    it("renders file information", () => {
      renderComponent();
      expect(screen.getByText(mockFile.name)).toBeInTheDocument();
      expect(screen.getByText(/\.pdf$/i)).toBeInTheDocument();
      expect(screen.getByText(/By: user1/i)).toBeInTheDocument();
    });

    it("renders as link element", () => {
      renderComponent();
      const link = screen.getByRole("link");
      expect(link).toBeInTheDocument();
    });

    it("renders thumbnail", () => {
      renderComponent();
      const thumbnail = screen.getByTestId("mock-thumbnail");
      expect(thumbnail).toBeInTheDocument();
      expect(thumbnail).toHaveAttribute(
        "data-alt",
        `Thumbnail for ${mockFile.name}`,
      );
    });

    it("renders formatted date", () => {
      renderComponent();
      expect(screen.getByTestId("mock-date")).toBeInTheDocument();
    });
  });

  describe("Link attributes", () => {
    it("has correct URL and target", () => {
      renderComponent();
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", mockFile.url);
      expect(link).toHaveAttribute("target", "_blank");
    });

    it("has aria-label", () => {
      renderComponent();
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("aria-label");
    });
  });

  describe("Edge cases", () => {
    it("handles special characters in file names", () => {
      const specialFile = {
        ...mockFile,
        name: "file@#$%.pdf",
      } as Models.Document;
      renderComponent(specialFile);
      expect(screen.getByText(/file@#\$%\.pdf/)).toBeInTheDocument();
    });

    it("handles long file names", () => {
      const longFileName = "a".repeat(100) + ".pdf";
      const longNameFile = {
        ...mockFile,
        name: longFileName,
      } as Models.Document;
      renderComponent(longNameFile);
      expect(screen.getByText(longFileName)).toBeInTheDocument();
    });
  });
});
