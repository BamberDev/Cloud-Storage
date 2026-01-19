import { ImgHTMLAttributes } from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { getFiles } from "@/lib/actions/file.actions";
import Search from "../Search";

jest.mock("next/navigation");
jest.mock("@/context/UserContext");
jest.mock("@/lib/actions/file.actions", () => ({
  getFiles: jest.fn(),
}));
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: ImgHTMLAttributes<HTMLImageElement>) => <img {...props} />,
}));

const mockUser = { $id: "user1", email: "user@example.com" };

describe("Search Component", () => {
  const mockPush = jest.fn();
  const mockRouter = {
    push: mockPush,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (usePathname as jest.Mock).mockReturnValue("/");
    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams());
    (useUser as jest.Mock).mockReturnValue({ currentUser: mockUser });
  });

  it("renders search input placeholder", () => {
    (getFiles as jest.Mock).mockResolvedValue({
      documents: [],
    });
    render(<Search />);
    const input = screen.getByPlaceholderText("Search...");
    expect(input).toBeInTheDocument();
  });

  it("displays search results after input change", async () => {
    const mockFiles = [
      {
        $id: "1",
        name: "Test Document",
        type: "document",
        $createdAt: "2026-01-01",
        url: "http://example.com/file1",
      },
    ];
    (getFiles as jest.Mock).mockResolvedValue({
      documents: mockFiles,
    });
    render(<Search />);
    const input = screen.getByPlaceholderText("Search...") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "test" } });
    await waitFor(() => {
      expect(getFiles).toHaveBeenCalled();
    });
  });

  it("clears results when query is empty", async () => {
    (getFiles as jest.Mock).mockResolvedValue({
      documents: [],
    });
    render(<Search />);
    const input = screen.getByPlaceholderText("Search...") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "test" } });
    await waitFor(() => {
      expect(getFiles).toHaveBeenCalled();
    });
    fireEvent.change(input, { target: { value: "" } });
    expect(input.value).toBe("");
  });

  it("calls getFiles with correct parameters", async () => {
    (getFiles as jest.Mock).mockResolvedValue({
      documents: [],
    });
    render(<Search />);
    const input = screen.getByPlaceholderText("Search...") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "search query" } });
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
    const input = screen.getByPlaceholderText("Search...") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "test" } });
    await waitFor(() => {
      expect(input.value).toBe("test");
      expect(getFiles).toHaveBeenCalled();
    });
    const clearButton = screen.getByRole("button", { name: /clear/i });
    fireEvent.click(clearButton);
    await waitFor(() => {
      expect(input.value).toBe("");
    });
  });
});
