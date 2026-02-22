import { render, screen } from "@testing-library/react";
import { AnchorHTMLAttributes, ImgHTMLAttributes, ReactNode } from "react";
import SummaryCard from "../SummaryCard";

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

const mockSummary = {
  title: "Documents",
  icon: "/assets/icons/file-document-light.svg",
  url: "/documents",
  size: 100_000_000,
  latestDate: new Date("2025-01-01T12:00:00Z").toISOString(),
};

describe("SummaryCard component", () => {
  it("renders title and file size", () => {
    render(<SummaryCard summary={mockSummary} />);
    expect(screen.getByText(mockSummary.title)).toBeInTheDocument();
    expect(screen.getByText(/100.0 MB/i)).toBeInTheDocument();
  });

  it("renders icon with alt text", () => {
    render(<SummaryCard summary={mockSummary} />);
    const icon = screen.getByAltText(`${mockSummary.title} icon`);
    expect(icon).toHaveAttribute(
      "src",
      expect.stringContaining(mockSummary.icon),
    );
  });

  it("renders link with correct href", () => {
    render(<SummaryCard summary={mockSummary} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", mockSummary.url);
  });

  it("renders formatted date", () => {
    render(<SummaryCard summary={mockSummary} />);
    expect(screen.getByText(/1:00 pm, 1 Jan/i)).toBeInTheDocument();
  });
});
