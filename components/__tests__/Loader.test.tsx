import { ImgHTMLAttributes } from "react";
import { render, screen } from "@testing-library/react";
import Loader from "../Loader";

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: ImgHTMLAttributes<HTMLImageElement>) => <img {...props} />,
}));

describe("Loader component", () => {
  it("renders default loader correctly", () => {
    render(<Loader />);
    const img = screen.getByAltText("");
    expect(img).toHaveAttribute("src", "/assets/icons/loader.svg");
    expect(img).toHaveAttribute("width", "24");
    expect(img).toHaveAttribute("height", "24");
    expect(img).toHaveClass("animate-spin");
    expect(img).toHaveAttribute("aria-hidden", "true");
  });

  it("renders with custom size", () => {
    render(<Loader size={40} />);
    const img = screen.getByAltText("");
    expect(img).toHaveAttribute("width", "40");
    expect(img).toHaveAttribute("height", "40");
  });
});
