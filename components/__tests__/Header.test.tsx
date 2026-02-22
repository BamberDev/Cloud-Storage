import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import Header from "@/components/Header";

jest.mock("@/components/Search", () => {
  return function MockSearch() {
    return <div data-testid="search">Search Component</div>;
  };
});

jest.mock("@/components/FileUploader", () => {
  return function MockFileUploader() {
    return <div data-testid="file-uploader">File Uploader</div>;
  };
});

jest.mock("@/components/SignOutButton", () => {
  return function MockSignOutButton() {
    return <div data-testid="sign-out">Sign Out Button</div>;
  };
});

describe("Header component", () => {
  it("renders as banner element", () => {
    render(<Header />);
    const header = screen.getByRole("banner");
    expect(header).toBeInTheDocument();
  });

  it("renders with correct styling classes", () => {
    render(<Header />);
    const header = screen.getByRole("banner");
    expect(header).toHaveClass("header");
    const wrapper = header.querySelector(".header-wrapper");
    expect(wrapper).toBeInTheDocument();
  });

  it("renders all child components", () => {
    render(<Header />);
    expect(screen.getByTestId("search")).toBeInTheDocument();
    expect(screen.getByTestId("file-uploader")).toBeInTheDocument();
    expect(screen.getByTestId("sign-out")).toBeInTheDocument();
  });
});
