import { render, screen } from "@testing-library/react";
import Sidebar from "../Sidebar";

const defaultProps = {
  username: "Test User",
  email: "test@example.com",
  avatar: "/avatar.png",
};

const renderSidebar = (props = {}) => {
  return render(<Sidebar {...defaultProps} {...props} />);
};

describe("Sidebar component", () => {
  it("renders sidebar navigation", () => {
    renderSidebar();
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });

  describe("User profile section", () => {
    it("renders username and email", () => {
      renderSidebar();
      expect(screen.getByText("Test User")).toBeInTheDocument();
      expect(screen.getByText("test@example.com")).toBeInTheDocument();
    });

    it.each([
      ["User One", "one@example.com"],
      ["User Two", "two@example.com"],
    ])("renders with different user data: %s", (username, email) => {
      renderSidebar({ username, email });
      expect(screen.getByText(username)).toBeInTheDocument();
      expect(screen.getByText(email)).toBeInTheDocument();
    });

    it("handles very long username", () => {
      const longUsername = "A".repeat(100);
      renderSidebar({ username: longUsername });
      expect(screen.getByText(longUsername)).toBeInTheDocument();
    });

    it.each([
      ["User-Name_2024", "user@example.com"],
      ["User", "user+tag@sub.domain.co.uk"],
    ])(
      "handles special characters: %s, %s",
      (username, email) => {
        renderSidebar({ username, email });
        expect(screen.getByText(username)).toBeInTheDocument();
        expect(screen.getByText(email)).toBeInTheDocument();
      },
    );
  });
});
