import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FileDetails, ShareFile } from "../ActionsContent";
import { Models } from "node-appwrite";

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
  owner: { username: "testuser", $id: "user-1" },
  users: [],
};

const mockFileWithUsers: Models.Document = {
  ...mockFile,
  users: ["user1@example.com", "user2@example.com"],
};

const defaultProps = {
  file: mockFile,
  email: "",
  onEmailChange: jest.fn(),
  onRemove: jest.fn(),
  handleAction: jest.fn(),
};

describe("ActionsContent component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("FileDetails", () => {
    it("renders file details with thumbnail and information", () => {
      render(<FileDetails file={mockFile} />);
      expect(screen.getByText(mockFile.name)).toBeInTheDocument();
      expect(screen.getByText("pdf")).toBeInTheDocument();
      expect(screen.getByText("testuser")).toBeInTheDocument();
      expect(screen.getByText("Format:")).toBeInTheDocument();
      expect(screen.getByText("Size:")).toBeInTheDocument();
      expect(screen.getByText("Owner:")).toBeInTheDocument();
      expect(screen.getByText("Last edit:")).toBeInTheDocument();
    });
  });

  describe("ShareFile", () => {
    it("renders share file component with thumbnail and input", () => {
      render(<ShareFile {...defaultProps} />);
      expect(screen.getByText(mockFile.name)).toBeInTheDocument();
      expect(
        screen.getByText(/Share file with other users/i),
      ).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/enter email/i)).toBeInTheDocument();
    });

    it("displays empty state when no users are shared", () => {
      render(<ShareFile {...defaultProps} />);
      expect(
        screen.getByText(/This file isn't shared with anyone yet/i),
      ).toBeInTheDocument();
    });

    it("displays shared users list when users exist", () => {
      render(<ShareFile {...defaultProps} file={mockFileWithUsers} />);
      expect(screen.getByText("user1@example.com")).toBeInTheDocument();
      expect(screen.getByText("user2@example.com")).toBeInTheDocument();
      expect(
        screen.getAllByLabelText(/Remove user from shared list/i),
      ).toHaveLength(2);
    });

    it("calls onEmailChange when email input changes", async () => {
      const user = userEvent.setup();
      render(<ShareFile {...defaultProps} />);
      await user.type(
        screen.getByPlaceholderText(/enter email/i),
        "test@example.com",
      );
      expect(defaultProps.onEmailChange).toHaveBeenCalled();
    });

    it("calls handleAction when Enter key is pressed", async () => {
      const user = userEvent.setup();
      render(<ShareFile {...defaultProps} email="test@example.com" />);
      await user.type(screen.getByPlaceholderText(/enter email/i), "{enter}");
      expect(defaultProps.handleAction).toHaveBeenCalledTimes(1);
    });

    it("calls onRemove when remove button is clicked", async () => {
      const user = userEvent.setup();
      render(<ShareFile {...defaultProps} file={mockFileWithUsers} />);
      const removeButtons = screen.getAllByLabelText(
        /Remove user from shared list/i,
      );
      await user.click(removeButtons[0]);
      expect(defaultProps.onRemove).toHaveBeenCalledWith("user1@example.com");
    });

    it("displays correct user count", () => {
      render(<ShareFile {...defaultProps} file={mockFileWithUsers} />);
      expect(screen.getByText("2 users")).toBeInTheDocument();
    });
  });
});
