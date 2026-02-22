import { render, screen } from "@testing-library/react";
import { ImgHTMLAttributes } from "react";
import Thumbnail from "@/components/Thumbnail";

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: ImgHTMLAttributes<HTMLImageElement>) => <img {...props} />,
}));

jest.mock("@/lib/utils", () => ({
  cn: jest.fn((...args) => args.filter(Boolean).join(" ")),
  getFileIcon: jest.fn(
    (extension, type) => `/assets/icons/${extension}-${type}.svg`,
  ),
}));

describe("Thumbnail component", () => {
  it('renders real image with correct src and classes when type="image"', () => {
    render(
      <Thumbnail
        type="image"
        extension="png"
        url="/real-image.png"
        alt="Real image"
        imageClassName="extra-class"
      />,
    );
    const img = screen.getByAltText("Real image");
    expect(img).toHaveAttribute("src", "/real-image.png");
    expect(img).toHaveClass("thumbnail-image", "extra-class");
  });

  it("renders figure element as container", () => {
    const { container } = render(
      <Thumbnail type="image" extension="png" url="/img.png" alt="Image" />,
    );
    expect(container.querySelector("figure")).toBeInTheDocument();
  });

  it("renders fallback icon when not an image", () => {
    render(<Thumbnail type="file" extension="pdf" alt="Pdf" />);
    const img = screen.getByAltText("Pdf");
    expect(img).toHaveAttribute("src", "/assets/icons/pdf-file.svg");
    expect(img).not.toHaveClass("thumbnail-image");
  });

  it("applies provided className to the <figure>", () => {
    const { container } = render(
      <Thumbnail
        type="file"
        extension="doc"
        alt="Doc"
        className="figure-extra"
      />,
    );
    expect(container.querySelector("figure")).toHaveClass(
      "thumbnail",
      "figure-extra",
    );
  });

  it("applies imageClassName even when rendering fallback icon", () => {
    render(
      <Thumbnail
        type="file"
        extension="zip"
        alt="Zip File"
        imageClassName="extra-class"
      />,
    );
    expect(screen.getByAltText("Zip File")).toHaveClass("extra-class");
  });

  it('treats ".svg" as fallback even when type="image"', () => {
    render(
      <Thumbnail type="image" extension="svg" url="/icon.svg" alt="SVG Icon" />,
    );
    const img = screen.getByAltText("SVG Icon");
    expect(img).toHaveAttribute("src", "/assets/icons/svg-image.svg");
    expect(img).not.toHaveClass("thumbnail-image");
  });

  it.each([
    ["image", "png", true],
    ["document", "pdf", false],
  ] as const)(
    "shows thumbnail-image class only for image types: %s",
    (type, ext, shouldHaveClass) => {
      render(
        <Thumbnail type={type} extension={ext} url="/file.ext" alt="File" />,
      );
      const img = screen.getByAltText("File");
      if (shouldHaveClass) {
        expect(img).toHaveClass("thumbnail-image");
      } else {
        expect(img).not.toHaveClass("thumbnail-image");
      }
    },
  );

  it.each([
    ["audio", "mp3", "/assets/icons/mp3-audio.svg"],
    ["video", "mp4", "/assets/icons/mp4-video.svg"],
    ["document", "docx", "/assets/icons/docx-document.svg"],
    ["other", "xyz", "/assets/icons/xyz-other.svg"],
  ] as const)(
    "calls getFileIcon with correct parameters for %s",
    (type, ext, expectedSrc) => {
      render(<Thumbnail type={type} extension={ext} alt={`${type} file`} />);
      expect(screen.getByAltText(`${type} file`)).toHaveAttribute(
        "src",
        expectedSrc,
      );
    },
  );

  it("renders image with alt text for screen readers", () => {
    render(
      <Thumbnail type="image" extension="png" url="/img.png" alt="Image" />,
    );
    expect(screen.getByAltText("Image")).toBeVisible();
  });

  it("handles missing url prop", () => {
    render(<Thumbnail type="file" extension="doc" alt="Doc" />);
    expect(screen.getByAltText("Doc")).toHaveAttribute(
      "src",
      "/assets/icons/doc-file.svg",
    );
  });

  it("applies correct size attributes", () => {
    render(
      <Thumbnail type="image" extension="jpg" url="/image.jpg" alt="Image" />,
    );
    const img = screen.getByAltText("Image");
    expect(img).toHaveAttribute("width", "100");
    expect(img).toHaveAttribute("height", "100");
  });
});
