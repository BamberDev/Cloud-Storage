import { ImgHTMLAttributes } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SignOutButton from "../SignOutButton";

jest.mock("../LogoutDialog", () => {
  return function MockLogoutDialog({
    trigger,
    isOpen,
  }: {
    trigger: React.ReactNode;
    isOpen: boolean;
  }) {
    return (
      <div>
        {trigger}
        {isOpen && <div data-testid="logout-dialog">Logout Dialog</div>}
      </div>
    );
  };
});

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: ImgHTMLAttributes<HTMLImageElement>) => <img {...props} />,
}));

describe("SignOutButton component", () => {
  it("renders sign out button with correct styling and accessibility", () => {
    render(<SignOutButton />);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("sign-out-button");
    expect(button).toHaveAttribute("aria-label", "Sign out");
  });

  it("renders logout icon image", () => {
    render(<SignOutButton />);
    const image = screen.getByAltText("Logout icon");
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", "/assets/icons/logout.png");
  });

  it("opens logout dialog when button is clicked", async () => {
    render(<SignOutButton />);
    const button = screen.getByRole("button");
    await userEvent.click(button);
    const dialog = screen.getByTestId("logout-dialog");
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveTextContent("Logout Dialog");
  });

  it("responds to keyboard interactions", async () => {
    render(<SignOutButton />);
    const button = screen.getByRole("button");
    button.focus();
    await userEvent.keyboard("{Enter}");
    const dialog = screen.getByTestId("logout-dialog");
    expect(dialog).toBeInTheDocument();
  });
});
