import { render, screen } from "@testing-library/react";
import Sidebar from "../Sidebar";

describe("Sidebar component", () => {
  it("renders sidebar navigation", () => {
    render(
      <Sidebar
        username="Test User"
        email="test@example.com"
        avatar="/avatar.png"
      />,
    );
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });

  it("renders user profile section", () => {
    render(
      <Sidebar
        username="Test User"
        email="test@example.com"
        avatar="/avatar.png"
      />,
    );
    expect(screen.getByText("Test User")).toBeInTheDocument();
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
  });

  it("renders with different user data", () => {
    const { rerender } = render(
      <Sidebar username="User One" email="one@example.com" avatar="/one.png" />,
    );
    expect(screen.getByText("User One")).toBeInTheDocument();
    expect(screen.getByText("one@example.com")).toBeInTheDocument();

    rerender(
      <Sidebar username="User Two" email="two@example.com" avatar="/two.png" />,
    );
    expect(screen.getByText("User Two")).toBeInTheDocument();
    expect(screen.getByText("two@example.com")).toBeInTheDocument();
  });

  it("handles very long username", () => {
    const longUsername = "A".repeat(100);
    render(
      <Sidebar
        username={longUsername}
        email="user@example.com"
        avatar="/avatar.png"
      />,
    );
    expect(screen.getByText(longUsername)).toBeInTheDocument();
  });

  it("handles special characters in username", () => {
    const specialUsername = "User-Name_2024";
    render(
      <Sidebar
        username={specialUsername}
        email="user@example.com"
        avatar="/avatar.png"
      />,
    );
    expect(screen.getByText(specialUsername)).toBeInTheDocument();
  });

  it("handles special characters in email", () => {
    const specialEmail = "user+tag@sub.domain.co.uk";
    render(
      <Sidebar username="User" email={specialEmail} avatar="/avatar.png" />,
    );
    expect(screen.getByText(specialEmail)).toBeInTheDocument();
  });
});
