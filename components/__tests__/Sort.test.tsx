import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Sort from "../Sort";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
  useSearchParams: jest.fn(),
}));

// Mock hasPointerCapture for Radix UI compatibility with jsdom
beforeAll(() => {
  if (!Element.prototype.hasPointerCapture) {
    Element.prototype.hasPointerCapture = () => false;
  }
  // Mock scrollIntoView for Radix UI compatibility with jsdom
  if (!HTMLElement.prototype.scrollIntoView) {
    HTMLElement.prototype.scrollIntoView = () => {};
  }
});

beforeEach(() => {
  (usePathname as jest.Mock).mockReturnValue("/documents");
  (useRouter as jest.Mock).mockReturnValue({
    push: jest.fn(),
  });
  (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams());
});

describe("Sort component", () => {
  it("renders sort combobox", () => {
    render(<Sort />);
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("uses default sort value on initial render", () => {
    render(<Sort />);
    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveTextContent("Date (newest)");
  });

  it("shows sort options when clicked", async () => {
    render(<Sort />);
    const sortCombo = screen.getByRole("combobox");
    await userEvent.click(sortCombo);
    expect(await screen.findByText("Name (A-Z)")).toBeInTheDocument();
    expect(await screen.findByText("Name (Z-A)")).toBeInTheDocument();
    expect(await screen.findByText("Size (Highest)")).toBeInTheDocument();
    expect(await screen.findByText("Size (Lowest)")).toBeInTheDocument();
  });

  it("displays date sort options", async () => {
    render(<Sort />);
    const sortCombo = screen.getByRole("combobox");
    await userEvent.click(sortCombo);
    const dateNewestOptions = await screen.findAllByText("Date (newest)");
    expect(dateNewestOptions.length).toBeGreaterThan(0);
    const dateOldestOptions = await screen.findAllByText("Date (oldest)");
    expect(dateOldestOptions.length).toBeGreaterThan(0);
  });

  it("applies sort parameter to URL when an option is selected", async () => {
    const mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    (usePathname as jest.Mock).mockReturnValue("/documents");

    render(<Sort />);
    const sortCombo = screen.getByRole("combobox");
    await userEvent.click(sortCombo);
    const nameOption = await screen.findByText("Name (A-Z)");
    await userEvent.click(nameOption);
    expect(mockPush).toHaveBeenCalledWith("/documents?sort=name-asc");
  });

  it("maintains sort state when component re-renders", async () => {
    const { rerender } = render(<Sort />);
    const sortCombo = screen.getByRole("combobox");
    await userEvent.click(sortCombo);
    const nameOption = await screen.findByText("Name (A-Z)");
    await userEvent.click(nameOption);

    (useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams("sort=name-asc"),
    );

    rerender(<Sort />);
    expect(screen.getByRole("combobox")).toHaveTextContent("Name (A-Z)");
  });
});
