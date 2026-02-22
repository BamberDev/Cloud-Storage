import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ActionDropdown from "../ActionDropdown";
import * as fileActions from "@/lib/actions/file.actions";
import { usePathname } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { Models } from "node-appwrite";
import { AnchorHTMLAttributes, ImgHTMLAttributes, ReactNode } from "react";

jest.mock("next/navigation", () => ({ usePathname: jest.fn() }));
jest.mock("@/context/UserContext", () => ({ useUser: jest.fn() }));
jest.mock("@/lib/actions/file.actions", () => ({
  deleteFile: jest.fn(),
  renameFile: jest.fn(),
  updateFileUsers: jest.fn(),
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: ImgHTMLAttributes<HTMLImageElement>) => <img {...props} />,
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({
    children,
    href,
    ...props
  }: {
    children: ReactNode;
    href: string;
    [key: string]: unknown;
  }) => (
    <a href={href} {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}>
      {children}
    </a>
  ),
}));

describe("ActionDropdown component", () => {
  const mockUser = {
    $id: "user-1",
    email: "owner@example.com",
    username: "owner",
  };
  const mockFile: Models.Document = {
    $id: "file-1",
    $collectionId: "files",
    $databaseId: "main",
    $createdAt: new Date().toISOString(),
    $updatedAt: new Date().toISOString(),
    $permissions: [],
    name: "document.txt",
    extension: "txt",
    type: "document",
    size: 1024,
    url: "https://example.com/document.txt",
    bucketFileId: "bucket-file-1",
    owner: { $id: "user-1", username: "owner" },
    users: ["collaborator@example.com"],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (usePathname as jest.Mock).mockReturnValue("/dashboard");
    (useUser as jest.Mock).mockReturnValue({ currentUser: mockUser });
  });

  const openDropdown = async () => {
    const user = userEvent.setup();
    render(<ActionDropdown file={mockFile} />);
    await user.click(screen.getByRole("button"));
    return user;
  };

  it("renders dropdown trigger button", () => {
    render(<ActionDropdown file={mockFile} />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  describe("Dropdown menu items", () => {
    it("displays all action options when opened", async () => {
      await openDropdown();
      expect(screen.getByText("Rename")).toBeInTheDocument();
      expect(screen.getByText("Details")).toBeInTheDocument();
      expect(screen.getByText("Share")).toBeInTheDocument();
      expect(screen.getByText("Download")).toBeInTheDocument();
      expect(screen.getByText("Delete")).toBeInTheDocument();
    });
  });

  describe("Permission-based visibility", () => {
    it.each([
      ["user-1", ["Rename", "Share", "Delete", "Download", "Details"]],
      ["user-2", ["Download", "Details"]],
    ])("shows correct actions for users", async (userId, expectedActions) => {
      (useUser as jest.Mock).mockReturnValue({
        currentUser: { ...mockUser, $id: userId },
      });
      const user = userEvent.setup();
      render(<ActionDropdown file={mockFile} />);
      await user.click(screen.getByRole("button"));
      expectedActions.forEach((action) => {
        expect(screen.getByText(action)).toBeInTheDocument();
      });

      if (userId === "user-2") {
        expect(screen.queryByText("Rename")).not.toBeInTheDocument();
        expect(screen.queryByText("Share")).not.toBeInTheDocument();
        expect(screen.queryByText("Delete")).not.toBeInTheDocument();
      }
    });
  });

  describe("Rename functionality", () => {
    it("renames file successfully", async () => {
      const user = await openDropdown();
      await user.click(screen.getByText("Rename"));
      const input = screen.getByDisplayValue("document");
      await user.clear(input);
      await user.type(input, "newname");
      await user.click(screen.getByLabelText("Submit action"));
      await waitFor(() => {
        expect(fileActions.renameFile).toHaveBeenCalledWith({
          fileId: "file-1",
          name: "newname",
          extension: "txt",
          path: "/dashboard",
        });
      });
    });

    it("shows error for empty name", async () => {
      const user = await openDropdown();
      await user.click(screen.getByText("Rename"));
      const input = screen.getByDisplayValue("document");
      await user.clear(input);
      await user.click(screen.getByLabelText("Submit action"));
      expect(await screen.findByText(/cannot be empty/i)).toBeInTheDocument();
    });

    it("trims whitespace from file names", async () => {
      const user = await openDropdown();
      await user.click(screen.getByText("Rename"));
      const input = screen.getByDisplayValue("document");
      await user.clear(input);
      await user.type(input, "  newname  ");
      await user.click(screen.getByLabelText("Submit action"));
      await waitFor(() => {
        expect(fileActions.renameFile).toHaveBeenCalledWith(
          expect.objectContaining({ name: "newname" }),
        );
      });
    });

    it("handles server errors", async () => {
      (fileActions.renameFile as jest.Mock).mockRejectedValueOnce(
        new Error("Server error"),
      );
      const user = await openDropdown();
      await user.click(screen.getByText("Rename"));
      const input = screen.getByDisplayValue("document");
      await user.type(input, "newname");
      await user.click(screen.getByLabelText("Submit action"));
      expect(
        await screen.findByText(/something went wrong/i),
      ).toBeInTheDocument();
    });
  });

  describe("Share functionality", () => {
    it("shares file with valid email", async () => {
      const user = await openDropdown();
      await user.click(screen.getByText("Share"));
      await user.type(
        screen.getByPlaceholderText(/enter email/i),
        "newuser@example.com",
      );
      await user.click(screen.getByLabelText("Submit action"));
      await waitFor(() => {
        expect(fileActions.updateFileUsers).toHaveBeenCalledWith({
          fileId: "file-1",
          emails: expect.arrayContaining(["newuser@example.com"]),
          path: "/dashboard",
        });
      });
    });

    it("validates email format", async () => {
      const user = await openDropdown();
      await user.click(screen.getByText("Share"));
      await user.type(
        screen.getByPlaceholderText(/enter email/i),
        "invalidemail",
      );
      await user.click(screen.getByLabelText("Submit action"));
      expect(await screen.findByText(/invalid email/i)).toBeInTheDocument();
    });

    it("shows error for duplicate email", async () => {
      const user = await openDropdown();
      await user.click(screen.getByText("Share"));
      await user.type(
        screen.getByPlaceholderText(/enter email/i),
        "collaborator@example.com",
      );
      await user.click(screen.getByLabelText("Submit action"));
      expect(
        await screen.findByText(/already has access/i),
      ).toBeInTheDocument();
    });
  });

  describe("Delete functionality", () => {
    it("deletes file when confirmed", async () => {
      const user = await openDropdown();
      await user.click(screen.getByText("Delete"));
      await user.click(screen.getByLabelText("Submit action"));
      await waitFor(() => {
        expect(fileActions.deleteFile).toHaveBeenCalledWith({
          fileId: "file-1",
          bucketFileId: "bucket-file-1",
          path: "/dashboard",
        });
      });
    });

    it("shows confirmation dialog before delete", async () => {
      const user = await openDropdown();
      await user.click(screen.getByText("Delete"));
      expect(await screen.findByText(/are you sure/i)).toBeInTheDocument();
      expect(screen.getByText("document.txt")).toBeInTheDocument();
    });

    it("handles delete errors", async () => {
      (fileActions.deleteFile as jest.Mock).mockRejectedValueOnce(
        new Error("Server error"),
      );
      const user = await openDropdown();
      await user.click(screen.getByText("Delete"));
      await user.click(screen.getByLabelText("Submit action"));
      expect(
        await screen.findByText(/something went wrong/i),
      ).toBeInTheDocument();
    });
  });

  describe("Details functionality", () => {
    it("shows file details modal", async () => {
      const user = await openDropdown();
      await user.click(screen.getByText("Details"));
      expect(screen.getByText("Details")).toBeInTheDocument();
      expect(screen.getByText("document.txt")).toBeInTheDocument();
      expect(screen.getByText("Format:")).toBeInTheDocument();
    });

    it("does not show footer buttons in details view", async () => {
      const user = await openDropdown();
      await user.click(screen.getByText("Details"));
      expect(screen.queryByLabelText("Cancel action")).not.toBeInTheDocument();
      expect(screen.queryByLabelText("Submit action")).not.toBeInTheDocument();
    });
  });

  describe("Download functionality", () => {
    it("renders download link with correct attributes", async () => {
      await openDropdown();
      const downloadLink = screen.getByLabelText("Download file");
      expect(downloadLink).toBeInTheDocument();
      expect(downloadLink.tagName).toBe("A");
      expect(downloadLink).toHaveAttribute("download", "document.txt");
      expect(downloadLink).toHaveAttribute("target", "_blank");
    });
  });

  describe("Modal interactions", () => {
    it("closes modal on cancel button click", async () => {
      const user = await openDropdown();
      await user.click(screen.getByText("Rename"));
      await user.click(screen.getByLabelText("Cancel action"));
      await waitFor(() => {
        expect(
          screen.queryByLabelText("Rename input field"),
        ).not.toBeInTheDocument();
      });
    });
  });
});
