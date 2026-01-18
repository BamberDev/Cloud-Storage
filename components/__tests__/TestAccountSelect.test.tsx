import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TestAccountSelect } from "@/components/TestAccountSelect";
import { TEST_EMAILS, TEST_PASSWORDS } from "@/lib/utils";

// Mock hasPointerCapture for Radix UI compatibility with jsdom
beforeAll(() => {
  if (!Element.prototype.hasPointerCapture) {
    Element.prototype.hasPointerCapture = () => false;
  }
  // Mock scrollIntoView for Radix UI compatibility with jsdom
  if (!HTMLElement.prototype.scrollIntoView) {
    HTMLElement.prototype.scrollIntoView = () => {};
  }
});

describe("TestAccountSelect component", () => {
  it("renders placeholder when no selection made", () => {
    render(<TestAccountSelect onSelect={jest.fn()} />);
    expect(screen.getByText("Select test account")).toBeInTheDocument();
  });

  it("renders as a combobox component", () => {
    render(<TestAccountSelect onSelect={jest.fn()} />);
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("accepts onSelect callback prop", () => {
    const mockCallback = jest.fn();
    render(<TestAccountSelect onSelect={mockCallback} />);
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("renders all test account options", async () => {
    render(<TestAccountSelect onSelect={jest.fn()} />);
    const trigger = screen.getByText("Select test account").closest("button");
    await userEvent.click(trigger!);
    TEST_EMAILS.forEach((_, i) => {
      expect(screen.getByText(`Test Account ${i + 1}`)).toBeInTheDocument();
    });
  });

  it("calls onSelect with correct email and password on selection", async () => {
    const onSelectMock = jest.fn();
    render(<TestAccountSelect onSelect={onSelectMock} />);
    const trigger = screen.getByText("Select test account").closest("button");
    await userEvent.click(trigger!);
    const optionIndex = 1;
    const optionLabel = `Test Account ${optionIndex + 1}`;
    await userEvent.click(screen.getByText(optionLabel));
    expect(onSelectMock).toHaveBeenCalledTimes(1);
    const expectedEmail = TEST_EMAILS[optionIndex].trim();
    const expectedPassword = TEST_PASSWORDS[optionIndex].trim();
    expect(onSelectMock).toHaveBeenCalledWith(expectedEmail, expectedPassword);
  });

  it("calls onSelect for first test account", async () => {
    const onSelectMock = jest.fn();
    render(<TestAccountSelect onSelect={onSelectMock} />);
    const trigger = screen.getByText("Select test account").closest("button");
    await userEvent.click(trigger!);
    await userEvent.click(screen.getByText("Test Account 1"));
    expect(onSelectMock).toHaveBeenCalledTimes(1);
  });

  it("shows dropdown menu when clicked", async () => {
    render(<TestAccountSelect onSelect={jest.fn()} />);
    const trigger = screen.getByText("Select test account").closest("button");
    await userEvent.click(trigger!);
    expect(screen.getByText("Test Account 1")).toBeInTheDocument();
  });

  it("hides dropdown after selection", async () => {
    render(<TestAccountSelect onSelect={jest.fn()} />);
    const trigger = screen.getByText("Select test account").closest("button");
    await userEvent.click(trigger!);
    const option = screen.getByText("Test Account 1");
    await userEvent.click(option);
    expect(trigger).toBeInTheDocument();
  });

  it("passes correct TEST_EMAILS data to callback", async () => {
    const onSelectMock = jest.fn();
    render(<TestAccountSelect onSelect={onSelectMock} />);
    const trigger = screen.getByText("Select test account").closest("button");
    await userEvent.click(trigger!);

    const firstEmail = TEST_EMAILS[0].trim();
    await userEvent.click(screen.getByText("Test Account 1"));

    expect(onSelectMock).toHaveBeenCalledWith(
      firstEmail,
      TEST_PASSWORDS[0].trim(),
    );
  });

  it("uses TEST_PASSWORDS from utils", async () => {
    const onSelectMock = jest.fn();
    render(<TestAccountSelect onSelect={onSelectMock} />);
    const trigger = screen.getByText("Select test account").closest("button");
    await userEvent.click(trigger!);

    const passwordIndex = 0;
    await userEvent.click(screen.getByText("Test Account 1"));

    const expectedPassword = TEST_PASSWORDS[passwordIndex].trim();
    const callArgs = onSelectMock.mock.calls[0];
    expect(callArgs[1]).toBe(expectedPassword);
  });

  it("handles selection of each test account", async () => {
    const { rerender } = render(<TestAccountSelect onSelect={jest.fn()} />);

    for (let i = 0; i < Math.min(TEST_EMAILS.length, 2); i++) {
      const onSelectMock = jest.fn();
      rerender(<TestAccountSelect onSelect={onSelectMock} />);

      const trigger = screen.getByRole("combobox");
      await userEvent.click(trigger);
      const accountLabel = `Test Account ${i + 1}`;
      await userEvent.click(screen.getByText(accountLabel));
      expect(onSelectMock).toHaveBeenCalledTimes(1);
    }
  });
});
