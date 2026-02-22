import { ImgHTMLAttributes } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import OTPModal from "../OTPModal";
import { sendEmailOTP, verifySecret } from "@/lib/actions/user.actions";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/lib/actions/user.actions", () => ({
  sendEmailOTP: jest.fn(),
  verifySecret: jest.fn(),
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: ImgHTMLAttributes<HTMLImageElement>) => <img {...props} />,
}));

jest.mock("../Loader", () => {
  return function MockLoader() {
    return <div data-testid="loader">Loader</div>;
  };
});

ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

document.elementFromPoint = jest.fn().mockReturnValue(null);
const mockPush = jest.fn();
const mockRouter = { push: mockPush };
const testEmail = "test@example.com";
const testAccountId = "account123";

describe("OTPModal component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (sendEmailOTP as jest.Mock).mockResolvedValue({});
    (verifySecret as jest.Mock).mockResolvedValue("session123");
  });

  it("renders OTP modal with correct title and description", () => {
    render(<OTPModal email={testEmail} accountId={testAccountId} />);
    expect(screen.getByText("Enter Your OTP")).toBeInTheDocument();
    expect(
      screen.getByText(/We've sent a one-time password to/i),
    ).toBeInTheDocument();
    expect(screen.getByText(testEmail)).toBeInTheDocument();
  });

  it("renders Submit and Resend buttons", () => {
    render(<OTPModal email={testEmail} accountId={testAccountId} />);
    expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /resend/i })).toBeInTheDocument();
  });

  it("updates OTP value when input changes", async () => {
    const user = userEvent.setup();
    render(<OTPModal email={testEmail} accountId={testAccountId} />);
    const input = screen.getByDisplayValue("");
    await user.type(input, "123456");
    expect(input).toHaveValue("123456");
  });

  it("successfully submits OTP and redirects to home", async () => {
    const user = userEvent.setup();
    render(<OTPModal email={testEmail} accountId={testAccountId} />);
    const input = screen.getByDisplayValue("");
    await user.type(input, "123456");
    await user.click(screen.getByRole("button", { name: /submit/i }));
    await waitFor(() => {
      expect(verifySecret).toHaveBeenCalledWith({
        accountId: testAccountId,
        password: "123456",
      });
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });

  it("displays loading state while submitting", async () => {
    (verifySecret as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve("session123"), 100);
        }),
    );
    const user = userEvent.setup();
    render(<OTPModal email={testEmail} accountId={testAccountId} />);
    await user.type(screen.getByDisplayValue(""), "123456");
    await user.click(screen.getByRole("button", { name: /submit/i }));
    await waitFor(() => {
      expect(screen.getByTestId("loader")).toBeInTheDocument();
      expect(screen.getByText(/Submiting.../i)).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });

  it("displays error messages for invalid OTP", async () => {
    (verifySecret as jest.Mock).mockRejectedValueOnce(
      new Error("Invalid token"),
    );
    const user = userEvent.setup();
    render(<OTPModal email={testEmail} accountId={testAccountId} />);
    await user.type(screen.getByDisplayValue(""), "123456");
    await user.click(screen.getByRole("button", { name: /submit/i }));
    await waitFor(() => {
      expect(
        screen.getByText("Invalid OTP code. Please try again."),
      ).toBeInTheDocument();
    });
  });

  it("clears error message when OTP input changes", async () => {
    (verifySecret as jest.Mock).mockRejectedValueOnce(
      new Error("Invalid token"),
    );
    const user = userEvent.setup();
    render(<OTPModal email={testEmail} accountId={testAccountId} />);
    await user.click(screen.getByRole("button", { name: /submit/i }));
    await waitFor(() => {
      expect(
        screen.getByText("Invalid OTP code. Please try again."),
      ).toBeInTheDocument();
    });
    await user.type(screen.getByDisplayValue(""), "1");
    await waitFor(() => {
      expect(
        screen.queryByText("Invalid OTP code. Please try again."),
      ).not.toBeInTheDocument();
    });
  });

  it("displays generic error message for other verification errors", async () => {
    (verifySecret as jest.Mock).mockRejectedValueOnce(
      new Error("Network error"),
    );
    const user = userEvent.setup();
    render(<OTPModal email={testEmail} accountId={testAccountId} />);
    await user.type(screen.getByDisplayValue(""), "123456");
    await user.click(screen.getByRole("button", { name: /submit/i }));
    await waitFor(() => {
      expect(
        screen.getByText("Failed to verify OTP. Please try again."),
      ).toBeInTheDocument();
    });
  });

  it("handles resend OTP", async () => {
    const user = userEvent.setup();
    render(<OTPModal email={testEmail} accountId={testAccountId} />);
    const resendButton = screen.getByRole("button", { name: /resend/i });
    expect(resendButton).not.toBeDisabled();
    await user.click(resendButton);
    await waitFor(() => {
      expect(sendEmailOTP).toHaveBeenCalledWith({ email: testEmail });
      expect(resendButton).toBeDisabled();
    });
  });

  it("prevents multiple rapid submissions", async () => {
    (verifySecret as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve("session123"), 100);
        }),
    );
    const user = userEvent.setup();
    render(<OTPModal email={testEmail} accountId={testAccountId} />);
    await user.type(screen.getByDisplayValue(""), "123456");
    const submitButton = screen.getByRole("button", { name: /submit/i });
    await user.click(submitButton);
    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
    await user.click(submitButton);
    await waitFor(() => {
      expect(verifySecret).toHaveBeenCalledTimes(1);
    });
  });
});
