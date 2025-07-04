import { ImgHTMLAttributes } from "react";
import "@testing-library/jest-dom";
import { render, screen, cleanup } from "@testing-library/react";
import Thumbnail from "@/components/Thumbnail";

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: ImgHTMLAttributes<HTMLImageElement>) => <img {...props} />,
}));

jest.mock("@/lib/utils", () => ({
  cn: (...classes: (string | false | null | undefined)[]) =>
    classes.filter(Boolean).join(" "),
  getFileIcon: (ext: string, type: string) =>
    `/assets/icons/${ext}-${type}.svg`,
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
      />
    );
    const img = screen.getByAltText("Real image");
    expect(img).toHaveAttribute("src", "/real-image.png");
    expect(img).toHaveClass("thumbnail-image", "extra-class");
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
      />
    );
    const figure = container.querySelector("figure");
    expect(figure).toHaveClass("thumbnail", "figure-extra");
  });

  it("applies imageClassName even when rendering fallback icon", () => {
    render(
      <Thumbnail
        type="file"
        extension="zip"
        alt="Zip File"
        imageClassName="extra-class"
      />
    );
    const img = screen.getByAltText("Zip File");
    expect(img).toHaveClass("extra-class");
  });

  it('treats ".svg" as fallback even when type="image"', () => {
    render(
      <Thumbnail type="image" extension="svg" url="/icon.svg" alt="SVG Icon" />
    );
    const img = screen.getByAltText("SVG Icon");
    expect(img).toHaveAttribute("src", "/assets/icons/svg-image.svg");
    expect(img).not.toHaveClass("thumbnail-image");
  });

  it("renders image with alt text for screen readers", () => {
    render(
      <Thumbnail type="image" extension="png" url="/img.png" alt="Image" />
    );
    expect(screen.getByAltText("Image")).toBeVisible();
  });

  it("handles missing url prop with empty string default", () => {
    render(<Thumbnail type="file" extension="doc" alt="Doc" />);
    const img = screen.getByAltText("Doc");
    expect(img).toHaveAttribute("src", "/assets/icons/doc-file.svg");
  });

  it("applies correct size attributes to the image", () => {
    render(
      <Thumbnail type="image" extension="jpg" url="/image.jpg" alt="Image" />
    );
    const img = screen.getByAltText("Image");
    expect(img).toHaveAttribute("width", "100");
    expect(img).toHaveAttribute("height", "100");
  });

  it("handles different file type and extension combinations", () => {
    const cases = [
      { type: "audio", ext: "mp3", expected: "/assets/icons/mp3-audio.svg" },
      { type: "video", ext: "mp4", expected: "/assets/icons/mp4-video.svg" },
      {
        type: "document",
        ext: "docx",
        expected: "/assets/icons/docx-document.svg",
      },
      { type: "other", ext: "xyz", expected: "/assets/icons/xyz-other.svg" },
    ];

    cases.forEach(({ type, ext, expected }) => {
      render(<Thumbnail type={type} extension={ext} alt={`${type} file`} />);
      const img = screen.getByAltText(`${type} file`);
      expect(img).toHaveAttribute("src", expected);
      cleanup();
    });
  });

  it("matches snapshot for fallback icon", () => {
    const { asFragment } = render(
      <Thumbnail type="file" extension="txt" alt="Text" />
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
