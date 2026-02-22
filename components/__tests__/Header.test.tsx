import { render, screen } from "@testing-library/react";
import Header from "@/components/Header";

jest.mock("@/components/Search", () => ({
  __esModule: true,
  default: () => <div data-testid="search">Search Component</div>,
}));

jest.mock("@/components/FileUploader", () => ({
  __esModule: true,
  default: () => <div data-testid="file-uploader">File Uploader</div>,
}));

jest.mock("@/components/SignOutButton", () => ({
  __esModule: true,
  default: () => <div data-testid="sign-out">Sign Out Button</div>,
}));

describe("Header component", () => {
  it("renders as banner element", () => {
    render(<Header />);
    expect(screen.getByRole("banner")).toBeInTheDocument();
  });

  it("renders with correct styling classes", () => {
    render(<Header />);
    const header = screen.getByRole("banner");
    expect(header).toHaveClass("header");
    expect(header.querySelector(".header-wrapper")).toBeInTheDocument();
  });

  it("renders all child components", () => {
    render(<Header />);
    expect(screen.getByTestId("search")).toBeInTheDocument();
    expect(screen.getByTestId("file-uploader")).toBeInTheDocument();
    expect(screen.getByTestId("sign-out")).toBeInTheDocument();
  });
});
