import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import AuthFormField from "../AuthFormField";

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
  const defaultProps = {
    name: "testField",
    label: "Test Label",
    placeholder: "Enter test value",
  } as const;

  it("applies correct CSS classes to form elements", () => {
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

  it("renders with label and input", () => {
    render(
      <TestWrapper>
        {(form) => <AuthFormField {...defaultProps} form={form} />}
      </TestWrapper>,
    );
    expect(screen.getByText("Test Label")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter test value")).toBeInTheDocument();
  });

  it("renders input with correct placeholder", () => {
    render(
      <TestWrapper>
        {(form) => <AuthFormField {...defaultProps} form={form} />}
      </TestWrapper>,
    );
    expect(screen.getByPlaceholderText("Enter test value")).toHaveAttribute(
      "placeholder",
      "Enter test value",
    );
  });

  it("renders input with correct type", () => {
    render(
      <TestWrapper>
        {(form) => <AuthFormField {...defaultProps} form={form} type="email" />}
      </TestWrapper>,
    );
    expect(screen.getByPlaceholderText("Enter test value")).toHaveAttribute(
      "type",
      "email",
    );
  });

  it("renders input with default type text when not specified", () => {
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

  it("renders disabled input when disabled prop is true", () => {
    render(
      <TestWrapper>
        {(form) => (
          <AuthFormField {...defaultProps} form={form} disabled={true} />
        )}
      </TestWrapper>,
    );
    expect(screen.getByPlaceholderText("Enter test value")).toBeDisabled();
  });

  it("renders enabled input when disabled prop is false", () => {
    render(
      <TestWrapper>
        {(form) => (
          <AuthFormField {...defaultProps} form={form} disabled={false} />
        )}
      </TestWrapper>,
    );
    expect(screen.getByPlaceholderText("Enter test value")).not.toBeDisabled();
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
    const input = screen.getByPlaceholderText("Enter test value");
    await userEvent.type(input, "a");
    expect(mockOnInputChange).toHaveBeenCalled();
  });

  it("renders sr-only description for accessibility", () => {
    render(
      <TestWrapper>
        {(form) => <AuthFormField {...defaultProps} form={form} />}
      </TestWrapper>,
    );
    const description = screen.getByText("Test Label input");
    expect(description).toBeInTheDocument();
    expect(description).toHaveClass("sr-only");
  });

  it("does not render autocomplete attribute for other types", () => {
    render(
      <TestWrapper>
        {(form) => (
          <AuthFormField {...defaultProps} form={form} type="password" />
        )}
      </TestWrapper>,
    );
    const input = screen.getByPlaceholderText("Enter test value");
    expect(input).not.toHaveAttribute("autoComplete");
  });

  it("does not render form message element when there is no error", () => {
    render(
      <TestWrapper>
        {(form) => <AuthFormField {...defaultProps} form={form} />}
      </TestWrapper>,
    );
    const formMessage = document.querySelector(".shad-form-message");
    expect(formMessage).not.toBeInTheDocument();
  });
});
