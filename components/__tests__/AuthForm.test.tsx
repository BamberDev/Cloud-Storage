import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AuthForm from "../AuthForm";
import { useRouter } from "next/navigation";
import {
  createAccount,
  signInUser,
  signInTestUser,
} from "@/lib/actions/user.actions";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/lib/actions/user.actions", () => ({
  createAccount: jest.fn(),
  signInUser: jest.fn(),
  signInTestUser: jest.fn(),
}));

ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

describe("AuthForm component", () => {
  const mockPush = jest.fn();
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    jest.clearAllMocks();
    user = userEvent.setup();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  it("renders sign-up form with email and username fields", () => {
    render(<AuthForm type="sign-up" />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /submit form/i }),
    ).toBeInTheDocument();
  });

  it("renders sign-in form with only email field", () => {
    render(<AuthForm type="sign-in" />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/username/i)).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /submit form/i }),
    ).toBeInTheDocument();
  });

  it("renders test-account form with test account selector", () => {
    render(<AuthForm type="test-account" />);
    expect(
      screen.getByRole("heading", { name: /test account/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/select test account/i)).toBeInTheDocument();
  });

  it("displays correct title for each form type", () => {
    const { rerender } = render(<AuthForm type="sign-up" />);
    expect(
      screen.getByRole("heading", { name: /sign up/i }),
    ).toBeInTheDocument();
    rerender(<AuthForm type="sign-in" />);
    expect(
      screen.getByRole("heading", { name: /sign in/i }),
    ).toBeInTheDocument();
    rerender(<AuthForm type="test-account" />);
    expect(
      screen.getByRole("heading", { name: /test account/i }),
    ).toBeInTheDocument();
  });

  it("renders link to sign-in page from sign-up form", () => {
    render(<AuthForm type="sign-up" />);
    expect(screen.getByText(/already have an account\?/i)).toBeInTheDocument();
    const signInLink = screen.getByRole("link", { name: /sign in/i });
    expect(signInLink).toHaveAttribute("href", "/sign-in");
  });

  it("renders link to sign-up page from sign-in form", () => {
    render(<AuthForm type="sign-in" />);
    expect(screen.getByText(/don't have an account\?/i)).toBeInTheDocument();
    const signUpLink = screen.getByRole("link", { name: /sign up/i });
    expect(signUpLink).toHaveAttribute("href", "/sign-up");
  });

  it("renders link to OTP login from test-account form", () => {
    render(<AuthForm type="test-account" />);
    expect(screen.getByText(/want to use otp login\?/i)).toBeInTheDocument();
    const otpLink = screen.getByRole("link", { name: /sign in with otp/i });
    expect(otpLink).toHaveAttribute("href", "/sign-in");
  });

  it("prevents form submission with invalid email format", async () => {
    (createAccount as jest.Mock).mockResolvedValue({ accountId: "123" });
    render(<AuthForm type="sign-up" />);
    const emailInput = screen.getByLabelText(/email/i);
    const usernameInput = screen.getByLabelText(/username/i);
    await user.type(usernameInput, "validusername");
    await user.type(emailInput, "invalid-email");
    await user.click(screen.getByRole("button", { name: /submit form/i }));
    await waitFor(() => {
      expect(createAccount).not.toHaveBeenCalled();
    });
  });

  it("shows validation error for short username on submit", async () => {
    render(<AuthForm type="sign-up" />);
    const emailInput = screen.getByLabelText(/email/i);
    const usernameInput = screen.getByLabelText(/username/i);
    await user.type(emailInput, "test@example.com");
    await user.type(usernameInput, "a");
    await user.click(screen.getByRole("button", { name: /submit form/i }));
    await waitFor(() => {
      const errorMessages = document.querySelectorAll(
        "[class*='text-red-500']",
      );
      expect(errorMessages.length).toBeGreaterThan(0);
    });
  });

  it("accepts valid email format", async () => {
    render(<AuthForm type="sign-up" />);
    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, "valid@email.com");
    expect(emailInput).toHaveValue("valid@email.com");
  });

  it("accepts valid username", async () => {
    render(<AuthForm type="sign-up" />);
    const usernameInput = screen.getByLabelText(/username/i);
    await user.type(usernameInput, "validuser");
    expect(usernameInput).toHaveValue("validuser");
  });

  it("disables submit button while loading", async () => {
    (createAccount as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100)),
    );
    render(<AuthForm type="sign-up" />);
    const emailInput = screen.getByLabelText(/email/i);
    const usernameInput = screen.getByLabelText(/username/i);
    const submitButton = screen.getByRole("button", { name: /submit form/i });
    await user.type(emailInput, "test@example.com");
    await user.type(usernameInput, "testuser");
    await user.click(submitButton);
    expect(submitButton).toBeDisabled();
  });

  it("calls createAccount action on sign-up submission", async () => {
    (createAccount as jest.Mock).mockResolvedValue({ accountId: "123" });
    render(<AuthForm type="sign-up" />);
    const emailInput = screen.getByLabelText(/email/i);
    const usernameInput = screen.getByLabelText(/username/i);
    await user.type(emailInput, "test@example.com");
    await user.type(usernameInput, "testuser");
    const submitButton = screen.getByRole("button", { name: /submit form/i });
    await user.click(submitButton);
    await waitFor(
      () => {
        expect(createAccount).toHaveBeenCalledWith({
          username: "testuser",
          email: "test@example.com",
        });
      },
      { timeout: 3000 },
    );
  });

  it("calls signInUser action on sign-in submission", async () => {
    (signInUser as jest.Mock).mockResolvedValue({ accountId: "123" });
    render(<AuthForm type="sign-in" />);
    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, "test@example.com");
    const submitButton = screen.getByRole("button", { name: /submit form/i });
    await user.click(submitButton);
    await waitFor(
      () => {
        expect(signInUser).toHaveBeenCalledWith({
          email: "test@example.com",
        });
      },
      { timeout: 3000 },
    );
  });

  it("displays error message when account already exists", async () => {
    (createAccount as jest.Mock).mockRejectedValue(
      new Error("Account already exists"),
    );
    render(<AuthForm type="sign-up" />);
    const emailInput = screen.getByLabelText(/email/i);
    const usernameInput = screen.getByLabelText(/username/i);
    await user.type(emailInput, "existing@example.com");
    await user.type(usernameInput, "existinguser");
    await user.click(screen.getByRole("button", { name: /submit form/i }));
    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        /account already exists/i,
      );
    });
  });

  it("displays error message when account does not exist", async () => {
    (signInUser as jest.Mock).mockRejectedValue(
      new Error("Account does not exist"),
    );
    render(<AuthForm type="sign-in" />);
    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, "nonexistent@example.com");
    await user.click(screen.getByRole("button", { name: /submit form/i }));
    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        /account does not exist. please sign up first/i,
      );
    });
  });

  it("displays generic error message on unexpected error", async () => {
    (createAccount as jest.Mock).mockRejectedValue(new Error("Network error"));
    render(<AuthForm type="sign-up" />);
    const emailInput = screen.getByLabelText(/email/i);
    const usernameInput = screen.getByLabelText(/username/i);
    await user.type(emailInput, "test@example.com");
    await user.type(usernameInput, "testuser");
    await user.click(screen.getByRole("button", { name: /submit form/i }));
    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        /failed to create account/i,
      );
    });
  });

  it("shows OTP modal after successful account creation", async () => {
    (createAccount as jest.Mock).mockResolvedValue({ accountId: "123" });
    render(<AuthForm type="sign-up" />);
    const emailInput = screen.getByLabelText(/email/i);
    const usernameInput = screen.getByLabelText(/username/i);
    await user.type(emailInput, "test@example.com");
    await user.type(usernameInput, "testuser");
    const submitButton = screen.getByRole("button", { name: /submit form/i });
    await user.click(submitButton);
    await waitFor(
      () => {
        expect(screen.getByText(/test@example.com/i)).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });

  it("does not show OTP modal for test-account type", async () => {
    (signInTestUser as jest.Mock).mockResolvedValue({});
    render(<AuthForm type="test-account" />);
    expect(screen.queryByText(/enter otp/i)).not.toBeInTheDocument();
  });
});
