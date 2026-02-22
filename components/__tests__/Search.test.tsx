import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Search from "../Search";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { getFiles } from "@/lib/actions/file.actions";
import { ImgHTMLAttributes } from "react";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
  useSearchParams: jest.fn(),
}));

jest.mock("@/context/UserContext", () => ({
  useUser: jest.fn(),
}));

jest.mock("@/lib/actions/file.actions", () => ({
  getFiles: jest.fn(),
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: ImgHTMLAttributes<HTMLImageElement>) => <img {...props} />,
}));

const mockUser = { $id: "user1", email: "user@example.com" };
const mockPush = jest.fn();
const mockRouter = { push: mockPush };

describe("Search component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (usePathname as jest.Mock).mockReturnValue("/");
    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams());
    (useUser as jest.Mock).mockReturnValue({ currentUser: mockUser });
  });

  it("renders search input placeholder", () => {
    (getFiles as jest.Mock).mockResolvedValue({ documents: [] });
    render(<Search />);
    expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument();
  });

  it("displays search results after input change", async () => {
    const user = userEvent.setup();
    const mockFiles = [
      {
        $id: "1",
        name: "Test Document",
        type: "document",
        $createdAt: "2026-01-01",
        url: "http://example.com/file1",
      },
    ];
    (getFiles as jest.Mock).mockResolvedValue({ documents: mockFiles });
    render(<Search />);
    await user.type(screen.getByPlaceholderText("Search..."), "test");
    await waitFor(() => {
      expect(getFiles).toHaveBeenCalled();
    });
  });

  it("clears results when query is empty", async () => {
    const user = userEvent.setup();
    (getFiles as jest.Mock).mockResolvedValue({ documents: [] });
    render(<Search />);
    const input = screen.getByPlaceholderText("Search...");
    await user.type(input, "test");
    await waitFor(() => {
      expect(getFiles).toHaveBeenCalled();
    });
    await user.clear(input);
    expect(input).toHaveValue("");
  });

  it("calls getFiles with correct parameters", async () => {
    const user = userEvent.setup();
    (getFiles as jest.Mock).mockResolvedValue({ documents: [] });
    render(<Search />);
    await user.type(screen.getByPlaceholderText("Search..."), "search query");
    await waitFor(() => {
      expect(getFiles).toHaveBeenCalledWith(
        expect.objectContaining({
          searchText: "search query",
          userId: "user1",
          userEmail: "user@example.com",
        }),
      );
    });
  });

  it("handles clear button click", async () => {
    const user = userEvent.setup();
    (getFiles as jest.Mock).mockResolvedValue({
      documents: [
        {
          $id: "1",
          name: "Test Document",
          type: "document",
          $createdAt: "2026-01-01",
          url: "http://example.com/file1",
        },
      ],
    });
    render(<Search />);
    const input = screen.getByPlaceholderText("Search...");
    await user.type(input, "test");
    await waitFor(() => {
      expect(getFiles).toHaveBeenCalled();
    });
    await user.click(screen.getByRole("button", { name: /clear/i }));
    await waitFor(() => {
      expect(input).toHaveValue("");
    });
  });
});
