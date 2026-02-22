import { render, screen } from "@testing-library/react";
import Chart from "../Chart";

jest.mock("recharts", () => ({
  Label: () => <div data-testid="chart-label" />,
  PolarGrid: () => <div data-testid="polar-grid">PolarGrid</div>,
  PolarRadiusAxis: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="polar-radius-axis">{children}</div>
  ),
  RadialBar: () => <div data-testid="radial-bar">RadialBar</div>,
  RadialBarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="radial-bar-chart">{children}</div>
  ),
}));

jest.mock("@/components/ui/chart", () => ({
  ChartContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="chart-container">{children}</div>
  ),
}));

jest.mock("@/lib/utils", () => ({
  cn: (...inputs: (string | undefined | null | false)[]) =>
    inputs.filter(Boolean).join(" "),
  calculatePercentage: jest.fn((size: number) => {
    const totalSizeInBytes = 1_000_000_000;
    const percentage = (size / totalSizeInBytes) * 100;
    return Number(percentage.toFixed(2));
  }),
  convertFileSize: jest.fn((size: number) => {
    if (size === 0) return "0 B";
    return `${(size / 1_000_000).toFixed(1)} MB`;
  }),
}));

describe("Chart component", () => {
  it("renders with default value of 0", () => {
    render(<Chart used={0} />);
    expect(screen.getByText("Available Storage")).toBeInTheDocument();
    expect(screen.getByText("1 GB")).toBeInTheDocument();
  });

  it("renders with storage used when value is provided", () => {
    render(<Chart used={500_000_000} />);
    expect(screen.getByText(/500\.0 MB/i)).toBeInTheDocument();
    expect(screen.getByText(/\/ 1 GB/i)).toBeInTheDocument();
  });

  it("renders chart container", () => {
    render(<Chart used={100_000_000} />);
    expect(screen.getByTestId("chart-container")).toBeInTheDocument();
  });

  it("renders radial bar chart elements", () => {
    render(<Chart used={100_000_000} />);
    expect(screen.getByTestId("radial-bar-chart")).toBeInTheDocument();
    expect(screen.getByTestId("polar-grid")).toBeInTheDocument();
    expect(screen.getByTestId("radial-bar")).toBeInTheDocument();
    expect(screen.getByTestId("polar-radius-axis")).toBeInTheDocument();
  });

  it("renders chart label element", () => {
    render(<Chart used={250_000_000} />);
    expect(screen.getByTestId("chart-label")).toBeInTheDocument();
    expect(screen.getByText("Space used")).toBeInTheDocument();
  });

  it.each([
    [100_000_000, "Space used"],
    [0, "Available Storage"],
  ] as const)("renders correct title for used=%i", (used, expectedTitle) => {
    render(<Chart used={used} />);
    expect(screen.getByText(expectedTitle)).toBeInTheDocument();
  });

  it("renders correct CSS classes", () => {
    render(<Chart used={100_000_000} />);
    const card =
      screen.getByTestId("chart-container").parentElement?.parentElement;
    expect(card).toHaveClass("chart");
    const cardTitle = screen
      .getAllByText("Space used")
      .find((el) => el.classList.contains("chart-title"));
    expect(cardTitle).toHaveClass("chart-title");
    expect(screen.getByText(/100\.0 MB/i)).toHaveClass("chart-description");
  });
});
