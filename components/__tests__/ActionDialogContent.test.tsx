import { render, screen, fireEvent } from "@testing-library/react";
import { Dialog } from "@/components/ui/dialog";
import ActionDialogContent from "../ActionDialogContent";
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

const createMockAction = (
  value: ActionTypeProps["value"],
  label: string,
): ActionTypeProps => ({
  label,
  icon: `/icons/${value}.svg`,
  value,
});

const defaultProps: ActionDialogContentProps = {
  action: createMockAction("rename", "Rename"),
  file: mockFile,
  name: "",
  setName: jest.fn(),
  setError: jest.fn(),
  emailInput: "",
  error: null,
  isLoading: false,
  handleAction: jest.fn(),
  closeAllModals: jest.fn(),
  handleEmailChange: jest.fn(),
  handleRemoveUser: jest.fn(),
};

const renderWithDialog = (props: Partial<ActionDialogContentProps> = {}) => {
  return render(
    <Dialog open={true}>
      <ActionDialogContent {...defaultProps} {...props} />
    </Dialog>,
  );
};

describe("ActionDialogContent component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns null when action is null", () => {
    const { container } = renderWithDialog({ action: null });
    expect(container.firstChild).toBeNull();
  });

  describe("Action type rendering", () => {
    it("renders rename action with input field and buttons", () => {
      renderWithDialog({
        action: { label: "Rename", icon: "/icons/rename.svg", value: "rename" },
        name: "test-document",
      });
      expect(screen.getByText("Rename")).toBeInTheDocument();
      expect(screen.getByLabelText("Rename input field")).toHaveValue(
        "test-document",
      );
      expect(screen.getByLabelText("Cancel action")).toBeInTheDocument();
      expect(screen.getByLabelText("Submit action")).toBeInTheDocument();
    });

    it("renders details action without footer buttons", () => {
      renderWithDialog({
        action: {
          label: "Details",
          icon: "/icons/details.svg",
          value: "details",
        },
      });
      expect(screen.getByText("Details")).toBeInTheDocument();
      expect(screen.getByText(mockFile.name)).toBeInTheDocument();
      expect(screen.queryByLabelText("Cancel action")).not.toBeInTheDocument();
    });

    it("renders share action with email input and user list", () => {
      renderWithDialog({
        action: { label: "Share", icon: "/icons/share.svg", value: "share" },
        file: { ...mockFile, users: ["user@example.com"] },
      });
      expect(screen.getByText("Share")).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/enter email/i)).toBeInTheDocument();
      expect(screen.getByText("user@example.com")).toBeInTheDocument();
      expect(screen.getByLabelText("Cancel action")).toBeInTheDocument();
    });

    it("renders delete action with confirmation message", () => {
      renderWithDialog({
        action: { label: "Delete", icon: "/icons/delete.svg", value: "delete" },
      });
      expect(screen.getByText("Delete")).toBeInTheDocument();
      expect(screen.getByText(/Are you sure/i)).toBeInTheDocument();
      expect(screen.getByText(mockFile.name)).toHaveClass("delete-file-name");
    });
  });

  describe("User interactions", () => {
    it("handles rename input change and clears error", () => {
      renderWithDialog({
        action: { label: "Rename", icon: "/icons/rename.svg", value: "rename" },
      });
      const input = screen.getByLabelText("Rename input field");
      fireEvent.change(input, { target: { value: "new-name" } });
      expect(defaultProps.setName).toHaveBeenCalledWith("new-name");
      expect(defaultProps.setError).toHaveBeenCalledWith(null);
    });

    it("submits on Enter key press in rename input", () => {
      renderWithDialog({
        action: { label: "Rename", icon: "/icons/rename.svg", value: "rename" },
      });
      fireEvent.keyDown(screen.getByLabelText("Rename input field"), {
        key: "Enter",
      });
      expect(defaultProps.handleAction).toHaveBeenCalled();
    });

    it("calls closeAllModals when cancel button clicked", () => {
      renderWithDialog({
        action: { label: "Rename", icon: "/icons/rename.svg", value: "rename" },
      });
      fireEvent.click(screen.getByLabelText("Cancel action"));
      expect(defaultProps.closeAllModals).toHaveBeenCalled();
    });

    it("calls handleAction when submit button clicked", () => {
      renderWithDialog({
        action: { label: "Rename", icon: "/icons/rename.svg", value: "rename" },
      });
      fireEvent.click(screen.getByLabelText("Submit action"));
      expect(defaultProps.handleAction).toHaveBeenCalled();
    });
  });

  describe("Loading and error states", () => {
    it.each([
      ["rename", "renaming"],
      ["delete", "deleting"],
      ["share", "sharing"],
    ] as const)(
      "disables buttons and shows %s loading text",
      (actionValue, loadingText) => {
        renderWithDialog({
          action: {
            label: actionValue,
            icon: `/icons/${actionValue}.svg`,
            value: actionValue,
          },
          isLoading: true,
        });
        expect(screen.getByLabelText("Cancel action")).toBeDisabled();
        expect(screen.getByLabelText("Submit action")).toBeDisabled();
        expect(
          screen.getByText(new RegExp(loadingText, "i")),
        ).toBeInTheDocument();
      },
    );

    it("displays error message when provided", () => {
      renderWithDialog({
        action: { label: "Rename", icon: "/icons/rename.svg", value: "rename" },
        error: "Invalid file name",
      });
      expect(screen.getByRole("alert")).toHaveTextContent("Invalid file name");
    });

    it("hides error when error is null", () => {
      renderWithDialog({
        action: { label: "Rename", icon: "/icons/rename.svg", value: "rename" },
        error: null,
      });
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it.each([
      ["rename", `Rename your file "${mockFile.name}"`],
      ["details", `View details for "${mockFile.name}"`],
      ["share", `Share "${mockFile.name}" with others`],
      ["delete", `Confirm deletion of "${mockFile.name}"`],
    ] as const)(
      "renders correct description for %s action",
      (actionValue, description) => {
        renderWithDialog({
          action: {
            label: actionValue,
            icon: `/icons/${actionValue}.svg`,
            value: actionValue,
          },
        });
        expect(
          screen.getByText(description, { selector: "[class*='sr-only']" }),
        ).toBeInTheDocument();
      },
    );
  });
});
