import { render, screen, fireEvent } from "@testing-library/react";
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
  owner: {
    username: "testuser",
    $id: "user-1",
  },
  users: [],
};

const mockFileWithUsers: Models.Document = {
  ...mockFile,
  users: ["user1@example.com", "user2@example.com"],
};

describe("ActionsContent component", () => {
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
    const mockOnEmailChange = jest.fn();
    const mockOnRemove = jest.fn();
    const mockHandleAction = jest.fn();

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("renders share file component with thumbnail and input", () => {
      render(
        <ShareFile
          file={mockFile}
          email=""
          onEmailChange={mockOnEmailChange}
          onRemove={mockOnRemove}
          handleAction={mockHandleAction}
        />,
      );
      expect(screen.getByText(mockFile.name)).toBeInTheDocument();
      expect(
        screen.getByText(/Share file with other users/i),
      ).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/enter email/i)).toBeInTheDocument();
    });

    it("displays empty state when no users are shared", () => {
      render(
        <ShareFile
          file={mockFile}
          email=""
          onEmailChange={mockOnEmailChange}
          onRemove={mockOnRemove}
          handleAction={mockHandleAction}
        />,
      );
      expect(
        screen.getByText(/This file isn't shared with anyone yet/i),
      ).toBeInTheDocument();
    });

    it("displays shared users list when users exist", () => {
      render(
        <ShareFile
          file={mockFileWithUsers}
          email=""
          onEmailChange={mockOnEmailChange}
          onRemove={mockOnRemove}
          handleAction={mockHandleAction}
        />,
      );
      expect(screen.getByText("user1@example.com")).toBeInTheDocument();
      expect(screen.getByText("user2@example.com")).toBeInTheDocument();
      const removeButtons = screen.getAllByLabelText(
        /Remove user from shared list/i,
      );
      expect(removeButtons).toHaveLength(2);
    });

    it("calls onEmailChange when email input changes", () => {
      render(
        <ShareFile
          file={mockFile}
          email=""
          onEmailChange={mockOnEmailChange}
          onRemove={mockOnRemove}
          handleAction={mockHandleAction}
        />,
      );
      const input = screen.getByPlaceholderText(/enter email/i);
      fireEvent.change(input, { target: { value: "test@example.com" } });
      expect(mockOnEmailChange).toHaveBeenCalledWith("test@example.com");
    });

    it("calls handleAction when Enter key is pressed in email input", () => {
      render(
        <ShareFile
          file={mockFile}
          email="test@example.com"
          onEmailChange={mockOnEmailChange}
          onRemove={mockOnRemove}
          handleAction={mockHandleAction}
        />,
      );
      const input = screen.getByPlaceholderText(/enter email/i);
      fireEvent.keyDown(input, { key: "Enter" });
      expect(mockHandleAction).toHaveBeenCalledTimes(1);
    });

    it("calls onRemove when remove button is clicked", () => {
      render(
        <ShareFile
          file={mockFileWithUsers}
          email=""
          onEmailChange={mockOnEmailChange}
          onRemove={mockOnRemove}
          handleAction={mockHandleAction}
        />,
      );
      const removeButtons = screen.getAllByLabelText(
        /Remove user from shared list/i,
      );
      fireEvent.click(removeButtons[0]);
      expect(mockOnRemove).toHaveBeenCalledWith("user1@example.com");
    });

    it("displays correct user count", () => {
      render(
        <ShareFile
          file={mockFileWithUsers}
          email=""
          onEmailChange={mockOnEmailChange}
          onRemove={mockOnRemove}
          handleAction={mockHandleAction}
        />,
      );
      expect(screen.getByText("2 users")).toBeInTheDocument();
    });
  });
});
