import { render, screen } from "@testing-library/react";
import FormattedDateTime from "../FormattedDateTime";

describe("FormattedDateTime component", () => {
  const date = "2025-01-01T12:00:00Z";

  it("renders formatted date", () => {
    render(<FormattedDateTime date={date} />);
    expect(screen.getByText(/1:00 pm, 1 Jan/i)).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const className = "custom-class";
    render(<FormattedDateTime date={date} className={className} />);
    expect(screen.getByText(/1:00 pm, 1 Jan/i)).toHaveClass(className);
  });
});
