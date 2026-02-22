import { render, screen } from "@testing-library/react";
import FormattedDateTime from "../FormattedDateTime";

const testDate = "2025-01-01T12:00:00Z";

describe("FormattedDateTime component", () => {
  it("renders formatted date", () => {
    render(<FormattedDateTime date={testDate} />);
    expect(screen.getByText(/1:00 pm, 1 Jan/i)).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(<FormattedDateTime date={testDate} className="custom-class" />);
    expect(screen.getByText(/1:00 pm, 1 Jan/i)).toHaveClass("custom-class");
  });
});
