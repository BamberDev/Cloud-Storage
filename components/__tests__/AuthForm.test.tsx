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

const mockPush = jest.fn();

const renderAuthForm = (
  type: "sign-up" | "sign-in" | "test-account" = "sign-up",
) => {
  return render(<AuthForm type={type} />);
};

describe("AuthForm component", () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    jest.clearAllMocks();
    user = userEvent.setup();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  describe("Form type rendering", () => {
    it("renders sign-up form with email and username fields", () => {
      renderAuthForm("sign-up");
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /submit form/i }),
      ).toBeInTheDocument();
    });

    it("renders sign-in form with only email field", () => {
      renderAuthForm("sign-in");
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.queryByLabelText(/username/i)).not.toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /submit form/i }),
      ).toBeInTheDocument();
    });

    it("renders test-account form with test account selector", () => {
      renderAuthForm("test-account");
      expect(
        screen.getByRole("heading", { name: /test account/i }),
      ).toBeInTheDocument();
      expect(screen.getByText(/select test account/i)).toBeInTheDocument();
    });

    it.each([
      ["sign-up", /sign up/i],
      ["sign-in", /sign in/i],
      ["test-account", /test account/i],
    ] as const)("displays correct title for %s form", (type, title) => {
      renderAuthForm(type);
      expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
    });
  });

  describe("Navigation links", () => {
    it("renders link to sign-in page from sign-up form", () => {
      renderAuthForm("sign-up");
      expect(
        screen.getByText(/already have an account\?/i),
      ).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /sign in/i })).toHaveAttribute(
        "href",
        "/sign-in",
      );
    });

    it("renders link to sign-up page from sign-in form", () => {
      renderAuthForm("sign-in");
      expect(screen.getByText(/don't have an account\?/i)).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /sign up/i })).toHaveAttribute(
        "href",
        "/sign-up",
      );
    });

    it("renders link to OTP login from test-account form", () => {
      renderAuthForm("test-account");
      expect(screen.getByText(/want to use otp login\?/i)).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: /sign in with otp/i }),
      ).toHaveAttribute("href", "/sign-in");
    });
  });

  describe("Input validation", () => {
    it("prevents form submission with invalid email format", async () => {
      (createAccount as jest.Mock).mockResolvedValue({ accountId: "123" });
      renderAuthForm("sign-up");
      await user.type(screen.getByLabelText(/username/i), "validusername");
      await user.type(screen.getByLabelText(/email/i), "invalid-email");
      await user.click(screen.getByRole("button", { name: /submit form/i }));
      await waitFor(() => {
        expect(createAccount).not.toHaveBeenCalled();
      });
    });

    it("shows validation error for short username on submit", async () => {
      renderAuthForm("sign-up");
      await user.type(screen.getByLabelText(/email/i), "test@example.com");
      await user.type(screen.getByLabelText(/username/i), "a");
      await user.click(screen.getByRole("button", { name: /submit form/i }));
      await waitFor(() => {
        const errorMessages = document.querySelectorAll(
          "[class*='text-red-500']",
        );
        expect(errorMessages.length).toBeGreaterThan(0);
      });
    });

    it("accepts valid email format", async () => {
      renderAuthForm("sign-up");
      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, "valid@email.com");
      expect(emailInput).toHaveValue("valid@email.com");
    });

    it("accepts valid username", async () => {
      renderAuthForm("sign-up");
      const usernameInput = screen.getByLabelText(/username/i);
      await user.type(usernameInput, "validuser");
      expect(usernameInput).toHaveValue("validuser");
    });
  });

  describe("Form submission", () => {
    it("disables submit button while loading", async () => {
      (createAccount as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100)),
      );
      renderAuthForm("sign-up");
      await user.type(screen.getByLabelText(/email/i), "test@example.com");
      await user.type(screen.getByLabelText(/username/i), "testuser");
      const submitButton = screen.getByRole("button", { name: /submit form/i });
      await user.click(submitButton);
      expect(submitButton).toBeDisabled();
    });

    it("calls createAccount action on sign-up submission", async () => {
      (createAccount as jest.Mock).mockResolvedValue({ accountId: "123" });
      renderAuthForm("sign-up");
      await user.type(screen.getByLabelText(/email/i), "test@example.com");
      await user.type(screen.getByLabelText(/username/i), "testuser");
      await user.click(screen.getByRole("button", { name: /submit form/i }));
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
      renderAuthForm("sign-in");
      await user.type(screen.getByLabelText(/email/i), "test@example.com");
      await user.click(screen.getByRole("button", { name: /submit form/i }));
      await waitFor(
        () => {
          expect(signInUser).toHaveBeenCalledWith({
            email: "test@example.com",
          });
        },
        { timeout: 3000 },
      );
    });
  });

  describe("Error handling", () => {
    it("displays error message when account already exists", async () => {
      (createAccount as jest.Mock).mockRejectedValue(
        new Error("Account already exists"),
      );
      renderAuthForm("sign-up");
      await user.type(screen.getByLabelText(/email/i), "existing@example.com");
      await user.type(screen.getByLabelText(/username/i), "existinguser");
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
      renderAuthForm("sign-in");
      await user.type(
        screen.getByLabelText(/email/i),
        "nonexistent@example.com",
      );
      await user.click(screen.getByRole("button", { name: /submit form/i }));
      await waitFor(() => {
        expect(screen.getByRole("alert")).toHaveTextContent(
          /account does not exist. please sign up first/i,
        );
      });
    });

    it("displays generic error message on unexpected error", async () => {
      (createAccount as jest.Mock).mockRejectedValue(
        new Error("Network error"),
      );
      renderAuthForm("sign-up");
      await user.type(screen.getByLabelText(/email/i), "test@example.com");
      await user.type(screen.getByLabelText(/username/i), "testuser");
      await user.click(screen.getByRole("button", { name: /submit form/i }));
      await waitFor(() => {
        expect(screen.getByRole("alert")).toHaveTextContent(
          /failed to create account/i,
        );
      });
    });
  });

  describe("OTP modal", () => {
    it("shows OTP modal after successful account creation", async () => {
      (createAccount as jest.Mock).mockResolvedValue({ accountId: "123" });
      renderAuthForm("sign-up");
      await user.type(screen.getByLabelText(/email/i), "test@example.com");
      await user.type(screen.getByLabelText(/username/i), "testuser");
      await user.click(screen.getByRole("button", { name: /submit form/i }));
      await waitFor(
        () => {
          expect(screen.getByText(/test@example.com/i)).toBeInTheDocument();
        },
        { timeout: 3000 },
      );
    });

    it("does not show OTP modal for test-account type", async () => {
      (signInTestUser as jest.Mock).mockResolvedValue({});
      renderAuthForm("test-account");
      expect(screen.queryByText(/enter otp/i)).not.toBeInTheDocument();
    });
  });
});
