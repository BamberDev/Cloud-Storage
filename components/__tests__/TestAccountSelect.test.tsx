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

const defaultProps = {
  onSelect: jest.fn(),
};

const renderTestAccountSelect = (props = {}) => {
  return render(<TestAccountSelect {...defaultProps} {...props} />);
};

const openDropdown = async () => {
  const user = userEvent.setup();
  renderTestAccountSelect();
  await user.click(screen.getByRole("combobox"));
  return user;
};

describe("TestAccountSelect component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders placeholder when no selection made", () => {
    renderTestAccountSelect();
    expect(screen.getByText("Select test account")).toBeInTheDocument();
  });

  it("renders as a combobox component", () => {
    renderTestAccountSelect();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  describe("Dropdown interactions", () => {
    it("shows dropdown menu when clicked", async () => {
      const user = userEvent.setup();
      renderTestAccountSelect();
      await user.click(screen.getByRole("combobox"));
      expect(screen.getByText("Test Account 1")).toBeInTheDocument();
    });

    it("hides dropdown after selection", async () => {
      const user = await openDropdown();
      await user.click(screen.getByText("Test Account 1"));
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    it("renders all test account options", async () => {
      await openDropdown();
      TEST_EMAILS.forEach((_, i) => {
        expect(screen.getByText(`Test Account ${i + 1}`)).toBeInTheDocument();
      });
    });
  });

  describe("Selection behavior", () => {
    it.each([
      [0, "Test Account 1"],
      [1, "Test Account 2"],
    ])(
      "calls onSelect with correct credentials for %s",
      async (index, label) => {
        const onSelectMock = jest.fn();
        const user = userEvent.setup();
        renderTestAccountSelect({ onSelect: onSelectMock });
        await user.click(screen.getByRole("combobox"));
        await user.click(screen.getByText(label));
        expect(onSelectMock).toHaveBeenCalledWith(
          TEST_EMAILS[index].trim(),
          TEST_PASSWORDS[index].trim(),
        );
      },
    );

    it("calls onSelect once per selection", async () => {
      const onSelectMock = jest.fn();
      const user = userEvent.setup();
      renderTestAccountSelect({ onSelect: onSelectMock });
      await user.click(screen.getByRole("combobox"));
      await user.click(screen.getByText("Test Account 1"));
      expect(onSelectMock).toHaveBeenCalledTimes(1);
    });
  });
});
