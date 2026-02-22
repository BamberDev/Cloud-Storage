import { render, screen } from "@testing-library/react";
import { usePathname } from "next/navigation";
import NavItems from "../NavItems";
import { navItems } from "@/constants";

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

const defaultProps = {
  variant: "sidebar" as const,
};

const renderNavItems = (props = {}) => {
  return render(<NavItems {...defaultProps} {...props} />);
};

describe("NavItems component", () => {
  beforeEach(() => {
    (usePathname as jest.Mock).mockReturnValue("/");
  });

  it("renders all navigation items", () => {
    renderNavItems();
    navItems.forEach((item) => {
      expect(screen.getByText(item.name)).toBeInTheDocument();
    });
  });

  it("renders as an unordered list", () => {
    renderNavItems();
    expect(screen.getByRole("list")).toBeInTheDocument();
  });

  describe("Variant styling", () => {
    it.each([
      ["sidebar", "sidebar-nav-list"],
      ["mobile", "mobile-nav-list"],
    ] as const)("applies %s variant classes", (variant, expectedClass) => {
      renderNavItems({ variant });
      expect(screen.getByRole("list")).toHaveClass(expectedClass);
    });
  });

  describe("Label visibility", () => {
    it("shows labels by default", () => {
      renderNavItems();
      expect(screen.getByText(navItems[0].name)).toBeInTheDocument();
    });

    it("hides labels when showLabels is false", () => {
      renderNavItems({ showLabels: false });
      expect(screen.queryByText(navItems[0].name)).not.toBeInTheDocument();
    });
  });

  describe("Active state", () => {
    it("applies active class to current route", () => {
      (usePathname as jest.Mock).mockReturnValue("/documents");
      renderNavItems();
      const activeItem = screen.getByText("Documents").closest("li");
      expect(activeItem).toHaveClass("nav-item-active");
    });
  });

  it("accepts custom className prop", () => {
    renderNavItems({ className: "custom-class" });
    expect(screen.getByRole("list")).toHaveClass("custom-class");
  });
});
