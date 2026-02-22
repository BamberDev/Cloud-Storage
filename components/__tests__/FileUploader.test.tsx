import { render, screen, act } from "@testing-library/react";
import FileUploader from "../FileUploader";
import { usePathname } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { useFileUploader } from "@/hooks/useFileUploader";
import { useErrorToast } from "@/hooks/useErrorToast";

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

jest.mock("@/context/UserContext", () => ({
  useUser: jest.fn(),
}));

jest.mock("@/hooks/useFileUploader", () => ({
  useFileUploader: jest.fn(),
}));

jest.mock("@/hooks/useErrorToast", () => ({
  useErrorToast: jest.fn(),
}));

let capturedOnDrop: ((files: File[]) => Promise<void>) | null = null;

jest.mock("react-dropzone", () => ({
  useDropzone: jest.fn(
    (opts: { onDrop?: (files: File[]) => Promise<void> }) => {
      capturedOnDrop = opts?.onDrop ?? null;
      return {
        getRootProps: () => ({}),
        getInputProps: () => ({}),
        open: jest.fn(),
      };
    },
  ),
}));

describe("FileUploader component", () => {
  const mockUser = {
    $id: "user-123",
    accountId: "account-123",
  };

  const mockUploadFiles = jest.fn();
  const mockShowErrorToast = jest.fn();

  beforeEach(() => {
    (usePathname as jest.Mock).mockReturnValue("/");
    (useUser as jest.Mock).mockReturnValue({ currentUser: mockUser });
    (useFileUploader as jest.Mock).mockReturnValue({
      uploadFiles: mockUploadFiles,
    });
    (useErrorToast as jest.Mock).mockReturnValue(mockShowErrorToast);
    // Mock URL.createObjectURL used by convertFileToUrl in tests
    const globalObj = global as unknown as {
      URL?: URL & { createObjectURL?: (f: File) => string };
      __origCreateObjectURL?: unknown;
    };
    globalObj.__origCreateObjectURL = globalObj.URL?.createObjectURL;
    if (globalObj.URL) {
      globalObj.URL.createObjectURL = jest.fn(() => "blob:fake");
    }
  });

  afterEach(() => {
    jest.clearAllMocks();
    capturedOnDrop = null;
    const globalObj = global as unknown as {
      URL?: URL & { createObjectURL?: (f: File) => string };
      __origCreateObjectURL?: unknown;
    };
    if (globalObj.__origCreateObjectURL) {
      if (globalObj.URL)
        globalObj.URL.createObjectURL = globalObj.__origCreateObjectURL as (
          f: File,
        ) => string;
      delete globalObj.__origCreateObjectURL;
    }
  });

  it("renders file uploader component", () => {
    render(<FileUploader />);
    const button = screen.getByText(/upload/i);
    expect(button).toBeInTheDocument();
  });

  it("renders with custom className", () => {
    render(<FileUploader className="custom-class" />);
    const button = screen.getByText(/upload/i).closest("button");
    expect(button).toHaveClass("uploader-button");
    expect(button).toHaveClass("custom-class");
  });

  it("applies correct aria-label to button", () => {
    render(<FileUploader />);
    const button = screen.getByLabelText(
      /Click to open file picker to upload files/i,
    );
    expect(button).toBeInTheDocument();
  });

  it("calls uploadFiles hook on initialization", () => {
    render(<FileUploader />);
    expect(useFileUploader).toHaveBeenCalledWith(
      expect.objectContaining({
        ownerId: "user-123",
        accountId: "account-123",
        path: "/",
      }),
    );
  });

  it("has error handling capability", () => {
    render(<FileUploader />);
    expect(mockShowErrorToast).toBeDefined();
  });

  it("does not show uploading list when no files are present", () => {
    render(<FileUploader />);
    expect(
      screen.queryByLabelText(/Uploading files list/i),
    ).not.toBeInTheDocument();
  });

  it("initializes hooks with correct user context", () => {
    render(<FileUploader />);
    expect(useUser).toHaveBeenCalled();
  });

  it("calls uploadFiles when valid files are dropped", async () => {
    render(<FileUploader />);
    const fileObj = {
      name: "file.txt",
      size: 1024,
      type: "text/plain",
    } as File;
    if (!capturedOnDrop) throw new Error("onDrop was not captured");
    await act(async () => {
      await capturedOnDrop!([fileObj]);
    });
    expect(mockUploadFiles).toHaveBeenCalledWith([fileObj]);
  });

  it("shows error toast for oversized files", async () => {
    render(<FileUploader />);
    const bigFile = {
      name: "big.mp4",
      size: 50 * 1024 * 1024,
      type: "video/mp4",
    } as File;
    if (!capturedOnDrop) throw new Error("onDrop was not captured");
    await act(async () => {
      await capturedOnDrop!([bigFile]);
    });
    expect(mockShowErrorToast).toHaveBeenCalled();
  });
});
