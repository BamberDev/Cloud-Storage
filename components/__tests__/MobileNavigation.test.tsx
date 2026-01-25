import "@testing-library/jest-dom";
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

jest.mock("@/components/LogoutDialog", () => {
  return function MockLogoutDialog(props: { trigger?: ReactNode }) {
    return <div data-testid="logout-dialog">{props.trigger ?? null}</div>;
  };
});

jest.mock("@/components/FileUploader", () => {
  return function MockFileUploader() {
    return <div data-testid="file-uploader">FileUploader</div>;
  };
});

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

describe("MobileNavigation component", () => {
  const props = {
    username: "John Doe",
    email: "john@example.com",
    avatar: "/avatar.jpg",
  };

  it("renders as a banner (header)", () => {
    render(<MobileNavigation {...props} />);
    const header = screen.getByRole("banner");
    expect(header).toBeInTheDocument();
  });

  it("renders the home link with aria-label", () => {
    render(<MobileNavigation {...props} />);
    const homeLink = screen.getByLabelText("Go to home page");
    expect(homeLink).toBeInTheDocument();
  });

  it("renders the menu trigger and icon", () => {
    render(<MobileNavigation {...props} />);
    const menuImg = screen.getByAltText("Menu icon");
    expect(menuImg).toBeInTheDocument();
  });

  it("shows user avatar, username and email", () => {
    render(<MobileNavigation {...props} />);
    const avatar = screen.getByAltText("User avatar");
    expect(avatar).toBeInTheDocument();
    expect(screen.getByText(props.username)).toBeInTheDocument();
    expect(screen.getByText(props.email)).toBeInTheDocument();
  });

  it("renders NavItems and FileUploader and LogoutDialog trigger", () => {
    render(<MobileNavigation {...props} />);
    expect(screen.getByLabelText("Go to Dashboard page")).toBeInTheDocument();
    expect(screen.getByTestId("file-uploader")).toBeInTheDocument();
    expect(screen.getByTestId("logout-dialog")).toBeInTheDocument();
    expect(screen.getByText(/Sign out/i)).toBeInTheDocument();
  });
});
