import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Sort from "../Sort";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
  useSearchParams: jest.fn(),
}));

if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = () => false;
}
if (!HTMLElement.prototype.scrollIntoView) {
  HTMLElement.prototype.scrollIntoView = () => {};
}

const mockPush = jest.fn();

describe("Sort component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (usePathname as jest.Mock).mockReturnValue("/documents");
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams());
  });

  it("renders sort combobox", () => {
    render(<Sort />);
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("uses default sort value on initial render", () => {
    render(<Sort />);
    expect(screen.getByRole("combobox")).toHaveTextContent("Date (newest)");
  });

  it("shows sort options when clicked", async () => {
    const user = userEvent.setup();
    render(<Sort />);
    await user.click(screen.getByRole("combobox"));
    expect(await screen.findByText("Name (A-Z)")).toBeInTheDocument();
    expect(await screen.findByText("Name (Z-A)")).toBeInTheDocument();
    expect(await screen.findByText("Size (Highest)")).toBeInTheDocument();
    expect(await screen.findByText("Size (Lowest)")).toBeInTheDocument();
  });

  it("displays date sort options", async () => {
    const user = userEvent.setup();
    render(<Sort />);
    await user.click(screen.getByRole("combobox"));
    const dateNewestOptions = await screen.findAllByText("Date (newest)");
    expect(dateNewestOptions.length).toBeGreaterThan(0);
    const dateOldestOptions = await screen.findAllByText("Date (oldest)");
    expect(dateOldestOptions.length).toBeGreaterThan(0);
  });

  it("applies sort parameter to URL when an option is selected", async () => {
    const user = userEvent.setup();
    render(<Sort />);
    await user.click(screen.getByRole("combobox"));
    await user.click(await screen.findByText("Name (A-Z)"));
    expect(mockPush).toHaveBeenCalledWith("/documents?sort=name-asc");
  });

  it("maintains sort state when component re-renders", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<Sort />);
    await user.click(screen.getByRole("combobox"));
    await user.click(await screen.findByText("Name (A-Z)"));
    (useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams("sort=name-asc"),
    );
    rerender(<Sort />);
    expect(screen.getByRole("combobox")).toHaveTextContent("Name (A-Z)");
  });
});
