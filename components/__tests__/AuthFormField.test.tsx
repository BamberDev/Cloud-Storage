import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import AuthFormField from "../AuthFormField";

const defaultProps = {
  name: "testField",
  label: "Test Label",
  placeholder: "Enter test value",
} as const;

const TestWrapper = ({
  children,
  defaultValues = { testField: "" },
}: {
  children: (form: UseFormReturn<{ testField: string }>) => React.ReactNode;
  defaultValues?: { testField: string };
}) => {
  const schema = z.object({ testField: z.string() });
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });
  return <Form {...form}>{children(form)}</Form>;
};

describe("AuthFormField", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders label and input", () => {
    render(
      <TestWrapper>
        {(form) => <AuthFormField {...defaultProps} form={form} />}
      </TestWrapper>,
    );
    expect(screen.getByText("Test Label")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter test value")).toBeInTheDocument();
  });

  it("applies correct CSS classes", () => {
    render(
      <TestWrapper>
        {(form) => <AuthFormField {...defaultProps} form={form} />}
      </TestWrapper>,
    );
    expect(screen.getByText("Test Label")).toHaveClass("shad-form-label");
    expect(screen.getByPlaceholderText("Enter test value")).toHaveClass(
      "shad-input",
    );
  });

  it.each([
    ["email", "email"],
    ["password", "password"],
    ["text", "text"],
  ] as const)("renders input with type %s", (type, expected) => {
    render(
      <TestWrapper>
        {(form) => <AuthFormField {...defaultProps} form={form} type={type} />}
      </TestWrapper>,
    );
    expect(screen.getByPlaceholderText("Enter test value")).toHaveAttribute(
      "type",
      expected,
    );
  });

  it("renders input with default type text", () => {
    render(
      <TestWrapper>
        {(form) => <AuthFormField {...defaultProps} form={form} />}
      </TestWrapper>,
    );
    expect(screen.getByPlaceholderText("Enter test value")).toHaveAttribute(
      "type",
      "text",
    );
  });

  it.each([
    [true, true],
    [false, false],
  ])("renders %s disabled input when disabled is %s", (disabled, expected) => {
    render(
      <TestWrapper>
        {(form) => (
          <AuthFormField {...defaultProps} form={form} disabled={disabled} />
        )}
      </TestWrapper>,
    );
    const input = screen.getByPlaceholderText("Enter test value");
    if (expected) {
      expect(input).toBeDisabled();
    } else {
      expect(input).not.toBeDisabled();
    }
  });

  it("renders custom component when provided", () => {
    const CustomComponent = <div data-testid="custom-component">Custom</div>;
    render(
      <TestWrapper>
        {(form) => (
          <AuthFormField
            {...defaultProps}
            form={form}
            customComponent={CustomComponent}
          />
        )}
      </TestWrapper>,
    );
    expect(screen.getByTestId("custom-component")).toBeInTheDocument();
    expect(
      screen.queryByPlaceholderText("Enter test value"),
    ).not.toBeInTheDocument();
  });

  it("calls onInputChange when input value changes", async () => {
    const mockOnInputChange = jest.fn();
    const user = userEvent.setup();
    render(
      <TestWrapper>
        {(form) => (
          <AuthFormField
            {...defaultProps}
            form={form}
            onInputChange={mockOnInputChange}
          />
        )}
      </TestWrapper>,
    );
    await user.type(screen.getByPlaceholderText("Enter test value"), "a");
    expect(mockOnInputChange).toHaveBeenCalled();
  });

  it("renders sr-only description for accessibility", () => {
    render(
      <TestWrapper>
        {(form) => <AuthFormField {...defaultProps} form={form} />}
      </TestWrapper>,
    );
    const description = screen.getByText("Test Label input");
    expect(description).toHaveClass("sr-only");
  });

  it("does not render autocomplete attribute for non-email types", () => {
    render(
      <TestWrapper>
        {(form) => (
          <AuthFormField {...defaultProps} form={form} type="password" />
        )}
      </TestWrapper>,
    );
    expect(screen.getByPlaceholderText("Enter test value")).not.toHaveAttribute(
      "autoComplete",
    );
  });

  it("does not render form message when no error", () => {
    render(
      <TestWrapper>
        {(form) => <AuthFormField {...defaultProps} form={form} />}
      </TestWrapper>,
    );
    expect(document.querySelector(".shad-form-message")).not.toBeInTheDocument();
  });
});
