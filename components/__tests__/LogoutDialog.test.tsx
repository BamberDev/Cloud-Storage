import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LogoutDialog from "../LogoutDialog";
import { useRouter } from "next/navigation";
import { signOutUser } from "@/lib/actions/user.actions";
import { useErrorToast } from "@/hooks/useErrorToast";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/lib/actions/user.actions", () => ({
  signOutUser: jest.fn(),
}));

jest.mock("@/hooks/useErrorToast", () => ({
  useErrorToast: jest.fn(),
}));

jest.mock("../Loader", () => {
  return function MockLoader() {
    return <div data-testid="loader">Loading...</div>;
  };
});

const mockPush = jest.fn();
const mockShowErrorToast = jest.fn();
const mockOnOpenChange = jest.fn();

const defaultProps = {
  isOpen: true,
  onOpenChange: mockOnOpenChange,
  trigger: <button>Open</button>,
};

describe("LogoutDialog component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (signOutUser as jest.Mock).mockResolvedValue(undefined);
    (useErrorToast as jest.Mock).mockReturnValue(mockShowErrorToast);
  });

  it("renders logout dialog when isOpen is true", () => {
    render(<LogoutDialog {...defaultProps} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Confirm")).toBeInTheDocument();
    expect(
      screen.getByText("Are you sure you want to sign out?"),
    ).toBeInTheDocument();
  });

  it("renders cancel and sign out buttons", () => {
    render(<LogoutDialog {...defaultProps} />);
    expect(
      screen.getByRole("button", { name: /cancel sign out/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /confirm sign out/i }),
    ).toBeInTheDocument();
  });

  it("calls onOpenChange(false) when cancel button clicked", async () => {
    const user = userEvent.setup();
    render(<LogoutDialog {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: /cancel/i }));
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it("calls signOutUser when sign out button clicked", async () => {
    const user = userEvent.setup();
    render(<LogoutDialog {...defaultProps} />);
    await user.click(
      screen.getByRole("button", { name: /confirm sign out/i }),
    );
    await waitFor(() => {
      expect(signOutUser).toHaveBeenCalled();
    });
  });

  it("closes dialog and redirects to sign-in on successful logout", async () => {
    const user = userEvent.setup();
    render(<LogoutDialog {...defaultProps} />);
    await user.click(
      screen.getByRole("button", { name: /confirm sign out/i }),
    );
    await waitFor(() => {
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
      expect(mockPush).toHaveBeenCalledWith("/sign-in");
    });
  });

  it("shows error toast on logout failure", async () => {
    (signOutUser as jest.Mock).mockRejectedValueOnce(
      new Error("Sign out failed"),
    );
    const user = userEvent.setup();
    render(<LogoutDialog {...defaultProps} />);
    await user.click(
      screen.getByRole("button", { name: /confirm sign out/i }),
    );
    await waitFor(() => {
      expect(mockShowErrorToast).toHaveBeenCalledWith(
        "Failed to sign out. Please try again.",
      );
    });
  });

  it("shows loader and signing out text during logout", async () => {
    (signOutUser as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 1000)),
    );
    const user = userEvent.setup();
    render(<LogoutDialog {...defaultProps} />);
    await user.click(
      screen.getByRole("button", { name: /confirm sign out/i }),
    );
    expect(screen.getByTestId("loader")).toBeInTheDocument();
    expect(screen.getByText("Signing Out...")).toBeInTheDocument();
  });

  it("disables buttons while loading", async () => {
    (signOutUser as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 1000)),
    );
    const user = userEvent.setup();
    render(<LogoutDialog {...defaultProps} />);
    await user.click(
      screen.getByRole("button", { name: /confirm sign out/i }),
    );
    expect(
      screen.getByRole("button", { name: /cancel sign out/i }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: /confirm sign out/i }),
    ).toBeDisabled();
  });
});
