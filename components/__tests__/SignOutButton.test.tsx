import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ImgHTMLAttributes } from "react";
import SignOutButton from "../SignOutButton";

jest.mock("../LogoutDialog", () => ({
  __esModule: true,
  default: ({
    trigger,
    isOpen,
  }: {
    trigger: React.ReactNode;
    isOpen: boolean;
  }) => (
    <div>
      {trigger}
      {isOpen && <div data-testid="logout-dialog">Logout Dialog</div>}
    </div>
  ),
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: ImgHTMLAttributes<HTMLImageElement>) => <img {...props} />,
}));

describe("SignOutButton component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders sign out button with correct styling and accessibility", () => {
    render(<SignOutButton />);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("sign-out-button");
    expect(button).toHaveAttribute("aria-label", "Sign out");
  });

  it("renders logout icon image", () => {
    render(<SignOutButton />);
    const image = screen.getByAltText("Logout icon");
    expect(image).toHaveAttribute("src", "/assets/icons/logout.png");
  });

  it("opens logout dialog when button is clicked", async () => {
    const user = userEvent.setup();
    render(<SignOutButton />);
    await user.click(screen.getByRole("button"));
    expect(screen.getByTestId("logout-dialog")).toBeInTheDocument();
  });

  it("opens dialog on Enter key", async () => {
    const user = userEvent.setup();
    render(<SignOutButton />);
    screen.getByRole("button").focus();
    await user.keyboard("{Enter}");
    expect(screen.getByTestId("logout-dialog")).toBeInTheDocument();
  });
});
