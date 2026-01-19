import { render, screen } from "@testing-library/react";
import { usePathname } from "next/navigation";
import NavItems from "../NavItems";
import { navItems } from "@/constants";

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

describe("NavItems component", () => {
  const mockPathname = usePathname as jest.Mock;

  beforeEach(() => {
    mockPathname.mockReturnValue("/");
  });

  it("renders all navigation items", () => {
    render(<NavItems variant="sidebar" />);
    navItems.forEach((item) => {
      expect(screen.getByText(item.name)).toBeInTheDocument();
    });
  });

  it("renders as an unordered list", () => {
    render(<NavItems variant="sidebar" />);
    expect(screen.getByRole("list")).toBeInTheDocument();
  });

  it("hides labels when showLabels is false", () => {
    const { rerender } = render(<NavItems variant="sidebar" />);
    expect(screen.getByText(navItems[0].name)).toBeInTheDocument();

    rerender(<NavItems variant="sidebar" showLabels={false} />);
    expect(screen.queryByText(navItems[0].name)).not.toBeInTheDocument();
  });

  it("applies correct classes for different variants", () => {
    const { rerender } = render(<NavItems variant="sidebar" />);
    expect(screen.getByRole("list")).toHaveClass("sidebar-nav-list");

    rerender(<NavItems variant="mobile" />);
    expect(screen.getByRole("list")).toHaveClass("mobile-nav-list");
  });

  it("applies active class to current route", () => {
    mockPathname.mockReturnValue("/documents");
    render(<NavItems variant="sidebar" />);

    const activeItem = screen.getByText("Documents").closest("li");
    expect(activeItem).toHaveClass("nav-item-active");
  });

  it("accepts custom className prop", () => {
    render(<NavItems variant="sidebar" className="custom-class" />);
    expect(screen.getByRole("list")).toHaveClass("custom-class");
  });
});
