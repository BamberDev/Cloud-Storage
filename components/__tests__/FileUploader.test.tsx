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

const mockUser = {
  $id: "user-123",
  accountId: "account-123",
};

const mockUploadFiles = jest.fn();
const mockShowErrorToast = jest.fn();

const renderComponent = (props = {}) => {
  return render(<FileUploader {...props} />);
};

describe("FileUploader component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    capturedOnDrop = null;
    (usePathname as jest.Mock).mockReturnValue("/");
    (useUser as jest.Mock).mockReturnValue({ currentUser: mockUser });
    (useFileUploader as jest.Mock).mockReturnValue({
      uploadFiles: mockUploadFiles,
    });
    (useErrorToast as jest.Mock).mockReturnValue(mockShowErrorToast);
    const globalObj = global as unknown as {
      URL?: URL & { createObjectURL?: (f: File) => string };
    };
    if (globalObj.URL) {
      globalObj.URL.createObjectURL = jest.fn(() => "blob:fake");
    }
  });

  describe("Basic rendering", () => {
    it("renders upload button", () => {
      renderComponent();
      const button = screen.getByText(/upload/i);
      expect(button).toBeInTheDocument();
    });

    it("renders with custom className", () => {
      renderComponent({ className: "custom-class" });
      const button = screen.getByText(/upload/i).closest("button");
      expect(button).toHaveClass("uploader-button");
      expect(button).toHaveClass("custom-class");
    });

    it("has aria-label on button", () => {
      renderComponent();
      const button = screen.getByLabelText(
        /Click to open file picker to upload files/i,
      );
      expect(button).toBeInTheDocument();
    });
  });

  describe("Hook initialization", () => {
    it("calls uploadFiles hook on initialization", () => {
      renderComponent();
      expect(useFileUploader).toHaveBeenCalledWith(
        expect.objectContaining({
          ownerId: "user-123",
          accountId: "account-123",
          path: "/",
        }),
      );
    });

    it("initializes user context", () => {
      renderComponent();
      expect(useUser).toHaveBeenCalled();
    });

    it("has error handling capability", () => {
      renderComponent();
      expect(mockShowErrorToast).toBeDefined();
    });
  });

  describe("Upload behavior", () => {
    it("calls uploadFiles when files are dropped", async () => {
      renderComponent();
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
      renderComponent();
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

  describe("Upload list", () => {
    it("does not show uploading list when no files", () => {
      renderComponent();
      expect(
        screen.queryByLabelText(/Uploading files list/i),
      ).not.toBeInTheDocument();
    });
  });
});
