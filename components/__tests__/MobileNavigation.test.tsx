import {
  ImgHTMLAttributes,
  PropsWithChildren,
  HTMLAttributes,
  ReactNode,
} from "react";
import { render, screen } from "@testing-library/react";
import MobileNavigation from "@/components/MobileNavigation";

jest.mock("next/image", () => ({
  __esModule: true,
  default: (
    props: ImgHTMLAttributes<HTMLImageElement> & {
      priority?: boolean;
      quality?: number;
      loading?: string;
    },
  ) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { priority, loading, quality, ...restProps } = props;
    return <img {...restProps} />;
  },
}));

jest.mock("@/components/LogoutDialog", () => ({
  __esModule: true,
  default: (props: { trigger?: ReactNode }) => (
    <div data-testid="logout-dialog">{props.trigger ?? null}</div>
  ),
}));

jest.mock("@/components/FileUploader", () => ({
  __esModule: true,
  default: () => <div data-testid="file-uploader">FileUploader</div>,
}));

jest.mock("@/components/ui/separator", () => ({
  Separator: (props: HTMLAttributes<HTMLHRElement>) => (
    <hr data-testid="separator" {...props} />
  ),
}));

jest.mock("@/components/ui/sheet", () => ({
  Sheet: (props: PropsWithChildren<Record<string, unknown>>) => (
    <div data-testid="sheet">{props.children}</div>
  ),
  SheetTrigger: (props: PropsWithChildren<Record<string, unknown>>) => (
    <div data-testid="sheet-trigger">{props.children}</div>
  ),
  SheetContent: (props: PropsWithChildren<Record<string, unknown>>) => (
    <div data-testid="sheet-content">{props.children}</div>
  ),
  SheetTitle: (props: PropsWithChildren<Record<string, unknown>>) => (
    <div data-testid="sheet-title">{props.children}</div>
  ),
  SheetDescription: (props: PropsWithChildren<Record<string, unknown>>) => (
    <div data-testid="sheet-description">{props.children}</div>
  ),
}));

const defaultProps = {
  username: "John Doe",
  email: "john@example.com",
  avatar: "/avatar.jpg",
};

const renderMobileNavigation = (props = {}) => {
  return render(<MobileNavigation {...defaultProps} {...props} />);
};

describe("MobileNavigation component", () => {
  it("renders as a banner", () => {
    renderMobileNavigation();
    expect(screen.getByRole("banner")).toBeInTheDocument();
  });

  describe("Header elements", () => {
    it("renders the home link with aria-label", () => {
      renderMobileNavigation();
      expect(screen.getByLabelText("Go to home page")).toBeInTheDocument();
    });

    it("renders the menu icon", () => {
      renderMobileNavigation();
      expect(screen.getByAltText("Menu icon")).toBeInTheDocument();
    });
  });

  describe("User profile section", () => {
    it("shows user avatar", () => {
      renderMobileNavigation();
      expect(screen.getByAltText("User avatar")).toBeInTheDocument();
    });

    it("shows username and email", () => {
      renderMobileNavigation();
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("john@example.com")).toBeInTheDocument();
    });
  });

  describe("Navigation components", () => {
    it("renders NavItems", () => {
      renderMobileNavigation();
      expect(screen.getByLabelText("Go to Dashboard page")).toBeInTheDocument();
    });

    it("renders FileUploader", () => {
      renderMobileNavigation();
      expect(screen.getByTestId("file-uploader")).toBeInTheDocument();
    });

    it("renders LogoutDialog", () => {
      renderMobileNavigation();
      expect(screen.getByTestId("logout-dialog")).toBeInTheDocument();
      expect(screen.getByText(/Sign out/i)).toBeInTheDocument();
    });
  });
});
